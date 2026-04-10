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
  purchaseTotalSales: number;
  purchaseDirectCount: number;
  
  // 장바구니 기준
  cartDirectSales: number;
  
  // 파생 지표
  directRoas: number; // 직접 매출 / 100 * 비용
  cartRatio: number; // 장바구니 비중
  leakageIndex: number; // 누수 지수
  
  // 룰 라벨링
  actionLabel: 'OFF(즉시)' | 'OFF(차단)' | 'FIX(정교화)' | 'SCALE(증액)' | 'TEST/관찰' | '대기';
}
