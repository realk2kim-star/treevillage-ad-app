import { DetailRow, ConvRow, JoinedMetric, GlobalKPI, JoinCoverage } from './types';

const safeNumber = (val?: string | number): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const parsed = Number(val.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// 키 맵핑 (유연성 최대화, 공백 제거 후 비교)
export const flexGet = (row: any, ...keys: string[]): string | undefined => {
  if (!row) return undefined;
  const cleanKeysMap = Object.keys(row).reduce((acc, originalKey) => {
    const cleanKey = originalKey.replace(/[\uFEFF\s]/g, '');
    acc[cleanKey] = originalKey;
    return acc;
  }, {} as Record<string, string>);

  for (const k of keys) {
    const cleanSearchKey = k.replace(/[\uFEFF\s]/g, '');
    if (cleanKeysMap[cleanSearchKey]) {
      return row[cleanKeysMap[cleanSearchKey]];
    }
  }
  return undefined;
};

// 💡 P0 픽스: 유니코드 표준화(NFC)만 적용하고 ⭐ 등 원본 문자는 유지
const safeStr = (val: any) => (val || '').toString().trim().normalize('NFC');

export const stitchAnalyticsData = (
  details: DetailRow[],
  conversions: ConvRow[]
): { results: JoinedMetric[], globalKPI: GlobalKPI, joinCoverage: JoinCoverage } => {
  
  // 1️⃣ P0: Executive 의존성 탈피를 위한 Raw Data 100% 우선 집계
  const kpi: GlobalKPI = {
    totalCost: 0, totalClicks: 0,
    purchaseDirectSales: 0, purchaseIndirectSales: 0, purchaseTotalSales: 0,
    purchaseDirectCount: 0, purchaseIndirectCount: 0,
    cartDirectSales: 0, cartIndirectSales: 0, cartTotalSales: 0,
    otherDirectSales: 0, otherIndirectSales: 0,
    roasDirect: 0, cartRatio: 0
  };

  const unclassifiedTypes = new Set<string>();

  details.forEach(d => {
    kpi.totalCost += safeNumber(flexGet(d, '총비용(VAT포함,원)', '총비용(VAT포함, 원)', '총비용', '비용'));
    kpi.totalClicks += safeNumber(flexGet(d, '클릭수', '클릭'));
  });

  conversions.forEach(c => {
    const dSales = safeNumber(flexGet(c, '직접전환매출액(원)', '직접전환매출액'));
    const iSales = safeNumber(flexGet(c, '간접전환매출액(원)', '간접전환매출액'));
    const dCount = safeNumber(flexGet(c, '직접전환수'));
    const iCount = safeNumber(flexGet(c, '간접전환수'));
    
    // 원본 전환유형 문자열
    const rawTypePattern = flexGet(c, '전환유형', '전환 유형', '전환타입') || '';
    const typeStr = rawTypePattern.toLowerCase();

    if (typeStr.includes('구매') || typeStr.includes('결제')) {
      kpi.purchaseDirectSales += dSales;
      kpi.purchaseIndirectSales += iSales;
      kpi.purchaseDirectCount += dCount;
      kpi.purchaseIndirectCount += iCount;
    } else if (typeStr.includes('장바구니')) {
      kpi.cartDirectSales += dSales;
      kpi.cartIndirectSales += iSales;
    } else {
      // 미분류 전환(기타)
      kpi.otherDirectSales += dSales;
      kpi.otherIndirectSales += iSales;
      if (rawTypePattern) unclassifiedTypes.add(rawTypePattern);
    }
  });

  kpi.purchaseTotalSales = kpi.purchaseDirectSales + kpi.purchaseIndirectSales;
  kpi.cartTotalSales = kpi.cartDirectSales + kpi.cartIndirectSales;
  kpi.roasDirect = kpi.totalCost > 0 ? (kpi.purchaseDirectSales / kpi.totalCost) * 100 : 0;
  kpi.cartRatio = (kpi.purchaseTotalSales + kpi.cartTotalSales) > 0 
    ? (kpi.cartTotalSales / (kpi.purchaseTotalSales + kpi.cartTotalSales)) * 100 : 0;

  // 2️⃣ P0: 조인 안전성 확보 (동적 최소 키 구성)
  const hasCampaign = conversions.some(c => flexGet(c, '캠페인')) && details.some(d => flexGet(d, '캠페인'));
  const hasCampType = conversions.some(c => flexGet(c, '캠페인유형')) && details.some(d => flexGet(d, '캠페인유형'));

  const buildKey = (row: any) => {
    let key = `${safeStr(flexGet(row, '일별', '날짜'))}|${safeStr(flexGet(row, '매체이름', '매체', '매체명'))}|${safeStr(flexGet(row, '광고그룹', '그룹'))}|${safeStr(flexGet(row, '광고그룹유형'))}`;
    if (hasCampaign) key += `|${safeStr(flexGet(row, '캠페인'))}`;
    if (hasCampType) key += `|${safeStr(flexGet(row, '캠페인유형'))}`;
    return key;
  };

  const convMap = new Map<string, ConvRow[]>();
  const mappedConvIndices = new Set<number>();
  
  conversions.forEach((conv, index) => {
    const key = buildKey(conv);
    if (!convMap.has(key)) convMap.set(key, []);
    convMap.get(key)!.push({ ...conv, _originalIndex: index });
  });

  let matchedDetailCount = 0;
  const mismatchedDetailSamples: string[] = [];

  const results: JoinedMetric[] = details.map((detail) => {
    const key = buildKey(detail);
    const matchConvs = convMap.get(key) || [];
    
    if (matchConvs.length > 0) {
      matchedDetailCount++;
      // 기록: 조인된 원본 컨버전 행 번호
      matchConvs.forEach((c: any) => mappedConvIndices.add(c._originalIndex));
    } else {
      if (mismatchedDetailSamples.length < 5) mismatchedDetailSamples.push(key);
    }
    
    let purchaseDirectSales = 0; let purchaseIndirectSales = 0;
    let purchaseDirectCount = 0; let purchaseIndirectCount = 0;
    let cartDirectSales = 0; let cartIndirectSales = 0;

    matchConvs.forEach((conv) => {
      const typeStr = (flexGet(conv, '전환유형', '전환 유형', '전환타입') || '').toLowerCase();
      const dSales = safeNumber(flexGet(conv, '직접전환매출액(원)', '직접전환매출액'));
      const iSales = safeNumber(flexGet(conv, '간접전환매출액(원)', '간접전환매출액'));
      const dCount = safeNumber(flexGet(conv, '직접전환수'));
      const iCount = safeNumber(flexGet(conv, '간접전환수'));

      if (typeStr.includes('구매') || typeStr.includes('결제')) {
        purchaseDirectSales += dSales; purchaseIndirectSales += iSales;
        purchaseDirectCount += dCount; purchaseIndirectCount += iCount;
      } else if (typeStr.includes('장바구니')) {
        cartDirectSales += dSales; cartIndirectSales += iSales;
      }
    });

    const cost = safeNumber(flexGet(detail, '총비용(VAT포함,원)', '총비용(VAT포함, 원)', '총비용', '비용'));
    const clicks = safeNumber(flexGet(detail, '클릭수', '클릭'));
    const impressions = safeNumber(flexGet(detail, '노출수', '노출'));
    const directRoas = cost > 0 ? (purchaseDirectSales / cost) * 100 : 0;
    const cartRatioRow = (purchaseDirectSales + cartDirectSales) > 0 ? (cartDirectSales / (purchaseDirectSales + cartDirectSales)) * 100 : 0;

    const expectedRoas = 300; 
    const roasRatio = directRoas > 0 ? expectedRoas / directRoas : 2; 
    const leakageIndex = cost > 0 && directRoas < expectedRoas ? (cost * roasRatio) : 0; 
    
    const costShare = kpi.totalCost > 0 ? cost / kpi.totalCost : 0;
    let leakageScore = 0;
    let improvementPlan = '현재 준수한 효율을 보이고 있거나 데이터가 적습니다. 현행 유지를 권장합니다.';
    let actionLabel: JoinedMetric['actionLabel'] = '대기';
    
    if (cost >= 100000 && directRoas < 30) {
      actionLabel = 'OFF(차단)'; leakageScore = costShare * roasRatio * leakageIndex;
      improvementPlan = '🚧 [차단 1순위] 예산 낭비가 매우 심각합니다! 과감한 운영 중단을 권장합니다.';
    } else if (cost >= 30000 && purchaseDirectSales === 0) {
      actionLabel = 'OFF(즉시)'; leakageScore = costShare * 2.5 * cost;
      improvementPlan = cartDirectSales > 0 ? '⚠️ [전환 장벽] 장바구니 유입은 있으나 결제가 없습니다. 결제창을 점검하세요.' : '⚠️ [긴급 차단] 전환이 전무합니다. 유입 타겟 점검 및 OFF 요망.';
    } else if (cost >= 50000 && directRoas > 30 && directRoas < 60) {
      actionLabel = 'FIX(정교화)'; leakageScore = costShare * (expectedRoas / Math.max(directRoas, 1)) * leakageIndex * 0.5;
      improvementPlan = '🔧 [효율 개선요망] 클릭단가 조정 및 타겟 시간대 최적화가 필요합니다.';
    } else if (cost > 0 && directRoas >= 300) {
      actionLabel = 'SCALE(증액)'; leakageScore = 0;
      improvementPlan = '🚀 [효자 영역] 타겟 KPI 상회. 예산을 늘려 노출(SCALE)을 적극 유도하세요.';
    } else if (cost > 0) {
      actionLabel = 'TEST/관찰'; leakageScore = costShare * leakageIndex * 0.1;
      improvementPlan = '🤔 성과 추이를 추가 관찰합니다.';
    }

    return {
      id: key + Math.random().toString(36).substring(7),
      date: safeStr(flexGet(detail, '일별', '날짜')),
      campaignType: flexGet(detail, '캠페인유형') || '',
      groupType: safeStr(flexGet(detail, '광고그룹유형')),
      campaign: flexGet(detail, '캠페인') || '',
      group: safeStr(flexGet(detail, '광고그룹', '그룹')),
      media: safeStr(flexGet(detail, '매체이름', '매체', '매체명')),
      cost, clicks, impressions,
      purchaseDirectSales, purchaseIndirectSales, purchaseTotalSales: purchaseDirectSales + purchaseIndirectSales,
      purchaseDirectCount, purchaseIndirectCount,
      cartDirectSales, cartIndirectSales,
      directRoas, cartRatio: cartRatioRow, leakageIndex, costShare, leakageScore, improvementPlan, actionLabel
    };
  });

  // 누락된 전환유형 샘플 수집
  const mismatchedConvSamples: string[] = [];
  conversions.forEach((conv, index) => {
    if (!mappedConvIndices.has(index) && mismatchedConvSamples.length < 5) {
      mismatchedConvSamples.push(buildKey(conv));
    }
  });

  const matchedConvRows = mappedConvIndices.size;
  const matchRate = conversions.length > 0 ? (matchedConvRows / conversions.length) * 100 : 0;

  const joinCoverage: JoinCoverage = {
    totalDetailRows: details.length,
    totalConvRows: conversions.length,
    matchedDetailRows: matchedDetailCount,
    matchedConvRows,
    matchRate,
    mismatchedDetailSamples,
    mismatchedConvSamples,
    unclassifiedTypes: Array.from(unclassifiedTypes)
  };

  return { results, globalKPI: kpi, joinCoverage };
};
