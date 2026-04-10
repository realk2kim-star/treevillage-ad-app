'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { parseCsvFile } from '@/lib/parser';
import { useAdStore } from '@/store/useAdStore';
import { DetailRow, ConvRow } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { setRawDetails, setRawConversions, processData, rawDetails, rawConversions, isProcessing } = useAdStore();
  
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'detail' | 'conv') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingType(type);
    setErrorMsg('');

    try {
      if (type === 'detail') {
        const parsed = await parseCsvFile<DetailRow>(file);
        setRawDetails(parsed);
      } else {
        const parsed = await parseCsvFile<ConvRow>(file);
        setRawConversions(parsed);
      }
    } catch (err: any) {
      setErrorMsg(`파일 업로드 실패: ${err.message}`);
    } finally {
      setLoadingType(null);
    }
  };

  const handleProcess = () => {
    processData();
    // 데이터 처리 후 대시보드로 이동
    setTimeout(() => {
      router.push('/dashboard');
    }, 500); 
  };

  const isDetailUploaded = rawDetails.length > 0;
  const isConvUploaded = rawConversions.length > 0;
  const canProcess = isDetailUploaded && isConvUploaded;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-[#1f1d1d]">
          Search Ad Analytics Workspace
        </h2>
        <p className="text-[#8d8174] max-w-lg mx-auto leading-relaxed">
          트리빌리지의 세밀한 매체별 효율을 단숨에 분석합니다. 상세 보고서와 전환유형 CSV 파일을 각각 업로드해 주세요.
        </p>
      </div>

      <div className="w-full max-w-3xl flex gap-6 mt-4">
        
        {/* 상세 보고서 업로드 영역 */}
        <div className={`relative flex-1 flex flex-col items-center justify-center p-10 border-2 rounded-xl transition-all ${isDetailUploaded ? 'border-brand-dark bg-[#fcfcfc]' : 'border-dashed border-[#dcdcdc] bg-white hover:border-[#1f1d1d]'}`}>
          <input 
            type="file" 
            accept=".csv" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'detail')}
          />
          {loadingType === 'detail' ? (
            <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
          ) : isDetailUploaded ? (
            <CheckCircle2 className="w-10 h-10 text-action-scale mb-2" />
          ) : (
            <UploadCloud className="w-8 h-8 text-brand-brown mb-2" />
          )}
          <h3 className="font-semibold text-[#1f1d1d] text-lg mt-2">상세 보고서 CSV</h3>
          <p className="text-sm text-[#8d8174] mt-1">{isDetailUploaded ? `${rawDetails.length}행 로드 완료` : '클릭 또는 드래그하여 파일 첨부'}</p>
        </div>

        {/* 전환유형 보고서 업로드 영역 */}
        <div className={`relative flex-1 flex flex-col items-center justify-center p-10 border-2 rounded-xl transition-all ${isConvUploaded ? 'border-brand-dark bg-[#fcfcfc]' : 'border-dashed border-[#dcdcdc] bg-white hover:border-[#1f1d1d]'}`}>
           <input 
            type="file" 
            accept=".csv" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'conv')}
          />
          {loadingType === 'conv' ? (
            <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
          ) : isConvUploaded ? (
            <CheckCircle2 className="w-10 h-10 text-action-scale mb-2" />
          ) : (
            <UploadCloud className="w-8 h-8 text-brand-brown mb-2" />
          )}
          <h3 className="font-semibold text-[#1f1d1d] text-lg mt-2">전환유형 보고서 CSV</h3>
          <p className="text-sm text-[#8d8174] mt-1">{isConvUploaded ? `${rawConversions.length}행 로드 완료` : '클릭 또는 드래그하여 파일 첨부'}</p>
        </div>

      </div>

      {errorMsg && <p className="text-action-off font-medium bg-red-50 py-2 px-4 rounded-md">{errorMsg}</p>}

      <button
        disabled={!canProcess || isProcessing}
        onClick={handleProcess}
        className={`mt-4 px-10 py-4 rounded-full flex items-center justify-center gap-2 font-medium tracking-wide transition-all ${canProcess ? 'bg-[#1f1d1d] text-white hover:bg-black shadow-lg hover:shadow-xl transform hover:-translate-y-1' : 'bg-[#e0e0e0] text-[#a0a0a0] cursor-not-allowed'}`}
      >
        {isProcessing ? '데이터 스티칭 및 계산 중...' : '자동 분석 시작하기'}
        {!isProcessing && <ArrowRight className="w-5 h-5" />}
      </button>

    </div>
  );
}
