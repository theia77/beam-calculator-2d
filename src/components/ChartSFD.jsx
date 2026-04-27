import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartSFD({ data }) {
  return (
    <div className="chart-container">
      <h4>Shear Force Diagram (SFD)</h4>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, 10]} />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="linear" dataKey="shear" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
