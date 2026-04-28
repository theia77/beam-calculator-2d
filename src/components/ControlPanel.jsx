import { materials, sections } from '../core/beamData';

export default function ControlPanel({
  beamLength, setBeamLength,
  supports, setSupports,
  pointLoad, setPointLoad,
  momentLoad, setMomentLoad,
  distLoad, setDistLoad,
  material, setMaterial, section, setSection
}) {
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '2px solid #cbd5e1', marginBottom: '15px',
    boxSizing: 'border-box', fontSize: '16px', fontWeight: '500'
  };

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
      </div>

      {/* Dynamic Supports Manager */}
      <div style={groupStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Supports</h3>

        {supports.map((sup, index) => (
          <div key={sup.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <select
                value={sup.type}
                onChange={(e) => {
                  const newSups = [...supports];
                  if (e.target.value === 'fixed') {
                    newSups[index].x = sup.x > beamLength / 2 ? beamLength : 0;
                  }
                  newSups[index].type = e.target.value;
                  setSupports(newSups);
                }}
                style={{ ...inputStyle, marginBottom: 0 }}
              >
                <option value="pin">Pin (Triangle)</option>
                <option value="roller">Roller (Circle)</option>
                <option value="fixed">Fixed (Wall)</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <input
                type="number" step="any"
                value={sup.x}
                disabled={sup.type === 'fixed'}
                title={sup.type === 'fixed' ? 'Fixed supports must be at ends' : ''}
                onChange={(e) => {
                  const newSups = [...supports];
                  newSups[index].x = Number(e.target.value);
                  setSupports(newSups);
                }}
                style={{ ...inputStyle, marginBottom: 0, backgroundColor: sup.type === 'fixed' ? '#e2e8f0' : 'white' }}
              />
            </div>

            <button
              onClick={() => setSupports(supports.filter(s => s.id !== sup.id))}
              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '12px 15px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              X
            </button>
          </div>
        ))}

        <button
          onClick={() => setSupports([...supports, { id: Date.now(), type: 'roller', x: beamLength / 2 }])}
          style={{ width: '100%', padding: '10px', background: '#e2e8f0', color: '#475569', border: '2px dashed #94a3b8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
        >
          + Add Support
        </button>
      </div>

      <div style={groupStyle}>
        <label style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" style={{ transform: 'scale(1.5)' }} checked={pointLoad.active} onChange={(e) => setPointLoad({ ...pointLoad, active: e.target.checked })} />
          Point Load
        </label>
        {pointLoad.active && (
          <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '16px' }}>
              <label><input type="radio" checked={pointLoad.dir === 'down'} onChange={() => setPointLoad({ ...pointLoad, dir: 'down' })} /> Downward</label>
              <label><input type="radio" checked={pointLoad.dir === 'up'} onChange={() => setPointLoad({ ...pointLoad, dir: 'up' })} /> Upward</label>
            </div>
            <label style={labelStyle}>Magnitude (kN):</label>
            <input type="number" step="any" value={pointLoad.mag} onChange={(e) => setPointLoad({ ...pointLoad, mag: Number(e.target.value) })} style={inputStyle} />
            <label style={labelStyle}>Position (m):</label>
            <input type="number" step="any" value={pointLoad.pos} onChange={(e) => setPointLoad({ ...pointLoad, pos: Number(e.target.value) })} style={inputStyle} />
          </div>
        )}
      </div>

      <div style={groupStyle}>
        <label style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" style={{ transform: 'scale(1.5)' }} checked={distLoad.active} onChange={(e) => setDistLoad({ ...distLoad, active: e.target.checked })} />
          Distributed Load
        </label>
        {distLoad.active && (
          <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '16px' }}>
              <label><input type="radio" checked={distLoad.dir === 'down'} onChange={() => setDistLoad({ ...distLoad, dir: 'down' })} /> Downward</label>
              <label><input type="radio" checked={distLoad.dir === 'up'} onChange={() => setDistLoad({ ...distLoad, dir: 'up' })} /> Upward</label>
            </div>
            <label style={labelStyle}>Start Magnitude (kN/m):</label>
            <input type="number" step="any" value={distLoad.startMag} onChange={(e) => setDistLoad({ ...distLoad, startMag: Number(e.target.value) })} style={inputStyle} />
            <label style={labelStyle}>End Magnitude (kN/m):</label>
            <input type="number" step="any" value={distLoad.endMag} onChange={(e) => setDistLoad({ ...distLoad, endMag: Number(e.target.value) })} style={inputStyle} />
            <label style={labelStyle}>Start Pos (m):</label>
            <input type="number" step="any" value={distLoad.startPos} onChange={(e) => setDistLoad({ ...distLoad, startPos: Number(e.target.value) })} style={inputStyle} />
            <label style={labelStyle}>End Pos (m):</label>
            <input type="number" step="any" value={distLoad.endPos} onChange={(e) => setDistLoad({ ...distLoad, endPos: Number(e.target.value) })} style={inputStyle} />
          </div>
        )}
      </div>

      <div style={groupStyle}>
        <label style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" style={{ transform: 'scale(1.5)' }} checked={momentLoad.active} onChange={(e) => setMomentLoad({ ...momentLoad, active: e.target.checked })} />
          Applied Moment
        </label>
        {momentLoad.active && (
          <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '16px' }}>
              <label><input type="radio" checked={momentLoad.dir === 'cw'} onChange={() => setMomentLoad({ ...momentLoad, dir: 'cw' })} /> Clockwise</label>
              <label><input type="radio" checked={momentLoad.dir === 'ccw'} onChange={() => setMomentLoad({ ...momentLoad, dir: 'ccw' })} /> Anti-Clockwise</label>
            </div>
            <label style={labelStyle}>Magnitude (kN·m):</label>
            <input type="number" step="any" value={momentLoad.mag} onChange={(e) => setMomentLoad({ ...momentLoad, mag: Number(e.target.value) })} style={inputStyle} />
            <label style={labelStyle}>Position (m):</label>
            <input type="number" step="any" value={momentLoad.pos} onChange={(e) => setMomentLoad({ ...momentLoad, pos: Number(e.target.value) })} style={inputStyle} />
          </div>
        )}
      </div>
    </div>
  );
}
