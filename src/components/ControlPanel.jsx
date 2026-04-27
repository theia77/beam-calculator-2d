export default function ControlPanel({
  beamLength, setBeamLength,
  supportA, setSupportA,
  supportB, setSupportB,
  pointLoad, setPointLoad,
  udlLoad, setUdlLoad,
  momentLoad, setMomentLoad,
  reactions
}) {
  return (
    <div className="control-panel">
      <h3>Controls</h3>

      {/* Beam Length */}
      <div className="control-group">
        <label>Total Beam Length: {beamLength} m</label>
        <input
          type="range" min="5" max="30" step="1"
          value={beamLength}
          onChange={(e) => setBeamLength(Number(e.target.value))}
        />
      </div>

      {/* Support Positions */}
      <div className="control-group">
        <label>Support A Position: {supportA} m</label>
        <input
          type="range" min="0" max={supportB - 1} step="0.1"
          value={supportA}
          onChange={(e) => setSupportA(Number(e.target.value))}
        />
        <label>Support B Position: {supportB} m</label>
        <input
          type="range" min={supportA + 1} max={beamLength} step="0.1"
          value={supportB}
          onChange={(e) => setSupportB(Number(e.target.value))}
        />
      </div>

      {/* Reactions Display */}
      {reactions && (
        <div className="control-group" style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>R<sub>A</sub> = <strong>{reactions.rA.toFixed(2)} kN</strong></span>
            <span>R<sub>B</sub> = <strong>{reactions.rB.toFixed(2)} kN</strong></span>
          </div>
        </div>
      )}

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
            <input type="range" min="0" max="50" value={udlLoad.mag}
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
