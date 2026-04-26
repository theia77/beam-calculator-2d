import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import { generatePlotData } from './core/superposition';

export default function App() {
  const beamLength = 10; // Fixed 10m beam

  // The application state holding our loads
  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5 });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });

  // useMemo ensures we only recalculate the math when the sliders move
  const plotData = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad });
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });

    return generatePlotData(beamLength, activeLoads);
  }, [pointLoad, udlLoad]);

  return (
    <div className="app-container">
      <h2>Interactive Beam Calculator (Macaulay's Method)</h2>
      <div className="dashboard">
        <ControlPanel
          pointLoad={pointLoad} setPointLoad={setPointLoad}
          udlLoad={udlLoad} setUdlLoad={setUdlLoad}
          beamLength={beamLength}
        />
        <div className="chart-section">
          <ChartSFD data={plotData} />
          <ChartBMD data={plotData} />
        </div>
      </div>
    </div>
  );
}
