import { useState, useRef, useEffect } from 'react'
import { VIEW_MODE } from '../constants/timetableConstants'
import { getAllTeachers } from '../utils/timetableHelpers'

export default function TeacherFilterBar({ viewMode, onViewModeChange, selectedTeacher, onTeacherChange }) {
  const teachers = getAllTeachers()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const selected = teachers.find(t => t.name === selectedTeacher)

  return (
    <div style={{
      background: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      padding: '10px var(--spacing-md)',
      display: 'flex',
      alignItems: 'flex-end',
      gap: 'var(--spacing-md)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          Tìm kiếm
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Gõ tên GV hoặc môn học..."
            style={{
              padding: '6px 32px 6px 10px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text)',
              width: 260, outline: 'none',
            }}
          />
          <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#6b7280" strokeWidth="1.4" />
            <path d="M9.5 9.5L12 12" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        {[{ mode: VIEW_MODE.THEO_LOP, label: 'Theo lớp' }, { mode: VIEW_MODE.THEO_GIAO_VIEN, label: 'Theo giáo viên' }].map(({ mode, label }) => (
          <button key={mode} onClick={() => onViewModeChange(mode)} style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${viewMode === mode ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: 'var(--color-white)',
            color: viewMode === mode ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: viewMode === mode ? 600 : 400,
            fontSize: 'var(--font-size-md)',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>
    </div>
  )
}