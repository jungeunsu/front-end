'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ethers } from 'ethers'
import { useUiStore } from '@/store/uiStore'
import { getPollPublic, PollPublic } from '@/lib/api'
import Chart from '@/components/domain/Chart'

const CONTRACT_ADDRESS = '0x6f75A7759b65C951E256BF9A90B7b1eE769ACD67'
import VotingABI from '@/lib/abi/Voting.json'

// 백엔드 DB 저장 API
const SAVE_DB_URL =
  'https://my-anon-voting-platfrom2.onrender.com/api/vote/create'

declare global {
  interface Window {
    ethereum: any
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function to3Bits(n: number) {
  return {
    bit0: n & 1,
    bit1: (n >> 1) & 1,
    bit2: (n >> 2) & 1,
  }
}

function randomFieldString() {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0].toString()
}

async function uuidToField(uuid: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(uuid)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const FIELD = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
  )

  return (BigInt('0x' + hex) % FIELD).toString()
}

type ZkProofResult = { ms: number; proof: any; publicSignals: string[] }

async function generateProof_zk(
  voteIndex: number,
  pollIdSignal: string
): Promise<ZkProofResult> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('/workers/proof.worker.js')

      worker.onmessage = (e: MessageEvent) => {
        const data = e.data

        if (!data.ok) reject(new Error(data.error))
        else {
          resolve({
            ms: data.ms,
            proof:
              typeof data.proof === 'string'
                ? JSON.parse(data.proof)
                : data.proof,
            publicSignals: data.publicSignals || [],
          })
        }
        worker.terminate()
      }

      worker.onerror = () => {
        reject(new Error('ZKP Worker 실행 오류'))
        worker.terminate()
      }

      const { bit0, bit1, bit2 } = to3Bits(voteIndex)

      const input = {
        vote: voteIndex,
        voteBit0: bit0,
        voteBit1: bit1,
        voteBit2: bit2,
        salt: randomFieldString(),
        nullifierSecret: randomFieldString(),
        pollId: pollIdSignal,
        pathElements: Array(14).fill('0'),
        pathIndex: Array(14).fill('0'),
      }

      worker.postMessage({
        input,
        wasmPath: '/zkp/vote.wasm',
        zkeyPath: '/zkp/vote_final.zkey',
      })
    } catch (e) {
      reject(e)
    }
  })
}

// -------------------------------------------------------
// ⭐ PollDetailPage 컴포넌트
// -------------------------------------------------------
export default function PollDetailPage() {
  const params = useParams()
  const pollId = params.pollId as string

  const { notify, notifyError } = useUiStore()

  const [pollData, setPollData] = useState<PollPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<
    '대기' | '증명중' | '제출중' | '검증중' | '영수증' | '실패'
  >('대기')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // -------------------------
  // 투표 정보 로드
  // -------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await getPollPublic(pollId)
        setPollData(data)
      } catch {
        notifyError('백엔드 연결 실패 — Demo 모드입니다.')
        setPollData({
          pollId,
          title: 'Demo Poll',
          description: '데모 화면입니다.',
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

  // -------------------------
  // 🦊 메타마스크 연결
  // -------------------------
  const handleConnectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])

      setWalletAddress(accounts[0])
      notify('지갑 연결 완료!', 'success')
    } catch {
      notifyError('지갑 연결 실패')
    }
  }

  // 지갑 다시 선택
  const handleReconnectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }])
      const accounts = await provider.send('eth_requestAccounts', [])
      setWalletAddress(accounts[0])
      notify('지갑이 다시 연결되었습니다!', 'success')
    } catch {
      notifyError('지갑 재연결 실패')
    }
  }

  // -------------------------
  // ⭐ 투표 제출 (온체인 + DB 저장)
  // -------------------------
  const handleSubmit = async () => {
    if (!walletAddress) return notifyError('지갑을 연결하세요')
    if (!selectedOption) return notifyError('후보를 선택하세요')
    if (!pollData) return notifyError('투표 정보를 불러오지 못함')

    const voteIndex = pollData.candidates.findIndex(
      (c) => c.id === selectedOption
    )
    if (voteIndex < 0) return notifyError('선택한 후보 오류')

    setIsSubmitting(true)
    setStatus('증명중')

    try {
      const pollIdSignal = await uuidToField(pollId)

      const { proof, publicSignals } = await generateProof_zk(
        voteIndex,
        pollIdSignal
      )

      const [root, pollId_from_proof, nullifierHash, voteCommitment] =
        publicSignals

      setStatus('제출중')

      // -------------------------------------------------------
      // ⭐ Solidity에 맞게 proof 배열 형태 변환
      // -------------------------------------------------------
      const pA = [proof.pi_a[0], proof.pi_a[1]]
      const pB = [
        [proof.pi_b[0][0], proof.pi_b[0][1]],
        [proof.pi_b[1][0], proof.pi_b[1][1]],
      ]
      const pC = [proof.pi_c[0], proof.pi_c[1]]

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        VotingABI,
        signer
      )

      // ⭐ 스마트컨트랙트 vote 실행
      const tx = await votingContract.vote(voteIndex, pA, pB, pC, [
        root,
        pollId_from_proof,
        nullifierHash,
        voteCommitment,
      ])

      setStatus('검증중')
      await tx.wait()

      // ------------------------------
      // ⭐ DB 저장
      // ------------------------------
      const res = await fetch(SAVE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          walletAddress,
          voteIndex,
          nullifierHash,
        }),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.message)

      notify('투표 완료(ZKP + 온체인 성공)!', 'success')
      setStatus('영수증')
    } catch (err: any) {
      console.error(err)
      setStatus('실패')
      setErrorMsg(err.message)
      notifyError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------
  // UI 렌더링
  // ---------------------------------------------
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
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: '2rem' }}>
          {pollData.title}
        </h1>

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
        </div>

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

        {!walletAddress ? (
          <button onClick={handleConnectWallet}>🦊 메타마스크 연결</button>
        ) : (
          <>
            <div style={{ marginTop: 20 }}>
              연결됨: {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </div>

            <button onClick={handleReconnectWallet} style={{ marginTop: 10 }}>
              지갑 다시 선택하기 🔄
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ marginTop: 10 }}
            >
              {isSubmitting ? '제출 중...' : '투표 + ZKP 제출 🚀'}
            </button>
          </>
        )}
      </div>

      <Chart />

      <Link href={`/qr/${pollId}`} style={{ color: '#00f2fe', marginTop: 20 }}>
        QR 코드 공유하기 🔗
      </Link>
    </div>
  )
}
