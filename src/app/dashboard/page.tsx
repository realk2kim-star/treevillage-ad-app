'use client';

import { useAdStore } from '@/store/useAdStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import KPICards from '@/components/KPICards';
import ActionTable from '@/components/ActionTable';
import TrendChart from '@/components/TrendChart';
import LeakageTopTable from '@/components/LeakageTopTable';
import ConversionMixTable from '@/components/ConversionMixTable';
import CoverageWarning from '@/components/CoverageWarning';

export default function DashboardPage() {
  const { joinedData, rawDetails } = useAdStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // zustand persist + hydration 방어
    if (joinedData.length === 0) {
      router.push('/');
    }
  }, [joinedData, router]);

  if (!mounted || joinedData.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-end justify-between border-b border-[#eaeaea] pb-4">
        <div>
          <h2 className="text-2xl font-light text-[#1f1d1d] uppercase tracking-wide">Executive Dashboard (vNext)</h2>
          <p className="text-[#8d8174] mt-1 text-sm tracking-widest">실측 구매 효율 분석 및 핵심 개선 과제 최우선 보고서</p>
        </div>
      </div>

      {/* P0: 결합 Coverage 경고 배너 */}
      <CoverageWarning />

      {/* 상단 핵심 KPI 요약 카드 구역 */}
      <KPICards />
      
      {/* 🚀 P0 요구사항: 가장 시급한 문제 지표 표출 */}
      <LeakageTopTable data={joinedData} />
      
      {/* 전환 유형 믹스 (직접/간접) */}
      <ConversionMixTable />
      
      {/* 기간별 트렌드 차트 구역 */}
      <TrendChart data={joinedData} />
      
      {/* 액션 플랜 테이블 구역 */}
      <div className="w-full bg-white border border-[#eaeaea] shadow-sm rounded-lg p-8">
        <h3 className="text-lg font-medium text-[#1f1d1d] mb-6">매체 및 주요 광고그룹 실행 액션표</h3>
        <ActionTable data={joinedData} />
      </div>
    </div>
  );
}
