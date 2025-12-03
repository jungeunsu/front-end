'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ethers } from 'ethers'
import { useUiStore } from '@/store/uiStore'
import { getPollPublic, PollPublic } from '@/lib/api'

// Relayer & Vote API
const SUBMIT_VOTE_URL = 'https://my-anon-voting-platfrom2.onrender.com/api/vote'

declare global {
  interface Window {
    ethereum: any
  }
}

// ZKP 시뮬레이션 (백엔드에서 증명 안 쓰는 경우 대응)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const generateProof_sim = async () => {
  await sleep(1500 + Math.random() * 1500)
  return { proof: `0x_dummy_proof`, proofMs: 1200 }
}

export default function PollDetailPage() {
  const params = useParams()
  const pollId = params.pollId as string

  const { notify, notifyError } = useUiStore()

  const [pollData, setPollData] = useState<PollPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 투표 정보 불러오기
  useEffect(() => {
    async function load() {
      try {
        const data = await getPollPublic(pollId)
        setPollData(data)
      } catch {
        notifyError('백엔드 연결 실패 — Demo 모드로 표시합니다.')
        setPollData({
          pollId,
          title: 'Demo Poll',
          description: '백엔드 연결 실패로 데모 화면 표시',
          candidates: [
            { id: '1', label: '치킨' },
            { id: '2', label: '피자' },
            { id: '3', label: '족발' },
          ],
          startTime: '',
          endTime: '',
          isActive: true,
          status: 'active',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pollId])

  // 메타마스크 연결
  const handleConnectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]
      setWalletAddress(address)
      notify('지갑 연결 완료', 'success')
    } catch {
      notifyError('지갑 연결 실패')
    }
  }

  // 투표 제출
  const handleSubmit = async () => {
    if (!walletAddress) return notify('지갑을 연결하세요', 'warning')
    if (!selectedOption) return notify('후보를 선택하세요', 'warning')

    setIsSubmitting(true)
    notify('투표 제출 중...', 'info')

    try {
      // (1) ZKP 증명 (백엔드 실제 사용 X여도 UI 유지)
      await generateProof_sim()

      // (2) txHash (현재 백엔드 요구 형식 맞춤)
      const txHash =
        '0x0000000000000000000000000000000000000000000000000000000000000000'

      const payload = {
        pollId, // ★ 필수
        walletAddress, // ★ 필수
        candidate: selectedOption, // ★ 필수
        txHash, // ★ 필수
      }

      const response = await fetch(SUBMIT_VOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()
      if (!json.success) throw new Error(json.message)

      notify('투표 완료!', 'success')
    } catch (err: any) {
      notifyError(err.message || '투표 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !pollData)
    return <div style={{ color: 'white', padding: 40 }}>Loading...</div>

  // ---------------------- UI 스타일 ----------------------
  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -20%, #1a1f35, #09090b 80%)',
    color: '#fff',
    padding: '40px 20px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
  }

  const card: React.CSSProperties = {
    width: '100%',
    maxWidth: '720px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
  }

  const option = (id: string): React.CSSProperties => ({
    padding: '18px',
    borderRadius: '12px',
    border:
      selectedOption === id
        ? '1px solid #00f2fe'
        : '1px solid rgba(255,255,255,0.1)',
    background: selectedOption === id ? 'rgba(0,242,254,0.15)' : 'transparent',
    cursor: 'pointer',
  })
  // -------------------------------------------------------

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>
          {pollData.title}
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.8 }}>
          {pollData.description}
        </p>

        {/* 후보 선택 */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {pollData.candidates.map((c) => (
            <div
              key={c.id}
              style={option(c.id)}
              onClick={() => setSelectedOption(c.id)}
            >
              {c.label}
            </div>
          ))}
        </div>

        {/* 지갑 연결 or 투표 버튼 */}
        {!walletAddress ? (
          <button
            onClick={handleConnectWallet}
            style={{
              width: '100%',
              padding: 16,
              marginTop: 26,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            🦊 메타마스크 연결
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: 16,
              marginTop: 26,
              borderRadius: 12,
              border: 'none',
              background: isSubmitting
                ? '#555'
                : 'linear-gradient(135deg, #4facfe, #00f2fe)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: '#fff',
            }}
          >
            {isSubmitting ? '제출 중...' : '투표 + 제출 🚀'}
          </button>
        )}
      </div>

      <Link
        href={`/qr/${pollId}`}
        style={{ textDecoration: 'none', color: '#00f2fe' }}
      >
        QR 코드 공유하기 🔗
      </Link>
    </div>
  )
}
