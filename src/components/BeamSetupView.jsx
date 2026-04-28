import React from 'react';

export default function BeamSetupView({ beamLength, supports, pointLoad, momentLoad, distLoad }) {
  const SVG_WIDTH = 800;
  const PADDING = 100;
  const Y_BEAM = 150;

  const scaleX = (x) => PADDING + (x / beamLength) * SVG_WIDTH;

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <svg viewBox="0 0 1000 280" style={{ width: '100%', minWidth: '600px', display: 'block' }}>

        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <rect x={scaleX(0)} y={Y_BEAM - 10} width={SVG_WIDTH} height={20} fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" rx="4" />

        {/* Dynamic supports loop */}
        {supports.map((sup) => {
          const cx = scaleX(sup.x);

          if (sup.type === 'pin') {
            return (
              <g key={sup.id}>
                <polygon points={`${cx},${Y_BEAM + 10} ${cx - 15},${Y_BEAM + 40} ${cx + 15},${Y_BEAM + 40}`} fill="#64748b" stroke="#475569" strokeWidth="2" />
                <line x1={cx - 20} y1={Y_BEAM + 40} x2={cx + 20} y2={Y_BEAM + 40} stroke="#475569" strokeWidth="3" />
                <text x={cx} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Pin</text>
              </g>
            );
          }
          else if (sup.type === 'roller') {
            return (
              <g key={sup.id}>
                <circle cx={cx} cy={Y_BEAM + 25} r="15" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                <circle cx={cx} cy={Y_BEAM + 25} r="5" fill="#64748b" />
                <line x1={cx - 20} y1={Y_BEAM + 40} x2={cx + 20} y2={Y_BEAM + 40} stroke="#475569" strokeWidth="3" />
                <text x={cx} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Roller</text>
              </g>
            );
          }
          else if (sup.type === 'fixed') {
            const isLeft = sup.x < beamLength / 2;
            return (
              <g key={sup.id}>
                {/* Vertical Wall */}
                <rect x={isLeft ? cx - 15 : cx} y={Y_BEAM - 40} width="15" height="100" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                {/* Diagonal Hash Marks */}
                <path d={isLeft
                  ? `M ${cx-15} ${Y_BEAM-30} L ${cx-25} ${Y_BEAM-40} M ${cx-15} ${Y_BEAM-10} L ${cx-25} ${Y_BEAM-20} M ${cx-15} ${Y_BEAM+10} L ${cx-25} ${Y_BEAM} M ${cx-15} ${Y_BEAM+30} L ${cx-25} ${Y_BEAM+20} M ${cx-15} ${Y_BEAM+50} L ${cx-25} ${Y_BEAM+40}`
                  : `M ${cx+15} ${Y_BEAM-30} L ${cx+25} ${Y_BEAM-40} M ${cx+15} ${Y_BEAM-10} L ${cx+25} ${Y_BEAM-20} M ${cx+15} ${Y_BEAM+10} L ${cx+25} ${Y_BEAM} M ${cx+15} ${Y_BEAM+30} L ${cx+25} ${Y_BEAM+20} M ${cx+15} ${Y_BEAM+50} L ${cx+25} ${Y_BEAM+40}`
                } stroke="#64748b" strokeWidth="2" />
                <text x={isLeft ? cx - 20 : cx + 20} y={Y_BEAM + 80} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Fixed</text>
              </g>
            );
          }
          return null;
        })}

        {pointLoad.active && (() => {
          const isDown = pointLoad.dir === 'down';
          return (
            <g>
              <line x1={scaleX(pointLoad.pos)} y1={isDown ? Y_BEAM - 90 : Y_BEAM + 90} x2={scaleX(pointLoad.pos)} y2={isDown ? Y_BEAM - 15 : Y_BEAM + 15} stroke="#ef4444" strokeWidth="3" />
              <polygon points={isDown ? `${scaleX(pointLoad.pos)},${Y_BEAM - 10} ${scaleX(pointLoad.pos) - 6},${Y_BEAM - 20} ${scaleX(pointLoad.pos) + 6},${Y_BEAM - 20}` : `${scaleX(pointLoad.pos)},${Y_BEAM + 10} ${scaleX(pointLoad.pos) - 6},${Y_BEAM + 20} ${scaleX(pointLoad.pos) + 6},${Y_BEAM + 20}`} fill="#ef4444" />
              <text x={scaleX(pointLoad.pos)} y={isDown ? Y_BEAM - 100 : Y_BEAM + 110} textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="bold">{pointLoad.mag} kN</text>
            </g>
          );
        })()}

        {/* Distributed Load with Directional Arrows */}
        {distLoad.active && (() => {
          const isDown = distLoad.dir === 'down';
          const maxMag = Math.max(Math.abs(distLoad.startMag), Math.abs(distLoad.endMag), 1);
          const startH = (distLoad.startMag / maxMag) * 60;
          const endH = (distLoad.endMag / maxMag) * 60;
          const yBase = isDown ? Y_BEAM - 10 : Y_BEAM + 10;
          const yDir = isDown ? -1 : 1;

          const numArrows = 9;
          const arrows = Array.from({ length: numArrows }).map((_, i) => {
            const t = i / (numArrows - 1);
            const currPos = distLoad.startPos + (distLoad.endPos - distLoad.startPos) * t;
            const currH = (Math.abs(distLoad.startMag * (1 - t) + distLoad.endMag * t) / maxMag) * 60;
            const yTip = yBase;
            const yTail = yBase + currH * yDir;

            if (currH < 5) return null;

            return (
              <g key={i}>
                <line x1={scaleX(currPos)} y1={yTail} x2={scaleX(currPos)} y2={yTip} stroke="#ef4444" strokeWidth="1.5" />
                <polygon
                  points={isDown
                    ? `${scaleX(currPos)},${yTip - 2} ${scaleX(currPos) - 4},${yTip - 8} ${scaleX(currPos) + 4},${yTip - 8}`
                    : `${scaleX(currPos)},${yTip + 2} ${scaleX(currPos) - 4},${yTip + 8} ${scaleX(currPos) + 4},${yTip + 8}`}
                  fill="#ef4444"
                />
              </g>
            );
          });

          return (
            <g>
              <polygon
                points={`${scaleX(distLoad.startPos)},${yBase} ${scaleX(distLoad.endPos)},${yBase} ${scaleX(distLoad.endPos)},${yBase + endH * yDir} ${scaleX(distLoad.startPos)},${yBase + startH * yDir}`}
                fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"
              />
              {arrows}
              <text x={scaleX(distLoad.startPos)} y={yBase + startH * yDir + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">{distLoad.startMag}</text>
              <text x={scaleX(distLoad.endPos)} y={yBase + endH * yDir + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">{distLoad.endMag}</text>
            </g>
          );
        })()}

        {/* Applied Moment */}
        {momentLoad.active && (() => {
          const isCW = momentLoad.dir === 'cw';
          const cx = scaleX(momentLoad.pos);
          return (
            <g>
              <circle cx={cx} cy={Y_BEAM} r="5" fill="#f59e0b" />
              <path
                d={`M ${cx - 25} ${Y_BEAM + 5} A 25 25 0 1 1 ${cx + 25} ${Y_BEAM + 5}`}
                fill="none" stroke="#f59e0b" strokeWidth="3"
              />
              {isCW ? (
                <polygon points={`${cx + 25},${Y_BEAM + 5} ${cx + 18},${Y_BEAM - 5} ${cx + 32},${Y_BEAM - 2}`} fill="#f59e0b" />
              ) : (
                <polygon points={`${cx - 25},${Y_BEAM + 5} ${cx - 18},${Y_BEAM - 5} ${cx - 32},${Y_BEAM - 2}`} fill="#f59e0b" />
              )}
              <text x={cx} y={Y_BEAM - 40} textAnchor="middle" fontSize="14" fill="#d97706" fontWeight="bold">
                {momentLoad.mag} kN·m
              </text>
            </g>
          );
        })()}

        <text x={scaleX(0)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">0 m</text>
        <text x={scaleX(beamLength)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">{beamLength} m</text>
      </svg>
    </div>
  );
}
