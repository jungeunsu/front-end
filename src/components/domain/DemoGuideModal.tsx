// 훅을 사용하므로 "use client" 선언
'use client'

import React, { useState, useEffect } from 'react'

// 방문 기록을 체크하는 Key
const LOCAL_STORAGE_KEY = 'hasVisitedDemo'

const DemoGuideModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  // 컴포넌트가 마운트될 때(브라우저에서) localStorage를 체크
  useEffect(() => {
    // localStorage는 window 객체 하위에 있으므로,
    // window가 정의된 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!hasVisited) {
        setIsOpen(true)
      }
    }
  }, []) // [] : 처음 한 번만 실행

  const handleClose = () => {
    // 닫기 버튼 누르면 localStorage에 기록
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  if (!isOpen) {
    return null
  }

  // 모달 스타일 (간단 구현)
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    color: '#333', // (다크모드일 경우 #333이 안 보일 수 있으니 추후 수정)
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
  }

  return (
    <div style={backdropStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2>ZKP 투표 데모 안내 (Demo/FAQ)</h2>
        <p>본 데모는 Sepolia 테스트 네트워크에서 진행됩니다.</p>
        <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
          <li>MetaMask 지갑 연결이 필요합니다.</li>
          <li>
            네트워크를 <b>Sepolia (ChainID=11155111)</b>로 설정해주세요.
          </li>
          <li>테스트용 Sepolia ETH가 없으면 가스비가 부족할 수 있습니다.</li>
        </ul>
        <br />
        <button
          onClick={handleClose}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        >
          확인하고 시작하기
        </button>
      </div>
    </div>
  )
}

export default DemoGuideModal
