// 🔥 API Base URL (Vercel 자동 감지)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://my-anon-voting-platfrom2.onrender.com'

// ------------------ 타입 ------------------
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
  totalVotes: number
  results: { candidate: string; label: string; votes: number }[]
}

// ------------------ 공통 fetch ------------------
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  })

  const json = await res.json().catch(() => {
    throw new Error('SERVER_NOT_JSON')
  })

  if (!json.success) throw new Error(json.message || 'API Error')
  return json.data
}

// ------------------ UUID → ZKP FIELD 변환 ------------------
async function uuidToField(uuid: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(uuid)
  const buffer = await crypto.subtle.digest('SHA-256', data)

  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const FIELD = BigInt(
    '21888242871839275222246405745257275088548364400416034343698204186575808495617'
  )

  return (BigInt('0x' + hex) % FIELD).toString()
}

// -------------------------------------------------------------
// 📌 투표 목록
// GET /api/polls
// -------------------------------------------------------------
export async function getPolls(): Promise<PollListItem[]> {
  return await fetchAPI(`/api/polls`)
}

// -------------------------------------------------------------
// 📌 공개 투표 정보 조회
// GET /api/polls/:pollId/public
// -------------------------------------------------------------
export async function getPollPublic(pollId: string): Promise<PollPublic> {
  return await fetchAPI(`/api/polls/${pollId}/public`)
}

// -------------------------------------------------------------
// 📌 실시간 투표 결과 조회 (UUID → pollIdSignal 변환 포함)
// GET /api/polls/:pollId/results
// -------------------------------------------------------------
export async function getPollResults(pollId: string): Promise<PollResult> {
  const pollIdSignal = await uuidToField(pollId)

  return await fetchAPI(`/api/polls/${pollId}/results?signal=${pollIdSignal}`)
}

// -------------------------------------------------------------
// 📌 투표 생성
// POST /api/polls
// -------------------------------------------------------------
export async function createPoll(payload: {
  creatorWallet: string
  title: string
  description: string
  candidates: { id: string; label: string }[]
  startTime: string
  endTime: string
}) {
  return await fetchAPI(`/api/polls`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -------------------------------------------------------------
// 📌 투표 제출
// POST /api/vote
// -------------------------------------------------------------
export async function submitVote(payload: {
  pollId: string
  walletAddress: string
  candidate: string
  txHash: string
}) {
  return await fetchAPI(`/api/vote`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -------------------------------------------------------------
// 📌 투표 삭제
// DELETE /api/polls/:pollId/delete
// -------------------------------------------------------------
export async function deletePoll(pollId: string) {
  return await fetchAPI(`/api/polls/${pollId}/delete`, {
    method: 'DELETE',
  })
}
