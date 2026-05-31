import { useState, useEffect } from 'react'

const DAY_SHORT = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export default function DeleteConfirmModal({ isOpen, data, onClose, onConfirm }) {
  const [applyFuture, setApplyFuture] = useState(false)

  useEffect(() => {
    if (isOpen) setApplyFuture(false)
  }, [isOpen])

  if (!isOpen || !data) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 440, background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1001 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M1 3H11M4 3V1.5C4 1.22386 4.22386 1 4.5 1H7.5C7.77614 1 8 1.22386 8 1.5V3M5 5.5V8.5M7 5.5V8.5M2 3V10.5C2 10.7761 2.22386 11 2.5 11H9.5C9.77614 11 10 10.7761 10 10.5V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            Xác nhận xóa
          </span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text)', marginBottom: 20 }}>
            Xóa tiết <strong style={{ fontWeight: 700 }}>{data.data.subject}</strong> — <strong style={{ fontWeight: 700 }}>{DAY_SHORT[data.dayIdx]}</strong>, Tiết {data.period}?
          </div>

          <div onClick={() => setApplyFuture(!applyFuture)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: applyFuture ? '5px solid var(--color-primary)' : '1px solid var(--color-border)', background: '#fff', transition: 'all 0.15s' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>Áp dụng thay đổi cho các tuần tiếp theo.</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Tùy chỉnh</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-border)', background: '#f8fafc', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500 }}>Hủy</button>
          <button onClick={() => onConfirm({ applyFuture })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M1 3H11M4 3V1.5C4 1.22386 4.22386 1 4.5 1H7.5C7.77614 1 8 1.22386 8 1.5V3M5 5.5V8.5M7 5.5V8.5M2 3V10.5C2 10.7761 2.22386 11 2.5 11H9.5C9.77614 11 10 10.7761 10 10.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Xóa
          </button>
        </div>
      </div>
    </>
  )
}