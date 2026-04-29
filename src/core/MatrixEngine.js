import { matrix, multiply, inv, zeros } from 'mathjs';

function getLocalK(E, I, L, hingeType = 'none') {
  const k = (E * I) / Math.pow(L, 3);

  if (hingeType === 'none') {
    return [
      [12*k,      6*L*k,     -12*k,     6*L*k],
      [6*L*k,    4*L*L*k,   -6*L*k,    2*L*L*k],
      [-12*k,    -6*L*k,     12*k,     -6*L*k],
      [6*L*k,    2*L*L*k,   -6*L*k,    4*L*L*k]
    ];
  }

  if (hingeType === 'right') {
    return [
      [3*k,      3*L*k,     -3*k,      0],
      [3*L*k,    3*L*L*k,   -3*L*k,    0],
      [-3*k,    -3*L*k,      3*k,      0],
      [0,        0,          0,        0]
    ];
  }

  if (hingeType === 'left') {
    return [
      [3*k,      0,         -3*k,      3*L*k],
      [0,        0,          0,        0],
      [-3*k,     0,          3*k,     -3*L*k],
      [3*L*k,    0,         -3*L*k,    3*L*L*k]
    ];
  }
}

export function solveFEA(nodes, elements, supports, nodalLoads) {
  const numNodes = nodes.length;
  const numDOFs = numNodes * 2;

  let K_global = zeros(numDOFs, numDOFs).toArray();
  let F_global = new Array(numDOFs).fill(0);

  // Assemble Global Stiffness Matrix
  elements.forEach(el => {
    const k_local = getLocalK(el.E, el.I, el.L, el.hinge);
    const n1 = nodes.findIndex(n => n.id === el.node1);
    const n2 = nodes.findIndex(n => n.id === el.node2);
    const dofs = [n1*2, n1*2+1, n2*2, n2*2+1];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K_global[dofs[i]][dofs[j]] += k_local[i][j];
      }
    }
  });

  const K_pure = matrix(K_global);

  // Apply Nodal Loads
  nodalLoads.forEach(load => {
    const nIdx = nodes.findIndex(n => n.id === load.nodeId);
    if (nIdx !== -1) {
      F_global[nIdx*2]   += load.Fy || 0;
      F_global[nIdx*2+1] += load.M  || 0;
    }
  });

  // Apply Boundary Conditions via Penalty Method
  const penalty = 1e15;
  supports.forEach(sup => {
    const nIdx = nodes.findIndex(n => n.id === sup.nodeId);
    if (nIdx !== -1) {
      if (sup.type === 'pin' || sup.type === 'roller') {
        K_global[nIdx*2][nIdx*2] += penalty;
      }
      if (sup.type === 'fixed') {
        K_global[nIdx*2][nIdx*2]     += penalty;
        K_global[nIdx*2+1][nIdx*2+1] += penalty;
      }
    }
  });

  // Solve K·u = F
  let displacements;
  try {
    displacements = multiply(inv(matrix(K_global)), matrix(F_global)).toArray();

    // Catch floating-point mechanisms: matrix "inverted" but displacements are astronomically huge
    const maxDisp = Math.max(...displacements.map(Math.abs));
    if (maxDisp > 1e6) {
      return { error: 'Structure is unstable (Mechanism detected). It will collapse under load.' };
    }
  } catch (err) {
    return { error: 'Matrix is singular (Structure is unstable)' };
  }

  // Back-calculate Reactions: R = K_pure·u - F
  const internalForces = multiply(K_pure, displacements).toArray();
  const reactions = {};

  supports.forEach(sup => {
    const nIdx = nodes.findIndex(n => n.id === sup.nodeId);
    reactions[sup.nodeId] = {
      Fy: internalForces[nIdx*2]   - F_global[nIdx*2],
      M:  sup.type === 'fixed'
            ? internalForces[nIdx*2+1] - F_global[nIdx*2+1]
            : 0
    };
  });

  return { displacements, reactions };
}
