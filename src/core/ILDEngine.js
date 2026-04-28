import { solveFEA } from './MatrixEngine';

export function calculateILD(nodes, elements, supports, targetNodeId, resultType = 'Fy') {
  const steps = 50;
  const beamLength = Math.max(...nodes.map(n => n.x));
  const dx = beamLength / steps;

  const ildData = [];

  for (let i = 0; i <= steps; i++) {
    const currentX = i * dx;

    // Snap the unit load to the nearest existing node
    const nearestNode = nodes.reduce((prev, curr) =>
      Math.abs(curr.x - currentX) < Math.abs(prev.x - currentX) ? curr : prev
    );

    const movingLoad = [{ nodeId: nearestNode.id, Fy: -1, M: 0 }];
    const result = solveFEA(nodes, elements, supports, movingLoad);

    if (result.error) continue;

    let influenceValue = 0;
    if (resultType === 'Fy') {
      influenceValue = result.reactions[targetNodeId]?.Fy || 0;
    }

    ildData.push({ x: currentX, influence: influenceValue });
  }

  return ildData;
}
