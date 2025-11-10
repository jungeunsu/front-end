import React from 'react'

const LoadingSpinner: React.FC = () => {
  // 아주 간단한 텍스트 기반 스피너
  // (나중에 CSS 애니메이션으로 교체하셔도 됩니다)
  const style: React.CSSProperties = {
    padding: '20px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  }

  return <div style={style}>로딩 중...</div>
}

export default LoadingSpinner
