'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUiStore } from '@/store/uiStore'

interface PollInfo {
  id: string
  title: string
}

export default function HomePage() {
  const [pollList, setPollList] = useState<PollInfo[]>([])
  const { notify } = useUiStore()

  // Hover 효과를 위한 상태 관리 (어떤 카드 위에 마우스가 있는지)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  // 페이지 로드 시 localStorage에서 목록 불러오기 (로직은 동일)
  useEffect(() => {
    try {
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      const existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)
      setPollList(existingPolls.reverse())
    } catch (err) {
      console.error('localStorage 불러오기 실패:', err)
    }
  }, [])

  const handleDeletePoll = (pollIdToDelete: string) => {
    if (!confirm('정말로 이 투표를 삭제하시겠습니까? 복구할 수 없습니다.')) {
      return
    }
    try {
      const existingPollsRaw = localStorage.getItem('zkpPollsList') || '[]'
      let existingPolls: PollInfo[] = JSON.parse(existingPollsRaw)
      const updatedPolls = existingPolls.filter(
        (poll) => poll.id !== pollIdToDelete
      )
      localStorage.setItem('zkpPollsList', JSON.stringify(updatedPolls))
      localStorage.removeItem(`poll_${pollIdToDelete}`)
      localStorage.removeItem(`voted_${pollIdToDelete}`)
      setPollList(updatedPolls.reverse())
      notify('투표가 삭제되었습니다.', 'success')
    } catch (err) {
      notify('삭제 중 오류가 발생했습니다.', 'error')
    }
  }

  // --- [🎨 스타일 정의] ---

  // 1. 전체 배경: 밋밋한 검정이 아닌, 깊이감 있는 그라데이션
  const pageContainerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    color: '#fff',
    padding: '40px 20px',
    fontFamily: 'sans-serif',
  }

  // 2. 제목 스타일: 텍스트에 그라데이션 적용
  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '10px',
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
    textShadow: '0 0 30px rgba(79, 172, 254, 0.3)',
  }

  const subtitleStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#888',
    marginBottom: '50px',
    fontSize: '1.1rem',
    fontWeight: '300',
  }

  const listContainerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  // 3. 카드 스타일 (기본)
  const cardStyleBase: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    borderRadius: '16px',
    // 글래스모피즘 효과 (반투명 유리)
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    overflow: 'hidden',
  }

  // 4. 카드 스타일 (Hover 시): 빛나는 효과와 떠오르는 효과
  const cardStyleHover: React.CSSProperties = {
    ...cardStyleBase,
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(79, 172, 254, 0.5)',
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px -10px rgba(0, 242, 254, 0.3)',
  }

  // 5. 삭제 버튼 스타일
  const deleteButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // 붉은색 반투명
    color: '#ff3b30',
    border: '1px solid rgba(255, 59, 48, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    zIndex: 2, // 링크보다 위에 오도록
  }

  // 6. 텅 비었을 때 스타일
  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px',
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '20px',
    color: '#555',
  }

  return (
    <div style={pageContainerStyle}>
      {/* 애니메이션 키프레임 (fade-in) */}
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
        .card-enter {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* 헤더 섹션 */}
      <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
        <h1 style={titleStyle}>ZKP Dashboard</h1>
        <p style={subtitleStyle}>
          보안과 익명성이 보장된 투표 시스템 <br />
          <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            Current Network: Sepolia Testnet
          </span>
        </p>
      </div>

      <div style={listContainerStyle}>
        {pollList.length === 0 ? (
          <div style={{ ...emptyStateStyle, animation: 'fadeIn 1s ease-out' }}>
            <h3 style={{ marginBottom: '10px', color: '#fff' }}>
              아직 생성된 투표가 없습니다 📭
            </h3>
            <p>
              우측 상단의 <strong>[+ 새 투표 생성하기]</strong> 버튼을
              눌러보세요!
            </p>
          </div>
        ) : (
          pollList.map((poll, index) => {
            const isHovered = hoveredCardId === poll.id

            return (
              <div
                key={poll.id}
                className="card-enter"
                style={{
                  // 순차적으로 나타나는 애니메이션 딜레이
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0, // 애니메이션 시작 전 숨김
                }}
              >
                {/* 카드 전체 컨테이너 */}
                <div
                  style={isHovered ? cardStyleHover : cardStyleBase}
                  onMouseEnter={() => setHoveredCardId(poll.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  {/* 클릭 시 이동하는 링크 영역 (삭제 버튼 제외한 전체) */}
                  <Link
                    href={`/polls/${poll.id}`}
                    style={{
                      flexGrow: 1,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* 카드 내용 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                      }}
                    >
                      {/* 아이콘 장식 */}
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background:
                            'linear-gradient(135deg, #4facfe, #00f2fe)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      >
                        🗳️
                      </div>

                      <div>
                        <h3
                          style={{
                            margin: '0 0 5px 0',
                            color: '#fff',
                            fontSize: '1.4rem',
                            textShadow: isHovered
                              ? '0 0 10px rgba(255,255,255,0.5)'
                              : 'none',
                            transition: 'text-shadow 0.3s',
                          }}
                        >
                          {poll.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.5)',
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          ID: {poll.id}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePoll(poll.id)
                    }}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff3b30'
                      e.currentTarget.style.color = 'white'
                      e.currentTarget.style.boxShadow =
                        '0 0 15px rgba(255, 59, 48, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255, 59, 48, 0.1)'
                      e.currentTarget.style.color = '#ff3b30'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
