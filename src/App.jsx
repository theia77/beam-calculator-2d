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
import StressProfileView from './components/StressProfileView';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';
import { solveFEA } from './core/MatrixEngine';
import { calculateILD } from './core/ILDEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Auth Wrapper ────────────────────────────────────────────────────────────
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
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Structural Analysis Engine</h2>
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
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Structural Analysis Engine</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 15px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
      <Workspace userId={session.user.id} />
    </div>
  );
}

// ─── Blank beam state ────────────────────────────────────────────────────────
const BLANK_BEAM = {
  beamLength: 10,
  supportA: 0,
  supportB: 10,
  loads: [],
  material: materials[0],
  section: sections[0],
};

// ─── Workspace with project management ───────────────────────────────────────
function Workspace({ userId }) {
  const [activeTab, setActiveTab] = useState('solver');

  // Beam state — lifted here so project save/load can read & write it
  const [beamLength, setBeamLength] = useState(BLANK_BEAM.beamLength);
  const [supportA,   setSupportA]   = useState(BLANK_BEAM.supportA);
  const [supportB,   setSupportB]   = useState(BLANK_BEAM.supportB);
  const [loads,      setLoads]      = useState(BLANK_BEAM.loads);
  const [material,   setMaterial]   = useState(BLANK_BEAM.material);
  const [section,    setSection]    = useState(BLANK_BEAM.section);

  // Project management state
  const [projects,        setProjects]        = useState([]);
  const [currentId,       setCurrentId]       = useState(null);
  const [currentName,     setCurrentName]     = useState('Untitled Project');
  const [showPanel,       setShowPanel]       = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [saveMsg,         setSaveMsg]         = useState(null);
  const [nameEditing,     setNameEditing]     = useState(false);
  const nameRef = useRef(null);

  // Load the user's project list on mount
  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('beam_projects')
      .select('id, name, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (!error) setProjects(data ?? []);
  }

  function applyBeamState(state) {
    setBeamLength(state.beam_length ?? state.beamLength ?? BLANK_BEAM.beamLength);
    setSupportA(state.support_a   ?? state.supportA   ?? BLANK_BEAM.supportA);
    setSupportB(state.support_b   ?? state.supportB   ?? BLANK_BEAM.supportB);
    setLoads(state.loads ?? []);
    setMaterial(state.material ?? BLANK_BEAM.material);
    setSection(state.section  ?? BLANK_BEAM.section);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      user_id:     userId,
      name:        currentName,
      beam_length: beamLength,
      support_a:   supportA,
      support_b:   supportB,
      loads,
      material,
      section,
      updated_at:  new Date().toISOString(),
    };

    let error;
    if (currentId) {
      ({ error } = await supabase.from('beam_projects').update(payload).eq('id', currentId));
    } else {
      const { data, error: insertError } = await supabase
        .from('beam_projects')
        .insert(payload)
        .select('id')
        .single();
      error = insertError;
      if (!error) setCurrentId(data.id);
    }

    setSaving(false);
    setSaveMsg(error ? 'Save failed' : 'Saved!');
    setTimeout(() => setSaveMsg(null), 2000);
    fetchProjects();
  }

  async function handleLoad(project) {
    const { data, error } = await supabase
      .from('beam_projects')
      .select('*')
      .eq('id', project.id)
      .single();
    if (!error && data) {
      applyBeamState(data);
      setCurrentId(data.id);
      setCurrentName(data.name);
      setActiveTab('solver');
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
    applyBeamState(BLANK_BEAM);
    setCurrentId(null);
    setCurrentName('Untitled Project');
    setShowPanel(false);
  }

  function startEditName() {
    setNameEditing(true);
    setTimeout(() => nameRef.current?.select(), 10);
  }

  const tabStyle = (id) => ({
    padding: '10px 24px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer',
    background: activeTab === id ? '#3b82f6' : '#e2e8f0',
    color:      activeTab === id ? 'white'   : '#475569',
  });

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1920px', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* ── Project bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* New */}
        <button onClick={handleNew} style={{ padding: '7px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          + New
        </button>

        {/* Project name */}
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
            <span
              onClick={startEditName}
              title="Click to rename"
              style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', cursor: 'text', padding: '4px 8px', borderRadius: '6px', border: '1px solid transparent' }}
            >
              {currentName}
            </span>
          )}
          {currentId && <span style={{ fontSize: '11px', color: '#94a3b8' }}>saved</span>}
        </div>

        {/* Save feedback */}
        {saveMsg && <span style={{ fontSize: '13px', color: saveMsg === 'Saved!' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{saveMsg}</span>}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '7px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save Project'}
        </button>

        {/* My Projects */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowPanel(p => !p); fetchProjects(); }}
            style={{ padding: '7px 14px', background: showPanel ? '#e0e7ff' : '#f1f5f9', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            My Projects {projects.length > 0 && `(${projects.length})`}
          </button>

          {showPanel && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '320px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>Saved Projects</div>
              {projects.length === 0 ? (
                <div style={{ padding: '20px 16px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No projects saved yet</div>
              ) : (
                <ul style={{ margin: 0, padding: '8px 0', listStyle: 'none', maxHeight: '320px', overflowY: 'auto' }}>
                  {projects.map(p => (
                    <li key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px', background: p.id === currentId ? '#eff6ff' : 'transparent' }}>
                      <button
                        onClick={() => handleLoad(p)}
                        style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(p.updated_at).toLocaleString()}</div>
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        style={{ padding: '4px 8px', background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <button style={tabStyle('solver')} onClick={() => setActiveTab('solver')}>Beam Solver</button>
        <button style={tabStyle('fea')}    onClick={() => setActiveTab('fea')}>Matrix FEA</button>
        <button style={tabStyle('ild')}    onClick={() => setActiveTab('ild')}>ILD Analysis</button>
      </div>

      {activeTab === 'solver' && (
        <BeamSolverTab
          beamLength={beamLength} setBeamLength={setBeamLength}
          supportA={supportA}     setSupportA={setSupportA}
          supportB={supportB}     setSupportB={setSupportB}
          loads={loads}           setLoads={setLoads}
          material={material}     setMaterial={setMaterial}
          section={section}       setSection={setSection}
        />
      )}
      {activeTab === 'fea' && <MatrixFEATab />}
      {activeTab === 'ild' && <ILDTab />}
    </div>
  );
}

// ─── Tab 1: Beam Solver (state is now props) ─────────────────────────────────
function BeamSolverTab({ beamLength, setBeamLength, supportA, setSupportA, supportB, setSupportB, loads, setLoads, material, setMaterial, section, setSection }) {
  const [isSolved, setIsSolved] = useState(false);

  const { plotData, reactions, peakValues } = useMemo(() => {
    const activeLoads = loads.map(load => {
      if (load.type === 'point')       return { ...load, mag: load.dir === 'down' ? load.mag : -load.mag };
      if (load.type === 'moment')      return { ...load, mag: load.dir === 'cw'   ? load.mag : -load.mag };
      if (load.type === 'distributed') {
        const mult = load.dir === 'down' ? 1 : -1;
        return { ...load, startMag: load.startMag * mult, endMag: load.endMag * mult };
      }
      return load;
    });

    const result = generatePlotData(beamLength, activeLoads, supportA, supportB, material, section);

    const getPeak = (key) => {
      const vals = result.plotData.map(d => d[key]);
      const maxP = Math.max(...vals);
      const maxN = Math.min(...vals);
      return Math.abs(maxP) > Math.abs(maxN) ? maxP : maxN;
    };

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
    };
  }, [beamLength, supportA, supportB, loads, material, section]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '3px solid #cbd5e1', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2rem' }}>Determinate Beam Solver</h1>
        {isSolved && (
          <button onClick={() => setIsSolved(false)} style={{ padding: '10px 20px', fontSize: '16px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Edit Setup
          </button>
        )}
      </div>

      {!isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
              <h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#1e293b' }}>Model View</h2>
              <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />
            </div>
            <button
              onClick={() => setIsSolved(true)}
              style={{ padding: '22px', fontSize: '22px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', letterSpacing: '2px', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.4)' }}
            >
              RUN ANALYSIS
            </button>
          </div>
          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supportA={supportA}    setSupportA={setSupportA}
            supportB={supportB}    setSupportB={setSupportB}
            loads={loads}          setLoads={setLoads}
            material={material}    setMaterial={setMaterial}
            section={section}      setSection={setSection}
          />
        </div>
      )}

      {isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, textAlign: 'center', color: '#1e293b', fontSize: '1.5rem' }}>Analysis Projections</h2>
            <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartSFD data={plotData} /></div>
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartBMD data={plotData} /></div>
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartDeflection data={plotData} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ResultsTable reactions={reactions} peakValues={peakValues} material={material} section={section} />
            <StressProfileView moment={peakValues.moment} section={section} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Matrix FEA ───────────────────────────────────────────────────────
function MatrixFEATab() {
  const nodes    = [{ id: 'n1', x: 0 }, { id: 'n2', x: 5 }, { id: 'n3', x: 10 }];
  const elements = [
    { id: 'e1', node1: 'n1', node2: 'n2', L: 5, E: 200e6, I: 0.0001, hinge: 'none' },
    { id: 'e2', node1: 'n2', node2: 'n3', L: 5, E: 200e6, I: 0.0001, hinge: 'left' },
  ];
  const supports   = [{ nodeId: 'n1', type: 'fixed' }, { nodeId: 'n3', type: 'roller' }];
  const nodalLoads = [{ nodeId: 'n2', Fy: -50, M: 0 }];
  const result = useMemo(() => solveFEA(nodes, elements, supports, nodalLoads), []);

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: '#1e293b', marginTop: 0 }}>Matrix Stiffness Method</h2>
      <p style={{ color: '#64748b' }}>3-node beam — internal hinge at node 2 (left of element 2) — 50 kN downward at midspan.</p>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Support Reactions</h3>
        {result.error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{result.error}</div>
        ) : (
          <>
            {Object.entries(result.reactions).map(([nodeId, r]) => (
              <div key={nodeId} style={{ display: 'flex', gap: '30px', marginBottom: '10px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <strong style={{ color: '#3b82f6', minWidth: '40px' }}>{nodeId}</strong>
                <span>Fy = <strong>{r.Fy.toFixed(2)} kN</strong></span>
                {r.M !== 0 && <span>M = <strong>{r.M.toFixed(2)} kN·m</strong></span>}
              </div>
            ))}
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>Raw displacement vector</summary>
              <pre style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '12px', marginTop: '8px', overflow: 'auto' }}>
                {JSON.stringify(result.displacements?.map(d => +d.toFixed(8)), null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
      <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '8px', border: '1px solid #fde047', color: '#713f12', fontSize: '14px' }}>
        <strong>Note:</strong> This tab uses the Matrix Stiffness engine with nodal loads. The Beam Solver tab uses the superposition engine — both engines are live.
      </div>
    </div>
  );
}

// ─── Tab 3: ILD Analysis ─────────────────────────────────────────────────────
function ILDTab() {
  const [targetNode, setTargetNode] = useState('n1');
  const nodes    = [{ id: 'n1', x: 0 }, { id: 'n2', x: 5 }, { id: 'n3', x: 10 }];
  const elements = [
    { id: 'e1', node1: 'n1', node2: 'n2', L: 5, E: 200e6, I: 0.0001, hinge: 'none' },
    { id: 'e2', node1: 'n2', node2: 'n3', L: 5, E: 200e6, I: 0.0001, hinge: 'left' },
  ];
  const supports = [{ nodeId: 'n1', type: 'pin' }, { nodeId: 'n3', type: 'roller' }];
  const ildData  = useMemo(() => calculateILD(nodes, elements, supports, targetNode, 'Fy'), [targetNode]);

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: '#1e293b', marginTop: 0 }}>Influence Line Diagram</h2>
      <p style={{ color: '#64748b' }}>Unit load sweeps across the beam. Chart shows how the selected reaction varies with load position.</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {['n1', 'n3'].map(n => (
          <button key={n} onClick={() => setTargetNode(n)}
            style={{ padding: '8px 20px', background: targetNode === n ? '#8b5cf6' : '#e2e8f0', color: targetNode === n ? 'white' : '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Reaction at {n.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>ILD — Reaction at {targetNode.toUpperCase()} (Fy)</h3>
        <div style={{ height: '320px' }}>
          <ResponsiveContainer>
            <LineChart data={ildData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: 'Load position (m)', position: 'insideBottom', offset: -4 }} />
              <YAxis label={{ value: 'Influence', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => v.toFixed(4)} />
              <Line type="monotone" dataKey="influence" stroke="#8b5cf6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
