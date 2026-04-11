'use client';

import { JoinedMetric } from '@/lib/types';
import { useState } from 'react';
import { Info } from 'lucide-react';

export default function ActionTable({ data }: { data: JoinedMetric[] }) {
  const [filter, setFilter] = useState<string>('ALL');

  // 날짜별 분리 데이터를 '캠페인-그룹-매체' 단위로 재통합
  const aggregatedMap = data.reduce((acc, row) => {
    const key = `${row.campaignType}|${row.groupType}|${row.campaign}|${row.group}|${row.media}`;
    if (!acc[key]) {
      acc[key] = {
        ...row,
        cost: 0, 
        clicks: 0, 
        impressions: 0, 
        purchaseDirectSales: 0, 
        purchaseIndirectSales: 0,
        purchaseTotalSales: 0, 
        purchaseDirectCount: 0,
        purchaseIndirectCount: 0,
        cartDirectSales: 0,
        cartIndirectSales: 0
      };
    }
    acc[key].cost += row.cost;
    acc[key].clicks += row.clicks;
    acc[key].impressions += row.impressions;
    acc[key].purchaseDirectSales += row.purchaseDirectSales;
    acc[key].purchaseIndirectSales += row.purchaseIndirectSales;
    acc[key].purchaseTotalSales += row.purchaseTotalSales;
    acc[key].purchaseDirectCount += row.purchaseDirectCount;
    acc[key].purchaseIndirectCount += row.purchaseIndirectCount;
    acc[key].cartDirectSales += row.cartDirectSales;
    acc[key].cartIndirectSales += row.cartIndirectSales;
    return acc;
  }, {} as Record<string, JoinedMetric>);

  const totalGlobalCost = Object.values(aggregatedMap).reduce((acc, curr) => acc + curr.cost, 0);

  let aggregatedData = Object.values(aggregatedMap).map(row => {
    // 💡 vNext: ROAS는 오직 구매 기준 
    const directRoas = row.cost > 0 ? (row.purchaseDirectSales / row.cost) * 100 : 0;
    
    // 타겟 ROAS 300 기준으로 복합 누수점수 계산 (비용점유 x ROAS격차 x 원시누수액)
    const expectedRoas = 300; 
    const roasRatio = directRoas > 0 ? expectedRoas / directRoas : 2; 
    const leakageIndex = row.cost > 0 && directRoas < expectedRoas ? (row.cost * roasRatio) : 0; 
    const costShare = totalGlobalCost > 0 ? row.cost / totalGlobalCost : 0;
    
    let leakageScore = 0;
    let actionLabel: JoinedMetric['actionLabel'] = '대기';
    
    if (row.cost >= 100000 && directRoas < 30) {
      actionLabel = 'OFF(차단)';
      leakageScore = costShare * roasRatio * leakageIndex;
    }
    else if (row.cost >= 30000 && row.purchaseDirectSales === 0) {
      actionLabel = 'OFF(즉시)';
      leakageScore = costShare * 2.5 * row.cost;
    }
    else if (row.cost >= 50000 && directRoas > 30 && directRoas < 60) {
      actionLabel = 'FIX(정교화)';
      leakageScore = costShare * (expectedRoas / Math.max(directRoas, 1)) * leakageIndex * 0.5;
    }
    else if (row.cost > 0 && directRoas >= 300) {
      actionLabel = 'SCALE(증액)';
      leakageScore = 0;
    }
    else if (row.cost > 0) {
      actionLabel = 'TEST/관찰';
      leakageScore = costShare * leakageIndex * 0.1;
    }

    return { ...row, directRoas, leakageIndex, leakageScore, actionLabel };
  });

  // 누수점수(leakageScore) 내림차순 정렬 
  let sortedData = aggregatedData
    .filter(row => row.cost > 0)
    .sort((a, b) => b.leakageScore - a.leakageScore);

  if (filter !== 'ALL') {
    sortedData = sortedData.filter(d => d.actionLabel.includes(filter));
  }

  const getLabelColor = (label: string) => {
    if (label.includes('OFF(즉시)')) return 'bg-action-off text-white opacity-100';
    if (label.includes('OFF(차단)')) return 'bg-action-off text-white opacity-80';
    if (label.includes('SCALE')) return 'bg-action-scale text-white';
    if (label.includes('FIX')) return 'bg-action-fix text-white';
    if (label.includes('TEST')) return 'bg-action-test text-white';
    return 'bg-[#f4f0ec] text-[#8d8174]';
  };

  return (
    <div className="flex flex-col gap-6" id="action-plan">
      <div className="bg-[#faf9f8] p-5 rounded-lg mb-2 text-sm text-[#4a4a4a] border border-[#eaeaea]">
        <h4 className="font-semibold text-[#1f1d1d] mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-brown" /> 
          룰셋 및 라벨링 안내 가이드 (vNext)
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3 text-[13px] leading-relaxed">
          <div className="flex gap-2">
            <strong className="text-action-off w-20 shrink-0">OFF(즉시)</strong>
            <span><span className="font-semibold text-black">3만원 이상</span> 소진되었으나 직접 매출이 0원인 이탈 자산. <span className="font-bold underline">즉각적인 광고 중단</span>을 권장합니다.</span>
          </div>
          <div className="flex gap-2">
            <strong className="text-action-off opacity-80 w-20 shrink-0">OFF(차단)</strong>
            <span><span className="font-semibold text-black">10만원 이상</span> 소진되었으나 ROAS가 30% 미만인 심각한 누수 자산. <span className="font-bold underline">운영 중단</span>을 권장합니다.</span>
          </div>
          <div className="flex gap-2">
            <strong className="text-action-scale w-20 shrink-0">SCALE(증액)</strong>
            <span>ROAS <span className="font-semibold text-black">300% 이상</span>인 초고효율 성과 그룹입니다. <span className="font-bold text-black border-b border-black">예산 증액(Scale-up)</span>을 강력히 권장합니다.</span>
          </div>
          <div className="flex gap-2">
            <strong className="text-action-fix w-20 shrink-0">FIX(정교화)</strong>
            <span>비용 지속 발생 및 단가 과다(ROAS 60% 미만). 키워드, 랜딩페이지 <span className="font-bold text-black">수정 조치</span>가 필요합니다.</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        {['ALL', 'OFF(즉시)', 'OFF(차단)', 'SCALE(증액)', 'FIX(정교화)', 'TEST/관찰'].map(type => {
          const query = type.split('(')[0].split('/')[0];
          return (
            <button 
              key={type} 
              onClick={() => setFilter(query)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${filter === query ? 'bg-[#1f1d1d] text-white shadow-md' : 'bg-[#f4f0ec] text-[#4a4a4a] hover:bg-[#e0dcd8]'}`}
            >
              {type}
            </button>
          )
        })}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b-2 border-[#1f1d1d] text-[#1f1d1d] text-sm tracking-wide">
              <th className="font-semibold p-4">분류 / 매체</th>
              <th className="font-semibold p-4">캠페인 / 광고그룹</th>
              <th className="font-semibold p-4 text-right">비용(원)</th>
              <th className="font-semibold p-4 text-right">클릭(건)</th>
              <th className="font-semibold p-4 text-right">구매직접매출(원)</th>
              <th className="font-semibold p-4 text-right">구매직접ROAS(%)</th>
              <th className="font-semibold p-4 text-right">구매전환수(직접)</th>
              <th className="font-semibold p-4 text-right">직접비중(%)</th>
              <th className="font-semibold p-4 text-center whitespace-nowrap">권장액션</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 100).map((row) => {
              const directShare = row.purchaseTotalSales > 0 ? (row.purchaseDirectSales / row.purchaseTotalSales) * 100 : 0;
              return (
                <tr key={row.id} className="border-b border-[#eaeaea] hover:bg-[#faf9f8] transition-colors group">
                  <td className="p-4 text-sm">
                    <div className="text-[#1f1d1d] font-medium">{row.media || '-'}</div>
                    <div className="text-[#8d8174] text-xs mt-1">{row.campaignType} <span className="opacity-50">/</span> {row.groupType}</div>
                  </td>
                  <td className="p-4 text-sm max-w-[200px] truncate" title={`${row.campaign} / ${row.group}`}>
                    <div className="text-[#1f1d1d] truncate">{row.campaign}</div>
                    <div className="text-[#8d8174] truncate mt-1">{row.group}</div>
                  </td>
                  <td className="p-4 text-right text-sm">{row.cost.toLocaleString()}</td>
                  <td className="p-4 text-right text-sm">{row.clicks.toLocaleString()}</td>
                  <td className="p-4 text-right text-sm text-[#ea580c] font-medium">{row.purchaseDirectSales.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`font-bold ${row.directRoas < 50 ? 'text-action-off' : row.directRoas >= 300 ? 'text-action-scale' : 'text-[#1f1d1d]'}`}>
                      {row.directRoas.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-[#1f1d1d] font-medium">{row.purchaseDirectCount.toLocaleString()}</td>
                  <td className="p-4 text-right text-sm font-light text-[#8d8174]">{directShare.toFixed(1)}%</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-[11px] font-bold tracking-wider rounded ${getLabelColor(row.actionLabel)}`}>
                      {row.actionLabel}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {sortedData.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center text-[#8d8174] bg-[#faf9f8] mt-4 rounded border border-dashed border-[#eaeaea]">
            <span className="text-lg mb-2">데이터가 없습니다</span>
            <span className="text-sm">조건에 부합하는 광고 자산이 없습니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
