import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import ChartBendingStress from './components/ChartBendingStress';
import BeamSetupView from './components/BeamSetupView';
import StressProfileView from './components/StressProfileView';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';

export default function App() {
  const [beamLength, setBeamLength] = useState(10);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(10);

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5, dir: 'down' });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });
  const [uvlLoad, setUvlLoad] = useState({ active: false, mag: 20, start: 0, end: 5 });
  const [momentLoad, setMomentLoad] = useState({ active: false, mag: 50, pos: 5, dir: 'cw' });

  const { plotData, reactions } = useMemo(() => {
    const activeLoads = [];

    if (pointLoad.active) {
      activeLoads.push({
        type: 'point',
        ...pointLoad,
        mag: pointLoad.dir === 'down' ? pointLoad.mag : -pointLoad.mag
      });
    }
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });
    if (uvlLoad.active) activeLoads.push({ type: 'uvl', ...uvlLoad });
    if (momentLoad.active) {
      activeLoads.push({
        type: 'moment',
        ...momentLoad,
        mag: momentLoad.dir === 'cw' ? momentLoad.mag : -momentLoad.mag
      });
    }

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
          <h4 style={{ marginTop: 0 }}>Graphical Question View</h4>
          <BeamSetupView
            beamLength={beamLength}
            supportA={supportA}
            supportB={supportB}
            pointLoad={pointLoad}
            udlLoad={udlLoad}
            uvlLoad={uvlLoad}
            momentLoad={momentLoad}
          />
        </div>
      </div>

      <div style={{ margin: '40px 0', borderTop: '2px solid #e2e8f0' }}></div>

      <h2>Answer: Design Performance Limits</h2>
      <div className="chart-section">
        <ChartSFD data={plotData} />
        <ChartBMD data={plotData} />
        <ChartBendingStress data={plotData} material={material} section={section} />
        <StressProfileView
          moment={plotData.reduce((max, d) => Math.abs(d.moment) > Math.abs(max) ? d.moment : max, 0)}
          section={section}
        />
      </div>
    </div>
  );
}
