import React from 'react';

export default function StressProfileView({ moment, section }) {
  const h = section.h_mm;
  const peakStress = Math.abs((moment * section.ymax_m) / section.i_m4) / 1000;
  const isSagging = moment >= 0;

  const isIBeam = section.id.toLowerCase().includes('w1');

  const scale = 0.8;
  const beamH = h * scale;
  const stressWidth = Math.min(peakStress * 1.5, 180);

  const centerY = 200;
  const sectionX = 150;
  const profileX = 500;

  return (
    <div className="chart-container" style={{ background: 'white', borderRadius: '16px', border: '2px solid #cbd5e1', overflow: 'hidden' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '15px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem' }}>
        Cross-Sectional Stress Profile
      </div>
      <div style={{ textAlign: 'center', padding: '10px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 'bold' }}>
        At Peak Moment: {moment.toFixed(2)} kN·m
      </div>

      <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', maxHeight: '400px' }}>

        {/* Neutral Axis */}
        <line x1="20" y1={centerY} x2="780" y2={centerY} stroke="#94a3b8" strokeDasharray="8,8" strokeWidth="2" />
        <text x="780" y={centerY - 10} textAnchor="end" fontSize="14" fill="#64748b" fontWeight="bold">Neutral Axis</text>

        {/* Cross-section shape */}
        <g transform={`translate(${sectionX}, 0)`}>
          {isIBeam ? (
            <g fill="#e2e8f0" stroke="#475569" strokeWidth="2.5">
              {/* Top Flange */}
              <rect x="-40" y={centerY - beamH / 2} width="80" height="20" rx="3" />
              {/* Bottom Flange */}
              <rect x="-40" y={centerY + beamH / 2 - 20} width="80" height="20" rx="3" />
              {/* Web */}
              <rect x="-8" y={centerY - beamH / 2 + 20} width="16" height={beamH - 40} />
            </g>
          ) : (
            <rect x="-35" y={centerY - beamH / 2} width="70" height={beamH} fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" rx="4" />
          )}
          <text x="0" y={centerY + beamH / 2 + 30} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">{section.label}</text>
        </g>

        {/* Stress profile */}
        <g transform={`translate(${profileX}, 0)`}>
          {/* Vertical reference line */}
          <line x1="0" y1={centerY - beamH / 2} x2="0" y2={centerY + beamH / 2} stroke="#334155" strokeWidth="3" />

          {/* Top triangle */}
          <polygon
            points={`0,${centerY} 0,${centerY - beamH / 2} ${isSagging ? -stressWidth : stressWidth},${centerY - beamH / 2}`}
            fill={isSagging ? '#ef4444' : '#3b82f6'} fillOpacity="0.4"
            stroke={isSagging ? '#ef4444' : '#3b82f6'} strokeWidth="2"
          />

          {/* Bottom triangle */}
          <polygon
            points={`0,${centerY} 0,${centerY + beamH / 2} ${isSagging ? stressWidth : -stressWidth},${centerY + beamH / 2}`}
            fill={isSagging ? '#3b82f6' : '#ef4444'} fillOpacity="0.4"
            stroke={isSagging ? '#3b82f6' : '#ef4444'} strokeWidth="2"
          />

          {/* Top label — anchored outward from the triangle peak */}
          <text
            x={isSagging ? -stressWidth - 15 : stressWidth + 15}
            y={centerY - beamH / 2 + 5}
            textAnchor={isSagging ? 'end' : 'start'}
            fontSize="18" fontWeight="900" fill={isSagging ? '#b91c1c' : '#1d4ed8'}
          >
            {isSagging ? 'COMPRESSION (-)' : 'TENSION (+)'}: {peakStress.toFixed(1)} MPa
          </text>

          {/* Bottom label — anchored outward from the triangle peak */}
          <text
            x={isSagging ? stressWidth + 15 : -stressWidth - 15}
            y={centerY + beamH / 2 + 5}
            textAnchor={isSagging ? 'start' : 'end'}
            fontSize="18" fontWeight="900" fill={isSagging ? '#1d4ed8' : '#b91c1c'}
          >
            {isSagging ? 'TENSION (+)' : 'COMPRESSION (-)'}: {peakStress.toFixed(1)} MPa
          </text>
        </g>

      </svg>
    </div>
  );
}
