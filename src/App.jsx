import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './core/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import ControlPanel from './components/ControlPanel';
import BeamSetupView from './components/BeamSetupView';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import ChartDeflection from './components/ChartDeflection';
import ResultsTable from './components/ResultsTable';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');

    if (errorParam) {
      setAuthError(errorDesc || errorParam);
      window.history.replaceState({}, document.title, '/');
      setSession(null);
      return;
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href).then(({ data, error }) => {
        if (error) { setAuthError(error.message); setSession(null); }
        else setSession(data.session);
        window.history.replaceState({}, document.title, '/');
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>StructurAI</h2>
        {authError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            Sign-in error: {authError}
          </div>
        )}
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} redirectTo={window.location.origin} />
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#0f172a', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, letterSpacing: '1px' }}>StructurAI</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sign Out
          </button>
        </div>
      </div>
      <Workspace userId={session.user.id} />
    </div>
  );
}

// ─── Blank beam defaults ──────────────────────────────────────────────────────
const BLANK = {
  beamLength: 10,
  supportA: 0,
  supportB: 10,
  loads: [],
  material: materials[0],
  section: sections[0],
};

// ─── Main Workspace ───────────────────────────────────────────────────────────
function Workspace({ userId }) {
  const [isSolved, setIsSolved] = useState(false);

  // Beam state (matches ControlPanel's prop interface exactly)
  const [beamLength, setBeamLength] = useState(BLANK.beamLength);
  const [supportA,   setSupportA]   = useState(BLANK.supportA);
  const [supportB,   setSupportB]   = useState(BLANK.supportB);
  const [loads,      setLoads]      = useState(BLANK.loads);
  const [material,   setMaterial]   = useState(BLANK.material);
  const [section,    setSection]    = useState(BLANK.section);

  // Project management
  const [projects,    setProjects]    = useState([]);
  const [currentId,   setCurrentId]   = useState(null);
  const [currentName, setCurrentName] = useState('Untitled Project');
  const [showPanel,   setShowPanel]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState(null);
  const [nameEditing, setNameEditing] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('beam_projects')
      .select('id, name, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (!error) setProjects(data ?? []);
  }

  function applyState(s) {
    setBeamLength(s.beam_length ?? s.beamLength ?? BLANK.beamLength);
    setSupportA(s.support_a   ?? s.supportA   ?? BLANK.supportA);
    setSupportB(s.support_b   ?? s.supportB   ?? BLANK.supportB);
    setLoads(s.loads ?? []);
    setMaterial(s.material ?? BLANK.material);
    setSection(s.section  ?? BLANK.section);
    setIsSolved(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      user_id: userId, name: currentName,
      beam_length: beamLength, support_a: supportA, support_b: supportB,
      loads, material, section, updated_at: new Date().toISOString(),
    };
    let error;
    if (currentId) {
      ({ error } = await supabase.from('beam_projects').update(payload).eq('id', currentId));
    } else {
      const { data, error: ie } = await supabase.from('beam_projects').insert(payload).select('id').single();
      error = ie;
      if (!error) setCurrentId(data.id);
    }
    setSaving(false);
    setSaveMsg(error ? 'Save failed' : 'Saved!');
    setTimeout(() => setSaveMsg(null), 2000);
    fetchProjects();
  }

  async function handleLoad(project) {
    const { data, error } = await supabase.from('beam_projects').select('*').eq('id', project.id).single();
    if (!error && data) {
      applyState(data);
      setCurrentId(data.id);
      setCurrentName(data.name);
      setShowPanel(false);
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.name}"?`)) return;
    await supabase.from('beam_projects').delete().eq('id', project.id);
    if (currentId === project.id) handleNew();
    fetchProjects();
  }

  function handleNew() {
    applyState(BLANK);
    setCurrentId(null);
    setCurrentName('Untitled Project');
    setShowPanel(false);
  }

  // ── Analysis computation ──────────────────────────────────────────────────
  const { plotData, reactions, peakValues, ildData, analysisError } = useMemo(() => {
    if (beamLength <= 0)     return { analysisError: 'Beam length must be greater than zero.' };
    if (supportA < 0)        return { analysisError: 'Support A cannot be at a negative position.' };
    if (supportB <= supportA) return { analysisError: 'Support B must be to the right of Support A.' };
    if (supportB > beamLength) return { analysisError: 'Support B cannot be beyond the end of the beam.' };

    try {
      const activeLoads = loads.map(load => {
        if (load.type === 'point')       return { ...load, mag: load.dir === 'down' ? load.mag : -load.mag };
        if (load.type === 'moment')      return { ...load, mag: load.dir === 'cw'   ? load.mag : -load.mag };
        if (load.type === 'distributed') {
          const m = load.dir === 'down' ? 1 : -1;
          return { ...load, startMag: load.startMag * m, endMag: load.endMag * m };
        }
        return load;
      });

      const result = generatePlotData(beamLength, activeLoads, supportA, supportB, material, section);

      const getPeak = (key) => {
        const vals = result.plotData.map(d => d[key]);
        const mx = Math.max(...vals), mn = Math.min(...vals);
        return Math.abs(mx) > Math.abs(mn) ? mx : mn;
      };

      // Analytical ILD for simply-supported beam — works with any span & overhangs
      const span = supportB - supportA;
      const ild = Array.from({ length: 101 }, (_, i) => {
        const x = +(beamLength * i / 100).toFixed(3);
        return {
          x,
          'Reaction A': +((supportB - x) / span).toFixed(4),
          'Reaction B': +((x - supportA) / span).toFixed(4),
        };
      });

      return {
        plotData: result.plotData,
        reactions: result.reactions,
        peakValues: {
          shear:      getPeak('shear'),
          moment:     getPeak('moment'),
          deflection: getPeak('deflection'),
          slope:      getPeak('slope'),
          stress:     Math.max(...result.plotData.map(d => d.stress)),
        },
        ildData: ild,
        analysisError: null,
      };
    } catch (e) {
      return { analysisError: 'Analysis failed: ' + (e.message || 'Unknown error') };
    }
  }, [beamLength, supportA, supportB, loads, material, section]);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 40px' }}>

      {/* ── Project bar ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={handleNew} style={{ padding: '7px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          + New
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {nameEditing ? (
            <input
              ref={nameRef}
              value={currentName}
              onChange={e => setCurrentName(e.target.value)}
              onBlur={() => setNameEditing(false)}
              onKeyDown={e => e.key === 'Enter' && setNameEditing(false)}
              style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', border: '1px solid #93c5fd', borderRadius: '6px', padding: '4px 8px', outline: 'none', minWidth: '200px' }}
            />
          ) : (
            <span onClick={() => { setNameEditing(true); setTimeout(() => nameRef.current?.select(), 10); }}
              title="Click to rename"
              style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', cursor: 'text', padding: '4px 8px', borderRadius: '6px' }}>
              {currentName}
            </span>
          )}
          {currentId && <span style={{ fontSize: '11px', color: '#94a3b8' }}>saved</span>}
        </div>

        {saveMsg && <span style={{ fontSize: '13px', fontWeight: 600, color: saveMsg === 'Saved!' ? '#10b981' : '#ef4444' }}>{saveMsg}</span>}

        <button onClick={handleSave} disabled={saving}
          style={{ padding: '7px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Project'}
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowPanel(p => !p); fetchProjects(); }}
            style={{ padding: '7px 14px', background: showPanel ? '#e0e7ff' : '#f1f5f9', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            My Projects {projects.length > 0 && `(${projects.length})`}
          </button>

          {showPanel && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '320px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>Saved Projects</div>
              {projects.length === 0 ? (
                <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No projects saved yet</div>
              ) : (
                <ul style={{ margin: 0, padding: '8px 0', listStyle: 'none', maxHeight: '320px', overflowY: 'auto' }}>
                  {projects.map(p => (
                    <li key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px', background: p.id === currentId ? '#eff6ff' : 'transparent' }}>
                      <button onClick={() => handleLoad(p)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(p.updated_at).toLocaleString()}</div>
                      </button>
                      <button onClick={() => handleDelete(p)} style={{ padding: '4px 8px', background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '2.2rem' }}>Beam Analysis</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Configure your beam below, then hit Solve to see all diagrams at once.</p>
        </div>
        {isSolved && (
          <button onClick={() => setIsSolved(false)}
            style={{ padding: '10px 22px', fontSize: '15px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Setup
          </button>
        )}
      </div>

      {/* ── SETUP PHASE ────────────────────────────────────────────────────── */}
      {!isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0, fontSize: '1.4rem', color: '#1e293b' }}>Model View</h2>
              <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />
            </div>

            {analysisError ? (
              <div style={{ padding: '24px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', border: '2px solid #f87171', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Unstable Structure</h3>
                <p style={{ margin: '0 0 8px 0' }}>{analysisError}</p>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Adjust your supports so the beam is fully constrained before solving.</p>
              </div>
            ) : (
              <button onClick={() => setIsSolved(true)}
                style={{ padding: '24px', fontSize: '20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}>
                SOLVE STRUCTURE
              </button>
            )}
          </div>

          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supportA={supportA}     setSupportA={setSupportA}
            supportB={supportB}     setSupportB={setSupportB}
            loads={loads}           setLoads={setLoads}
            material={material}     setMaterial={setMaterial}
            section={section}       setSection={setSection}
          />
        </div>
      )}

      {/* ── RESULTS PHASE ──────────────────────────────────────────────────── */}
      {isSolved && !analysisError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>

          {/* Left: all diagrams stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', textAlign: 'center' }}>Analysis Results</h2>

            <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <ChartSFD data={plotData} beamLength={beamLength} />
            </div>
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <ChartBMD data={plotData} beamLength={beamLength} />
            </div>
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <ChartDeflection data={plotData} />
            </div>

            {/* ILD ── Analytical */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>Influence Line Diagram (ILD)</h4>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>— Reaction A</span>
                  <span style={{ marginLeft: '12px', color: '#16a34a', fontWeight: 700 }}>— Reaction B</span>
                </div>
              </div>
              <div style={{ height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={ildData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="x" type="number" domain={[0, beamLength]} label={{ value: 'Load position (m)', position: 'insideBottom', offset: -2 }} />
                    <YAxis label={{ value: 'Influence', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(v, name) => [v.toFixed(4), name]} />
                    <ReferenceLine y={0} stroke="#000" />
                    <Line type="monotone" dataKey="Reaction A" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Reaction B" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: summary table */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <ResultsTable reactions={reactions} peakValues={peakValues} material={material} section={section} />
          </div>
        </div>
      )}
    </div>
  );
}
