'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/store/uiStore'
import { ethers } from 'ethers'

const CREATE_POLL_URL =
  'https://my-anon-voting-platfrom2.onrender.com/api/polls'

export default function NewPollPage() {
  const router = useRouter()
  const { notify, notifyError } = useUiStore()

  const [isLoading, setIsLoading] = useState(false)
  const [wallet, setWallet] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [optionsText, setOptionsText] = useState('')

  /* ----------------------------------------------------
    🦊 1) 지갑 연결
  ---------------------------------------------------- */
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        notifyError('메타마스크가 설치되어 있지 않습니다.')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setWallet(accounts[0])

      notify('지갑 연결 성공!', 'success')
    } catch (e) {
      notifyError('지갑 연결 실패')
    }
  }

  /* ----------------------------------------------------
    🗳️ 2) 투표 생성
  ---------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!wallet) {
      notifyError('지갑을 먼저 연결해주세요!')
      return
    }

    const candidates = optionsText
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    if (!title || candidates.length < 2) {
      notifyError('제목과 후보 2개 이상을 입력해주세요.')
      return
    }

    const body = {
      creatorWallet: wallet,
      title,
      description,
      candidates: candidates.map((name, idx) => ({
        id: `opt${idx + 1}`,
        label: name,
      })),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1시간
    }

    setIsLoading(true)
    notify('투표 생성 중...', 'info')

    try {
      const res = await fetch(CREATE_POLL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.message)

      notify('투표 생성 완료!', 'success')
      router.push(`/polls/${json.data.pollId}`)
    } catch (err: any) {
      notifyError(err.message || '투표 생성 실패')
    } finally {
      setIsLoading(false)
    }
  }

  /* ----------------------------------------------------
    🎨 스타일
  ---------------------------------------------------- */
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#fff',
    fontFamily: 'sans-serif',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    background: wallet ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : '#333',
    border: 'none',
    borderRadius: '12px',
    cursor: wallet ? 'pointer' : 'not-allowed',
    marginTop: '15px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '10px',
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          새 투표 생성
        </h1>

        {/* ---------------------- */}
        {/* 🦊 Wallet 연결 영역 */}
        {/* ---------------------- */}
        {!wallet ? (
          <button
            onClick={connectWallet}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #ff7eb3, #ff758c)',
              cursor: 'pointer',
            }}
          >
            🦊 메타마스크 지갑 연결하기
          </button>
        ) : (
          <div
            style={{
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.9rem',
              opacity: 0.8,
            }}
          >
            연결됨: {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </div>
        )}

        {/* ---------------------- */}
        {/* 🗳️ 폼: 지갑 연결 후 활성화 */}
        {/* ---------------------- */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            opacity: wallet ? 1 : 0.4,
            pointerEvents: wallet ? 'auto' : 'none',
          }}
        >
          {/* 제목 */}
          <div>
            <label>투표 제목</label>
            <input
              type="text"
              value={title}
              style={inputStyle}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 설명 */}
          <div>
            <label>투표 설명 (선택)</label>
            <textarea
              value={description}
              style={{ ...inputStyle, minHeight: '100px' }}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 후보 */}
          <div>
            <label>후보 목록 (줄바꿈으로 구분)</label>
            <textarea
              value={optionsText}
              style={{ ...inputStyle, minHeight: '120px' }}
              placeholder={'예:\n치킨\n피자\n햄버거'}
              onChange={(e) => setOptionsText(e.target.value)}
            />
          </div>

          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? '투표 생성 중…' : '투표 생성하기 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
