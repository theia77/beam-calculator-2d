import React from 'react';

export default function BeamSetupView({ beamLength, supportA, supportB, loads }) {
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

        <polygon points={`${scaleX(supportA)},${Y_BEAM + 10} ${scaleX(supportA) - 15},${Y_BEAM + 40} ${scaleX(supportA) + 15},${Y_BEAM + 40}`} fill="#64748b" stroke="#475569" strokeWidth="2" />
        <text x={scaleX(supportA)} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Pin (A)</text>

        <circle cx={scaleX(supportB)} cy={Y_BEAM + 25} r="15" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
        <circle cx={scaleX(supportB)} cy={Y_BEAM + 25} r="5" fill="#64748b" />
        <text x={scaleX(supportB)} y={Y_BEAM + 60} textAnchor="middle" fontSize="14" fill="#475569" fontWeight="bold">Roller (B)</text>

        {loads.map(load => {
          if (load.type === 'point') {
            const isDown = load.dir === 'down';
            return (
              <g key={load.id}>
                <line x1={scaleX(load.pos)} y1={isDown ? Y_BEAM - 90 : Y_BEAM + 90} x2={scaleX(load.pos)} y2={isDown ? Y_BEAM - 15 : Y_BEAM + 15} stroke="#3b82f6" strokeWidth="3" />
                <polygon points={isDown ? `${scaleX(load.pos)},${Y_BEAM - 10} ${scaleX(load.pos) - 6},${Y_BEAM - 20} ${scaleX(load.pos) + 6},${Y_BEAM - 20}` : `${scaleX(load.pos)},${Y_BEAM + 10} ${scaleX(load.pos) - 6},${Y_BEAM + 20} ${scaleX(load.pos) + 6},${Y_BEAM + 20}`} fill="#3b82f6" />
                <text x={scaleX(load.pos)} y={isDown ? Y_BEAM - 100 : Y_BEAM + 110} textAnchor="middle" fontSize="14" fill="#1d4ed8" fontWeight="bold">{load.mag} kN</text>
              </g>
            );
          }

          if (load.type === 'distributed') {
            const isDown = load.dir === 'down';
            const maxMag = Math.max(Math.abs(load.startMag), Math.abs(load.endMag), 1);
            const startH = (load.startMag / maxMag) * 60;
            const endH = (load.endMag / maxMag) * 60;
            const yBase = isDown ? Y_BEAM - 10 : Y_BEAM + 10;
            const yDir = isDown ? -1 : 1;

            const numArrows = 9;
            const arrows = Array.from({ length: numArrows }).map((_, i) => {
              const t = i / (numArrows - 1);
              const currPos = load.startPos + (load.endPos - load.startPos) * t;
              const currH = (Math.abs(load.startMag * (1 - t) + load.endMag * t) / maxMag) * 60;
              const yTip = yBase;
              const yTail = yBase + (currH * yDir);
              if (currH < 5) return null;
              return (
                <g key={i}>
                  <line x1={scaleX(currPos)} y1={yTail} x2={scaleX(currPos)} y2={yTip} stroke="#ef4444" strokeWidth="1.5" />
                  <polygon points={isDown ? `${scaleX(currPos)},${yTip - 2} ${scaleX(currPos) - 4},${yTip - 8} ${scaleX(currPos) + 4},${yTip - 8}` : `${scaleX(currPos)},${yTip + 2} ${scaleX(currPos) - 4},${yTip + 8} ${scaleX(currPos) + 4},${yTip + 8}`} fill="#ef4444" />
                </g>
              );
            });

            return (
              <g key={load.id}>
                <polygon points={`${scaleX(load.startPos)},${yBase} ${scaleX(load.endPos)},${yBase} ${scaleX(load.endPos)},${yBase + (endH * yDir)} ${scaleX(load.startPos)},${yBase + (startH * yDir)}`} fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                {arrows}
                <text x={scaleX(load.startPos)} y={yBase + (startH * yDir) + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#b91c1c" fontWeight="bold">{load.startMag}</text>
                <text x={scaleX(load.endPos)} y={yBase + (endH * yDir) + (isDown ? -10 : 20)} textAnchor="middle" fontSize="12" fill="#b91c1c" fontWeight="bold">{load.endMag}</text>
              </g>
            );
          }

          if (load.type === 'moment') {
            const isCW = load.dir === 'cw';
            const cx = scaleX(load.pos);
            return (
              <g key={load.id}>
                <circle cx={cx} cy={Y_BEAM} r="5" fill="#f59e0b" />
                <path d={`M ${cx - 25} ${Y_BEAM + 5} A 25 25 0 1 1 ${cx + 25} ${Y_BEAM + 5}`} fill="none" stroke="#f59e0b" strokeWidth="3" />
                {isCW ? (
                  <polygon points={`${cx + 25},${Y_BEAM + 5} ${cx + 18},${Y_BEAM - 5} ${cx + 32},${Y_BEAM - 2}`} fill="#f59e0b" />
                ) : (
                  <polygon points={`${cx - 25},${Y_BEAM + 5} ${cx - 18},${Y_BEAM - 5} ${cx - 32},${Y_BEAM - 2}`} fill="#f59e0b" />
                )}
                <text x={cx} y={Y_BEAM - 40} textAnchor="middle" fontSize="14" fill="#d97706" fontWeight="bold">{load.mag} kN·m</text>
              </g>
            );
          }

          return null;
        })}

        <text x={scaleX(0)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">0 m</text>
        <text x={scaleX(beamLength)} y={Y_BEAM + 90} textAnchor="middle" fontSize="12" fill="#94a3b8">{beamLength} m</text>
      </svg>
    </div>
  );
}
