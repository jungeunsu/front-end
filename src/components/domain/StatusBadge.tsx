// 훅을 사용하므로 "use client" 선언
'use client'

import React from 'react'

// 시연 시나리오에 명시된 상태들 (docs/상태_다이어그램.md 기반)
export type VoteStatus =
  | 'idle' // 대기
  | 'generating_proof' // (0:20) 증명 생성 중
  | 'submitting' // (0:50) 제출 중
  | 'validating' // (1:10) 검증 중 (Conf=1)
  | 'confirmed' // (1:10) 영수증 (Conf=2)
  | 'duplicate' // (1:40) 중복(409)
  | 'failed' // 기타 실패

interface StatusBadgeProps {
  status: VoteStatus
}

// 간단한 스타일 객체
const baseStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '16px',
  fontWeight: 'bold',
  fontSize: '14px',
  border: '1px solid',
  minWidth: '100px',
  textAlign: 'center',
}

// 상태별 스타일과 텍스트 정의 (문서 기반)
const statusConfig: {
  [key in VoteStatus]: { text: string; style: React.CSSProperties }
} = {
  idle: {
    text: '대기 중',
    style: {
      backgroundColor: '#E0E0E0',
      borderColor: '#9E9E9E',
      color: '#616161',
    },
  },
  generating_proof: {
    text: '증명 생성 중...',
    style: {
      backgroundColor: '#BBDEFB',
      borderColor: '#1976D2',
      color: '#1976D2',
    },
  },
  submitting: {
    text: '제출 중...',
    style: {
      backgroundColor: '#BBDEFB',
      borderColor: '#1976D2',
      color: '#1976D2',
    },
  },
  validating: {
    text: '검증 중 (Conf=1)',
    style: {
      backgroundColor: '#FFF9C4',
      borderColor: '#FBC02D',
      color: '#FBC02D',
    },
  },
  confirmed: {
    text: '영수증 (Conf=2)',
    style: {
      backgroundColor: '#C8E6C9',
      borderColor: '#4CAF50',
      color: '#4CAF50',
    },
  },
  duplicate: {
    text: '409 중복',
    style: {
      backgroundColor: '#FFCDD2',
      borderColor: '#D32F2F',
      color: '#D32F2F',
    },
  },
  failed: {
    text: '실패',
    style: {
      backgroundColor: '#FFCDD2',
      borderColor: '#D32F2F',
      color: '#D32F2F',
    },
  },
}
// (다크모드일 경우 색상이 잘 안 보일 수 있으니 globals.css를 확인하세요)

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // 상태가 유효하지 않으면 'idle'로 처리
  const config = statusConfig[status] || statusConfig.idle
  const combinedStyle = { ...baseStyle, ...config.style }

  return <div style={combinedStyle}>{config.text}</div>
}

export default StatusBadge
