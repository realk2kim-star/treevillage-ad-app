import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DetailRow, ConvRow, JoinedMetric, GlobalKPI, JoinCoverage } from '../lib/types';
import { stitchAnalyticsData } from '../lib/analytics';

interface AdStoreState {
  reportId: string | null;
  rawDetails: DetailRow[];
  rawConversions: ConvRow[];
  joinedData: JoinedMetric[];
  globalKPI: GlobalKPI | null;
  joinCoverage: JoinCoverage | null;
  isProcessing: boolean;
  
  setRawDetails: (data: DetailRow[]) => void;
  setRawConversions: (data: ConvRow[]) => void;
  processData: () => void;
  clearData: () => void;
}

export const useAdStore = create<AdStoreState>()(
  persist(
    (set, get) => ({
      reportId: null,
      rawDetails: [],
      rawConversions: [],
      joinedData: [],
      globalKPI: null,
      joinCoverage: null,
      isProcessing: false,

      setRawDetails: (data) => set({ rawDetails: data }),
      setRawConversions: (data) => set({ rawConversions: data }),

      processData: () => {
        const { rawDetails, rawConversions } = get();
        if (rawDetails.length === 0 || rawConversions.length === 0) return;
        
        // P1: 필수 컬럼 누락 에러 감지 (최소 조인키 확인)
        // flexGet 내부 로직을 간접적으로 테스트
        const firstDetail = JSON.stringify(rawDetails[0] || {}).replace(/[\uFEFF\s]/g, '');
        const firstConv = JSON.stringify(rawConversions[0] || {}).replace(/[\uFEFF\s]/g, '');
        
        const reqKeys = ['일별', '매체', '그룹'];
        const missingInDetail = reqKeys.filter(k => !firstDetail.includes(k));
        const missingInConv = reqKeys.filter(k => !firstConv.includes(k));
        
        if (missingInDetail.length > 0) {
          alert(`상세 데이터(비용)에 필수 컬럼이 없습니다: ${missingInDetail.join(', ')}`);
          return;
        }
        if (missingInConv.length > 0) {
          alert(`전환유형 데이터에 필수 컬럼이 없습니다: ${missingInConv.join(', ')}`);
          return;
        }

        set({ isProcessing: true });
        
        setTimeout(() => {
          const { results, globalKPI, joinCoverage } = stitchAnalyticsData(rawDetails, rawConversions);
          const newReportId = `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
          
          set({ 
            reportId: newReportId,
            joinedData: results, 
            globalKPI,
            joinCoverage,
            isProcessing: false 
          });
        }, 100);
      },

      clearData: () => {
        set({ reportId: null, rawDetails: [], rawConversions: [], joinedData: [], globalKPI: null, joinCoverage: null, isProcessing: false });
      }
    }),
    {
      name: 'ad-analytics-storage', 
    }
  )
);
