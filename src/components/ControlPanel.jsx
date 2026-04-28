import { materials, sections } from '../core/beamData';

export default function ControlPanel({
  beamLength, setBeamLength,
  supportA, setSupportA, supportB, setSupportB,
  loads, setLoads,
  material, setMaterial, section, setSection
}) {
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #cbd5e1', marginBottom: '15px', boxSizing: 'border-box', fontSize: '16px', fontWeight: '500' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#475569', fontSize: '15px' };
  const groupStyle = { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };

  return (
    <div className="control-panel">
      <h2 style={{ marginTop: 0, fontSize: '1.8rem', color: '#1e293b' }}>Parameters</h2>

      <div style={groupStyle}>
        <label style={labelStyle}>Material:</label>
        <select value={material.id} onChange={(e) => setMaterial(materials.find(m => m.id === e.target.value))} style={inputStyle}>
          {materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <label style={labelStyle}>Cross-Section Shape:</label>
        <select value={section.id} onChange={(e) => setSection(sections.find(s => s.id === e.target.value))} style={inputStyle}>
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Total Beam Length (m):</label>
        <input type="number" step="any" value={beamLength} onChange={(e) => setBeamLength(Number(e.target.value))} style={inputStyle} />
        <label style={labelStyle}>Support A Position (m):</label>
        <input type="number" step="any" value={supportA} onChange={(e) => setSupportA(Number(e.target.value))} style={inputStyle} />
        <label style={labelStyle}>Support B Position (m):</label>
        <input type="number" step="any" value={supportB} onChange={(e) => setSupportB(Number(e.target.value))} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Applied Loads</h3>

        {loads.map((load, index) => {
          const updateLoad = (newVals) => {
            const newLoads = [...loads];
            newLoads[index] = { ...load, ...newVals };
            setLoads(newLoads);
          };

          return (
            <div key={load.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
                <span style={{ textTransform: 'capitalize', color: load.type === 'point' ? '#3b82f6' : load.type === 'distributed' ? '#ef4444' : '#8b5cf6' }}>
                  {load.type} Load
                </span>
                <button onClick={() => setLoads(loads.filter(l => l.id !== load.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Remove ✖</button>
              </div>

              {load.type === 'point' && (
                <>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <label><input type="radio" checked={load.dir === 'down'} onChange={() => updateLoad({ dir: 'down' })} /> Down</label>
                    <label><input type="radio" checked={load.dir === 'up'} onChange={() => updateLoad({ dir: 'up' })} /> Up</label>
                  </div>
                  <label style={labelStyle}>Mag (kN):</label>
                  <input type="number" step="any" value={load.mag} onChange={e => updateLoad({ mag: Number(e.target.value) })} style={inputStyle} />
                  <label style={labelStyle}>Pos (m):</label>
                  <input type="number" step="any" value={load.pos} onChange={e => updateLoad({ pos: Number(e.target.value) })} style={inputStyle} />
                </>
              )}

              {load.type === 'moment' && (
                <>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <label><input type="radio" checked={load.dir === 'cw'} onChange={() => updateLoad({ dir: 'cw' })} /> Clockwise</label>
                    <label><input type="radio" checked={load.dir === 'ccw'} onChange={() => updateLoad({ dir: 'ccw' })} /> Anti-Clockwise</label>
                  </div>
                  <label style={labelStyle}>Mag (kNm):</label>
                  <input type="number" step="any" value={load.mag} onChange={e => updateLoad({ mag: Number(e.target.value) })} style={inputStyle} />
                  <label style={labelStyle}>Pos (m):</label>
                  <input type="number" step="any" value={load.pos} onChange={e => updateLoad({ pos: Number(e.target.value) })} style={inputStyle} />
                </>
              )}

              {load.type === 'distributed' && (
                <>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <label><input type="radio" checked={load.dir === 'down'} onChange={() => updateLoad({ dir: 'down' })} /> Down</label>
                    <label><input type="radio" checked={load.dir === 'up'} onChange={() => updateLoad({ dir: 'up' })} /> Up</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label style={labelStyle}>Start Mag:</label> <input type="number" step="any" value={load.startMag} onChange={e => updateLoad({ startMag: Number(e.target.value) })} style={inputStyle} /></div>
                    <div><label style={labelStyle}>End Mag:</label> <input type="number" step="any" value={load.endMag} onChange={e => updateLoad({ endMag: Number(e.target.value) })} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Start Pos:</label> <input type="number" step="any" value={load.startPos} onChange={e => updateLoad({ startPos: Number(e.target.value) })} style={inputStyle} /></div>
                    <div><label style={labelStyle}>End Pos:</label> <input type="number" step="any" value={load.endPos} onChange={e => updateLoad({ endPos: Number(e.target.value) })} style={inputStyle} /></div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setLoads([...loads, { id: Date.now(), type: 'point', mag: 10, pos: beamLength / 2, dir: 'down' }])} style={{ flex: 1, padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px dashed #38bdf8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Point</button>
          <button onClick={() => setLoads([...loads, { id: Date.now(), type: 'distributed', startMag: 10, endMag: 10, startPos: 0, endPos: beamLength / 2, dir: 'down' }])} style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#b91c1c', border: '1px dashed #f87171', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Dist</button>
          <button onClick={() => setLoads([...loads, { id: Date.now(), type: 'moment', mag: 20, pos: beamLength / 2, dir: 'cw' }])} style={{ flex: 1, padding: '10px', background: '#f3e8ff', color: '#7e22ce', border: '1px dashed #c084fc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Moment</button>
        </div>
      </div>
    </div>
  );
}
