import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartBendingStress({ data, material, section }) {
  const utilizationValues = data.map(d => d.utilization);
  const maxUtilization = Math.max(...utilizationValues);
  const isFailed = maxUtilization > 1.0;

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Bending Stress Diagram (Flexure)</h4>
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          <div style={{ padding: '4px 10px', borderRadius: '6px', background: '#e2e8f0' }}>
            Section peak y: {section.ymax_mm} mm
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: '6px',
            background: isFailed ? '#fee2e2' : '#f0fdf4',
            color: isFailed ? '#991b1b' : '#15803d'
          }}>
            Peak σ: {maxUtilization.toFixed(2)} / Yield
          </div>
        </div>
      </div>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, 'dataMax']} />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={1.0} stroke="#991b1b" strokeDasharray="5 5" label="Yield" />
            <ReferenceLine y={-1.0} stroke="#991b1b" strokeDasharray="5 5" />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="monotone" dataKey="utilization" stroke="#16a34a" fill="#22c55e" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
