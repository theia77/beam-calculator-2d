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

  const [loads, setLoads] = useState([
    { id: 1, type: 'point', mag: 10, pos: 2, dir: 'down' },
    { id: 2, type: 'moment', mag: 20, pos: 6, dir: 'ccw' },
    { id: 3, type: 'distributed', startMag: 5, endMag: 2, startPos: 0, endPos: 5, dir: 'up' }
  ]);

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const { plotData, reactions, peakValues } = useMemo(() => {
    const activeLoads = loads.map(load => {
      if (load.type === 'point') return { ...load, mag: load.dir === 'down' ? load.mag : -load.mag };
      if (load.type === 'moment') return { ...load, mag: load.dir === 'cw' ? load.mag : -load.mag };
      if (load.type === 'distributed') {
        const mult = load.dir === 'down' ? 1 : -1;
        return { ...load, startMag: load.startMag * mult, endMag: load.endMag * mult };
      }
      return load;
    });

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
        shear: getPeak('shear'), moment: getPeak('moment'),
        deflection: getPeak('deflection'), slope: getPeak('slope'),
        stress: Math.max(...result.plotData.map(d => d.stress))
      }
    };
  }, [beamLength, supportA, supportB, loads, material, section]);

  return (
    <div className="app-container" style={{ width: '100%', maxWidth: '1920px', boxSizing: 'border-box', margin: '0 auto', padding: '20px 40px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #cbd5e1', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.5rem' }}>Determinate Beam Solver</h1>
        {isSolved && (
          <button onClick={() => setIsSolved(false)} style={{ padding: '12px 24px', fontSize: '18px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Edit Problem Setup
          </button>
        )}
      </div>

      {!isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
              <h2 style={{ marginTop: 0, fontSize: '1.8rem', color: '#1e293b' }}>Model View</h2>
              <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />
            </div>

            <button onClick={() => setIsSolved(true)} style={{ padding: '25px', fontSize: '24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', letterSpacing: '2px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
              RUN ANALYSIS
            </button>
          </div>

          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supportA={supportA} setSupportA={setSupportA} supportB={supportB} setSupportB={setSupportB}
            loads={loads} setLoads={setLoads}
            material={material} setMaterial={setMaterial} section={section} setSection={setSection}
          />
        </div>
      )}

      {isSolved && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, textAlign: 'center', color: '#1e293b', fontSize: '1.8rem' }}>Analysis Projections</h2>
            <BeamSetupView beamLength={beamLength} supportA={supportA} supportB={supportB} loads={loads} />
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartSFD data={plotData} /></div>
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartBMD data={plotData} /></div>
            <div style={{ borderTop: '3px dashed #cbd5e1', paddingTop: '20px' }}><ChartDeflection data={plotData} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <ResultsTable reactions={reactions} peakValues={peakValues} material={material} section={section} />
            <StressProfileView moment={peakValues.moment} section={section} />
          </div>
        </div>
      )}
    </div>
  );
}
