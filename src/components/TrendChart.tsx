'use client';

import { JoinedMetric } from '@/lib/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar } from 'recharts';

export default function TrendChart({ data }: { data: JoinedMetric[] }) {
  // 날짜별로 그룹화하여 총 비용과 총 매출 계산
  const dailyMap = data.reduce((acc, row) => {
    const d = row.date;
    if (!acc[d]) {
      acc[d] = { date: d, cost: 0, sales: 0 };
    }
    acc[d].cost += row.cost;
    acc[d].sales += row.purchaseDirectSales;
    return acc;
  }, {} as Record<string, { date: string, cost: number, sales: number }>);

  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  if (dailyData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#eaeaea] p-4 shadow-lg rounded-lg">
          <p className="font-semibold text-[#1f1d1d] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex flex-col text-sm">
              <span style={{ color: entry.color }}>
                {entry.name}: {entry.value.toLocaleString()}원
              </span>
            </div>
          ))}
          <p className="text-xs text-[#8d8174] mt-2 pt-2 border-t border-[#eaeaea]">
            일간 ROAS: {payload[0]?.value > 0 ? ((payload[1]?.value / payload[0]?.value) * 100).toFixed(1) : 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white border border-[#eaeaea] shadow-sm rounded-lg p-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#1f1d1d]">날짜별 지출 및 구매 트렌드</h3>
        <p className="text-sm text-[#8d8174] mt-1">캠페인 전체의 실소진 비용과 매출액 추이</p>
      </div>
      
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="date" tick={{ fill: '#8d8174', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={10} minTickGap={20} />
            <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`} tick={{ fill: '#8d8174', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
            
            <Bar yAxisId="left" name="총 지출 비용" dataKey="cost" fill="#d9d3c9" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line yAxisId="left" type="monotone" name="직접 매출액" dataKey="sales" stroke="#1f1d1d" strokeWidth={3} dot={{ r: 4, fill: '#1f1d1d' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
