import { useState, useEffect } from 'react'

const DAY_SHORT = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export default function MoveConfirmModal({ isOpen, data, onClose, onConfirm }) {
  const [applyFuture, setApplyFuture] = useState(false)

  useEffect(() => {
    if (isOpen) setApplyFuture(false)
  }, [isOpen])

  if (!isOpen || !data) return null

  const { source, target } = data
  const isSwap = !!target.data

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 460, background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1001 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
               <path d="M2 5h10M12 5l-3-3M12 5l-3 3M14 11H4M4 11l3 3M4 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            {isSwap ? 'Xác nhận đổi tiết' : 'Xác nhận di chuyển tiết'}
          </span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text)', marginBottom: 20, lineHeight: 1.6 }}>
            {isSwap ? (
              <>
                Đổi tiết <strong style={{ color: '#2563eb' }}>{source.data.subject}</strong> ({DAY_SHORT[source.dayIdx]}, Tiết {source.period}) 
                <br/>với tiết <strong style={{ color: '#059669' }}>{target.data.subject}</strong> ({DAY_SHORT[target.dayIdx]}, Tiết {target.period})?
              </>
            ) : (
              <>
                Di chuyển tiết <strong style={{ color: '#2563eb' }}>{source.data.subject}</strong> từ <strong style={{ fontWeight: 600 }}>({DAY_SHORT[source.dayIdx]}, Tiết {source.period})</strong>
                <br/>sang <strong style={{ fontWeight: 600 }}>({DAY_SHORT[target.dayIdx]}, Tiết {target.period})</strong>?
              </>
            )}
          </div>

          <div onClick={() => setApplyFuture(!applyFuture)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 14px', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: applyFuture ? '5px solid var(--color-primary)' : '1px solid var(--color-border)', background: '#fff', transition: 'all 0.15s' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 500 }}>Áp dụng thay đổi cho các tuần tiếp theo.</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Tùy chỉnh</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-border)', background: '#f8fafc', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500 }}>Hủy</button>
          <button onClick={() => onConfirm({ applyFuture })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 5h10M12 5l-3-3M12 5l-3 3M14 11H4M4 11l3 3M4 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Xác nhận {isSwap ? 'Đổi' : 'Di chuyển'}
          </button>
        </div>
      </div>
    </>
  )
}