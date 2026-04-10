import Papa from 'papaparse';

export const parseCsvFile = async <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.readAsArrayBuffer(file);
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('파일 읽어오기 실패'));
        return;
      }
      
      try {
        const buffer = e.target.result as ArrayBuffer;
        let decodedText = '';
        
        // 💡 핵심 픽스 1: 유연한 인코딩 판별
        // 일부 네이버 리포트는 EUC-KR이 아닌 UTF-8(BOM)로 떨어진다는 점을 고려하여,
        // UTF-8로 먼저 디코딩 시도 후 오류 발생 시 EUC-KR로 디코딩합니다.
        try {
          const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
          decodedText = utf8Decoder.decode(buffer);
        } catch (err: unknown) {
          const eucKrDecoder = new TextDecoder('euc-kr');
          decodedText = eucKrDecoder.decode(buffer);
        }
        
        // 💡 핵심 픽스 2: 네이버 광고 첫 번째 줄 메타데이터(쓰레기값) 완벽 제거
        let firstLineEnd = decodedText.indexOf('\n');
        if (firstLineEnd !== -1) {
          const firstLine = decodedText.substring(0, firstLineEnd);
          if (firstLine.split(',').length < 5) {
            decodedText = decodedText.substring(firstLineEnd + 1);
          }
        }
        
        Papa.parse(decodedText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as T[]);
          },
          error: (err: { message?: string }) => {
            reject(new Error(err.message || 'CSV 파싱 에러'));
          }
        });
      } catch (err: unknown) {
        reject(err instanceof Error ? err : new Error('알 수 없는 오류'));
      }
    };
    
    reader.onerror = () => reject(new Error('파일 로드 에러'));
  });
};
