import { materials, sections } from '../core/beamData';

export default function ControlPanel({
  beamLength, setBeamLength,
  supportA, setSupportA,
  supportB, setSupportB,
  reactions,
  pointLoad, setPointLoad,
  momentLoad, setMomentLoad,
  distLoad, setDistLoad,
  material, setMaterial,
  section, setSection,
}) {
  const inputStyle = {
    width: '100%', padding: '8px', borderRadius: '6px',
    border: '1px solid #cbd5e1', marginBottom: '12px',
    boxSizing: 'border-box', fontSize: '14px',
  };

  return (
    <div className="control-panel">
      <h3>Controls (Problem Setup)</h3>

      <div className="control-group">
        <label>Material:</label>
        <select value={material.id} onChange={(e) => setMaterial(materials.find(m => m.id === e.target.value))} style={inputStyle}>
          {materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <label>Section:</label>
        <select value={section.id} onChange={(e) => setSection(sections.find(s => s.id === e.target.value))} style={inputStyle}>
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="control-group">
        <label>Total Beam Length (m):</label>
        <input type="number" step="any" value={beamLength} onChange={(e) => setBeamLength(Number(e.target.value))} style={inputStyle} />

        <label>Support A Position (m):</label>
        <input type="number" step="any" value={supportA} onChange={(e) => setSupportA(Number(e.target.value))} style={inputStyle} />

        <label>Support B Position (m):</label>
        <input type="number" step="any" value={supportB} onChange={(e) => setSupportB(Number(e.target.value))} style={inputStyle} />

        {reactions && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#e2e8f0', borderRadius: '6px' }}>
            <span><b>R<sub>A</sub></b> = {reactions.rA.toFixed(2)} kN</span>
            <span><b>R<sub>B</sub></b> = {reactions.rB.toFixed(2)} kN</span>
          </div>
        )}
      </div>

      {/* Point Load */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={pointLoad.active} onChange={(e) => setPointLoad({ ...pointLoad, active: e.target.checked })} />
          {' '}Point Load
        </label>
        {pointLoad.active && (
          <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #3b82f6' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={pointLoad.dir === 'down'} onChange={() => setPointLoad({ ...pointLoad, dir: 'down' })} /> Downward</label>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={pointLoad.dir === 'up'} onChange={() => setPointLoad({ ...pointLoad, dir: 'up' })} /> Upward</label>
            </div>
            <label>Magnitude (kN):</label>
            <input type="number" step="any" value={pointLoad.mag} onChange={(e) => setPointLoad({ ...pointLoad, mag: Number(e.target.value) })} style={inputStyle} />
            <label>Position (m):</label>
            <input type="number" step="any" value={pointLoad.pos} onChange={(e) => setPointLoad({ ...pointLoad, pos: Number(e.target.value) })} style={inputStyle} />
          </div>
        )}
      </div>

      {/* Distributed Load */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={distLoad.active} onChange={(e) => setDistLoad({ ...distLoad, active: e.target.checked })} />
          {' '}Distributed Load
        </label>
        {distLoad.active && (
          <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={distLoad.dir === 'down'} onChange={() => setDistLoad({ ...distLoad, dir: 'down' })} /> Downward</label>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={distLoad.dir === 'up'} onChange={() => setDistLoad({ ...distLoad, dir: 'up' })} /> Upward</label>
            </div>
            <label>Start Magnitude (kN/m):</label>
            <input type="number" step="any" value={distLoad.startMag} onChange={(e) => setDistLoad({ ...distLoad, startMag: Number(e.target.value) })} style={inputStyle} />
            <label>End Magnitude (kN/m):</label>
            <input type="number" step="any" value={distLoad.endMag} onChange={(e) => setDistLoad({ ...distLoad, endMag: Number(e.target.value) })} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Start Pos (m):</label>
                <input type="number" step="any" value={distLoad.startPos} onChange={(e) => setDistLoad({ ...distLoad, startPos: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label>End Pos (m):</label>
                <input type="number" step="any" value={distLoad.endPos} onChange={(e) => setDistLoad({ ...distLoad, endPos: Number(e.target.value) })} style={inputStyle} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applied Moment */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={momentLoad.active} onChange={(e) => setMomentLoad({ ...momentLoad, active: e.target.checked })} />
          {' '}Applied Moment
        </label>
        {momentLoad.active && (
          <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #8b5cf6' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={momentLoad.dir === 'cw'} onChange={() => setMomentLoad({ ...momentLoad, dir: 'cw' })} /> Clockwise</label>
              <label style={{ fontWeight: 'normal' }}><input type="radio" checked={momentLoad.dir === 'ccw'} onChange={() => setMomentLoad({ ...momentLoad, dir: 'ccw' })} /> Anti-Clockwise</label>
            </div>
            <label>Magnitude (kN·m):</label>
            <input type="number" step="any" value={momentLoad.mag} onChange={(e) => setMomentLoad({ ...momentLoad, mag: Number(e.target.value) })} style={inputStyle} />
            <label>Position (m):</label>
            <input type="number" step="any" value={momentLoad.pos} onChange={(e) => setMomentLoad({ ...momentLoad, pos: Number(e.target.value) })} style={inputStyle} />
          </div>
        )}
      </div>
    </div>
  );
}
