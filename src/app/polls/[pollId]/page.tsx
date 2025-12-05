'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ethers } from 'ethers'
import { useUiStore } from '@/store/uiStore'
import { getPollPublic, PollPublic } from '@/lib/api'

// 투표 제출 API
const SUBMIT_VOTE_URL =
  'https://my-anon-voting-platfrom2.onrender.com/api/vote/create'

// 🔥 Etherscan 컨트랙트 주소
const CONTRACT_ADDRESS = '0x6f75A7759b65C951E256BF9A90B7b1eE769ACD67'
const ETHERSCAN_URL = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`

// 📌 실시간 차트
import Chart from '@/components/domain/Chart'

declare global {
  interface Window {
    ethereum: any
  }
}

// ------------------------
// 🔥 수정된 부분 1: nullifierHash 더미 생성 함수
// ------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function generateProof_sim(walletAddress: string, pollId: string) {
  await sleep(800)

  // 더미 nullifierHash = 지갑주소 + pollId 기반으로 유니크하게 생성
  const hash = btoa(walletAddress + pollId + Date.now()).slice(0, 32)

  return {
    proof: '0x_dummy_proof',
    nullifierHash: `hash_${hash}`,
  }
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

  // 🌟 상태 배지
  const [status, setStatus] = useState<
    '대기' | '증명중' | '제출중' | '검증중' | '영수증' | '실패'
  >('대기')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 투표 정보 가져오기
  useEffect(() => {
    async function load() {
      try {
        const data = await getPollPublic(pollId)
        setPollData(data)
      } catch {
        notifyError('백엔드 연결 실패 — Demo 화면 표시')
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

  // 🦊 메타마스크 연결
  const handleConnectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setWalletAddress(accounts[0])
      notify('지갑 연결 완료', 'success')
    } catch {
      notifyError('지갑 연결 실패')
    }
  }

  // 🚀 투표 제출
  const handleSubmit = async () => {
    if (!walletAddress) return notifyError('지갑을 연결하세요')
    if (!selectedOption) return notifyError('후보를 선택하세요')

    setIsSubmitting(true)
    setStatus('증명중')

    try {
      // -----------------------
      // 🔥 수정된 부분 2: nullifierHash 생성
      // -----------------------
      const proofResult = await generateProof_sim(walletAddress, pollId)
      const nullifierHash = proofResult.nullifierHash

      setStatus('제출중')

      // 기존 txHash 유지
      const txHash =
        '0x0000000000000000000000000000000000000000000000000000000000000000'

      // -----------------------
      // 🔥 수정된 부분 3: payload에 nullifierHash 추가
      // -----------------------
      const payload = {
        pollId,
        walletAddress,
        candidate: selectedOption,
        nullifierHash,
        txHash,
      }

      const res = await fetch(SUBMIT_VOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      setStatus('검증중')

      if (!json.success) throw new Error(json.message)

      await sleep(500)
      setStatus('영수증')
      notify('투표 완료!', 'success')
    } catch (err: any) {
      setStatus('실패')
      setErrorMsg(err?.message || '알 수 없는 오류')
      notifyError(err?.message || '투표 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !pollData)
    return <div style={{ color: 'white', padding: 40 }}>Loading...</div>

  const badge: Record<typeof status, string> = {
    대기: '#777',
    증명중: '#9b59b6',
    제출중: '#3498db',
    검증중: '#f1c40f',
    영수증: '#2ecc71',
    실패: '#e74c3c',
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
          maxWidth: '720px',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>
          {pollData.title}
        </h1>

        {/* 상태 배지 */}
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            textAlign: 'center',
            background: badge[status],
            fontWeight: 700,
            marginTop: 15,
          }}
        >
          {status}
          {status === '실패' && errorMsg ? ` — ${errorMsg}` : ''}
        </div>

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
              onClick={() => setSelectedOption(c.id)}
              style={{
                padding: 18,
                borderRadius: 12,
                cursor: 'pointer',
                border:
                  selectedOption === c.id
                    ? '1px solid #00f2fe'
                    : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {c.label}
            </div>
          ))}
        </div>

        {/* 연결된 지갑 */}
        {!walletAddress ? (
          <button onClick={handleConnectWallet}>🦊 메타마스크 연결</button>
        ) : (
          <>
            <div style={{ marginTop: 20, marginBottom: 10 }}>
              연결됨: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '제출 중...' : '투표 + 제출 🚀'}
            </button>

            {status === '영수증' && (
              <button
                onClick={() => window.open(ETHERSCAN_URL, '_blank')}
                style={{ marginTop: 18 }}
              >
                🧾 영수증 보기 (Etherscan)
              </button>
            )}
          </>
        )}
      </div>

      {/* 🔥 실시간 차트 */}
      <Chart />

      <Link href={`/qr/${pollId}`} style={{ color: '#00f2fe', marginTop: 20 }}>
        QR 코드 공유하기 🔗
      </Link>
    </div>
  )
}
