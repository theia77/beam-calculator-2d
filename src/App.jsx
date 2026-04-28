import { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import ChartSFD from './components/ChartSFD';
import ChartBMD from './components/ChartBMD';
import ChartDeflection from './components/ChartDeflection';
import ChartRotation from './components/ChartRotation';
import BeamSetupView from './components/BeamSetupView';
import StressProfileView from './components/StressProfileView';
import ResultsTable from './components/ResultsTable';
import { generatePlotData } from './core/superposition';
import { materials, sections } from './core/beamData';

export default function App() {
  const [isSolved, setIsSolved] = useState(false);

  const [beamLength, setBeamLength] = useState(10);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(10);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 10, pos: 2, dir: 'down' });
  const [momentLoad, setMomentLoad] = useState({ active: true, mag: 20, pos: 6, dir: 'ccw' });
  const [distLoad, setDistLoad] = useState({ active: true, startMag: 5, endMag: 2, startPos: 0, endPos: 5, dir: 'up' });

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const { plotData, reactions, peakValues } = useMemo(() => {
    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad, mag: pointLoad.dir === 'down' ? pointLoad.mag : -pointLoad.mag });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad, mag: momentLoad.dir === 'cw' ? momentLoad.mag : -momentLoad.mag });
    if (distLoad.active) {
      const multiplier = distLoad.dir === 'down' ? 1 : -1;
      activeLoads.push({ type: 'distributed', startPos: distLoad.startPos, endPos: distLoad.endPos, startMag: distLoad.startMag * multiplier, endMag: distLoad.endMag * multiplier });
    }

    const result = generatePlotData(beamLength, activeLoads, supportA, supportB, material, section);

    const getPeak = (key) => {
      const vals = result.plotData.map(d => d[key]);
      const maxP = Math.max(...vals);
      const maxN = Math.min(...vals);
      return Math.abs(maxP) > Math.abs(maxN) ? maxP : maxN;
    };

    return {
      plotData: result.plotData,
      reactions: result.reactions,
      peakValues: {
        shear: getPeak('shear'),
        moment: getPeak('moment'),
        deflection: getPeak('deflection'),
        slope: getPeak('slope'),
        stress: Math.max(...result.plotData.map(d => d.stress)),
      },
    };
  }, [beamLength, supportA, supportB, pointLoad, momentLoad, distLoad, material, section]);

  return (
    <div className="app-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Structural Analysis Engine</h2>
        {isSolved && (
          <button onClick={() => setIsSolved(false)} style={{ padding: '10px 20px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Edit Setup
          </button>
        )}
      </div>

      {/* PAGE 1: SETUP MODE */}
      {!isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0 }}>Model View</h3>
              <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} pointLoad={pointLoad} momentLoad={momentLoad} distLoad={distLoad} />
            </div>

            <button
              onClick={() => setIsSolved(true)}
              style={{ padding: '20px', fontSize: '20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              RUN ANALYSIS (SOLVE)
            </button>
          </div>

          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supportA={supportA} setSupportA={setSupportA}
            supportB={supportB} setSupportB={setSupportB}
            reactions={reactions}
            pointLoad={pointLoad} setPointLoad={setPointLoad}
            momentLoad={momentLoad} setMomentLoad={setMomentLoad}
            distLoad={distLoad} setDistLoad={setDistLoad}
            material={material} setMaterial={setMaterial}
            section={section} setSection={setSection}
          />
        </div>
      )}

      {/* PAGE 2: RESULTS MODE */}
      {isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>

          {/* Left Column: Stacked visuals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, textAlign: 'center', color: '#475569' }}>Analysis Projections</h3>

            <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} pointLoad={pointLoad} momentLoad={momentLoad} distLoad={distLoad} />

            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '15px' }}>
              <ChartSFD data={plotData} />
            </div>
            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '15px' }}>
              <ChartBMD data={plotData} />
            </div>
            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '15px' }}>
              <ChartDeflection data={plotData} />
            </div>
          </div>

          {/* Right Column: Summary table and stress profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ResultsTable reactions={reactions} peakValues={peakValues} material={material} section={section} />
            <StressProfileView moment={peakValues.moment} section={section} />
          </div>

        </div>
      )}

    </div>
  );
}
