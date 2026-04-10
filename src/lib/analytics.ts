import { DetailRow, ConvRow, JoinedMetric } from './types';

const safeNumber = (val?: string | number): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const parsed = Number(val.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const flexGet = (row: any, ...keys: string[]): string | undefined => {
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

// 💡 픽스: 네이버 전환유형 보고서에 캠페인이 누락다운로드 되는 경우가 많아 가장 확실한 3가지 키로만 결합
export const createJoinKey = (
  date = '',
  grp = '',
  media = ''
) => {
  return `${date}|${grp}|${media}`;
};

export const stitchAnalyticsData = (
  details: DetailRow[],
  conversions: ConvRow[]
): JoinedMetric[] => {
  const convMap = new Map<string, ConvRow[]>();

  conversions.forEach((conv) => {
    const key = createJoinKey(
      flexGet(conv, '일별', '날짜')?.trim(),
      flexGet(conv, '광고그룹', '그룹')?.trim(),
      flexGet(conv, '매체이름', '매체', '매체명')?.trim()
    );
    if (!convMap.has(key)) {
      convMap.set(key, []);
    }
    convMap.get(key)!.push(conv);
  });

  const results: JoinedMetric[] = details.map((detail) => {
    const key = createJoinKey(
      flexGet(detail, '일별', '날짜')?.trim(),
      flexGet(detail, '광고그룹', '그룹')?.trim(),
      flexGet(detail, '매체이름', '매체', '매체명')?.trim()
    );

    const matchConvs = convMap.get(key) || [];
    
    let purchaseDirectSales = 0;
    let purchaseTotalSales = 0;
    let purchaseDirectCount = 0;
    let cartDirectSales = 0;

    matchConvs.forEach((conv) => {
      const typeStr = flexGet(conv, '전환유형', '전환 유형', '전환타입') || '';
      const dSales = safeNumber(flexGet(conv, '직접전환매출액(원)', '직접전환매출액'));
      const iSales = safeNumber(flexGet(conv, '간접전환매출액(원)', '간접전환매출액'));
      const dCount = safeNumber(flexGet(conv, '직접전환수'));

      if (typeStr.includes('구매') || typeStr.includes('결제')) {
        purchaseDirectSales += dSales;
        purchaseTotalSales += (dSales + iSales);
        purchaseDirectCount += dCount;
      } else if (typeStr.includes('장바구니')) {
        cartDirectSales += dSales;
      }
    });

    const cost = safeNumber(flexGet(detail, '총비용(VAT포함,원)', '총비용(VAT포함, 원)', '총비용', '비용'));
    const clicks = safeNumber(flexGet(detail, '클릭수', '클릭'));
    const impressions = safeNumber(flexGet(detail, '노출수', '노출'));

    const directRoas = cost > 0 ? (purchaseDirectSales / cost) * 100 : 0;
    const cartRatio = (purchaseDirectSales + cartDirectSales) > 0 
      ? (cartDirectSales / (purchaseDirectSales + cartDirectSales)) * 100 
      : 0;

    const expectedRoas = 300; 
    const roasRatio = directRoas > 0 ? expectedRoas / directRoas : 2; 
    const leakageIndex = cost > 0 && directRoas < expectedRoas ? (cost * roasRatio) : 0; 

    let actionLabel: JoinedMetric['actionLabel'] = '대기';
    if (cost >= 100000 && directRoas < 30) actionLabel = 'OFF(차단)';
    else if (cost >= 30000 && purchaseDirectSales === 0) actionLabel = 'OFF(즉시)';
    else if (cost >= 50000 && directRoas > 30 && directRoas < 60) actionLabel = 'FIX(정교화)';
    else if (cost > 0 && directRoas >= 300) actionLabel = 'SCALE(증액)';
    else if (cost > 0) actionLabel = 'TEST/관찰';

    return {
      id: key + Math.random().toString(), // React Key 유일성 보장
      date: flexGet(detail, '일별', '날짜') || '',
      campaignType: flexGet(detail, '캠페인유형') || '',
      groupType: flexGet(detail, '광고그룹유형') || '',
      campaign: flexGet(detail, '캠페인') || '',
      group: flexGet(detail, '광고그룹') || '',
      media: flexGet(detail, '매체이름', '매체', '매체명') || '',
      cost,
      clicks,
      impressions,
      purchaseDirectSales,
      purchaseTotalSales,
      purchaseDirectCount,
      cartDirectSales,
      directRoas,
      cartRatio,
      leakageIndex,
      actionLabel
    };
  });

  return results;
};
