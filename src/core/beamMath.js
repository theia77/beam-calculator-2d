function mac(x, a, power) {
  if (x < a) return 0;
  if (power === 0) return 1;
  return Math.pow(x - a, power);
}

export function calcPointLoad(x, L, mag, pos, beamType) {
  let R1 = 0;
  let M_wall = 0;

  if (beamType === 'simply_supported') {
    R1 = mag * (L - pos) / L;
    const shear = R1 - (mag * mac(x, pos, 0));
    const moment = (R1 * x) - (mag * mac(x, pos, 1));
    return { shear, moment };
  } else if (beamType === 'cantilever') {
    R1 = mag;
    M_wall = -mag * pos;
    const shear = R1 - (mag * mac(x, pos, 0));
    const moment = M_wall + (R1 * x) - (mag * mac(x, pos, 1));
    return { shear, moment };
  }

  return { shear: 0, moment: 0 };
}

export function calcUDL(x, L, mag, start, end, beamType) {
  let R1 = 0;
  let M_wall = 0;
  const totalForce = mag * (end - start);
  const centerOfForce = start + ((end - start) / 2);

  if (beamType === 'simply_supported') {
    R1 = totalForce * (L - centerOfForce) / L;
    const shear = R1 - (mag * mac(x, start, 1)) + (mag * mac(x, end, 1));
    const moment = (R1 * x) - ((mag / 2) * mac(x, start, 2)) + ((mag / 2) * mac(x, end, 2));
    return { shear, moment };
  } else if (beamType === 'cantilever') {
    R1 = totalForce;
    M_wall = -totalForce * centerOfForce;
    const shear = R1 - (mag * mac(x, start, 1)) + (mag * mac(x, end, 1));
    const moment = M_wall + (R1 * x) - ((mag / 2) * mac(x, start, 2)) + ((mag / 2) * mac(x, end, 2));
    return { shear, moment };
  }

  return { shear: 0, moment: 0 };
}
