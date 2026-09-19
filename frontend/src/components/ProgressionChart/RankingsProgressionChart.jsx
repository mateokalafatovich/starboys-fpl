import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { scaleLinear } from 'd3-scale';
import useRankingsProgression from '../../hooks/useRankingsProgression';

const LINE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#2bfbff', '#7c3aed', '#0891b2', '#ff9bc8', '#65a30d', '#7b2900', '#ea580c'];

export default function RankingsProgressionChart() {
  const { data, loading, error } = useRankingsProgression();

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Failed to load rankings progression data.</div>;
  if (!data || data.length === 0) return <div>No rankings progression data yet.</div>;

  const teamNames = Object.keys(data[0]).filter((key) => key !== 'gameweek');

  const scale = scaleLinear().domain([0, 10]).range([10, 0]); 


  return (
    <div style={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="50%" height="100%">
            <LineChart 
                data={data}
                margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="gameweek" label={{ value: 'Gameweek', position: 'insideBottom', offset: -10 }} />
                <YAxis 
                    domain={[10,0]}
                    scale={scale}
                    reversed={true}
                    label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip
                    defaultIndex={3}
                    contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #64748b', borderRadius: 8, padding: 10 }}
                    labelStyle={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    itemStyle={{ display: 'block', paddingTop: 2, paddingBottom: 2 }}
                />
                <Legend    
                    layout="vertical"
                    position="right" 
                    verticalAlign="middle"   
                    wrapperStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4, paddingTop: 4, paddingBottom: 4, paddingLeft: '20px'}}
                    labelStyle={{ color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    iconType="circle"
                />
                {teamNames.map((name, i) => (
                    <Line type="monotone" key={name} dataKey={name} stroke={LINE_COLORS[i % LINE_COLORS.length]} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}