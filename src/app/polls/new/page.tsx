'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/store/uiStore'
import Link from 'next/link'

interface PollInfo {
  id: string
  title: string
}

export default function NewPollPage() {
  const router = useRouter()
  const { notify, notifyError } = useUiStore()
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [optionsText, setOptionsText] = useState('')

  // --- (기능 로직은 기존과 동일) ---
  const handleSubmit_sim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const options = optionsText.split('\n').filter((opt) => opt.trim() !== '')

    if (!title || options.length < 2) {
      notifyError('제목과 2개 이상의 후보를 입력해주세요.')
      return
    }

    setIsLoading(true)
    notify('시스템에 투표를 등록 중입니다...', 'info')

    await new Promise((res) => setTimeout(res, 1000))

    const newPollId = `poll_${Math.random().toString(36).substring(2, 9)}`

    try {
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      const existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)
      const newPollInfo: PollInfo = { id: newPollId, title: title }
      existingPolls.push(newPollInfo)
      localStorage.setItem('zkpPollsList', JSON.stringify(existingPolls))
      localStorage.setItem(
        `poll_${newPollId}`,
        JSON.stringify({
          title: title,
          options: options,
        })
      )
    } catch (err) {
      console.error('localStorage 저장 실패:', err)
      notifyError('저장소 오류 발생')
    }

    notify('투표 생성 완료! 상세 페이지로 이동합니다.', 'success')
    router.push(`/polls/${newPollId}`)
  }

  // --- [🎨 화려한 스타일 정의] ---

  // 1. 전체 배경
  const pageContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'sans-serif',
    color: '#fff',
  }

  // 2. 글래스 카드
  const glassCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    animation: 'slideUp 0.6s ease-out',
  }

  // 3. 네온 타이틀
  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '10px',
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 20px rgba(79, 172, 254, 0.4)',
  }

  // 4. 입력창 라벨
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  }

  // 5. 사이버펑크 입력창
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  }

  // 6. 네온 버튼
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
    boxShadow: isLoading ? 'none' : '0 10px 20px -5px rgba(0, 242, 254, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={pageContainerStyle}>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .input-focus:focus {
          border-color: #00f2fe !important;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
          background: rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>

      <div style={glassCardStyle}>
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              transition: 'color 0.2s',
            }}
          >
            &larr; 대시보드로 돌아가기
          </span>
        </Link>

        <h1 style={titleStyle}>새 투표 생성</h1>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '40px',
          }}
        >
          관리자 권한으로 새로운 ZKP 투표를 생성합니다.
        </p>

        <form
          onSubmit={handleSubmit_sim}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" style={labelStyle}>
              투표 제목
            </label>
            <input
              id="title"
              type="text"
              className="input-focus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="예: 오늘 점심 메뉴는?"
            />
          </div>

          {/* 설명 입력 */}
          <div>
            <label htmlFor="description" style={labelStyle}>
              투표 설명 (선택)
            </label>
            <textarea
              id="description"
              className="input-focus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="투표의 목적이나 설명을 간단히 적어주세요."
            />
          </div>

          {/* 후보 목록 입력 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="options" style={labelStyle}>
                후보 목록
              </label>
              <span style={{ fontSize: '12px', color: '#00f2fe' }}>
                최소 2개 이상
              </span>
            </div>
            <textarea
              id="options"
              className="input-focus"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '150px',
                fontFamily: 'monospace',
              }}
              placeholder={'예:\n마라탕\n떡볶이\n라면'}
            />
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '8px',
              }}
            >
              * 각 후보는 <strong>줄바꿈(Enter)</strong>으로 구분됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!isLoading)
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isLoading ? '컨트랙트 배포 중...' : '투표 시작하기 '}
          </button>
        </form>
      </div>
    </div>
  )
}
