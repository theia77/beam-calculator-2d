import { useState, useEffect, useMemo, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
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

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [authError, setAuthError] = useState(null);
  const [theme, setTheme] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');

    let codeExchangeInProgress = !!code;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (codeExchangeInProgress && !sess) return;
      codeExchangeInProgress = false;
      setSession(sess ?? null);
    });

    if (errorParam) {
      setAuthError(errorDesc || errorParam);
      window.history.replaceState({}, document.title, '/');
      setSession(null);
    } else if (code) {
      supabase.auth.exchangeCodeForSession(window.location.href).then(({ data, error }) => {
        codeExchangeInProgress = false;
        if (error) { setAuthError(error.message); setSession(null); }
        window.history.replaceState({}, document.title, '/');
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => setSession(session ?? null));
    }

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#64748b', fontSize: '15px' }}>Loading…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <header className="app-header">
          <div className="header-brand">
            <div className="header-logo" />
            <span className="header-title">StructurAI</span>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '400px', padding: '30px', background: theme === 'dark' ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: theme === 'dark' ? '#f1f5f9' : '#1e293b' }}>StructurAI</h2>
            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                Sign-in error: {authError}
              </div>
            )}
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme={theme === 'dark' ? 'dark' : 'default'}
              providers={['google']}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    );
  }

  return <Workspace session={session} theme={theme} setTheme={setTheme} />;
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
function Workspace({ session, theme, setTheme }) {
  const userId = session.user.id;

  const [isSolved, setIsSolved] = useState(false);
  const [viewMode, setViewMode] = useState('2D');

  const [beamLength, setBeamLength] = useState(BLANK.beamLength);
  const [supportA,   setSupportA]   = useState(BLANK.supportA);
  const [supportB,   setSupportB]   = useState(BLANK.supportB);
  const [loads,      setLoads]      = useState(BLANK.loads);
  const [material,   setMaterial]   = useState(BLANK.material);
  const [section,    setSection]    = useState(BLANK.section);

  const [projects,    setProjects]    = useState([]);
  const [currentId,   setCurrentId]   = useState(null);
  const [currentName, setCurrentName] = useState('Untitled Project');
  const [showPanel,   setShowPanel]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [isDirty,     setIsDirty]     = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { fetchProjects(); }, []);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    setIsDirty(true);
    setIsSolved(false);
  }, [beamLength, supportA, supportB, loads, material, section]);

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
    if (!error) setIsDirty(false);
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
      setIsDirty(false);
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
    setIsDirty(false);
    setShowPanel(false);
  }

  const { plotData, reactions, peakValues, ildData, analysisError } = useMemo(() => {
    if (beamLength <= 0)       return { analysisError: 'Beam length must be greater than zero.' };
    if (supportA < 0)          return { analysisError: 'Support A cannot be at a negative position.' };
    if (supportB <= supportA)  return { analysisError: 'Support B must be to the right of Support A.' };
    if (supportB > beamLength) return { analysisError: 'Support B cannot be beyond the end of the beam.' };

    for (const load of loads) {
      if (load.type === 'point' || load.type === 'moment') {
        if (load.pos < 0 || load.pos > beamLength)
          return { analysisError: `A ${load.type} load is positioned outside the beam (${load.pos} m). Move it within [0, ${beamLength} m].` };
      }
      if (load.type === 'distributed') {
        if (load.startPos < 0 || load.endPos > beamLength || load.startPos >= load.endPos)
          return { analysisError: `A distributed load has invalid extents (${load.startPos}–${load.endPos} m). Must be within [0, ${beamLength} m] with start < end.` };
      }
    }

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
          stress:     getPeak('stress'),
        },
        ildData: ild,
        analysisError: null,
      };
    } catch (e) {
      return { analysisError: 'Analysis failed: ' + (e.message || 'Unknown error') };
    }
  }, [beamLength, supportA, supportB, loads, material, section]);

  const cardStyle = {
    background: 'var(--bg-surface)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  };

  return (
    <div className="app-shell">

      {/* ── Global Header ──────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo" />
          <span className="header-title">StructurAI</span>
        </div>
        <div className="header-right">
          <span className="header-email">{session.user.email}</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </header>

      {/* ── Split Pane ─────────────────────────────────────────────────────── */}
      <div className="workspace">

        {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
        <div className="left-panel">

          {/* Tab bar — Shadcn pill style */}
          <div className="tab-bar">
            <div className="tab-list">
              <button
                className={`tab-btn${viewMode === '2D' ? ' active' : ''}`}
                onClick={() => setViewMode('2D')}
              >
                2D Diagrams (SFD / BMD)
              </button>
              <button
                className={`tab-btn${viewMode === '3D' ? ' active' : ''}`}
                onClick={() => setViewMode('3D')}
              >
                3D Environment
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div className="canvas-area">
            {viewMode === '3D' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', lineHeight: 1 }}>🏗️</div>
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>3D Environment</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>React Three Fiber integration coming soon</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Beam model — always visible */}
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>
                    Beam Model
                  </h3>
                  <BeamSetupView
                    beamLength={beamLength}
                    supportA={supportA}
                    supportB={supportB}
                    loads={loads}
                  />
                </div>

                {/* Analysis error banner */}
                {analysisError && (
                  <div style={{ padding: '16px 20px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', border: '1px solid #f87171' }}>
                    <strong>Unstable Structure:</strong> {analysisError}
                    <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                      Adjust your supports so the beam is fully constrained before solving.
                    </p>
                  </div>
                )}

                {/* Results charts — shown after solving */}
                {isSolved && !analysisError && (
                  <>
                    <div style={cardStyle}>
                      <ChartSFD data={plotData} beamLength={beamLength} />
                    </div>
                    <div style={cardStyle}>
                      <ChartBMD data={plotData} beamLength={beamLength} />
                    </div>
                    <div style={cardStyle}>
                      <ChartDeflection data={plotData} beamLength={beamLength} />
                    </div>

                    {/* ILD */}
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>
                          Influence Line Diagram (ILD)
                        </h4>
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>— Reaction A</span>
                          <span style={{ marginLeft: '12px', color: '#16a34a', fontWeight: 700 }}>— Reaction B</span>
                        </div>
                      </div>
                      <div style={{ height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={ildData} margin={{ top: 5, right: 30, left: 0, bottom: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                            <XAxis dataKey="x" type="number" domain={[0, beamLength]} label={{ value: 'Load position (m)', position: 'insideBottom', offset: -8 }} />
                            <YAxis label={{ value: 'Influence', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(v, name) => [v.toFixed(4), name]} />
                            <ReferenceLine y={0} stroke="#000" />
                            <Line type="monotone" dataKey="Reaction A" stroke="#2563eb" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Reaction B" stroke="#16a34a" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}

                {/* Pre-solve empty state */}
                {!isSolved && !analysisError && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ready to Analyze</p>
                    <p style={{ margin: 0, fontSize: '13px' }}>Configure your beam on the right, then click Solve Structure.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="right-panel">

          {/* Project bar */}
          <div className="project-bar">
            <button
              onClick={handleNew}
              style={{ padding: '6px 11px', background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', flexShrink: 0, fontFamily: 'inherit' }}
            >
              + New
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
              {nameEditing ? (
                <input
                  ref={nameRef}
                  value={currentName}
                  onChange={e => setCurrentName(e.target.value)}
                  onBlur={() => setNameEditing(false)}
                  onKeyDown={e => e.key === 'Enter' && setNameEditing(false)}
                  style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', border: '1px solid #93c5fd', borderRadius: '6px', padding: '3px 6px', outline: 'none', minWidth: 0, flex: 1, background: 'var(--bg-surface)', fontFamily: 'inherit' }}
                />
              ) : (
                <span
                  onClick={() => { setNameEditing(true); setTimeout(() => nameRef.current?.select(), 10); }}
                  title="Click to rename"
                  style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'text', padding: '3px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}
                >
                  {currentName}
                </span>
              )}
              {currentId && !isDirty && <span style={{ fontSize: '10px', color: 'var(--text-subtle)', flexShrink: 0 }}>saved</span>}
              {currentId &&  isDirty && <span style={{ fontSize: '10px', color: '#f59e0b', flexShrink: 0 }}>unsaved</span>}
            </div>

            {saveMsg && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: saveMsg === 'Saved!' ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                {saveMsg}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: '12px', opacity: saving ? 0.7 : 1, flexShrink: 0, fontFamily: 'inherit' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => { setShowPanel(p => !p); fetchProjects(); }}
                style={{ padding: '6px 10px', background: showPanel ? '#e0e7ff' : 'var(--bg-base)', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', fontFamily: 'inherit' }}
              >
                Projects{projects.length > 0 && ` (${projects.length})`}
              </button>

              {showPanel && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '280px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 100 }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                    Saved Projects
                  </div>
                  {projects.length === 0 ? (
                    <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No projects saved yet</div>
                  ) : (
                    <ul style={{ margin: 0, padding: '6px 0', listStyle: 'none', maxHeight: '280px', overflowY: 'auto' }}>
                      {projects.map(p => (
                        <li key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', gap: '6px', background: p.id === currentId ? '#eff6ff' : 'transparent' }}>
                          <button onClick={() => handleLoad(p)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 4px', borderRadius: '4px', fontFamily: 'inherit' }}>
                            <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(p.updated_at).toLocaleString()}</div>
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            style={{ padding: '3px 7px', background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontFamily: 'inherit' }}
                          >
                            Del
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Beam parameters */}
          <div style={{ padding: '16px' }}>
            <ControlPanel
              beamLength={beamLength} setBeamLength={setBeamLength}
              supportA={supportA}     setSupportA={setSupportA}
              supportB={supportB}     setSupportB={setSupportB}
              loads={loads}           setLoads={setLoads}
              material={material}     setMaterial={setMaterial}
              section={section}       setSection={setSection}
            />
          </div>

          {/* Solve / results */}
          <div style={{ padding: '0 16px 32px' }}>
            {analysisError ? (
              <div style={{ padding: '14px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', border: '1px solid #f87171', fontSize: '13px' }}>
                <strong>Error:</strong> {analysisError}
              </div>
            ) : !isSolved ? (
              <button
                onClick={() => setIsSolved(true)}
                style={{ width: '100%', padding: '16px', fontSize: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 12px rgba(37,99,235,0.35)', letterSpacing: '0.5px', fontFamily: 'inherit' }}
              >
                SOLVE STRUCTURE
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={() => setIsSolved(false)}
                  style={{ width: '100%', padding: '10px', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  ← Reset Results
                </button>
                <ResultsTable
                  reactions={reactions}
                  peakValues={peakValues}
                  material={material}
                  section={section}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
