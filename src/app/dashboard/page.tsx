'use client';

import { useAdStore } from '@/store/useAdStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import KPICards from '@/components/KPICards';
import ActionTable from '@/components/ActionTable';
import TrendChart from '@/components/TrendChart';

export default function DashboardPage() {
  const { joinedData, rawDetails } = useAdStore();
  const router = useRouter();

  useEffect(() => {
    if (joinedData.length === 0) {
      router.push('/');
    }
  }, [joinedData, router]);

  if (joinedData.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between border-b border-[#eaeaea] pb-4">
        <div>
          <h2 className="text-2xl font-light text-[#1f1d1d] uppercase tracking-wide">Executive Dashboard</h2>
          <p className="text-[#8d8174] mt-1 text-sm tracking-widest">실측 구매 효율 분석 및 우선순위 라벨링 요약</p>
        </div>
      </div>

      {/* 상단 핵심 KPI 요약 카드 구역 */}
      <KPICards data={joinedData} />
      
      {/* 누락되었던 기간별 트렌드 차트 구역 */}
      <TrendChart data={joinedData} />
      
      {/* 액션 플랜 테이블 구역 */}
      <div className="w-full bg-white border border-[#eaeaea] shadow-sm rounded-lg p-8">
        <h3 className="text-lg font-medium text-[#1f1d1d] mb-6">매체 및 주요 광고그룹 실행 액션표</h3>
        <ActionTable data={joinedData} />
      </div>
    </div>
  );
}
