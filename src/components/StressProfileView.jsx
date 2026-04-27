export default function StressProfileView({ moment, section }) {
  const h = section.h_mm;
  const peakStress = Math.abs((moment * section.ymax_m) / section.i_m4) / 1000; // MPa
  const isSagging = moment >= 0;

  const scale = 0.8;
  const centerX = 150;
  const centerY = 150;
  const beamH = h * scale;
  const stressWidth = Math.min(peakStress * 2, 100);

  return (
    <div className="chart-container" style={{ textAlign: 'center' }}>
      <h4>Cross-Sectional Stress Profile (at Peak Moment)</h4>
      <svg viewBox="0 0 400 300" style={{ width: '100%', height: '300px' }}>
        {/* Neutral Axis */}
        <line x1="50" y1={centerY} x2="350" y2={centerY} stroke="#94a3b8" strokeDasharray="5,5" />
        <text x="355" y={centerY + 5} fontSize="12" fill="#64748b">Neutral Axis</text>

        {/* Cross-section rectangle */}
        <rect
          x={centerX - 40} y={centerY - beamH / 2}
          width="80" height={beamH}
          fill="#e2e8f0" stroke="#475569" strokeWidth="2"
        />

        {/* Stress triangles */}
        <g transform={`translate(${centerX + 100}, 0)`}>
          <line x1="0" y1={centerY - beamH / 2} x2="0" y2={centerY + beamH / 2} stroke="#334155" strokeWidth="2" />

          {/* Top triangle */}
          <polygon
            points={`0,${centerY} 0,${centerY - beamH / 2} ${isSagging ? -stressWidth : stressWidth},${centerY - beamH / 2}`}
            fill={isSagging ? '#ef4444' : '#3b82f6'} fillOpacity="0.3"
            stroke={isSagging ? '#ef4444' : '#3b82f6'}
          />

          {/* Bottom triangle */}
          <polygon
            points={`0,${centerY} 0,${centerY + beamH / 2} ${isSagging ? stressWidth : -stressWidth},${centerY + beamH / 2}`}
            fill={isSagging ? '#3b82f6' : '#ef4444'} fillOpacity="0.3"
            stroke={isSagging ? '#3b82f6' : '#ef4444'}
          />

          {/* Labels */}
          <text x={isSagging ? -stressWidth - 10 : stressWidth + 10} y={centerY - beamH / 2} textAnchor="middle" fontSize="12" fontWeight="bold">
            {isSagging ? 'COMP (-)' : 'TEN (+)'}: {peakStress.toFixed(1)} MPa
          </text>
          <text x={isSagging ? stressWidth + 10 : -stressWidth - 10} y={centerY + beamH / 2} textAnchor="middle" fontSize="12" fontWeight="bold">
            {isSagging ? 'TEN (+)' : 'COMP (-)'}: {peakStress.toFixed(1)} MPa
          </text>
        </g>
      </svg>
    </div>
  );
}
