import { calcPointLoad, calcUDL } from './beamMath';

export function generatePlotData(beamLength, loads) {
  const steps = 100;
  const dx = beamLength / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    // Deal with floating point math quirks (e.g. 0.30000000000000004)
    const x = Math.round((i * dx) * 1000) / 1000;
    let totalShear = 0;
    let totalMoment = 0;

    // The Superposition Loop
    loads.forEach(load => {
      let result = { shear: 0, moment: 0 };

      if (load.type === 'point') {
        result = calcPointLoad(x, beamLength, load.mag, load.pos);
      } else if (load.type === 'udl') {
        result = calcUDL(x, beamLength, load.mag, load.start, load.end);
      }

      totalShear += result.shear;
      totalMoment += result.moment;
    });

    data.push({
      x: x,
      shear: Math.round(totalShear * 100) / 100,
      moment: Math.round(totalMoment * 100) / 100
    });
  }

  return data;
}
