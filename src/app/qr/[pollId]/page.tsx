'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { useParams } from 'next/navigation'

// 배포 / 로컬 자동 감지
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export default function QrPage() {
  const params = useParams()
  const pollId = params.pollId as string
  const votePageUrl = `${BASE_URL}/polls/${pollId}`

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'sans-serif',
    color: '#fff',
    gap: '30px',
  }

  const glassCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    padding: '30px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    maxWidth: '300px',
    width: '100%',
    animation: 'fadeIn 0.6s ease-out',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '2.3rem',
    fontWeight: '800',
    marginBottom: '5px',
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  }

  const copyBtnStyle: React.CSSProperties = {
    marginTop: '12px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(votePageUrl)
    alert('🔗 투표 링크가 복사되었습니다!\n카톡/단체방에 공유해 주세요.')
  }

  return (
    <div style={pageStyle}>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div>
        <h1 style={titleStyle}>Scan to Vote</h1>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'monospace',
          }}
        >
          Poll ID: {pollId}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        {/* 투표 QR */}
        <div style={glassCardStyle}>
          <h2 style={{ margin: 0, color: '#00f2fe', fontSize: '1.2rem' }}>
            🗳️ 투표 참여하기
          </h2>
          <div style={{ padding: 15, background: 'white', borderRadius: 16 }}>
            <QRCode value={votePageUrl} size={180} />
          </div>

          {/* URL 복사 버튼 */}
          <button onClick={copyToClipboard} style={copyBtnStyle}>
            링크 복사 후 단체방에 공유하기 📋
          </button>
        </div>
      </div>

      <p
        style={{
          fontSize: '13px',
          marginTop: '15px',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        스마트폰으로 스캔하거나 링크를 클릭해 투표에 참여하세요.
      </p>

      <div style={{ color: '#444', fontSize: '13px', marginTop: '20px' }}>
        Powered by Zero-Knowledge Proof Voting
      </div>
    </div>
  )
}
