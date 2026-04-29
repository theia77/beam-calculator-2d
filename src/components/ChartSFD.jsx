import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ChartSFD({ data, beamLength }) {
  const shearValues = data.map(d => d.shear);
  const maxPositive = Math.max(...shearValues);
  const maxNegative = Math.min(...shearValues);
  const peakShear = Math.max(Math.abs(maxPositive), Math.abs(maxNegative));

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Shear Force Diagram (SFD)</h4>
        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Peak: {peakShear.toFixed(2)} kN
        </div>
      </div>
      <div style={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="x" type="number" domain={[0, beamLength ?? 'dataMax']} />
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
