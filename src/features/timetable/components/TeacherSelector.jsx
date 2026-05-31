import { useState, useRef, useEffect } from 'react'

export default function TeacherSelector({ selectedTeacher, onSelect, teachers = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const selectedObj = teachers.find(t => t.name === selectedTeacher)

  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 20,
      margin: '16px 20px' 
    }}>
      <div style={{ color: '#3b82f6' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <div ref={ref} style={{ position: 'relative', width: 320 }}>
        <label style={{ display: 'block', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Giáo viên
        </label>
        <button onClick={() => setIsOpen(!isOpen)} style={{
          width: '100%', padding: '8px 32px 8px 14px', background: '#fff',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          textAlign: 'left', fontSize: 13, color: selectedObj ? 'var(--color-text)' : 'var(--color-text-secondary)',
          cursor: 'pointer', position: 'relative'
        }}>
          {selectedObj ? selectedObj.label : '-- Chọn giáo viên --'}
          <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#fff', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            maxHeight: 300, overflowY: 'auto', zIndex: 100
          }}>
            <div onClick={() => { onSelect(null); setIsOpen(false) }} style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              -- Chọn giáo viên --
            </div>
            {teachers.map(t => (
              <div key={t.name}
                onClick={() => { onSelect(t.name); setIsOpen(false) }}
                style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', background: selectedTeacher === t.name ? 'var(--color-primary)' : 'transparent', color: selectedTeacher === t.name ? '#fff' : 'var(--color-text)' }}
                onMouseEnter={e => { if (selectedTeacher !== t.name) e.currentTarget.style.background = '#f3f4f6' }}
                onMouseLeave={e => { if (selectedTeacher !== t.name) e.currentTarget.style.background = 'transparent' }}
              >
                {t.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', fontSize: 13, fontWeight: 500 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        {selectedObj ? (selectedObj.subjects ? `Môn: ${selectedObj.subjects} — Xem tất cả tiết dạy trong tuần` : `Giáo viên ${selectedObj.name} hiện chưa có tiết dạy`) : 'Chọn giáo viên để xem lịch dạy trong tuần'}
      </div>
    </div>
  )
}