import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import ChartBendingStress from './components/ChartBendingStress';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';

export default function App() {
  const [beamLength, setBeamLength] = useState(10);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(10);

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5 });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });
  const [uvlLoad, setUvlLoad] = useState({ active: false, mag: 20, start: 0, end: 5 });
  const [momentLoad, setMomentLoad] = useState({ active: false, mag: 50, pos: 5 });

  const { plotData, reactions } = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad });
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });
    if (uvlLoad.active) activeLoads.push({ type: 'uvl', ...uvlLoad });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad });

    return generatePlotData(beamLength, activeLoads, supportA, supportB, material, section);
  }, [beamLength, supportA, supportB, material, section, pointLoad, udlLoad, uvlLoad, momentLoad]);

  return (
    <div className="app-container">
      <h2>Question: Structural Problem Setup</h2>
      <div className="dashboard">
        <ControlPanel
          beamLength={beamLength} setBeamLength={setBeamLength}
          supportA={supportA} setSupportA={setSupportA}
          supportB={supportB} setSupportB={setSupportB}
          material={material} setMaterial={setMaterial}
          section={section} setSection={setSection}
          pointLoad={pointLoad} setPointLoad={setPointLoad}
          udlLoad={udlLoad} setUdlLoad={setUdlLoad}
          uvlLoad={uvlLoad} setUvlLoad={setUvlLoad}
          momentLoad={momentLoad} setMomentLoad={setMomentLoad}
        />
        <div className="chart-section" style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', background: '#f8fafc' }}>
          <h4>Graphical Question View</h4>
          <p style={{ color: '#64748b' }}>BeamSetupView.jsx will be added here to draw the beam with supports and loads.</p>
        </div>
      </div>

      <div style={{ margin: '40px 0', borderTop: '2px solid #e2e8f0' }}></div>

      <h2>Answer: Design Performance Limits</h2>
      <div className="chart-section">
        <ChartSFD data={plotData} />
        <ChartBMD data={plotData} />
        <ChartBendingStress data={plotData} material={material} section={section} />
      </div>
    </div>
  );
}
