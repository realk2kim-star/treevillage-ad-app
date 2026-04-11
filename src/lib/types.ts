export interface DetailRow {
  "일별"?: string;
  "캠페인유형"?: string;
  "광고그룹유형"?: string;
  "캠페인"?: string;
  "광고그룹"?: string;
  "매체이름"?: string;
  "총비용(VAT포함,원)"?: string;
  "클릭수"?: string;
  "노출수"?: string;
  [key: string]: any;
}

export interface ConvRow {
  "일별"?: string;
  "전환유형"?: string;
  "캠페인유형"?: string;
  "광고그룹유형"?: string;
  "캠페인"?: string;
  "광고그룹"?: string;
  "매체이름"?: string;
  "직접전환수"?: string;
  "간접전환수"?: string;
  "직접전환매출액(원)"?: string;
  "간접전환매출액(원)"?: string;
  [key: string]: any;
}

export interface JoinedMetric {
  id: string; // 고유 결합 키
  date: string;
  campaignType: string;
  groupType: string;
  campaign: string;
  group: string;
  media: string;
  cost: number;
  clicks: number;
  impressions: number;
  
  // 구매 기준
  purchaseDirectSales: number;
  purchaseIndirectSales: number;
  purchaseTotalSales: number;
  purchaseDirectCount: number;
  purchaseIndirectCount: number;
  
  // 장바구니 기준
  cartDirectSales: number;
  cartIndirectSales: number;
  
  // 파생 지표
  directRoas: number; // 순수 구매 직접 ROAS
  cartRatio: number; // 장바구니 비중
  leakageIndex: number; // 원시 누수액
  
  // vNext 복합 누수 점수 시스템
  costShare: number; // 전체 비용 대비 점유율
  leakageScore: number; // 복합 누수 점수 (비용점유 x ROAS격차 x 원시누수액)
  improvementPlan: string; // 광고 담당자 전달용 개선 가이드라인
  
  // 룰 라벨링
  actionLabel: 'OFF(즉시)' | 'OFF(차단)' | 'FIX(정교화)' | 'SCALE(증액)' | 'TEST/관찰' | '대기';
}

export interface GlobalKPI {
  totalCost: number;
  totalClicks: number;
  
  purchaseDirectSales: number;
  purchaseIndirectSales: number;
  purchaseTotalSales: number;
  purchaseDirectCount: number;
  purchaseIndirectCount: number;
  
  cartDirectSales: number;
  cartIndirectSales: number;
  cartTotalSales: number;

  otherDirectSales: number;
  otherIndirectSales: number;

  roasDirect: number; // 구매기준 직접 ROAS
  cartRatio: number;  // 장바구니 매출 비중
}

export interface JoinCoverage {
  totalDetailRows: number;
  totalConvRows: number;
  matchedDetailRows: number;
  matchedConvRows: number;
  matchRate: number; // percentage
  mismatchedDetailSamples: string[];
  mismatchedConvSamples: string[];
  unclassifiedTypes: string[]; // 파싱 불분명한 원문 전환유형 저장용
}
