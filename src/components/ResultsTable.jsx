export default function ResultsTable({ reactions, peakValues, material, section }) {
  const rowStyle = {
    padding: '11px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  };

  const yieldExceeded = Math.abs(peakValues.stress) > material.fy_mpa;

  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: '#1e293b', color: 'white', padding: '12px 16px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.4px', textAlign: 'center' }}>
        Analysis Summary
      </div>

      {/* Reactions */}
      <div style={{ padding: '14px 16px', background: 'var(--reactions-bg)', borderBottom: '1px solid var(--border-strong)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
          Support Reactions
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0ea5e9' }}>
              {reactions.rA.toFixed(2)} kN
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>R<sub>A</sub></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0ea5e9' }}>
              {reactions.rB.toFixed(2)} kN
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>R<sub>B</sub></div>
          </div>
        </div>
      </div>

      {/* Peak values */}
      <div>
        <div style={rowStyle}>
          <span style={{ color: 'var(--text-muted)' }}>Peak Shear (V)</span>
          <strong style={{ color: 'var(--text-primary)' }}>{peakValues.shear.toFixed(2)} kN</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: 'var(--text-muted)' }}>Peak Moment (M)</span>
          <strong style={{ color: 'var(--text-primary)' }}>{peakValues.moment.toFixed(2)} kN·m</strong>
        </div>
        <div style={rowStyle}>
          <span style={{ color: 'var(--text-muted)' }}>Max Deflection (Δ)</span>
          <strong style={{ color: Math.abs(peakValues.deflection) > 25 ? '#ef4444' : 'var(--text-primary)' }}>
            {peakValues.deflection.toFixed(2)} mm
          </strong>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ color: 'var(--text-muted)' }}>Max Rotation (θ)</span>
          <strong style={{ color: 'var(--text-primary)' }}>{peakValues.slope.toFixed(4)} rad</strong>
        </div>
      </div>

      {/* Design checks */}
      <div style={{ padding: '14px 16px', background: 'var(--reactions-bg)', borderTop: '1px solid var(--border-strong)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
          Design Check
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Bending Stress:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{peakValues.stress.toFixed(1)} MPa</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Yield ({material.label}):</span>
          <strong style={{ color: 'var(--text-primary)' }}>{material.fy_mpa} MPa</strong>
        </div>

        <div style={{
          padding: '9px 12px',
          background: yieldExceeded ? 'var(--check-fail-bg)' : 'var(--check-pass-bg)',
          color: yieldExceeded ? 'var(--check-fail-text)' : 'var(--check-pass-text)',
          textAlign: 'center',
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '13px',
        }}>
          {yieldExceeded ? '⚠ Section Fails — Yield Exceeded' : '✓ Section is Safe'}
        </div>
      </div>
    </div>
  );
}
