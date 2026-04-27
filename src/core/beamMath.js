function mac(x, a, power) {
  if (x < a) return 0;
  if (power === 0) return 1;
  return Math.pow(x - a, power);
}

export function solveReactions(L, loads, xA, xB) {
  const span = xB - xA;
  if (span === 0) return { rA: 0, rB: 0 };

  let totalMomentAboutA = 0;
  let totalVerticalForce = 0;

  loads.forEach(load => {
    const mag = load.mag;
    let force = 0;
    let arm = 0;

    if (load.type === 'point') {
      force = mag;
      arm = load.pos - xA;
    } else if (load.type === 'udl') {
      force = mag * (load.end - load.start);
      arm = (load.start + (load.end - load.start) / 2) - xA;
    } else if (load.type === 'uvl') {
      const length = load.end - load.start;
      force = 0.5 * mag * length;
      arm = (load.start + length * (2 / 3)) - xA;
    } else if (load.type === 'moment') {
      totalMomentAboutA += mag;
      return;
    }

    totalVerticalForce += force;
    totalMomentAboutA += force * arm;
  });

  const rB = totalMomentAboutA / span;
  const rA = totalVerticalForce - rB;

  return { rA, rB };
}

export function calculateInternalForces(x, L, loads, xA, xB, rA, rB) {
  let shear = rA * mac(x, xA, 0) + rB * mac(x, xB, 0);
  let moment = rA * mac(x, xA, 1) + rB * mac(x, xB, 1);

  loads.forEach(load => {
    if (load.type === 'point') {
      shear -= load.mag * mac(x, load.pos, 0);
      moment -= load.mag * mac(x, load.pos, 1);
    } else if (load.type === 'udl') {
      shear -= load.mag * mac(x, load.start, 1) - load.mag * mac(x, load.end, 1);
      moment -= (load.mag / 2) * mac(x, load.start, 2) - (load.mag / 2) * mac(x, load.end, 2);
    } else if (load.type === 'uvl') {
      const length = load.end - load.start;
      if (length > 0) {
        const k = load.mag / length;
        shear -= (k / 2) * mac(x, load.start, 2) - (k / 2) * mac(x, load.end, 2) - load.mag * mac(x, load.end, 1);
        moment -= (k / 6) * mac(x, load.start, 3) - (k / 6) * mac(x, load.end, 3) - (load.mag / 2) * mac(x, load.end, 2);
      }
    } else if (load.type === 'moment') {
      moment -= load.mag * mac(x, load.pos, 0);
    }
  });

  return { shear, moment };
}
