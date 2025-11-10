import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
// [추가] 2-4에서 만든 알림 배너 import
import NotificationBanner from '@/components/common/NotificationBanner'

export const metadata: Metadata = {
  title: 'ZKP 캡스톤 프로젝트',
  description: 'ZKP 투표 데모',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const mainStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '0 24px',
    fontFamily: 'sans-serif',
  }

  return (
    <html lang="ko">
      <body>
        {/* [추가] 배너를 여기에 두면 모든 페이지에서 보입니다. */}
        <NotificationBanner />

        <Header />
        <main style={mainStyle}>{children}</main>
      </body>
    </html>
  )
}
