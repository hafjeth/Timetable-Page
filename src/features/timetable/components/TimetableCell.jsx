import { useState } from 'react'
import { SUBJECT_COLORS } from '../../../utils/colors'

export default function TimetableCell({ data, isToday, isHighlighted, matched, dimmed, draggable, onDragStart, onClick, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  if (!data) {
    return (
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick} 
        style={{ 
          width: '100%', height: '100%', minHeight: 60, 
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          background: isHovered ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
          border: isHovered ? '1px dashed #93c5fd' : '1px solid transparent',
          transition: 'all 0.15s ease'
        }} 
      >
        {isHovered && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    )
  }

  const color = SUBJECT_COLORS[data.subject] || { bg: '#f8fafc', border: '#94a3b8' }

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        setIsDragging(true)
        onDragStart?.(e)
      }}
      onDragEnd={() => setIsDragging(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        minHeight: 60, height: '100%',
        borderRadius: 'var(--radius-sm)',
        background: color.bg,
        borderLeft: `3px solid ${color.border}`,
        padding: '6px 8px',
        opacity: isDragging ? 0.4 : (dimmed ? 0.3 : 1),
        transform: isDragging ? 'scale(0.96)' : 'none',
        transition: 'all 0.15s ease',
        boxShadow: matched ? '0 0 0 2px #eab308' : (isDragging ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'),
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer', 
      }}
    >
      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: color.border, marginBottom: 4 }}>
        {data.subject}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
        {data.teacher}
      </div>

      {isHovered && !isDragging && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.() }}
            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            title="Sửa tiết"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L10 4.5L3.5 11H1V8.5L7.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.() }}
            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' }}
            title="Xóa tiết"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 3H11M4 3V1.5C4 1.22386 4.22386 1 4.5 1H7.5C7.77614 1 8 1.22386 8 1.5V3M5 5.5V8.5M7 5.5V8.5M2 3V10.5C2 10.7761 2.22386 11 2.5 11H9.5C9.77614 11 10 10.7761 10 10.5V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}