import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import ChartBendingStress from './components/ChartBendingStress';
import ChartDeflection from './components/ChartDeflection';
import ChartRotation from './components/ChartRotation';
import BeamSetupView from './components/BeamSetupView';
import StressProfileView from './components/StressProfileView';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';

export default function App() {
  const [beamLength, setBeamLength] = useState(10);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(10);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 50, pos: 5, dir: 'down' });
  const [udlLoad, setUdlLoad] = useState({ active: false, mag: 10, start: 2, end: 8 });
  const [uvlLoad, setUvlLoad] = useState({ active: false, mag: 20, start: 0, end: 5 });
  const [momentLoad, setMomentLoad] = useState({ active: false, mag: 50, pos: 5, dir: 'cw' });

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const { plotData, reactions, peakMoment } = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad, mag: pointLoad.dir === 'down' ? pointLoad.mag : -pointLoad.mag });
    if (udlLoad.active) activeLoads.push({ type: 'udl', ...udlLoad });
    if (uvlLoad.active) activeLoads.push({ type: 'uvl', ...uvlLoad });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad, mag: momentLoad.dir === 'cw' ? momentLoad.mag : -momentLoad.mag });

    const result = generatePlotData(beamLength, activeLoads, supportA, supportB, material, section);

    const momentValues = result.plotData.map(d => d.moment);
    const maxPos = Math.max(...momentValues);
    const maxNeg = Math.min(...momentValues);
    const peakM = Math.abs(maxPos) > Math.abs(maxNeg) ? maxPos : maxNeg;

    return { plotData: result.plotData, reactions: result.reactions, peakMoment: peakM };
  }, [beamLength, supportA, supportB, pointLoad, udlLoad, uvlLoad, momentLoad, material, section]);

  return (
    <div className="app-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Interactive Structural Analysis Engine</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '40% 1fr', gap: '30px', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>Problem Setup</h3>
            <BeamSetupView
              beamLength={beamLength} supportA={supportA} supportB={supportB}
              pointLoad={pointLoad} udlLoad={udlLoad} uvlLoad={uvlLoad} momentLoad={momentLoad}
            />
          </div>

          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supportA={supportA} setSupportA={setSupportA}
            supportB={supportB} setSupportB={setSupportB}
            reactions={reactions}
            pointLoad={pointLoad} setPointLoad={setPointLoad}
            udlLoad={udlLoad} setUdlLoad={setUdlLoad}
            uvlLoad={uvlLoad} setUvlLoad={setUvlLoad}
            momentLoad={momentLoad} setMomentLoad={setMomentLoad}
            material={material} setMaterial={setMaterial}
            section={section} setSection={setSection}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #94a3b8', paddingBottom: '10px' }}>Analysis Results</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <ChartSFD data={plotData} />
            <ChartBMD data={plotData} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <ChartDeflection data={plotData} />
            <ChartRotation data={plotData} />
          </div>

          <ChartBendingStress data={plotData} material={material} section={section} />
          <StressProfileView moment={peakMoment} section={section} />
        </div>

      </div>
    </div>
  );
}
