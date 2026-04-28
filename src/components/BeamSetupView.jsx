export default function BeamSetupView({
  beamLength, supportA, supportB,
  pointLoad, momentLoad, distLoad,
}) {
  const SVG_WIDTH = 800;
  const PADDING = 100;
  const Y_BEAM = 150;

  const scaleX = (x) => PADDING + (x / beamLength) * SVG_WIDTH;

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <svg viewBox="0 0 1000 300" style={{ width: '100%', minWidth: '600px', display: 'block' }}>

        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Beam */}
        <rect x={scaleX(0)} y={Y_BEAM - 10} width={SVG_WIDTH} height={20} fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" rx="4" />

        {/* Support A — Pin */}
        <polygon points={`${scaleX(supportA)},${Y_BEAM + 10} ${scaleX(supportA) - 15},${Y_BEAM + 40} ${scaleX(supportA) + 15},${Y_BEAM + 40}`} fill="#64748b" stroke="#475569" strokeWidth="2" />
        <text x={scaleX(supportA)} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Pin (A)</text>

        {/* Support B — Roller */}
        <circle cx={scaleX(supportB)} cy={Y_BEAM + 25} r="15" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
        <circle cx={scaleX(supportB)} cy={Y_BEAM + 25} r="5" fill="#64748b" />
        <text x={scaleX(supportB)} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Roller (B)</text>

        {/* Point Load */}
        {pointLoad.active && (() => {
          const isDown = pointLoad.dir === 'down';
          return (
            <g>
              <line x1={scaleX(pointLoad.pos)} y1={isDown ? Y_BEAM - 90 : Y_BEAM + 90} x2={scaleX(pointLoad.pos)} y2={isDown ? Y_BEAM - 15 : Y_BEAM + 15} stroke="#ef4444" strokeWidth="3" />
              <polygon
                points={isDown
                  ? `${scaleX(pointLoad.pos)},${Y_BEAM - 10} ${scaleX(pointLoad.pos) - 6},${Y_BEAM - 20} ${scaleX(pointLoad.pos) + 6},${Y_BEAM - 20}`
                  : `${scaleX(pointLoad.pos)},${Y_BEAM + 10} ${scaleX(pointLoad.pos) - 6},${Y_BEAM + 20} ${scaleX(pointLoad.pos) + 6},${Y_BEAM + 20}`}
                fill="#ef4444"
              />
              <text x={scaleX(pointLoad.pos)} y={isDown ? Y_BEAM - 100 : Y_BEAM + 110} textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="bold">
                {pointLoad.mag} kN
              </text>
            </g>
          );
        })()}

        {/* Distributed Load (Trapezoid) */}
        {distLoad.active && (() => {
          const isDown = distLoad.dir === 'down';
          const maxMag = Math.max(Math.abs(distLoad.startMag), Math.abs(distLoad.endMag), 1);
          const startH = (distLoad.startMag / maxMag) * 60;
          const endH = (distLoad.endMag / maxMag) * 60;
          const yBase = isDown ? Y_BEAM - 10 : Y_BEAM + 10;
          const yDir = isDown ? -1 : 1;

          return (
            <g>
              <polygon
                points={`${scaleX(distLoad.startPos)},${yBase} ${scaleX(distLoad.endPos)},${yBase} ${scaleX(distLoad.endPos)},${yBase + endH * yDir} ${scaleX(distLoad.startPos)},${yBase + startH * yDir}`}
                fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"
              />
              <text x={scaleX(distLoad.startPos)} y={yBase + startH * yDir + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">
                {distLoad.startMag}
              </text>
              <text x={scaleX(distLoad.endPos)} y={yBase + endH * yDir + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">
                {distLoad.endMag}
              </text>
            </g>
          );
        })()}

        {/* Applied Moment */}
        {momentLoad.active && (() => {
          const isCW = momentLoad.dir === 'cw';
          return (
            <g>
              <path d={`M ${scaleX(momentLoad.pos) - 20} ${Y_BEAM - 30} A 25 25 0 1 1 ${scaleX(momentLoad.pos) + 20} ${Y_BEAM - 30}`} fill="none" stroke="#8b5cf6" strokeWidth="3" />
              {isCW ? (
                <polygon points={`${scaleX(momentLoad.pos) + 20},${Y_BEAM - 30} ${scaleX(momentLoad.pos) + 15},${Y_BEAM - 40} ${scaleX(momentLoad.pos) + 28},${Y_BEAM - 35}`} fill="#8b5cf6" />
              ) : (
                <polygon points={`${scaleX(momentLoad.pos) - 20},${Y_BEAM - 30} ${scaleX(momentLoad.pos) - 15},${Y_BEAM - 40} ${scaleX(momentLoad.pos) - 28},${Y_BEAM - 35}`} fill="#8b5cf6" />
              )}
              <text x={scaleX(momentLoad.pos)} y={Y_BEAM - 65} textAnchor="middle" fontSize="14" fill="#8b5cf6" fontWeight="bold">
                {momentLoad.mag} kN·m
              </text>
            </g>
          );
        })()}

        {/* Axis Labels */}
        <text x={scaleX(0)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">0 m</text>
        <text x={scaleX(beamLength)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">{beamLength} m</text>
      </svg>
    </div>
  );
}
