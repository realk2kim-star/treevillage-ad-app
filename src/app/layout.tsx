import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'TreeVillage | 검색광고 자동 분석',
  description: '100% 핸드메이드 인테리어 그림 액자 전문 브랜드 트리빌리지 전용 검색광고 분석 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
