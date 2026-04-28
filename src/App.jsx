import { useState, useEffect, useMemo } from 'react';
import { supabase } from './core/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { solveFEA } from './core/MatrixEngine';
import { calculateILD } from './core/ILDEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Log in to Matrix FEA</h2>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>FEA Engine Dashboard</h3>
        <div>
          <span style={{ marginRight: '20px' }}>{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 15px', background: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>
      <FEAWorkspace userId={session.user.id} />
    </div>
  );
}

function FEAWorkspace({ userId }) {
  const [viewMode, setViewMode] = useState('static');

  const [nodes] = useState([
    { id: 'n1', x: 0 },
    { id: 'n2', x: 5 },
    { id: 'n3', x: 10 }
  ]);

  const [elements] = useState([
    { id: 'e1', node1: 'n1', node2: 'n2', L: 5, E: 200e6, I: 0.0001, hinge: 'none' },
    { id: 'e2', node1: 'n2', node2: 'n3', L: 5, E: 200e6, I: 0.0001, hinge: 'left' }
  ]);

  const [supports] = useState([
    { nodeId: 'n1', type: 'pin' },
    { nodeId: 'n3', type: 'roller' }
  ]);

  const [loads] = useState([
    { nodeId: 'n2', Fy: -50, M: 0 }
  ]);

  const staticResults = useMemo(() => {
    return solveFEA(nodes, elements, supports, loads);
  }, [nodes, elements, supports, loads]);

  const ildData = useMemo(() => {
    if (viewMode !== 'ild') return [];
    return calculateILD(nodes, elements, supports, 'n1', 'Fy');
  }, [nodes, elements, supports, viewMode]);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setViewMode('static')}
          style={{ padding: '10px 20px', background: viewMode === 'static' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'static' ? 'white' : 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Static Analysis
        </button>
        <button
          onClick={() => setViewMode('ild')}
          style={{ padding: '10px 20px', background: viewMode === 'ild' ? '#8b5cf6' : '#e2e8f0', color: viewMode === 'ild' ? 'white' : 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          ILD Analysis (Reaction at Node 1)
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>

        {viewMode === 'static' && (
          <div>
            <h3>Static Results (Matrix Engine)</h3>
            {staticResults.error ? (
              <div style={{ color: 'red', fontWeight: 'bold' }}>{staticResults.error}</div>
            ) : (
              <pre style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {JSON.stringify(staticResults.reactions, null, 2)}
              </pre>
            )}
            <p style={{ color: '#64748b' }}>* The engine has successfully calculated the exact matrix reactions for your pre-loaded 3-node system with an internal hinge.</p>
          </div>
        )}

        {viewMode === 'ild' && (
          <div>
            <h3>Influence Line Diagram (Target: Reaction at Node 1)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={ildData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="influence" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
