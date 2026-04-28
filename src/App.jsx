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

  const [supports, setSupports] = useState([
    { id: 1, type: 'pin', x: 0 },
    { id: 2, type: 'roller', x: 10 }
  ]);

  const [pointLoad, setPointLoad] = useState({ active: true, mag: 10, pos: 2, dir: 'down' });
  const [momentLoad, setMomentLoad] = useState({ active: true, mag: 20, pos: 6, dir: 'ccw' });
  const [distLoad, setDistLoad] = useState({ active: true, startMag: 5, endMag: 2, startPos: 0, endPos: 5, dir: 'up' });

  const [material, setMaterial] = useState(materials[0]);
  const [section, setSection] = useState(sections[0]);

  const { isDeterminate, unknowns } = useMemo(() => {
    let unk = 0;
    supports.forEach(sup => {
      if (sup.type === 'roller' || sup.type === 'pin') unk += 1;
      if (sup.type === 'fixed') unk += 2;
    });
    return { unknowns: unk, isDeterminate: unk === 2 };
  }, [supports]);

  const { plotData, reactions, peakValues, mathError } = useMemo(() => {
    if (!isDeterminate) return { mathError: true };

    const activeLoads = [];
    if (pointLoad.active) activeLoads.push({ type: 'point', ...pointLoad, mag: pointLoad.dir === 'down' ? pointLoad.mag : -pointLoad.mag });
    if (momentLoad.active) activeLoads.push({ type: 'moment', ...momentLoad, mag: momentLoad.dir === 'cw' ? momentLoad.mag : -momentLoad.mag });
    if (distLoad.active) {
      const multiplier = distLoad.dir === 'down' ? 1 : -1;
      activeLoads.push({ type: 'distributed', startPos: distLoad.startPos, endPos: distLoad.endPos, startMag: distLoad.startMag * multiplier, endMag: distLoad.endMag * multiplier });
    }

    const xA = supports[0] ? supports[0].x : 0;
    const xB = supports[1] ? supports[1].x : 10;

    const result = generatePlotData(beamLength, activeLoads, xA, xB, material, section);

    const getPeak = (key) => {
      const vals = result.plotData.map(d => d[key]);
      const maxP = Math.max(...vals);
      const maxN = Math.min(...vals);
      return Math.abs(maxP) > Math.abs(maxN) ? maxP : maxN;
    };

    return {
      mathError: false,
      plotData: result.plotData,
      reactions: result.reactions,
      peakValues: {
        shear: getPeak('shear'), moment: getPeak('moment'),
        deflection: getPeak('deflection'), slope: getPeak('slope'),
        stress: Math.max(...result.plotData.map(d => d.stress))
      }
    };
  }, [beamLength, supports, pointLoad, momentLoad, distLoad, material, section, isDeterminate]);

  return (
    <div className="app-container" style={{ width: '100%', maxWidth: '1920px', boxSizing: 'border-box', margin: '0 auto', padding: '20px 40px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #cbd5e1', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.5rem' }}>Structural Analysis Engine</h1>
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
              <BeamSetupView beamLength={beamLength} supports={supports} pointLoad={pointLoad} momentLoad={momentLoad} distLoad={distLoad} />
            </div>

            {isDeterminate ? (
              <button onClick={() => setIsSolved(true)} style={{ padding: '25px', fontSize: '24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', letterSpacing: '2px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
                RUN ANALYSIS
              </button>
            ) : (
              <div style={{ padding: '25px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #f87171' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Statically Indeterminate</h3>
                You have {unknowns} unknown support reactions. Matrix Stiffness Method upgrade required to solve.
              </div>
            )}
          </div>

          <ControlPanel
            beamLength={beamLength} setBeamLength={setBeamLength}
            supports={supports} setSupports={setSupports}
            pointLoad={pointLoad} setPointLoad={setPointLoad}
            momentLoad={momentLoad} setMomentLoad={setMomentLoad} distLoad={distLoad} setDistLoad={setDistLoad}
            material={material} setMaterial={setMaterial} section={section} setSection={setSection}
          />
        </div>
      )}

      {isSolved && !mathError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, textAlign: 'center', color: '#1e293b', fontSize: '1.8rem' }}>Analysis Projections</h2>
            <BeamSetupView beamLength={beamLength} supports={supports} pointLoad={pointLoad} momentLoad={momentLoad} distLoad={distLoad} />
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
