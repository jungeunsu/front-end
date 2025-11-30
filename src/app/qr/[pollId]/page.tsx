// app/qr/[pollId]/page.tsx

'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { useParams } from 'next/navigation'

// 실제 배포 시에는 본인 Vercel 주소로 바꿔야 합니다.
// (지금은 로컬 테스트용)
const BASE_URL = 'https://zkp-vote-demo.vercel.app'
// const BASE_URL = "http://localhost:3000"; // 로컬 테스트 시 주석 해제

const CONTRACT_ADDRESS = '0xAb5801a7D398351b89E11801Bf7B0328a809Cdd6'
const ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`

export default function DynamicQrPage() {
  const params = useParams()
  const pollId = params.pollId as string

  // 이 투표의 접속 링크 (예: .../polls/poll_abc123)
  const votePageUrl = `${BASE_URL}/polls/${pollId}`

  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    gap: '30px',
    padding: '20px',
    fontFamily: 'sans-serif',
    backgroundColor: '#f5f5f5',
    color: '#333',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  }

  return (
    <div style={pageStyle}>
      <h1>🗳️ 실시간 투표 참여 (ID: {pollId})</h1>
      <p style={{ fontSize: '18px' }}>
        아래 QR 코드를 스캔하여 투표에 참여하세요.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        {/* 1. 투표 참여 QR */}
        <div style={cardStyle}>
          <h2 style={{ margin: 0, color: '#1976D2' }}>투표 접속</h2>
          <div style={{ padding: '10px', background: 'white' }}>
            <QRCode value={votePageUrl} size={200} />
          </div>
          <p
            style={{
              fontSize: '14px',
              wordBreak: 'break-all',
              maxWidth: '250px',
              color: '#555',
            }}
          >
            {votePageUrl}
          </p>
        </div>

        {/* 2. 컨트랙트 주소 QR (신뢰성 강조용) */}
        <div style={cardStyle}>
          <h2 style={{ margin: 0, color: '#333' }}>컨트랙트 (Sepolia)</h2>
          <div style={{ padding: '10px', background: 'white' }}>
            <QRCode value={ETHERSCAN_URL} size={200} />
          </div>
          <p
            style={{
              fontSize: '14px',
              wordBreak: 'break-all',
              maxWidth: '250px',
              color: '#555',
            }}
          >
            {CONTRACT_ADDRESS}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
        * 시연을 위해 Sepolia 테스트넷을 사용합니다.
      </div>
    </div>
  )
}
