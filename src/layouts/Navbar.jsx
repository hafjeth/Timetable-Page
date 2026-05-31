import { useState, useRef, useEffect } from 'react'
import { APP_NAME, CAP_HOC, NAM_HOC, HOC_KY } from '../utils/constants'
import { useSchoolConfig } from '../contexts/SchoolConfigContext'

function DropdownPill({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.15)', // Nền trắng mờ
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', fontSize: 'var(--font-size-sm)',
          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        {selected?.label}
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
          minWidth: 140, zIndex: 1000, overflow: 'hidden', border: '1px solid var(--color-border)'
        }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                fontSize: 'var(--font-size-sm)', border: 'none', cursor: 'pointer',
                color: value === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
                background: value === opt.value ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: value === opt.value ? 600 : 400,
              }}
              onMouseEnter={e => { if(value !== opt.value) e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { if(value !== opt.value) e.currentTarget.style.background = 'transparent' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { capHoc, setCapHoc, namHoc, setNamHoc, hocKy, setHocKy } = useSchoolConfig()

  return (
    <nav style={{
      height: 'var(--navbar-height)', background: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 'var(--spacing-lg)',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
          TK
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>
          Trường TH-THCS-THPT Titkul
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', marginRight: 4 }}>
          Quản lý giáo dục
        </span>
        <DropdownPill options={CAP_HOC} value={capHoc} onChange={setCapHoc} />
        <DropdownPill options={NAM_HOC} value={namHoc} onChange={setNamHoc} />
        <DropdownPill options={HOC_KY} value={hocKy} onChange={setHocKy} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
          A
        </div>
        <span style={{ color: '#fff', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>admin</span>
      </div>
    </nav>
  )
}