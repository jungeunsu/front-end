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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [optionsText, setOptionsText] = useState('')

  // 🔥 투표 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const candidates = optionsText
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    if (!title || candidates.length < 2) {
      notifyError('제목과 후보 2개 이상 입력해주세요.')
      return
    }

    // 🦊 지갑 주소 가져오기
    let creatorWallet = ''
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      creatorWallet = accounts[0]
    } catch {
      notifyError('메타마스크 연결에 실패했습니다.')
      return
    }

    const body = {
      creatorWallet,
      title,
      description,
      candidates: candidates.map((name, idx) => ({
        id: `opt${idx + 1}`,
        label: name,
      })),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1시간 뒤 종료
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

      const newPollId = json.data.pollId
      notify('투표 생성 완료!', 'success')
      router.push(`/polls/${newPollId}`)
    } catch (err: any) {
      console.error(err)
      notifyError(err.message || '투표 생성 실패')
    } finally {
      setIsLoading(false)
    }
  }

  // 🎨 스타일
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'sans-serif',
    color: '#fff',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '10px',
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '18px',
    marginTop: '20px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    background: isLoading
      ? '#333'
      : 'linear-gradient(135deg, #4facfe, #00f2fe)',
    border: 'none',
    borderRadius: '12px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>새 투표 생성</h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* 제목 */}
          <div>
            <label style={labelStyle}>투표 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 설명 */}
          <div>
            <label style={labelStyle}>투표 설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: '100px' }}
            />
          </div>

          {/* 후보 */}
          <div>
            <label style={labelStyle}>후보 목록 (줄바꿈으로 구분)</label>
            <textarea
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '160px',
                fontFamily: 'monospace',
              }}
              placeholder={'예:\n수학\n과학\n역사'}
            />
          </div>

          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? '투표 생성 중...' : '투표 생성하기 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
