'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { useParams } from 'next/navigation'

// 베이스 도메인
const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_URL || 'front-end-1pu7.vercel.app'

export default function QrPage() {
  const params = useParams()
  const pollId = params.pollId as string

  // 🔥 웹 브라우저 URL
  const webUrl = `https://${BASE_DOMAIN}/polls/${pollId}`

  // 🔥 모바일 메타마스크 딥링크 URL
  const metamaskDeepLink = `https://metamask.app.link/dapp/${BASE_DOMAIN}/polls/${pollId}`

  // QR 코드에는 모바일에서도 열릴 수 있도록 딥링크 사용
  const qrUrl = metamaskDeepLink

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
    navigator.clipboard.writeText(webUrl)
    alert('🔗 웹 투표 링크가 복사되었습니다!')
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
            {/* 🔥 DeepLink QR */}
            <QRCode value={qrUrl} size={180} />
          </div>

          {/* 링크 복사 (웹 URL) */}
          <button onClick={copyToClipboard} style={copyBtnStyle}>
            웹 링크 복사하기 📋
          </button>

          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
            모바일: MetaMask 앱으로 자동 연결
            <br />
            PC: 웹 브라우저에서 링크를 사용하세요
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: '13px',
          marginTop: '15px',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        스마트폰에서 QR을 스캔하면 MetaMask 앱이 자동으로 열립니다.
      </p>

      <div style={{ color: '#444', fontSize: '13px', marginTop: '20px' }}>
        Powered by Zero-Knowledge Proof Voting
      </div>
    </div>
  )
}
