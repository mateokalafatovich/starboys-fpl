import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
    { gameweek: 1, 'Roadgers 2 Glory': 72, 'Mbappe\'s Empire': 48, 'Saka Potatoes': 52},
    { gameweek: 2, 'Roadgers 2 Glory': 165, 'Mbappe\'s Empire': 176, 'Saka Potatoes': 163},
    { gameweek: 3, 'Roadgers 2 Glory': 224, 'Mbappe\'s Empire': 216, 'Saka Potatoes': 214},  
];

export default function ProgressionChart() {
  return (
    <div style={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="50%" height="100%">
            <LineChart 
                data={mockData}
                margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis
                    dataKey="gameweek"
                    label={{ value: 'Gameweek', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                    label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                    defaultIndex={3}
                    contentStyle={{ backgroundColor: '#f8fafc', border: '2px solid #64748b', borderRadius: 8, padding: 10 }}
                    labelStyle={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    itemStyle={{ display: 'block', paddingTop: 2, paddingBottom: 2 }}
                />
                <Legend        
                    wrapperStyle={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        paddingTop: 4,
                        paddingBottom: 4,
                    }}
                    labelStyle={{ 
                        color: '#0f172a', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                    }}
                    iconType="circle"
                />
                <Line dataKey="Roadgers 2 Glory" stroke="blue"/>
                <Line dataKey="Mbappe's Empire" stroke="green"/>
                <Line dataKey="Saka Potatoes" stroke="black"/>
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}