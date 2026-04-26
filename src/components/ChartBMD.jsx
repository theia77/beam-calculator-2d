import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartBMD({ data }) {
  return (
    <div className="chart-container">
      <h4>Bending Moment Diagram (BMD)</h4>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, 10]} />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="monotone" dataKey="moment" stroke="#16a34a" fill="#22c55e" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
