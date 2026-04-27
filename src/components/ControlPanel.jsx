export default function ControlPanel({ beamType, setBeamType, pointLoad, setPointLoad, udlLoad, setUdlLoad, beamLength }) {
  return (
    <div className="control-panel">
      <h3>Controls</h3>

      <div className="control-group">
        <label>Beam Type</label>
        <select
          value={beamType}
          onChange={(e) => setBeamType(e.target.value)}
          style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
        >
          <option value="simply_supported">Simply Supported</option>
          <option value="cantilever">Cantilever (Fixed Left)</option>
        </select>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={pointLoad.active}
            onChange={(e) => setPointLoad({ ...pointLoad, active: e.target.checked })}
          />
          Point Load
        </label>

        {pointLoad.active && (
          <>
            <label>Magnitude: {pointLoad.mag} kN</label>
            <input type="range" min="0" max="100" value={pointLoad.mag}
              onChange={(e) => setPointLoad({ ...pointLoad, mag: Number(e.target.value) })} />

            <label>Position: {pointLoad.pos} m</label>
            <input type="range" min="0" max={beamLength} step="0.1" value={pointLoad.pos}
              onChange={(e) => setPointLoad({ ...pointLoad, pos: Number(e.target.value) })} />
          </>
        )}
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={udlLoad.active}
            onChange={(e) => setUdlLoad({ ...udlLoad, active: e.target.checked })}
          />
          Uniform Distributed Load (UDL)
        </label>

        {udlLoad.active && (
          <>
            <label>Magnitude: {udlLoad.mag} kN/m</label>
            <input type="range" min="0" max="50" value={udlLoad.mag}
              onChange={(e) => setUdlLoad({ ...udlLoad, mag: Number(e.target.value) })} />

            <label>Start Pos: {udlLoad.start} m</label>
            <input type="range" min="0" max={udlLoad.end} step="0.1" value={udlLoad.start}
              onChange={(e) => setUdlLoad({ ...udlLoad, start: Number(e.target.value) })} />

            <label>End Pos: {udlLoad.end} m</label>
            <input type="range" min={udlLoad.start} max={beamLength} step="0.1" value={udlLoad.end}
              onChange={(e) => setUdlLoad({ ...udlLoad, end: Number(e.target.value) })} />
          </>
        )}
      </div>
    </div>
  );
}
