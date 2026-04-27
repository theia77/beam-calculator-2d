export default function ControlPanel({
  beamLength, setBeamLength,
  beamType, setBeamType,
  pointLoad, setPointLoad,
  udlLoad, setUdlLoad,
  uvlLoad, setUvlLoad,
  momentLoad, setMomentLoad
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

      {/* Beam Type */}
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

      {/* Point Load */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={pointLoad.active}
            onChange={(e) => setPointLoad({ ...pointLoad, active: e.target.checked })} />
          {' '}Point Load
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

      {/* UVL (Triangular Load) */}
      <div className="control-group">
        <label>
          <input type="checkbox" checked={uvlLoad.active}
            onChange={(e) => setUvlLoad({ ...uvlLoad, active: e.target.checked })} />
          {' '}Triangular Load (UVL)
        </label>
        {uvlLoad.active && (
          <>
            <label>Peak Magnitude: {uvlLoad.mag} kN/m</label>
            <input type="range" min="0" max="50" value={uvlLoad.mag}
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
