'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import Chart from '@/components/domain/Chart'
import { useUiStore } from '@/store/uiStore'
import DebugPanel from '@/components/common/DebugPanel'
import StatusBadge, { VoteStatus } from '@/components/domain/StatusBadge'

// --- [수정] 시뮬레이션: ZKP 리포트 데이터 반영 (2s ~ 5s) ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateProof_sim = async (
  voteOption: string
): Promise<{ proof: string; proofMs: number }> => {
  console.log(`'${voteOption}' 표에 대한 증명 생성 시작...`)

  // v1.2 벤치마크 기반: 평균 2초, 최대 5초 정도로 랜덤 설정
  // (기존 3~5초 -> 2~5초로 단축하여 실제 체감 성능 반영)
  const proofTime = 2000 + Math.random() * 3000

  await sleep(proofTime)

  // 5% 확률로 증명 생성 실패 시뮬레이션 (데모용)
  if (Math.random() < 0.05) throw new Error('W3_PROOF_FAILED')

  return { proof: `0x123...(${voteOption})`, proofMs: Math.round(proofTime) }
}

const submitToRelayer_sim = async (
  proof: string
): Promise<{ txHash: string }> => {
  console.log(`Relayer로 증명(${proof}) 제출...`)
  await sleep(1500) // 네트워크 딜레이 1.5초

  // 5% 확률로 가스/네트워크 에러 시뮬레이션
  const rand = Math.random()
  if (rand < 0.05) throw new Error('W3_NO_GAS')
  if (rand < 0.1) throw new Error('W3_NETWORK_ERROR')

  return { txHash: '0x71a2c...9e3f' }
}

const subscribeStatus_sim = (
  txHash: string,
  onUpdate: (status: VoteStatus) => void
) => {
  // 블록체인 검증 대기 시간
  setTimeout(() => onUpdate('validating'), 2000) // 2초 후 검증 중 (Conf=1)
  setTimeout(() => onUpdate('confirmed'), 5000) // 5초 후 영수증 (Conf=2)
}
// --- 시뮬레이션 끝 ---

interface PollData {
  title: string
  options: string[]
}

