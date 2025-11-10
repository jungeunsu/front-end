// QR 코드 라이브러리를 사용하므로 "use client"
'use client'

import React from 'react'
// 4-1에서 설치한 라이브러리
import QRCode from 'react-qr-code'

// (가상) Vercel URL과 컨트랙트 주소
const VERCEL_URL = 'https://zkp-vote-demo.vercel.app'
const CONTRACT_ADDRESS = '0xAb5801a7D398351b89E11801Bf7B0328a809Cdd6' // (이더리움 예시 주소)
const ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`

export default function QrPage() {
  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
    gap: '40px',
    padding: '20px',
    fontFamily: 'sans-serif',
  }

  const qrBoxStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: 'white', // QR 코드는 흰색 배경 필수
    borderRadius: '8px',
  }

  return (
    <div style={pageStyle}>
      <h1>시연 접속 페이지 (T-0, 0:00)</h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '50px',
        }}
      >
        {/* 1. 데모 앱 접속 QR */}
        <div>
          <h2>데모 앱 접속</h2>
          <div style={qrBoxStyle}>
            <QRCode value={VERCEL_URL} size={200} />
          </div>
          <p style={{ wordBreak: 'break-all' }}>{VERCEL_URL}</p>
        </div>

        {/* 2. 컨트랙트 주소(Etherscan) QR */}
        <div>
          <h2>컨트랙트 주소 (Sepolia)</h2>
          <div style={qrBoxStyle}>
            <QRCode value={ETHERSCAN_URL} size={200} />
          </div>
          <p style={{ wordBreak: 'break-all' }}>{CONTRACT_ADDRESS}</p>
        </div>
      </div>
    </div>
  )
}
