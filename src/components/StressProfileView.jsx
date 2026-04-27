export default function StressProfileView({ moment, section }) {
  const h = section.h_mm;
  const peakStress = Math.abs((moment * section.ymax_m) / section.i_m4) / 1000; // MPa
  const isSagging = moment >= 0;

  const scale = 0.8;
  const beamH = h * scale;
  const stressWidth = Math.min(peakStress * 1.5, 120);

  return (
    <div className="chart-container" style={{ textAlign: 'center', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Cross-Sectional Stress Profile</h4>
        <div style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          At Moment: {moment.toFixed(2)} kN·m
        </div>
      </div>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: '100%', maxHeight: '300px' }}>
        {/* Neutral Axis */}
        <line x1="50" y1="150" x2="550" y2="150" stroke="#94a3b8" strokeDasharray="5,5" />
        <text x="555" y="154" fontSize="12" fill="#64748b">Neutral Axis</text>

        {/* Cross-section rectangle */}
        <rect
          x="150" y={150 - beamH / 2}
          width="60" height={beamH}
          fill="#e2e8f0" stroke="#475569" strokeWidth="2"
        />

        {/* Stress triangles */}
        <g transform="translate(350, 0)">
          <line x1="0" y1={150 - beamH / 2} x2="0" y2={150 + beamH / 2} stroke="#334155" strokeWidth="2" />

          {/* Top triangle */}
          <polygon
            points={`0,150 0,${150 - beamH / 2} ${isSagging ? -stressWidth : stressWidth},${150 - beamH / 2}`}
            fill={isSagging ? '#ef4444' : '#3b82f6'} fillOpacity="0.3"
            stroke={isSagging ? '#ef4444' : '#3b82f6'}
          />

          {/* Bottom triangle */}
          <polygon
            points={`0,150 0,${150 + beamH / 2} ${isSagging ? stressWidth : -stressWidth},${150 + beamH / 2}`}
            fill={isSagging ? '#3b82f6' : '#ef4444'} fillOpacity="0.3"
            stroke={isSagging ? '#3b82f6' : '#ef4444'}
          />

          {/* Top label */}
          <text
            x={isSagging ? -stressWidth - 10 : stressWidth + 10}
            y={150 - beamH / 2 + 5}
            textAnchor={isSagging ? 'end' : 'start'}
            fontSize="14" fontWeight="bold" fill={isSagging ? '#b91c1c' : '#1d4ed8'}
          >
            {isSagging ? 'Compression (-)' : 'Tension (+)'}: {peakStress.toFixed(1)} MPa
          </text>

          {/* Bottom label */}
          <text
            x={isSagging ? stressWidth + 10 : -stressWidth - 10}
            y={150 + beamH / 2 + 5}
            textAnchor={isSagging ? 'start' : 'end'}
            fontSize="14" fontWeight="bold" fill={isSagging ? '#1d4ed8' : '#b91c1c'}
          >
            {isSagging ? 'Tension (+)' : 'Compression (-)'}: {peakStress.toFixed(1)} MPa
          </text>
        </g>
      </svg>
    </div>
  );
}
