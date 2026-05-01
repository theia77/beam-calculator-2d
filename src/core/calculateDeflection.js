function interpolate(xs, values, targetX) {
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i] <= targetX && targetX <= xs[i + 1]) {
      const t = (targetX - xs[i]) / (xs[i + 1] - xs[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[values.length - 1];
}

export function calculateDeflection(momentData, E, I, xA, xB) {
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

  // Boundary conditions: y(xA) = 0 and y(xB) = 0
  // Solve for integration constants C1, C2 in: Y_corrected(x) = Y_raw(x) + C1*x + C2
  const xs = momentData.map(d => d.x);
  const Y_at_xA = interpolate(xs, deflectionValues, xA);
  const Y_at_xB = interpolate(xs, deflectionValues, xB);
  const span = xB - xA;
  const C1 = -(Y_at_xB - Y_at_xA) / span;
  const C2 = -Y_at_xA - C1 * xA;

  return momentData.map((d, i) => {
    const cDeflection = deflectionValues[i] + C1 * d.x + C2;
    const cSlope = slopeValues[i] + C1;

    return {
      x: d.x,
      shear: d.shear,
      moment: d.moment,
      slope: cSlope / (E * I),
      deflection: (cDeflection / (E * I)) * 1000, // m → mm
    };
  });
}
