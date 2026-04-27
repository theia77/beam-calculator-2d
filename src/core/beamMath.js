function mac(x, a, power) {
  if (x < a) return 0;
  if (power === 0) return 1;
  return Math.pow(x - a, power);
}

export function calcPointLoad(x, L, mag, pos, beamType) {
  let R1 = 0; let M_wall = 0;
  if (beamType === 'simply_supported') {
    R1 = mag * (L - pos) / L;
  } else if (beamType === 'cantilever') {
    R1 = mag;
    M_wall = -mag * pos;
  }
  const shear = R1 - (mag * mac(x, pos, 0));
  const moment = M_wall + (R1 * x) - (mag * mac(x, pos, 1));
  return { shear, moment };
}

export function calcUDL(x, L, mag, start, end, beamType) {
  let R1 = 0; let M_wall = 0;
  const totalForce = mag * (end - start);
  const centerOfForce = start + ((end - start) / 2);
  if (beamType === 'simply_supported') {
    R1 = totalForce * (L - centerOfForce) / L;
  } else if (beamType === 'cantilever') {
    R1 = totalForce;
    M_wall = -totalForce * centerOfForce;
  }
  const shear = R1 - (mag * mac(x, start, 1)) + (mag * mac(x, end, 1));
  const moment = M_wall + (R1 * x) - ((mag / 2) * mac(x, start, 2)) + ((mag / 2) * mac(x, end, 2));
  return { shear, moment };
}

export function calcUVL(x, L, mag, start, end, beamType) {
  const length = end - start;
  if (length === 0) return { shear: 0, moment: 0 };

  const k = mag / length;
  const totalForce = 0.5 * mag * length;
  const centerOfForce = start + (length * (2 / 3));

  let R1 = 0; let M_wall = 0;
  if (beamType === 'simply_supported') {
    R1 = totalForce * (L - centerOfForce) / L;
  } else if (beamType === 'cantilever') {
    R1 = totalForce;
    M_wall = -totalForce * centerOfForce;
  }

  const shear = R1
    - (k / 2) * mac(x, start, 2)
    + (k / 2) * mac(x, end, 2)
    + mag * mac(x, end, 1);

  const moment = M_wall + (R1 * x)
    - (k / 6) * mac(x, start, 3)
    + (k / 6) * mac(x, end, 3)
    + (mag / 2) * mac(x, end, 2);

  return { shear, moment };
}

export function calcMomentLoad(x, L, mag, pos, beamType) {
  let R1 = 0;
  let M_wall = 0;
  if (beamType === 'simply_supported') {
    R1 = -mag / L;
  } else if (beamType === 'cantilever') {
    R1 = 0;
    M_wall = -mag;
  }
  const shear = R1;
  const moment = M_wall + (R1 * x) + (mag * mac(x, pos, 0));
  return { shear, moment };
}
