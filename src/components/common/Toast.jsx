import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  const styles = {
    success: { bg: '#047857', color: '#ffffff', icon: 'M5 13l4 4L19 7' },
    error:   { bg: '#dc2626', color: '#ffffff', icon: 'M6 18L18 6M6 6l12 12' }, 
  }
  const s = styles[type] || styles.success

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px',
      background: s.bg,
      borderRadius: 999, // Pill shape
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      zIndex: 2000,
      fontSize: 'var(--font-size-sm)',
      color: s.color,
      fontWeight: 500,
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{
        width: 18, height: 18, 
        border: '1.5px solid rgba(255,255,255,0.8)', 
        borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d={s.icon} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {message}
    </div>
  )
}