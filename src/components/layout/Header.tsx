import React from 'react'

const Header: React.FC = () => {
  // 간단한 헤더 스타일
  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: '1px solid #eaeaea',
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    fontSize: '20px',
  }

  return (
    <header style={headerStyle}>
      {/* 이곳이 Phase 2에서 만들 '알림 배너'가 
        표시될 공간의 부모가 됩니다.
      */}
      <span>캡스톤 디자인 프로젝트 (ZKP 투표)</span>
    </header>
  )
}

export default Header
