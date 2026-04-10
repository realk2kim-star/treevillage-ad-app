import { JoinedMetric } from '@/lib/types';
import { DollarSign, ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function KPICards({ data }: { data: JoinedMetric[] }) {
  const totalCost = data.reduce((acc, curr) => acc + curr.cost, 0);
  const totalPurchase = data.reduce((acc, curr) => acc + curr.purchaseDirectSales, 0);
  const totalCarts = data.reduce((acc, curr) => acc + curr.cartDirectSales, 0);
  
  const totalRoas = totalCost > 0 ? (totalPurchase / totalCost) * 100 : 0;
  const cartRatio = (totalPurchase + totalCarts) > 0 ? (totalCarts / (totalPurchase + totalCarts)) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="gallery-card flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2 text-[#8d8174] text-sm font-medium tracking-wide">
          <DollarSign className="w-4 h-4"/><span>총 지출 비용</span>
        </div>
        <div className="text-3xl font-light text-[#1f1d1d]">{totalCost.toLocaleString()}원</div>
      </div>
      
      <div className="gallery-card flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2 text-[#8d8174] text-sm font-medium tracking-wide">
          <ShoppingBag className="w-4 h-4"/><span>직접 구매 매출액</span>
        </div>
        <div className="text-3xl font-light text-[#1f1d1d]">{totalPurchase.toLocaleString()}원</div>
      </div>
      
      <div className="gallery-card flex flex-col justify-center gap-3 relative overflow-hidden bg-[#faf9f8]">
        <div className="flex items-center gap-2 text-[#4a4a4a] text-sm font-bold tracking-wide">
          <CheckCircle2 className="w-4 h-4 text-action-scale"/><span>실측 기준 ROAS</span>
        </div>
        <div className="text-4xl font-bold text-action-scale">{totalRoas.toFixed(1)}%</div>
      </div>
      
      <div className="gallery-card flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2 text-[#8d8174] text-sm font-medium tracking-wide">
          <AlertTriangle className="w-4 h-4 text-action-off"/><span>퍼널: 장바구니 착시율</span>
        </div>
        <div className="text-3xl font-light text-action-off">{cartRatio.toFixed(1)}%</div>
      </div>
    </div>
  );
}
