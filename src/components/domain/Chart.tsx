// [수정] React.memo를 import 합니다.
import React, { memo } from 'react'

// Phase 7 (성능 최적화) 전의 기본 차트 컴포넌트입니다.
// 지금은 가짜 데이터(Mock Data)를 사용합니다.
const MOCK_DATA = [
  { id: 1, option: '찬성', votes: 150 },
  { id: 2, option: '반대', votes: 75 },
]

// 컴포넌트 함수 자체는 수정할 필요가 없습니다.
const Chart: React.FC = () => {
  const chartContainerStyle: React.CSSProperties = {
    marginTop: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
  }

  return (
    <div style={chartContainerStyle}>
      <h2>투표 현황 (차트)</h2>
      <ul>
        {MOCK_DATA.map((item) => (
          <li key={item.id} style={{ margin: '10px 0' }}>
            {item.option}: {item.votes} 표
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '12px', color: '#888' }}>
        (Phase 3: React.memo 적용)
      </p>
    </div>
  )
}

// [수정] export default 할 때 React.memo로 감싸줍니다.
// 이렇게 하면 Chart 컴포넌트의 props가 변경되지 않는 한,
// 부모 컴포넌트(HomePage)가 리렌더링 되어도 Chart는 리렌더링되지 않습니다.
export default memo(Chart)
