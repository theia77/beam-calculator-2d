import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import { generatePlotData } from './core/superposition';

export default function App() {
  const [beamLength, setBeamLength] = useState(10);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(10);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5 });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });
  const [momentLoad, setMomentLoad] = useState({ active: false, mag: 20, pos: 3 });

  const { plotData, reactions } = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad });
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad });

    const result = generatePlotData(beamLength, activeLoads, supportA, supportB);
    return { plotData: result.data, reactions: { rA: result.rA, rB: result.rB } };
  }, [beamLength, supportA, supportB, pointLoad, udlLoad, momentLoad]);

  return (
    <div className="app-container">
      <h2>Interactive Beam Calculator</h2>
      <div className="dashboard">
        <ControlPanel
          beamLength={beamLength} setBeamLength={setBeamLength}
          supportA={supportA} setSupportA={setSupportA}
          supportB={supportB} setSupportB={setSupportB}
          pointLoad={pointLoad} setPointLoad={setPointLoad}
          udlLoad={udlLoad} setUdlLoad={setUdlLoad}
          momentLoad={momentLoad} setMomentLoad={setMomentLoad}
          reactions={reactions}
        />
        <div className="chart-section">
          <ChartSFD data={plotData} />
          <ChartBMD data={plotData} />
        </div>
      </div>
    </div>
  );
}
