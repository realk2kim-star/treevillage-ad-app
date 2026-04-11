'use client';

import { useAdStore } from '@/store/useAdStore';

export default function ConversionMixTable() {
  const { globalKPI } = useAdStore();
  if (!globalKPI) return null;

  const totalPurchaseCount = globalKPI.purchaseDirectCount + globalKPI.purchaseIndirectCount;
  const directRatio = globalKPI.purchaseTotalSales > 0 ? (globalKPI.purchaseDirectSales / globalKPI.purchaseTotalSales) * 100 : 0;
  const indirectRatio = globalKPI.purchaseTotalSales > 0 ? (globalKPI.purchaseIndirectSales / globalKPI.purchaseTotalSales) * 100 : 0;
  
  const countDirectRatio = totalPurchaseCount > 0 ? (globalKPI.purchaseDirectCount / totalPurchaseCount) * 100 : 0;
  const countIndirectRatio = totalPurchaseCount > 0 ? (globalKPI.purchaseIndirectCount / totalPurchaseCount) * 100 : 0;

  return (
    <div className="w-full bg-white border border-[#eaeaea] shadow-sm rounded-lg p-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#1f1d1d]">전환유형 요약표 (Direct / Indirect Mix)</h3>
        <p className="text-sm text-[#8d8174] mt-1">사용자의 1차 클릭(직접) 대비 추적 기간 내 결제(간접) 비율 분석입니다.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-[#1f1d1d] text-[#1f1d1d] bg-[#faf9f8]">
              <th className="py-3 px-4 font-semibold">전환 그룹</th>
              <th className="py-3 px-4 font-semibold text-right border-l border-[#eaeaea]">매출 합계 (원)</th>
              <th className="py-3 px-4 font-semibold text-right">직접 매출 (원)</th>
              <th className="py-3 px-4 font-semibold text-right">간접 매출 (원)</th>
              <th className="py-3 px-4 font-semibold text-right border-l border-[#eaeaea]">전환수 합계 (건)</th>
              <th className="py-3 px-4 font-semibold text-right">직접 전환 (건)</th>
              <th className="py-3 px-4 font-semibold text-right">간접 전환 (건)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#eaeaea]">
              <td className="py-4 px-4 font-bold text-[#ea580c] flex items-center gap-2">🛒 구매 완료</td>
              <td className="py-4 px-4 text-right font-bold border-l border-[#eaeaea]">
                {globalKPI.purchaseTotalSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right text-[#1f1d1d]">
                {globalKPI.purchaseDirectSales.toLocaleString()} <span className="text-[10px] text-[#8d8174] ml-1">({directRatio.toFixed(1)}%)</span>
              </td>
              <td className="py-4 px-4 text-right text-[#8d8174]">
                {globalKPI.purchaseIndirectSales.toLocaleString()} <span className="text-[10px] ml-1">({indirectRatio.toFixed(1)}%)</span>
              </td>
              
              <td className="py-4 px-4 text-right font-bold border-l border-[#eaeaea]">
                {totalPurchaseCount.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right">
                {globalKPI.purchaseDirectCount.toLocaleString()} <span className="text-[10px] text-[#8d8174] ml-1">({countDirectRatio.toFixed(1)}%)</span>
              </td>
              <td className="py-4 px-4 text-right text-[#8d8174]">
                {globalKPI.purchaseIndirectCount.toLocaleString()} <span className="text-[10px] ml-1">({countIndirectRatio.toFixed(1)}%)</span>
              </td>
            </tr>

            <tr className="border-b border-[#eaeaea]">
              <td className="py-4 px-4 font-medium text-[#1f1d1d]">🛍️ 장바구니 담기</td>
              <td className="py-4 px-4 text-right font-bold border-l border-[#eaeaea]">
                {globalKPI.cartTotalSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right text-[#1f1d1d]">
                {globalKPI.cartDirectSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right text-[#8d8174]">
                {globalKPI.cartIndirectSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-center text-[#8d8174] border-l border-[#eaeaea]" colSpan={3}>
                <span className="text-xs italic">-</span>
              </td>
            </tr>

            <tr className="border-b border-[#eaeaea]">
              <td className="py-4 px-4 font-medium text-[#8d8174]">📦 기타 (미분류)</td>
              <td className="py-4 px-4 text-right font-bold text-[#8d8174] border-l border-[#eaeaea]">
                {(globalKPI.otherDirectSales + globalKPI.otherIndirectSales).toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right text-[#8d8174]">
                {globalKPI.otherDirectSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-right text-[#8d8174]">
                {globalKPI.otherIndirectSales.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-center text-[#8d8174] border-l border-[#eaeaea]" colSpan={3}>
                <span className="text-xs italic">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
