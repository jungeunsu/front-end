'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// [추가] 삭제 완료 알림을 띄우기 위해 import
import { useUiStore } from '@/store/uiStore'

interface PollInfo {
  id: string
  title: string
}

export default function HomePage() {
  const [pollList, setPollList] = useState<PollInfo[]>([])
  // [추가] 알림 훅
  const { notify } = useUiStore()

  // 페이지 로드 시 localStorage에서 목록 불러오기
  useEffect(() => {
    try {
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      const existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)
      setPollList(existingPolls.reverse())
    } catch (err) {
      console.error('localStorage 불러오기 실패:', err)
    }
  }, []) // [] : 처음 한 번만 실행

  // --- [★새로운 기능★] ---
  // 투표 삭제 시뮬레이션 함수
  const handleDeletePoll = (pollIdToDelete: string) => {
    // 1. 확인창 띄우기 (실수 방지)
    if (!confirm('정말로 이 투표를 삭제하시겠습니까?')) {
      return
    }

    try {
      // 2. 'zkpPollsList' (메인 목록)에서 해당 pollId 제거
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      let existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)
      const updatedPolls = existingPolls.filter(
        (poll) => poll.id !== pollIdToDelete
      )
      localStorage.setItem('zkpPollsList', JSON.stringify(updatedPolls))

      // 3. 'poll_...' (상세 정보) 삭제
      localStorage.removeItem(`poll_${pollIdToDelete}`)
      // 4. 'voted_...' (투표 기록) 삭제
      localStorage.removeItem(`voted_${pollIdToDelete}`)

      // 5. UI(React 상태) 즉시 업데이트 (삭제된 목록 반영)
      setPollList(updatedPolls.reverse()) // reverse() 유지

      notify('투표가 성공적으로 삭제되었습니다.', 'success')
    } catch (err) {
      console.error('삭제 중 오류:', err)
      notify('삭제 중 오류가 발생했습니다.', 'error') // notifyError 대신
    }
  }
  // --- [★새로운 기능 끝★] ---

  // --- (스타일) ---
  const listContainerStyle: React.CSSProperties = {
    maxWidth: '700px',
    margin: '20px auto',
  }
  const listItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '15px 20px',
    border: '1px solid #555',
    borderRadius: '8px',
    margin: '10px 0',
    fontSize: '18px',
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#222',
    transition: 'background-color 0.2s',
    flexGrow: 1, // [수정] 링크가 남은 공간을 다 차지하도록
  }
  const emptyListStyle: React.CSSProperties = {
    /* (이전과 동일) */
  }

  // [추가] 삭제 버튼 스타일
  const deleteButtonStyle: React.CSSProperties = {
    padding: '10px 15px',
    fontSize: '14px',
    backgroundColor: '#D32F2F', // 빨간색
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    flexShrink: 0, // [추가] 버튼 크기 줄어들지 않게
  }
  // --- (스타일 끝) ---

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>ZKP 투표 대시보드 (홈)</h1>
      <p style={{ textAlign: 'center' }}>
        "여러 개의 투표 동시 운영" (신규 요구사항)
      </p>

      <div style={listContainerStyle}>
        {pollList.length === 0 ? (
          <div style={emptyListStyle}>{/* ... (이전과 동일) ... */}</div>
        ) : (
          pollList.map((poll) => (
            // --- [★수정된 부분★] ---
            // <Link>를 <div>로 감싸서 버튼과 가로로 정렬
            <div
              key={poll.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '10px 0',
              }}
            >
              <Link
                href={`/polls/${poll.id}`}
                style={listItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#333')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#222')
                }
              >
                {poll.title}
                <span
                  style={{ fontSize: '12px', color: '#888', display: 'block' }}
                >
                  ID: {poll.id}
                </span>
              </Link>

              {/* [추가] 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation() // (링크 이동 방지)
                  handleDeletePoll(poll.id)
                }}
                style={deleteButtonStyle}
              >
                삭제
              </button>
            </div>
            // --- [★수정 끝★] ---
          ))
        )}
      </div>
    </div>
  )
}
