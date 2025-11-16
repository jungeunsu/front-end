'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

import Chart from '@/components/domain/Chart'
import { useUiStore } from '@/store/uiStore'
import DebugPanel from '@/components/common/DebugPanel'
import StatusBadge, { VoteStatus } from '@/components/domain/StatusBadge'
import Link from 'next/link'

// --- [★수정★] 시뮬레이션 함수 본체 전체 ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateProof_sim = async (
  voteOption: string
): Promise<{ proof: string; proofMs: number }> => {
  console.log(`'${voteOption}' 표에 대한 증명 생성 시작...`)
  const proofTime = 3000 + Math.random() * 2000
  await sleep(proofTime)
  if (Math.random() < 0.1) throw new Error('W3_PROOF_FAILED')
  return { proof: `0x123...(${voteOption})`, proofMs: Math.round(proofTime) }
}

const submitToRelayer_sim = async (
  proof: string
): Promise<{ txHash: string }> => {
  console.log(`Relayer로 증명(${proof}) 제출...`)
  await sleep(2000)
  // (중복 검사는 UI 레벨(hasVoted)에서 하므로 여기선 성공으로 간주)
  return { txHash: '0xabc...' }
}

const subscribeStatus_sim = (
  txHash: string,
  onUpdate: (status: VoteStatus) => void
) => {
  // (시뮬) 1:10 시나리오
  setTimeout(() => onUpdate('validating'), 2000) // 2초 뒤 '검증 (Conf=1)'
  setTimeout(() => onUpdate('confirmed'), 5000) // 5초 뒤 '영수증 (Conf=2)'
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
  const [debugInfo, setDebugInfo] = useState({
    wasmMs: 310,
    network: 'Sepolia (11155111)',
  })
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (!pollId) return

    // 1. localStorage에서 "투표 정보" (제목, 옵션) 불러오기
    try {
      const pollDataRaw = localStorage.getItem(`poll_${pollId}`)
      if (pollDataRaw) {
        const data: PollData = JSON.parse(pollDataRaw)
        setPollData(data)
      } else {
        setPollData(null)
      }
    } catch (err) {
      console.error('Poll data 로딩 실패:', err)
      setPollData(null)
    }

    // 2. localStorage에서 "이 투표에 참여했는지" 여부 불러오기
    const voted = localStorage.getItem(`voted_${pollId}`)
    setHasVoted(voted === 'true')

    setSelectedOption(null)
    setCurrentStatus('idle')
  }, [pollId])

  const handleVoteSubmit = async () => {
    if (!selectedOption) {
      notify('후보를 먼저 선택해주세요.', 'warning')
      return
    }
    if (hasVoted) {
      notifyError('B_409_DUPLICATE')
      setCurrentStatus('duplicate')
      return
    }
    if (isLoading) return
    setIsLoading(true)
    setCurrentStatus('idle')
    try {
      setCurrentStatus('generating_proof')
      notify('증명 생성을 시작합니다...', 'info')
      const { proof, proofMs } = await generateProof_sim(selectedOption)
      setDebugInfo((prev) => ({ ...prev, proofMs }))
      setCurrentStatus('submitting')
      notify('Relayer로 제출합니다...', 'info')
      const { txHash } = await submitToRelayer_sim(proof)
      subscribeStatus_sim(txHash, (newStatus) => {
        setCurrentStatus(newStatus)
        if (newStatus === 'confirmed') {
          notify('투표가 성공적으로 기록되었습니다!', 'success')
          setIsLoading(false)
          setSelectedOption(null)
          localStorage.setItem(`voted_${pollId}`, 'true')
          setHasVoted(true)
        }
      })
    } catch (error: any) {
      const errorCode = error.message
      notifyError(errorCode)
      setCurrentStatus('failed')
      setIsLoading(false)
    }
  }

  // [★수정★] getButtonStyle 함수 본체 추가
  const getButtonStyle = (option: string) => ({
    padding: '15px 25px',
    fontSize: '16px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    border: '2px solid',
    backgroundColor: selectedOption === option ? '#1976D2' : 'white',
    color: selectedOption === option ? 'white' : '#1976D2',
    borderColor: '#1976D2',
    borderRadius: '8px',
    margin: '5px',
  })

  if (!pollData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>투표를 찾을 수 없습니다 (404)</h2>
        <p>ID: {pollId}</p>
        <p>데이터가 없거나 잘못된 URL입니다.</p>
        <Link href="/" style={{ color: '#0070f3' }}>
          &larr; 홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1>ZKP 투표 참여</h1>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #555',
          borderRadius: '8px',
        }}
      >
        <h3>
          {pollData.title} (ID: {pollId})
        </h3>

        <div style={{ margin: '25px 0', textAlign: 'center' }}>
          <p style={{ marginBottom: '15px' }}>1. 투표 항목을 선택하세요:</p>
          <div>
            {pollData.options.map((option) => (
              <button
                key={option}
                style={getButtonStyle(option)}
                onClick={() => setSelectedOption(option)}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ margin: '25px 0', borderColor: '#444' }} />

        <div style={{ marginBottom: '20px' }}>
          <p>2. 실시간 상태</p>
          <StatusBadge status={currentStatus} />
        </div>

        <button
          onClick={handleVoteSubmit}
          disabled={!selectedOption || isLoading}
          style={{
            padding: '12px 22px',
            fontSize: '16px',
            cursor: !selectedOption || isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: !selectedOption || isLoading ? '#555' : '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {isLoading ? '처리 중...' : '투표 + 증명 생성'}
        </button>
      </div>

      <Chart />
      <DebugPanel info={debugInfo} />
    </div>
  )
}
