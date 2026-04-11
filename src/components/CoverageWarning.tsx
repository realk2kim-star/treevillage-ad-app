'use client';

import { useAdStore } from '@/store/useAdStore';
import { AlertCircle, FileMinus } from 'lucide-react';

export default function CoverageWarning() {
  const { joinCoverage } = useAdStore();

  if (!joinCoverage) return null;
  if (joinCoverage.totalConvRows === 0) return null; // 전환 데이터 없는 경우는 제외

  // 매칭률 100%면 경고를 띄울 필요가 없음 (단, 95% 이하일 때만 노출)
  if (joinCoverage.matchRate >= 95 && joinCoverage.unclassifiedTypes.length === 0) return null;

  return (
    <div className="w-full bg-[#fff4f2] border-2 border-action-off shadow-md rounded-lg p-6 mb-2 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
      <div className="absolute top-0 left-0 w-2 h-full bg-action-off" />
      
      <div className="flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-action-off mt-1 shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#4a0000] mb-2 flex items-center gap-2">
            ⚠️ 데이터 결합 주의 (매칭률 {joinCoverage.matchRate.toFixed(1)}%)
          </h3>
          <p className="text-sm text-[#4a4a4a] mb-4">
            전환유형 파일에 <strong>{joinCoverage.totalConvRows.toLocaleString()}건</strong>의 데이터가 존재하지만, 상세 파일과의 키(Key) 일치 건수는 <strong>{joinCoverage.matchedConvRows.toLocaleString()}건</strong>에 불과합니다. 
            양쪽 파일의 필터 설정이나 추출 기간이 다르지 않은지 확인해 주세요. <br/>
            <span className="opacity-80">(* 아래에 누락된 샘플 키를 참고하여 양쪽 엑셀의 형태를 동일하게 맞춰주세요)</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {joinCoverage.mismatchedConvSamples.length > 0 && (
              <div className="bg-white p-4 rounded border border-red-200">
                <h4 className="text-sm font-semibold text-action-off flex items-center gap-1 mb-2">
                  <FileMinus className="w-4 h-4" /> 결합 실패 전환 데이터 샘플
                </h4>
                <ul className="list-disc pl-5 text-xs text-[#4a4a4a] space-y-1">
                  {joinCoverage.mismatchedConvSamples.map((sample, idx) => (
                    <li key={idx} className="font-mono text-[11px] truncate" title={sample}>{sample}</li>
                  ))}
                </ul>
              </div>
            )}

            {joinCoverage.unclassifiedTypes.length > 0 && (
              <div className="bg-white p-4 rounded border border-yellow-300">
                <h4 className="text-sm font-semibold text-yellow-700 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-4 h-4" /> 구매/장바구니 미분류 항목 (기타)
                </h4>
                <ul className="list-disc pl-5 text-xs text-[#4a4a4a] space-y-1">
                  {joinCoverage.unclassifiedTypes.map((type, idx) => (
                    <li key={idx} className="font-mono text-[11px] truncate whitespace-pre-wrap">{type}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
