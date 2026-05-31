import { formatShortDate } from '../../../utils/formatDate'

export default function TimetableHeader({
  pill,
  monday,
  saturday,
  searchFilters = [],
  onRemoveFilter,
  weekNavigator,
  actions,
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px var(--spacing-md)',
      borderBottom: '1px solid var(--color-border)',
      gap: 12,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <CalendarIcon />
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Thời khóa biểu</span>

        {pill && <Pill color={pill.color}>{pill.label}</Pill>}

        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Tuần: {formatShortDate(monday)}/{monday.getFullYear()} – {formatShortDate(saturday)}/{saturday.getFullYear()}
        </span>

        {searchFilters.map((filter, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px',
              background: '#eff6ff',
              border: '1px solid var(--color-primary)',
              borderRadius: 999,
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            {filter.label}
            <button
              onClick={() => onRemoveFilter(idx)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-primary)', fontSize: 16, padding: '0 0 0 4px', lineHeight: 1,
              }}
            >×</button>
          </div>
        ))}
      </div>

      <div
        data-html2canvas-ignore="true"
        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        {weekNavigator}
        {actions}
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" />
      <path d="M1 7h14" stroke="var(--color-primary)" strokeWidth="1.5" />
      <path d="M5 1v3M11 1v3" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Pill({ children, color = 'blue' }) {
  const s = color === 'blue'
    ? { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' }
    : { bg: '#f1f5f9', color: 'var(--color-text-secondary)' }
  return (
    <span style={{
      padding: '2px 8px',
      background: s.bg,
      color: s.color,
      borderRadius: 999,
      fontSize: 'var(--font-size-sm)',
      fontWeight: 600,
    }}>
      {children}
    </span>
  )
}