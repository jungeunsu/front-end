import { ethers } from 'ethers'

// 🔥 Vercel / 로컬 자동 지원
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// ------------------ 타입 정의 ------------------
export interface Candidate {
  id: string
  label: string
}

export interface PollListItem {
  pollId: string
  title: string
  description: string
  createdAt: string
}

export interface PollPublic {
  pollId: string
  title: string
  description: string
  candidates: Candidate[]
  startTime: string
  endTime: string
  isActive: boolean
  status: 'active' | 'upcoming' | 'ended'
}

export interface PollResult {
  pollId: string
  title: string
  totalVotes: number
  results: { candidate: string; count: number }[]
  timestamp: string
}

// ------------------ 공통 Fetch Wrapper ------------------
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('SERVER_NOT_JSON')
    }

    const body = await res.json()

    if (res.status >= 400 || body.success === false) {
      const err: any = new Error(body.message || 'API Error')
      err.status = res.status
      err.details = body.details
      throw err
    }

    return body.data
  } catch (error) {
    console.warn(`[API Fail] ${endpoint}`, error)
    throw error
  }
}

// -------------------------------------------------------------
// 📌 투표 목록 (전체 공개) — GET /api/polls
// -------------------------------------------------------------
export async function getPolls(): Promise<PollListItem[]> {
  return await fetchAPI(`/api/polls`)
}

// -------------------------------------------------------------
// 📌 투표 공개 정보 조회 (유권자 자동 등록 포함)
// GET /api/polls/:pollId/public
// -------------------------------------------------------------
export async function getPollPublic(pollId: string): Promise<PollPublic> {
  return await fetchAPI(`/api/polls/${pollId}/public`)
}

// -------------------------------------------------------------
// 📌 결과 조회 (차트 / 집계)
// GET /api/polls/:pollId/results
// -------------------------------------------------------------
export async function getPollResults(pollId: string): Promise<PollResult> {
  return await fetchAPI(`/api/polls/${pollId}/results`)
}

// -------------------------------------------------------------
// 📌 투표 생성 — POST /api/vote/create
// 프론트에서 title, description, candidates 배열만 보냄
// -------------------------------------------------------------
export async function createPoll(payload: {
  title: string
  description: string
  candidates: string[]
}) {
  return await fetchAPI(`/api/vote/create`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -------------------------------------------------------------
// 📌 투표 제출 — POST /api/relayer/send
// -------------------------------------------------------------
export async function submitVote(payload: {
  pollId: string
  walletAddress: string
  candidate: string
  txHash: string
}) {
  return await fetchAPI(`/api/relayer/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -------------------------------------------------------------
// 📌 투표 삭제 — DELETE /api/polls/:pollId/delete
// -------------------------------------------------------------
export async function deletePoll(pollId: string) {
  return await fetchAPI(`/api/polls/${pollId}/delete`, {
    method: 'DELETE',
  })
}

// -------------------------------------------------------------
// ❌ registerVoter API 사용 없음 (백엔드에서 자동 등록)
// -------------------------------------------------------------
