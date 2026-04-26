// Macaulay Bracket Helper Function
// Returns 0 if x < a. If x >= a, returns (x-a)^power
function mac(x, a, power) {
  if (x < a) return 0;
  if (power === 0) return 1; // Step function for point loads in shear
  return Math.pow(x - a, power);
}

export function calcPointLoad(x, L, mag, pos) {
  // Statics: Sum of Moments around right support = 0
  const R1 = mag * (L - pos) / L;

  // Macaulay Equations
  const shear = R1 - (mag * mac(x, pos, 0));
  const moment = (R1 * x) - (mag * mac(x, pos, 1));

  return { shear, moment };
}

export function calcUDL(x, L, mag, start, end) {
  // Statics: Equivalent point load
  const totalForce = mag * (end - start);
  const centerOfForce = start + ((end - start) / 2);
  const R1 = totalForce * (L - centerOfForce) / L;

  // Macaulay Equations for UDL starting at 'start' and stopping at 'end'
  const shear = R1 - (mag * mac(x, start, 1)) + (mag * mac(x, end, 1));
  const moment = (R1 * x) - ((mag / 2) * mac(x, start, 2)) + ((mag / 2) * mac(x, end, 2));

  return { shear, moment };
}
