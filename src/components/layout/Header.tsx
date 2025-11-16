import React from 'react'
// Next.js에서 페이지 이동을 위한 Link 컴포넌트 import
import Link from 'next/link'

const Header: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: '1px solid #eaeaea',
    backgroundColor: '#ffffff', // (다크모드라면 #222 등으로)
    color: '#000000', // (다크모드라면 #eee 등으로)
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
  }

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#0070f3',
    fontSize: '16px',
    fontWeight: 'normal',
    border: '1px solid #0070f3',
    padding: '5px 10px',
    borderRadius: '5px',
  }

  return (
    <header style={headerStyle}>
      {/* 1. 로고/제목 (홈 링크) */}
      <span>
        {/* [★이 부분입니다★]
            제목 텍스트를 <Link href="/">로 감싸줍니다.
            이제 이 제목을 클릭하면 홈('/')으로 이동합니다.
        */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          캡스톤 디자인 프로젝트 (ZKP 투표)
        </Link>
      </span>

      {/* 2. 새 투표 생성 링크 */}
      <span>
        <Link href="/polls/new" style={linkStyle}>
          + 새 투표 생성하기
        </Link>
      </span>
    </header>
  )
}

export default Header
