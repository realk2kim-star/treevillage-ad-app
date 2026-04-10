import { create } from 'zustand';
import { DetailRow, ConvRow, JoinedMetric } from '../lib/types';
import { stitchAnalyticsData } from '../lib/analytics';

interface AdStoreState {
  rawDetails: DetailRow[];
  rawConversions: ConvRow[];
  joinedData: JoinedMetric[];
  isProcessing: boolean;
  
  setRawDetails: (data: DetailRow[]) => void;
  setRawConversions: (data: ConvRow[]) => void;
  processData: () => void;
  clearData: () => void;
}

export const useAdStore = create<AdStoreState>((set, get) => ({
  rawDetails: [],
  rawConversions: [],
  joinedData: [],
  isProcessing: false,

  setRawDetails: (data) => set({ rawDetails: data }),
  setRawConversions: (data) => set({ rawConversions: data }),

  processData: () => {
    // 상태에서 CSV 데이터 꺼내기
    const { rawDetails, rawConversions } = get();
    if (rawDetails.length === 0 || rawConversions.length === 0) return;

    set({ isProcessing: true });
    
    // JS 엔진을 블로킹하지 않도록 약간 딜레이를 주어 UI 로딩 상태를 확실히 보여줍니다.
    setTimeout(() => {
      const results = stitchAnalyticsData(rawDetails, rawConversions);
      set({ joinedData: results, isProcessing: false });
    }, 100);
  },

  clearData: () => {
    set({ rawDetails: [], rawConversions: [], joinedData: [], isProcessing: false });
  }
}));
