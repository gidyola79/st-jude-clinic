import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';

interface SparklineProps {
  data: { value: number; time?: string }[];
  color?: string;
  height?: number;
  width?: number | string;
  dataKey?: string;
  unit?: string;
}

export const VitalsSparkline: React.FC<SparklineProps> = ({
  data,
  color = '#0d9488',
  height = 36,
  width = 80,
  dataKey = 'value',
  unit = ''
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }} className="shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow border border-slate-700">
                    {payload[0].value} {unit}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
