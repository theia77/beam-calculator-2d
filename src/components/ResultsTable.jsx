import React from 'react';

export default function ResultsTable({ reactions, peakValues, material, section }) {
  const rowStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' };

  return (
    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>
        Analysis Summary
      </div>

      <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Support Reactions</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '18px', fontWeight: 'bold' }}>
          <span style={{ color: '#0ea5e9' }}>R<sub>A</sub>: {reactions.rA.toFixed(2)} kN</span>
          <span style={{ color: '#0ea5e9' }}>R<sub>B</sub>: {reactions.rB.toFixed(2)} kN</span>
        </div>
      </div>

      <div>
        <div style={rowStyle}>
          <span style={{ color: '#64748b' }}>Peak Shear Force (V)</span>
          <span style={{ fontWeight: 'bold' }}>{peakValues.shear.toFixed(2)} kN</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#64748b' }}>Peak Bending Moment (M)</span>
          <span style={{ fontWeight: 'bold' }}>{peakValues.moment.toFixed(2)} kN·m</span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#64748b' }}>Maximum Deflection (Δ)</span>
          <span style={{ fontWeight: 'bold', color: Math.abs(peakValues.deflection) > 25 ? '#ef4444' : 'inherit' }}>
            {peakValues.deflection.toFixed(2)} mm
          </span>
        </div>
        <div style={rowStyle}>
          <span style={{ color: '#64748b' }}>Maximum Rotation (θ)</span>
          <span style={{ fontWeight: 'bold' }}>{peakValues.slope.toFixed(4)} rad</span>
        </div>
      </div>

      <div style={{ padding: '15px', background: '#f0fdf4', borderTop: '2px solid #cbd5e1' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>Design Checks</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Max Bending Stress:</span>
          <strong>{peakValues.stress.toFixed(1)} MPa</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Material Yield ({material.label}):</span>
          <strong>{material.fy_mpa} MPa</strong>
        </div>

        {Math.abs(peakValues.stress) > material.fy_mpa ? (
          <div style={{ marginTop: '10px', padding: '8px', background: '#fee2e2', color: '#b91c1c', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold' }}>
            WARNING: Section Fails (Yield Exceeded)
          </div>
        ) : (
          <div style={{ marginTop: '10px', padding: '8px', background: '#dcfce7', color: '#15803d', textAlign: 'center', borderRadius: '4px', fontWeight: 'bold' }}>
            PASS: Section is Safe
          </div>
        )}
      </div>
    </div>
  );
}
