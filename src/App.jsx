import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import { generatePlotData } from './core/superposition';

export default function App() {
  const [beamLength, setBeamLength] = useState(10);
  const [beamType, setBeamType] = useState('simply_supported');
  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5 });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });
  const [uvlLoad, setUvlLoad] = useState({ active: false, mag: 20, start: 0, end: 5 });
  const [momentLoad, setMomentLoad] = useState({ active: false, mag: 50, pos: 5 });

  const plotData = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad });
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });
    if (uvlLoad.active) activeLoads.push({ type: 'uvl', ...uvlLoad });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad });

    return generatePlotData(beamLength, activeLoads, beamType);
  }, [beamLength, pointLoad, udlLoad, uvlLoad, momentLoad, beamType]);

  return (
    <div className="app-container">
      <h2>Interactive Beam Calculator</h2>
      <div className="dashboard">
        <ControlPanel
          beamLength={beamLength} setBeamLength={setBeamLength}
          beamType={beamType} setBeamType={setBeamType}
          pointLoad={pointLoad} setPointLoad={setPointLoad}
          udlLoad={udlLoad} setUdlLoad={setUdlLoad}
          uvlLoad={uvlLoad} setUvlLoad={setUvlLoad}
          momentLoad={momentLoad} setMomentLoad={setMomentLoad}
        />
        <div className="chart-section">
          <ChartSFD data={plotData} />
          <ChartBMD data={plotData} />
        </div>
      </div>
    </div>
  );
}
