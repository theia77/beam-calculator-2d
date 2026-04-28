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
    let force = 0;
    let arm = 0;

    if (load.type === 'point') {
      force = load.mag;
      arm = load.pos - xA;
      totalMomentAboutA += force * arm;
    } else if (load.type === 'moment') {
      totalMomentAboutA += load.mag;
      return;
    } else if (load.type === 'distributed') {
      const length = load.endPos - load.startPos;
      if (length <= 0) return;

      const w1 = load.startMag;
      const w2 = load.endMag;

      const forceRect = w1 * length;
      const armRect = (load.startPos + length / 2) - xA;

      const forceTri = 0.5 * (w2 - w1) * length;
      const armTri = (load.startPos + length * (2 / 3)) - xA;

      force = forceRect + forceTri;
      totalMomentAboutA += (forceRect * armRect) + (forceTri * armTri);
    }

    totalVerticalForce += force;
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
    } else if (load.type === 'moment') {
      moment += load.mag * mac(x, load.pos, 0);
    } else if (load.type === 'distributed') {
      const length = load.endPos - load.startPos;
      if (length <= 0) return;

      const w1 = load.startMag;
      const w2 = load.endMag;
      const k = (w2 - w1) / length;

      // Rectangular part
      shear -= w1 * mac(x, load.startPos, 1) - w1 * mac(x, load.endPos, 1);
      moment -= (w1 / 2) * mac(x, load.startPos, 2) - (w1 / 2) * mac(x, load.endPos, 2);

      // Triangular part
      shear -= (k / 2) * mac(x, load.startPos, 2) - (k / 2) * mac(x, load.endPos, 2) - (w2 - w1) * mac(x, load.endPos, 1);
      moment -= (k / 6) * mac(x, load.startPos, 3) - (k / 6) * mac(x, load.endPos, 3) - ((w2 - w1) / 2) * mac(x, load.endPos, 2);
    }
  });

  return { shear, moment };
}
