import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartDeflection({ data, beamLength }) {
  const values = data.map(d => d.deflection);
  const peak = Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values)));

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Deflection</h4>
        <div style={{ background: '#faf5ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Peak: {peak.toFixed(2)} mm
        </div>
      </div>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, beamLength ?? 'dataMax']} />
            <YAxis unit=" mm" />
            <Tooltip formatter={(v) => [`${v} mm`, 'Deflection']} />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="monotone" dataKey="deflection" stroke="#7c3aed" fill="#a78bfa" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
