import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartRotation({ data }) {
  const values = data.map(d => d.slope);
  const peak = Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values)));

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Rotation (Slope)</h4>
        <div style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Peak: {peak.toExponential(2)} rad
        </div>
      </div>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, 'dataMax']} />
            <YAxis />
            <Tooltip formatter={(v) => [v.toExponential(3), 'Slope (rad)']} />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="monotone" dataKey="slope" stroke="#ea580c" fill="#fb923c" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
