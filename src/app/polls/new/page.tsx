'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUiStore } from '@/store/uiStore'
// import Layout from '@/components/layout/Layout'; // (app/layout.tsx에서 전역 관리하므로 제거해도 됩니다)

// [추가] localStorage에 저장될 투표 목록의 타입
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

  const handleSubmit_sim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const options = optionsText.split('\n').filter((opt) => opt.trim() !== '')

    if (!title || options.length < 2) {
      notifyError('제목과 2개 이상의 후보를 입력해주세요.')
      return
    }

    setIsLoading(true)
    notify('새 투표를 생성 중입니다...', 'info')

    await new Promise((res) => setTimeout(res, 1000)) // (속도 1초로 줄임)

    const newPollId = `poll_${Math.random().toString(36).substring(2, 9)}`

    // --- [★ 수정된 부분 ★] ---
    // (시뮬레이션) 백엔드 DB 대신 localStorage에 저장
    try {
      // 1. 기존에 저장된 목록을 불러옵니다.
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      const existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)

      // 2. 새 투표 정보를 추가합니다.
      const newPollInfo: PollInfo = { id: newPollId, title: title }
      existingPolls.push(newPollInfo)

      // 3. 다시 저장합니다.
      localStorage.setItem('zkpPollsList', JSON.stringify(existingPolls))

      // 4. (시뮬레이션) 각 poll의 상세 정보도 저장합니다.
      localStorage.setItem(
        `poll_${newPollId}`,
        JSON.stringify({
          title: title,
          options: options,
        })
      )
    } catch (err) {
      console.error('localStorage 저장 실패:', err)
      notifyError('브라우저 저장소 오류가 발생했습니다.')
    }
    // --- [★ 수정 끝 ★] ---

    notify('투표가 성공적으로 생성되었습니다!', 'success')

    // 5. 생성된 상세 페이지로 이동
    router.push(`/polls/${newPollId}`)
  }

  // --- (폼 스타일 등 하단은 동일) ---
  const formStyle: React.CSSProperties = {
    /* (이전과 동일) */
  }
  const inputStyle: React.CSSProperties = {
    /* (이전과 동일) */
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>새 투표 생성하기 (관리자)</h1>
      <p style={{ textAlign: 'center' }}>
        "초보 관리자도 즉시 사용" (신규 요구사항)
      </p>
      <form onSubmit={handleSubmit_sim} style={formStyle}>
        {/* ... (이전과 동일한 폼 내용) ... */}
        <label htmlFor="title">투표 제목:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="예: 오늘 저녁 메뉴는?"
        />
        <label htmlFor="description">투표 설명 (선택):</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px' }}
          placeholder="예: 가장 선호하는 메뉴에 투표해주세요."
        />
        <label htmlFor="options">후보 목록 (한 줄에 하나씩 입력):</label>
        <textarea
          id="options"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          style={{ ...inputStyle, minHeight: '120px' }}
          placeholder="예:\n마라탕\n떡볶이\n라면"
          rows={5}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: '12px', fontSize: '18px', cursor: 'pointer' }}
        >
          {isLoading ? '생성 중...' : '투표 생성 및 참여 링크 받기'}
        </button>
      </form>
    </div>
  )
}
