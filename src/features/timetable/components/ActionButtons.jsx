export default function ActionButtons({ onImport, onExport, onAdd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onImport}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-white)',
          color: '#10b981',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 10v2h10v-2" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Import Excel
      </button>

      <button
        onClick={onExport}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-white)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 10v2h10v-2" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M7 2v7M4.5 4.5L7 2l2.5 2.5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Xuất PNG
      </button>

      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-primary)',
          color: '#fff',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Thêm tiết
      </button>
    </div>
  )
}