'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUiStore } from '@/store/uiStore'

// 🔥 전체 투표 목록 API (fetchPollList ❌ getPolls ⭕)
import { getPolls, deletePoll } from '@/lib/api'

interface PollListItem {
  pollId: string
  title: string
  description: string
}

export default function HomePage() {
  const { notify, notifyError } = useUiStore()
  const [polls, setPolls] = useState<PollListItem[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const list = await getPolls()
      setPolls(list)
    } catch (err) {
      notifyError('서버 연결 실패 — Demo 모드로 표시됩니다.')
      setPolls([
        {
          pollId: 'demo1',
          title: '야식 메뉴 투표 (Demo)',
          description: 'Demo',
        },
        {
          pollId: 'demo2',
          title: '점심 메뉴 투표 (Demo)',
          description: 'Demo',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (pollId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await deletePoll(pollId)
      notify('삭제 완료', 'success')
      load()
    } catch (err: any) {
      notifyError(err.message || '삭제 실패')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
        color: '#fff',
        padding: '40px 20px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          margin: '0 auto',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          📌 투표 목록
        </h1>

        <Link href="/polls/new">
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '30px',
            }}
          >
            🆕 새 투표 생성하기
          </button>
        </Link>

        {loading && <p style={{ textAlign: 'center' }}>불러오는 중...</p>}

        {!loading && polls.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.8 }}>
            아직 생성된 투표가 없습니다.
          </p>
        )}

        {polls.map((p) => (
          <div
            key={p.pollId}
            style={{
              padding: '18px 22px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '18px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Link
              href={`/polls/${p.pollId}`}
              style={{ flex: 1, textDecoration: 'none', color: 'white' }}
            >
              <h3 style={{ margin: 0, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                {p.description}
              </p>
            </Link>

            <button
              onClick={() => handleDelete(p.pollId)}
              style={{
                padding: '6px 10px',
                background: '#d9534f',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: 'none',
                fontWeight: 600,
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
