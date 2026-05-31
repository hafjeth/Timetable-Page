import { getWeekRange, formatShortDate, addDays } from '../../../utils/formatDate'

export default function WeekNavigator({ currentDate, onPrev, onNext, onToday }) {
  const { monday, saturday } = getWeekRange(currentDate)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={onPrev}
        style={{
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-white)',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={onToday}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-white)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text)',
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#6b7280" strokeWidth="1.3"/>
          <path d="M1 5.5h11" stroke="#6b7280" strokeWidth="1.3"/>
          <path d="M4 1v2M9 1v2" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Tuần này
      </button>

      <button
        onClick={onNext}
        style={{
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-white)',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}