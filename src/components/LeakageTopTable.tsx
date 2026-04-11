'use client';

import { JoinedMetric } from '@/lib/types';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function LeakageTopTable({ data }: { data: JoinedMetric[] }) {
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
    acc[key].purchaseTotalSales += row.purchaseTotalSales;
    acc[key].cartDirectSales += row.cartDirectSales;
    return acc;
  }, {} as Record<string, JoinedMetric>);

  const totalGlobalCost = Object.values(aggregatedMap).reduce((acc, curr) => acc + curr.cost, 0);

  let topLeakageData = Object.values(aggregatedMap).map(row => {
    const directRoas = row.cost > 0 ? (row.purchaseDirectSales / row.cost) * 100 : 0;
    const expectedRoas = 300; 
    const roasRatio = directRoas > 0 ? expectedRoas / directRoas : 2; 
    const leakageIndex = row.cost > 0 && directRoas < expectedRoas ? (row.cost * roasRatio) : 0; 
    const costShare = totalGlobalCost > 0 ? row.cost / totalGlobalCost : 0;
    
    // vNext 공식: 비용점유율 * ROAS격차 * 원시누수액
    let leakageScore = 0;
    let severityLabel = '';
    let computedImprovementPlan = '';
    
    if (row.cost >= 100000 && directRoas < 30) {
      leakageScore = costShare * roasRatio * leakageIndex;
      severityLabel = '🔴 매우 위험 (차단)';
      computedImprovementPlan = '🚧 [차단 1순위] 예산 낭비가 매우 심각합니다! 키워드/소재를 당장 점검하시고, 노출을 즉시 중단(OFF)할 것을 권장합니다.';
    } else if (row.cost >= 30000 && row.purchaseDirectSales === 0) {
      leakageScore = costShare * 2.5 * row.cost; // 매우 치명적 가중치
      severityLabel = '🔴 치명적 (전환 0)';
      computedImprovementPlan = row.cartDirectSales > 0 
        ? '⚠️ [전환 장벽] 장바구니 유입은 있으나 결제가 없습니다. 결제창, 쿠폰 안내, 상세페이지 CTA를 즉시 점검하세요.' 
        : '⚠️ [긴급 차단] 클릭은 일어났으나 0원 0건입니다. 유입 타겟과 랜딩페이지가 전혀 맞지 않습니다.';
    } else if (row.cost >= 50000 && directRoas > 30 && directRoas < 60) {
      leakageScore = costShare * (expectedRoas / Math.max(directRoas, 1)) * leakageIndex * 0.5;
      severityLabel = '🟠 위험 (효율 붕괴)';
      computedImprovementPlan = '🔧 [효율 개선요망] 전환은 일어나나 단가가 너무 높습니다. 클릭단가(CPC) 하향과 특정 시간대 집중을 통해 효율을 정교화(FIX)하세요.';
    } else {
      leakageScore = 0; // 심각하지 않은 경우 제외
    }

    return { ...row, directRoas, leakageScore, severityLabel, computedImprovementPlan };
  })
  .filter(d => d.leakageScore > 0)
  .sort((a, b) => b.leakageScore - a.leakageScore)
  .slice(0, 10); // 요구사항: TOP 10 픽스

  if (topLeakageData.length === 0) return null;

  return (
    <div className="w-full bg-[#fffcfb] border-2 border-action-off border-opacity-20 shadow-sm rounded-lg p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-action-off opacity-80" />
      <div className="mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-[#4a0000]">
          <AlertCircle className="w-6 h-6 text-action-off" />
          가장 먼저 끊을 구간 (누수 방어 TOP 10)
        </h3>
        <p className="text-sm text-[#8d8174] mt-1 ml-8">비용 점유율과 ROAS 격차를 종합 분석하여 당장 조치가 필요한 최우선 해결 대상을 진단합니다.</p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {topLeakageData.map((row, idx) => (
          <div key={row.id} className="bg-white border border-[#eaeaea] p-4 rounded-md shadow-sm hover:border-action-off transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fde8e8] text-action-off font-bold flex items-center justify-center border border-red-100">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{row.media}</span>
                    <span className="text-sm font-semibold text-[#1f1d1d]">{row.campaign}</span>
                    <span className="text-sm text-[#8d8174]">/ {row.group}</span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium mt-2">
                    <span className="text-[#ea580c]">소진액: {row.cost.toLocaleString()}원</span>
                    <span className="text-action-off font-bold">ROAS: {row.directRoas.toFixed(1)}%</span>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      {row.severityLabel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2 p-3 bg-[#faf9f8] rounded border border-[#eaeaea]">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-action-off shrink-0" />
                  <span className="text-sm text-[#1f1d1d] font-semibold leading-relaxed">
                    {row.computedImprovementPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
