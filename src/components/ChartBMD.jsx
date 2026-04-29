import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartBMD({ data, beamLength }) {
  const momentValues = data.map(d => d.moment);
  const maxPositive = Math.max(...momentValues);
  const maxNegative = Math.min(...momentValues);
  const peakMoment = Math.max(Math.abs(maxPositive), Math.abs(maxNegative));

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Bending Moment Diagram (BMD)</h4>
        <div style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Peak: {peakMoment.toFixed(2)} kN·m
        </div>
      </div>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, beamLength ?? 'dataMax']} />
            <YAxis reversed={true} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            <Area type="monotone" dataKey="moment" stroke="#16a34a" fill="#22c55e" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
