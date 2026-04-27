import { solveReactions, calculateInternalForces } from './beamMath';
import { calculateDeflection } from './calculateDeflection';

export function generatePlotData(beamLength, loads, xA, xB, material, section) {
  const steps = 150;
  const dx = beamLength / steps;
  const basicData = [];

  const { rA, rB } = solveReactions(beamLength, loads, xA, xB);

  for (let i = 0; i <= steps; i++) {
    const x = Math.round((i * dx) * 1000) / 1000;
    const { shear, moment } = calculateInternalForces(x, beamLength, loads, xA, xB, rA, rB);
    basicData.push({ x, shear, moment });
  }

  const deflectionData = calculateDeflection(basicData, material.e_kn_m2, section.i_m4);

  const plotData = deflectionData.map(d => {
    const stressKpa = (d.moment * section.ymax_m) / section.i_m4;
    const stressMpa = stressKpa / 1000;
    const utilization = Math.abs(stressMpa) / material.fy_mpa;

    return {
      ...d,
      shear: Math.round(d.shear * 100) / 100,
      moment: Math.round(d.moment * 100) / 100,
      deflection: Math.round(d.deflection * 100) / 100,
      stress: Math.round(stressMpa * 100) / 100,
      utilization,
    };
  });

  return {
    plotData,
    reactions: { rA: Math.round(rA * 100) / 100, rB: Math.round(rB * 100) / 100 },
  };
}
