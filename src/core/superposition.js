import { solveReactions, calculateInternalForces } from './beamMath';

export function generatePlotData(beamLength, loads, xA, xB) {
  const steps = 150;
  const dx = beamLength / steps;
  const data = [];

  const { rA, rB } = solveReactions(beamLength, loads, xA, xB);

  for (let i = 0; i <= steps; i++) {
    const x = Math.round((i * dx) * 1000) / 1000;
    const { shear, moment } = calculateInternalForces(x, beamLength, loads, xA, xB, rA, rB);

    data.push({
      x,
      shear: Math.round(shear * 100) / 100,
      moment: Math.round(moment * 100) / 100
    });
  }

  return { data, rA, rB };
}
