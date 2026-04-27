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
    if (load.type === 'point') {
      const force = load.mag;
      const arm = load.pos - xA;
      totalVerticalForce += force;
      totalMomentAboutA += force * arm;
    } else if (load.type === 'udl') {
      const force = load.mag * (load.end - load.start);
      const arm = (load.start + (load.end - load.start) / 2) - xA;
      totalVerticalForce += force;
      totalMomentAboutA += force * arm;
    } else if (load.type === 'moment') {
      totalMomentAboutA += load.mag;
    }
  });

  const rB = totalMomentAboutA / span;
  const rA = totalVerticalForce - rB;

  return { rA, rB };
}

export function calculateInternalForces(x, L, loads, xA, xB, rA, rB) {
  let shear = rA * mac(x, xA, 0);
  let moment = rA * mac(x, xA, 1);

  shear += rB * mac(x, xB, 0);
  moment += rB * mac(x, xB, 1);

  loads.forEach(load => {
    if (load.type === 'point') {
      shear -= load.mag * mac(x, load.pos, 0);
      moment -= load.mag * mac(x, load.pos, 1);
    } else if (load.type === 'udl') {
      shear -= load.mag * mac(x, load.start, 1) - load.mag * mac(x, load.end, 1);
      moment -= (load.mag / 2) * mac(x, load.start, 2) - (load.mag / 2) * mac(x, load.end, 2);
    } else if (load.type === 'moment') {
      moment -= load.mag * mac(x, load.pos, 0);
    }
  });

  return { shear, moment };
}
