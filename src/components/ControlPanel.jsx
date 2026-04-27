import { materials, sections } from '../core/beamData';

export default function ControlPanel({
  beamLength, setBeamLength,
  supportA, setSupportA,
  supportB, setSupportB,
  reactions,
  material, setMaterial,
  section, setSection,
  pointLoad, setPointLoad,
  udlLoad, setUdlLoad,
  uvlLoad, setUvlLoad,
  momentLoad, setMomentLoad
}) {
  return (
    <div className="control-panel">
      <h3>Controls</h3>

      {/* Beam & Supports */}
      <div className="control-group">
        <label>Total Beam Length: {beamLength} m</label>
        <input type="range" min="5" max="30" step="1" value={beamLength}
          onChange={(e) => setBeamLength(Number(e.target.value))} />

        <label>Support A Position: {supportA} m</label>
        <input type="range" min="0" max={supportB - 0.1} step="0.1" value={supportA}
          onChange={(e) => setSupportA(Number(e.target.value))} />

        <label>Support B Position: {supportB} m</label>
        <input type="range" min={supportA + 0.1} max={beamLength} step="0.1" value={supportB}
          onChange={(e) => setSupportB(Number(e.target.value))} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px', background: '#e2e8f0', borderRadius: '6px' }}>
          <span><b>R<sub>A</sub></b> = {reactions.rA.toFixed(2)} kN</span>
          <span><b>R<sub>B</sub></b> = {reactions.rB.toFixed(2)} kN</span>
        </div>
      </div>

      {/* Material & Section */}
      <div className="control-group">
        <label>Material</label>
        <select style={{ width: '100%', padding: '5px', marginBottom: '8px' }}
          value={material.id}
          onChange={(e) => setMaterial(materials.find(m => m.id === e.target.value))}>
          {materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <label>Cross Section</label>
        <select style={{ width: '100%', padding: '5px' }}
          value={section.id}
          onChange={(e) => setSection(sections.find(s => s.id === e.target.value))}>
          {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Point Load */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={pointLoad.active}
            onChange={(e) => setPointLoad({ ...pointLoad, active: e.target.checked })} />
          {' '}Point Load
        </label>
        {pointLoad.active && (
          <>
            <label>Magnitude: {pointLoad.mag} kN (Negative = Upward)</label>
            <input type="range" min="-100" max="100" value={pointLoad.mag}
              onChange={(e) => setPointLoad({ ...pointLoad, mag: Number(e.target.value) })} />
            <label>Position: {pointLoad.pos} m</label>
            <input type="range" min="0" max={beamLength} step="0.1" value={pointLoad.pos}
              onChange={(e) => setPointLoad({ ...pointLoad, pos: Number(e.target.value) })} />
          </>
        )}
      </div>

      {/* UDL */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={udlLoad.active}
            onChange={(e) => setUdlLoad({ ...udlLoad, active: e.target.checked })} />
          {' '}Uniform Load (UDL)
        </label>
        {udlLoad.active && (
          <>
            <label>Magnitude: {udlLoad.mag} kN/m</label>
            <input type="range" min="-50" max="50" value={udlLoad.mag}
              onChange={(e) => setUdlLoad({ ...udlLoad, mag: Number(e.target.value) })} />
            <label>Start Pos: {udlLoad.start} m</label>
            <input type="range" min="0" max={udlLoad.end - 0.1} step="0.1" value={udlLoad.start}
              onChange={(e) => setUdlLoad({ ...udlLoad, start: Number(e.target.value) })} />
            <label>End Pos: {udlLoad.end} m</label>
            <input type="range" min={udlLoad.start + 0.1} max={beamLength} step="0.1" value={udlLoad.end}
              onChange={(e) => setUdlLoad({ ...udlLoad, end: Number(e.target.value) })} />
          </>
        )}
      </div>

      {/* UVL */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={uvlLoad.active}
            onChange={(e) => setUvlLoad({ ...uvlLoad, active: e.target.checked })} />
          {' '}Triangular Load (UVL)
        </label>
        {uvlLoad.active && (
          <>
            <label>Peak Magnitude: {uvlLoad.mag} kN/m</label>
            <input type="range" min="-50" max="50" value={uvlLoad.mag}
              onChange={(e) => setUvlLoad({ ...uvlLoad, mag: Number(e.target.value) })} />
            <label>Start Pos (0 kN/m): {uvlLoad.start} m</label>
            <input type="range" min="0" max={uvlLoad.end - 0.1} step="0.1" value={uvlLoad.start}
              onChange={(e) => setUvlLoad({ ...uvlLoad, start: Number(e.target.value) })} />
            <label>End Pos (Peak kN/m): {uvlLoad.end} m</label>
            <input type="range" min={uvlLoad.start + 0.1} max={beamLength} step="0.1" value={uvlLoad.end}
              onChange={(e) => setUvlLoad({ ...uvlLoad, end: Number(e.target.value) })} />
          </>
        )}
      </div>

      {/* Applied Moment */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={momentLoad.active}
            onChange={(e) => setMomentLoad({ ...momentLoad, active: e.target.checked })} />
          {' '}Applied Moment
        </label>
        {momentLoad.active && (
          <>
            <label>Magnitude: {momentLoad.mag} kN·m</label>
            <input type="range" min="-100" max="100" value={momentLoad.mag}
              onChange={(e) => setMomentLoad({ ...momentLoad, mag: Number(e.target.value) })} />
            <label>Position: {momentLoad.pos} m</label>
            <input type="range" min="0" max={beamLength} step="0.1" value={momentLoad.pos}
              onChange={(e) => setMomentLoad({ ...momentLoad, pos: Number(e.target.value) })} />
          </>
        )}
      </div>

    </div>
  );
}
