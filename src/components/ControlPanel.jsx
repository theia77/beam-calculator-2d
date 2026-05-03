import { materials, sections } from '../core/beamData';

export default function ControlPanel({
  beamLength, setBeamLength,
  supportA, setSupportA, supportB, setSupportB,
  loads, setLoads,
  material, setMaterial, section, setSection
}) {
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1.5px solid var(--input-border)',
    marginBottom: '14px',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontWeight: '500',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    letterSpacing: '0.2px',
  };

  const groupStyle = {
    background: 'var(--bg-surface)',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    marginBottom: '16px',
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.3px' }}>
        Parameters
      </h2>

      {/* Material & Section */}
      <div style={groupStyle}>
        <label style={labelStyle}>Material:</label>
        <select
          value={material.id}
          onChange={e => setMaterial(materials.find(m => m.id === e.target.value))}
          style={inputStyle}
        >
          {materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <label style={labelStyle}>Cross-Section Shape:</label>
        <select
          value={section.id}
          onChange={e => setSection(sections.find(s => s.id === e.target.value))}
          style={{ ...inputStyle, marginBottom: 0 }}
        >
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Geometry */}
      <div style={groupStyle}>
        <label style={labelStyle}>Total Beam Length (m):</label>
        <input type="number" step="any" value={beamLength} onChange={e => setBeamLength(Number(e.target.value))} style={inputStyle} />

        <label style={labelStyle}>Support A Position (m):</label>
        <input type="number" step="any" value={supportA} onChange={e => setSupportA(Number(e.target.value))} style={inputStyle} />

        <label style={labelStyle}>Support B Position (m):</label>
        <input type="number" step="any" value={supportB} onChange={e => setSupportB(Number(e.target.value))} style={{ ...inputStyle, marginBottom: 0 }} />
      </div>

      {/* Applied Loads */}
      <div style={groupStyle}>
        <h3 style={{ margin: '0 0 14px 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '14px', fontWeight: 700 }}>
          Applied Loads
        </h3>

        {loads.map((load, index) => {
          const updateLoad = newVals => {
            const next = [...loads];
            next[index] = { ...load, ...newVals };
            setLoads(next);
          };

          const typeColor = load.type === 'point' ? '#3b82f6' : load.type === 'distributed' ? '#ef4444' : '#8b5cf6';

          return (
            <div
              key={load.id}
              style={{ background: 'var(--bg-surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 700, fontSize: '13px' }}>
                <span style={{ textTransform: 'capitalize', color: typeColor }}>{load.type} Load</span>
                <button
                  onClick={() => setLoads(loads.filter(l => l.id !== load.id))}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: 0, fontFamily: 'inherit' }}
                >
                  Remove ✖
                </button>
              </div>

              {(load.type === 'point' || load.type === 'distributed') && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" checked={load.dir === 'down'} onChange={() => updateLoad({ dir: 'down' })} /> Down
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" checked={load.dir === 'up'} onChange={() => updateLoad({ dir: 'up' })} /> Up
                  </label>
                </div>
              )}

              {load.type === 'moment' && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" checked={load.dir === 'cw'} onChange={() => updateLoad({ dir: 'cw' })} /> Clockwise
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" checked={load.dir === 'ccw'} onChange={() => updateLoad({ dir: 'ccw' })} /> Anti-CW
                  </label>
                </div>
              )}

              {(load.type === 'point' || load.type === 'moment') && (
                <>
                  <label style={labelStyle}>Mag ({load.type === 'moment' ? 'kNm' : 'kN'}):</label>
                  <input type="number" step="any" value={load.mag} onChange={e => updateLoad({ mag: Number(e.target.value) })} style={inputStyle} />
                  <label style={labelStyle}>Position (m):</label>
                  <input type="number" step="any" value={load.pos} onChange={e => updateLoad({ pos: Number(e.target.value) })} style={{ ...inputStyle, marginBottom: 0 }} />
                </>
              )}

              {load.type === 'distributed' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Start Mag (kN/m):</label>
                    <input type="number" step="any" value={load.startMag} onChange={e => updateLoad({ startMag: Number(e.target.value) })} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Mag (kN/m):</label>
                    <input type="number" step="any" value={load.endMag} onChange={e => updateLoad({ endMag: Number(e.target.value) })} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Pos (m):</label>
                    <input type="number" step="any" value={load.startPos} onChange={e => updateLoad({ startPos: Number(e.target.value) })} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Pos (m):</label>
                    <input type="number" step="any" value={load.endPos} onChange={e => updateLoad({ endPos: Number(e.target.value) })} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add load buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setLoads([...loads, { id: Date.now(), type: 'point', mag: 10, pos: beamLength / 2, dir: 'down' }])}
            style={{ flex: 1, padding: '9px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px dashed #3b82f6', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}
          >
            + Point
          </button>
          <button
            onClick={() => setLoads([...loads, { id: Date.now(), type: 'distributed', startMag: 10, endMag: 10, startPos: 0, endPos: beamLength / 2, dir: 'down' }])}
            style={{ flex: 1, padding: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px dashed #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}
          >
            + Dist
          </button>
          <button
            onClick={() => setLoads([...loads, { id: Date.now(), type: 'moment', mag: 20, pos: beamLength / 2, dir: 'cw' }])}
            style={{ flex: 1, padding: '9px', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px dashed #8b5cf6', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}
          >
            + Moment
          </button>
        </div>
      </div>
    </div>
  );
}