export default function PollDetailPage() {
  const { notify, notifyError } = useUiStore()
  const params = useParams()
  const pollId = params.pollId as string

  const [pollData, setPollData] = useState<PollData | null>(null)
  const [currentStatus, setCurrentStatus] = useState<VoteStatus>('idle')
  const [isLoading, setIsLoading] = useState(false)

  // [수정] 디버그 정보 초기값 (wasmMs는 보고서 기반 고정값 가정)
  const [debugInfo, setDebugInfo] = useState({
    wasmMs: 450,
    network: 'Sepolia (11155111)',
    proofMs: 0,
  })

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (!pollId) return

    try {
      const pollDataRaw = localStorage.getItem(`poll_${pollId}`)
      if (pollDataRaw) {
        setPollData(JSON.parse(pollDataRaw))
      } else {
        // [중요] 모바일/QR 접속 시 데이터가 없으면 임시 데이터 표시 (404 방지)
        console.log('모바일 접속 감지: 시연용 임시 데이터 사용')
        setPollData({
          title: '야식 메뉴 투표 (모바일 시연)',
          options: ['치킨', '피자', '족발'],
        })
      }
    } catch (err) {
      setPollData({
        title: '데이터 복구됨',
        options: ['옵션 A', '옵션 B'],
      })
    }

    const voted = localStorage.getItem(`voted_${pollId}`)
    setHasVoted(voted === 'true')

    setSelectedOption(null)
    setCurrentStatus('idle')
    setTxHash(null)
  }, [pollId])

  const handleVoteSubmit = async () => {
    if (!selectedOption) {
      notify('후보를 먼저 선택해주세요.', 'warning')
      return
    }
    // 1. 중복 투표 체크 (가장 먼저)
    if (hasVoted) {
      notifyError('B_409_DUPLICATE') // 배너
      setCurrentStatus('duplicate') // 배지
      return
    }
    if (isLoading) return

    setIsLoading(true)
    setCurrentStatus('idle')
    setTxHash(null)
    setDebugInfo((prev) => ({ ...prev, proofMs: 0 })) // 초기화

    try {
      // 2. 증명 생성 (2~5초)
      setCurrentStatus('generating_proof')
      notify('ZKP 증명을 생성 중입니다... (2~5초 소요)', 'info')

      const { proof, proofMs } = await generateProof_sim(selectedOption)

      // [수정] 실제 걸린 시간을 디버그 패널에 업데이트
      setDebugInfo((prev) => ({ ...prev, proofMs }))

      // 3. Relayer 제출
      setCurrentStatus('submitting')
      notify('Relayer로 트랜잭션을 제출합니다...', 'info')

      const { txHash: newTxHash } = await submitToRelayer_sim(proof)
      setTxHash(newTxHash)

      // 4. 상태 구독 (검증 -> 영수증)
      subscribeStatus_sim(newTxHash, (newStatus) => {
        setCurrentStatus(newStatus)
        if (newStatus === 'confirmed') {
          notify('투표가 블록체인에 확정되었습니다!', 'success')
          setIsLoading(false)
          setSelectedOption(null)
          localStorage.setItem(`voted_${pollId}`, 'true')
          setHasVoted(true)
        }
      })
    } catch (error: any) {
      const errorCode = error.message
      notifyError(errorCode) // 에러 배너 띄우기 (error-map.json 기반)

      // 상태 배지 업데이트
      setCurrentStatus('failed')
      setIsLoading(false)
    }
  }

  // --- [스타일 정의] (이전 디자인 유지) ---
  const pageContainerStyle: React.CSSProperties = {
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

  const glassCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '700px',
    padding: '40px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    animation: 'fadeIn 0.6s ease-out',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '5px',
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const optionButtonStyle = (option: string): React.CSSProperties => {
    const isSelected = selectedOption === option
    return {
      padding: '18px 24px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
      background: isSelected
        ? 'rgba(0, 242, 254, 0.15)'
        : 'rgba(255, 255, 255, 0.05)',
      border: isSelected
        ? '1px solid #00f2fe'
        : '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.3)' : 'none',
      flex: '1 1 30%',
      minWidth: '120px',
    }
  }

  const actionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '18px',
    marginTop: '20px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff',
    background:
      !selectedOption || isLoading
        ? '#333'
        : 'linear-gradient(135deg, #4facfe, #00f2fe)',
    border: 'none',
    borderRadius: '12px',
    cursor: !selectedOption || isLoading ? 'not-allowed' : 'pointer',
    boxShadow:
      !selectedOption || isLoading
        ? 'none'
        : '0 10px 20px -5px rgba(0, 242, 254, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    opacity: !selectedOption || isLoading ? 0.5 : 1,
  }

  const qrButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '13px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#ccc',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    transition: 'background 0.2s',
  }

  if (!pollData) return <div style={{ ...pageContainerStyle }}>Loading...</div>

  return (
    <div style={pageContainerStyle}>
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
      `}</style>

      <div style={glassCardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              &larr; 목록으로
            </span>
          </Link>
          <Link
            href={`/qr/${pollId}`}
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={qrButtonStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')
              }
            >
              <span>📱</span> QR 코드 보기
            </div>
          </Link>
        </div>

        <h1 style={titleStyle}>{pollData.title}</h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
            marginBottom: '30px',
            fontFamily: 'monospace',
          }}
        >
          ID: {pollId}
        </p>

        <div style={{ marginBottom: '30px' }}>
          <p style={{ marginBottom: '15px', color: '#ddd', fontWeight: '600' }}>
            1. 투표 항목을 선택하세요
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {pollData.options.map((option) => (
              <button
                key={option}
                style={optionButtonStyle(option)}
                onClick={() => setSelectedOption(option)}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '25px 0',
          }}
        />

        <div>
          <p style={{ marginBottom: '10px', color: '#ddd', fontWeight: '600' }}>
            2. 진행 상태
          </p>
          <StatusBadge status={currentStatus} />

          {currentStatus === 'confirmed' && txHash && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid #4CAF50',
                borderRadius: '12px',
                animation: 'fadeIn 0.5s',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#4CAF50',
                  margin: '0 0 10px 0',
                  fontWeight: 'bold',
                }}
              >
                ✅ 블록체인 기록 완료!
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  color: '#4CAF50',
                  textDecoration: 'underline',
                  fontSize: '14px',
                }}
              >
                🔗 Etherscan에서 영수증 확인하기 &rarr;
              </a>
            </div>
          )}
        </div>

        <button
          onClick={handleVoteSubmit}
          disabled={!selectedOption || isLoading}
          style={actionButtonStyle}
          onMouseEnter={(e) => {
            if (!isLoading && selectedOption)
              e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            if (!isLoading && selectedOption)
              e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {isLoading ? 'ZKP 증명 생성 및 제출 중...' : '투표 + 증명 생성 ✨'}
        </button>
      </div>

      <div style={glassCardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: '#fff' }}>
          📊 실시간 투표 현황
        </h3>
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '20px',
            borderRadius: '16px',
          }}
        >
          <Chart />
        </div>
      </div>

      <DebugPanel info={debugInfo} />
    </div>
  )
}
