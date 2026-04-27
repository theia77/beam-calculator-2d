import { calcPointLoad, calcUDL, calcUVL, calcMomentLoad } from './beamMath';

export function generatePlotData(beamLength, loads, beamType) {
  const steps = 100;
  const dx = beamLength / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const x = Math.round((i * dx) * 1000) / 1000;
    let totalShear = 0;
    let totalMoment = 0;

    loads.forEach(load => {
      let result = { shear: 0, moment: 0 };

      if (load.type === 'point') {
        result = calcPointLoad(x, beamLength, load.mag, load.pos, beamType);
      } else if (load.type === 'udl') {
        result = calcUDL(x, beamLength, load.mag, load.start, load.end, beamType);
      } else if (load.type === 'uvl') {
        result = calcUVL(x, beamLength, load.mag, load.start, load.end, beamType);
      } else if (load.type === 'moment') {
        result = calcMomentLoad(x, beamLength, load.mag, load.pos, beamType);
      }

      totalShear += result.shear;
      totalMoment += result.moment;
    });

    data.push({
      x,
      shear: Math.round(totalShear * 100) / 100,
      moment: Math.round(totalMoment * 100) / 100
    });
  }

  return data;
}
