export function calculateDeflection(momentData, E, I) {
  const steps = momentData.length;
  const beamLength = momentData[steps - 1].x;
  const dx = beamLength / (steps - 1);

  const slopeValues = new Array(steps).fill(0);
  const deflectionValues = new Array(steps).fill(0);

  // 1st integration (trapezoidal): EI·θ = ∫M dx
  for (let i = 1; i < steps; i++) {
    const avgM = (momentData[i - 1].moment + momentData[i].moment) / 2;
    slopeValues[i] = slopeValues[i - 1] + avgM * dx;
  }

  // 2nd integration: EI·y = ∫θ dx
  for (let i = 1; i < steps; i++) {
    const avgSlope = (slopeValues[i - 1] + slopeValues[i]) / 2;
    deflectionValues[i] = deflectionValues[i - 1] + avgSlope * dx;
  }

  // Boundary condition: deflection at B = 0 (simply supported)
  const deflectionAtB = deflectionValues[steps - 1];
  const slopeCorrection = deflectionAtB / beamLength;

  return momentData.map((d, i) => {
    const cSlope = slopeValues[i] - slopeCorrection;
    const cDeflection = deflectionValues[i] - slopeCorrection * d.x;

    return {
      x: d.x,
      shear: d.shear,
      moment: d.moment,
      slope: cSlope / (E * I),
      deflection: (cDeflection / (E * I)) * 1000, // m → mm
    };
  });
}
