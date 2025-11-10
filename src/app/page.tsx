// 훅을 사용하므로 "use client"
'use client'

import React, { useState } from 'react'
import Chart from '@/components/domain/Chart'
import { useUiStore } from '@/store/uiStore'
import DebugPanel from '@/components/common/DebugPanel'
import DemoGuideModal from '@/components/domain/DemoGuideModal'
// [추가] 4-2에서 만든 상태 배지
import StatusBadge, { VoteStatus } from '@/components/domain/StatusBadge'

// --- API 및 Web3 시뮬레이션 함수 ---
// (실제로는 안지영, 유지민, 김다예님 작업과 연동)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// (시뮬) 프론트 B (안지영) - Proof 생성 (문서: 3~5초)
const generateProof_sim = async (): Promise<{
  proof: string
  proofMs: number
}> => {
  const proofTime = 3000 + Math.random() * 2000 // 3~5초
  await sleep(proofTime)
  // (시뮬) 10% 확률로 증명 실패
  if (Math.random() < 0.1) throw new Error('W3_PROOF_FAILED')
  return { proof: '0x123abc...', proofMs: Math.round(proofTime) }
}

// (시뮬) 백엔드 B (유지민) - Relayer 제출 (문서: 2초)
const submitToRelayer_sim = async (
  proof: string
): Promise<{ txHash: string }> => {
  await sleep(2000)
  // (시뮬) 20% 확률로 409 중복 발생
  if (Math.random() < 0.2) throw new Error('B_409_DUPLICATE')
  return { txHash: '0xabc...' }
}

// (시뮬) 블록체인 상태 구독 (프론트 B 또는 백엔드 A)
const subscribeStatus_sim = (
  txHash: string,
  onUpdate: (status: VoteStatus) => void
) => {
  // (시뮬) 1:10 시나리오
  setTimeout(() => onUpdate('validating'), 2000) // 2초 뒤 '검증 (Conf=1)'
  setTimeout(() => onUpdate('confirmed'), 5000) // 5초 뒤 '영수증 (Conf=2)'
}
// --- 시뮬레이션 끝 ---

export default function HomePage() {
  const { notify, notifyError } = useUiStore()

  // 시연 시나리오의 '상태' 관리
  const [currentStatus, setCurrentStatus] = useState<VoteStatus>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState({
    wasmMs: 310,
    network: 'Sepolia (11155111)',
  })

  // (시연 0:20) '투표 + 증명 생성' 버튼 클릭 핸들러
  const handleVoteSubmit = async () => {
    if (isLoading) return // 중복 클릭 방지
    setIsLoading(true)
    setCurrentStatus('idle') // 상태 초기화

    try {
      // (시연 0:20) 증명 생성
      setCurrentStatus('generating_proof')
      notify('증명 생성을 시작합니다... (3~5초 소요)', 'info') // "진행 중" 토스트

      const { proof, proofMs } = await generateProof_sim()

      // 디버그 패널 업데이트
      setDebugInfo((prev) => ({ ...prev, proofMs }))

      // (시연 0:50) Relayer 제출
      setCurrentStatus('submitting')
      notify('Relayer로 제출합니다... (가스 0원)', 'info')

      const { txHash } = await submitToRelayer_sim(proof)

      // (시연 1:10) 실시간 상태 확인 (구독)
      subscribeStatus_sim(txHash, (newStatus) => {
        setCurrentStatus(newStatus)

        if (newStatus === 'confirmed') {
          notify('투표가 성공적으로 기록되었습니다!', 'success')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      // (시연 1:40) 모든 실패/중복 처리
      const errorCode = error.message // "B_409_DUPLICATE" 등

      notifyError(errorCode) // Phase 2에서 만든 에러 배너 띄우기 (1초 내)

      // 상태 배지를 에러 상태로 변경
      if (errorCode === 'B_409_DUPLICATE') {
        setCurrentStatus('duplicate') // 409 중복 배지
      } else {
        setCurrentStatus('failed') // 기타 실패 배지
      }
      setIsLoading(false)
    }
  }

  return (
    <div>
      <DemoGuideModal />

      <h1>ZKP 투표 데모</h1>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #555',
          borderRadius: '8px',
        }}
      >
        <h3>시연 시나리오 (정은수 - UI/UX)</h3>

        {/* 1. 실시간 상태 배지 */}
        <div style={{ marginBottom: '20px' }}>
          <p>실시간 상태 (시나리오 1:10)</p>
          <StatusBadge status={currentStatus} />
        </div>

        {/* 2. 메인 버튼 */}
        <button
          onClick={handleVoteSubmit}
          disabled={isLoading}
          style={{
            padding: '12px 22px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isLoading ? '#555' : '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {isLoading ? '처리 중...' : '투표 + 증명 생성 (시연 시작)'}
        </button>
      </div>

      {/* 차트 컴포넌트 */}
      <Chart />

      {/* 디버그 패널 */}
      <DebugPanel info={debugInfo} />

      {/* --- Phase 2/3 테스트 섹션 (유지) --- */}
      <div
        style={{
          marginTop: '20px',
          borderTop: '1px dashed #ccc',
          paddingTop: '10px',
          opacity: 0.5,
        }}
      >
        <p>
          <b>[Phase 2 테스트]</b> 알림 배너 (수동)
        </p>
        <button onClick={() => notify('테스트 성공!', 'success')}>성공</button>
        <button
          onClick={() => notifyError('B_409_DUPLICATE')}
          style={{ margin: '0 10px' }}
        >
          에러: 중복
        </button>
        <button onClick={() => notifyError('W3_NO_GAS')}>에러: 가스</button>
      </div>
    </div>
  )
}
