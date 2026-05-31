import { useState, useEffect, useRef } from 'react'
import { formatShortDate } from '../../../utils/formatDate'
import { VIEW_MODE } from '../constants/timetableConstants'
import { normalizeStr } from '../utils/timetableHelpers'

export default function ExportImageModal({
  isOpen,
  onClose,
  exportRef,
  viewMode,
  lop,
  selectedTeacher,
  monday,
  saturday,
  setToast,
}) {
  const [scale, setScale] = useState(2)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [canvasSize, setCanvasSize] = useState(null)

  useEffect(() => {
    if (!isOpen || !monday || !saturday) return
    const weekStr = `${formatShortDate(monday).replace('/', '')}-${formatShortDate(saturday).replace('/', '')}`
    const prefix = viewMode === VIEW_MODE.THEO_LOP
      ? `Lop_${lop}`
      : `GV_${normalizeStr(selectedTeacher || 'chua-chon')}`
    setFileName(`TKB_${prefix}_Tuan_${weekStr}`)
  }, [isOpen, monday, saturday, viewMode, lop, selectedTeacher])

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null)
      return
    }
    generatePreview()
  }, [isOpen, scale])

  async function captureElement(targetScale) {
    if (!exportRef?.current) throw new Error('Không tìm thấy vùng cần chụp')

    const html2canvas = (await import('html2canvas')).default
    const el = exportRef.current

    const saved = {
      overflow: el.style.overflow,
      height: el.style.height,
      maxHeight: el.style.maxHeight,
    }
    el.style.overflow = 'visible'
    el.style.height = 'auto'
    el.style.maxHeight = 'none'

    const scrollableChildren = Array.from(el.querySelectorAll('*')).filter(child => {
      const s = window.getComputedStyle(child)
      return ['auto', 'scroll'].includes(s.overflow)
        || ['auto', 'scroll'].includes(s.overflowY)
        || ['auto', 'scroll'].includes(s.overflowX)
    })

    const childSaved = scrollableChildren.map(child => {
      const orig = {
        el: child,
        overflow: child.style.overflow,
        overflowY: child.style.overflowY,
        overflowX: child.style.overflowX,
        height: child.style.height,
        maxHeight: child.style.maxHeight,
      }
      child.style.overflow = 'visible'
      child.style.overflowY = 'visible'
      child.style.overflowX = 'visible'
      child.style.height = 'auto'
      child.style.maxHeight = 'none'
      return orig
    })

    await new Promise(r => setTimeout(r, 80))

    const canvas = await html2canvas(el, {
      scale: targetScale,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      onclone: (doc) => {
        doc.querySelectorAll('[data-html2canvas-ignore]').forEach(e => {
          e.style.display = 'none'
        })
        doc.querySelectorAll('*').forEach(e => {
          const cs = window.getComputedStyle(e)
          if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
            e.style.overflow = 'visible'
            e.style.height = 'auto'
            e.style.maxHeight = 'none'
          }
        })
      },
    })

    Object.assign(el.style, saved)
    childSaved.forEach(({ el, overflow, overflowY, overflowX, height, maxHeight }) => {
      el.style.overflow = overflow
      el.style.overflowY = overflowY
      el.style.overflowX = overflowX
      el.style.height = height
      el.style.maxHeight = maxHeight
    })

    return canvas
  }

  async function generatePreview() {
    setIsGenerating(true)
    setPreviewUrl(null)
    try {
      const canvas = await captureElement(1)
      setPreviewUrl(canvas.toDataURL('image/png'))
      setCanvasSize({ w: canvas.width * scale, h: canvas.height * scale })
    } catch (err) {
      console.error(err)
      setToast({ message: 'Không thể tạo preview', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave() {
    if (isSaving) return
    setIsSaving(true)
    try {
      const canvas = await captureElement(scale)
      const dataURL = canvas.toDataURL('image/png')
      const name = (fileName.trim() || 'TKB') + '.png'

      if (window.showSaveFilePicker) {
        try {
          const blob = await (await fetch(dataURL)).blob()
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: name,
            types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
          })
          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()
          setToast({ message: 'Lưu ảnh PNG thành công!', type: 'success' })
          onClose()
          return
        } catch (err) {
          if (err.name === 'AbortError') { setIsSaving(false); return }
        }
      }

      const link = document.createElement('a')
      link.href = dataURL
      link.download = name
      link.click()
      setToast({ message: 'Xuất ảnh PNG thành công!', type: 'success' })
      onClose()
    } catch (err) {
      console.error(err)
      setToast({ message: 'Có lỗi xảy ra khi xuất ảnh', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 640, maxWidth: 'calc(100vw - 32px)',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#16a34a',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            Xuất ảnh PNG
          </span>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20 }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preview */}
          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#f8fafc',
            minHeight: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 32, color: 'var(--color-text-secondary)' }}>
                <div style={{
                  width: 28, height: 28,
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: 13 }}>Đang tạo preview...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', display: 'block', borderRadius: 4 }}
              />
            ) : (
              <div style={{ padding: 32, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                Không tạo được preview
              </div>
            )}
          </div>

          {canvasSize && !isGenerating && (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Kích thước ảnh xuất: <strong style={{ color: 'var(--color-text)' }}>{canvasSize.w} × {canvasSize.h} px</strong>
            </div>
          )}

          {/* Cài đặt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Tên file */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                Tên file
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <input
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  style={{
                    flex: 1, padding: '8px 12px',
                    border: 'none', outline: 'none',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text)',
                    background: '#fff',
                  }}
                />
                <span style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  borderLeft: '1px solid var(--color-border)',
                  flexShrink: 0,
                }}>
                  .png
                </span>
              </div>
            </div>

            {/* Chất lượng */}
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                Chất lượng ảnh
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 1, label: '1×', sub: 'Tiêu chuẩn' },
                  { value: 2, label: '2×', sub: 'Sắc nét (khuyên dùng)' },
                  { value: 3, label: '3×', sub: 'Siêu nét' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setScale(opt.value)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      border: `1.5px solid ${scale === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 8,
                      background: scale === opt.value ? 'var(--color-primary-light)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, color: scale === opt.value ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          background: '#f8fafc',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: '#fff',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isGenerating || isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: (isGenerating || isSaving) ? '#94a3b8' : '#16a34a',
              color: '#fff',
              fontWeight: 600,
              cursor: (isGenerating || isSaving) ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? (
              <>
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Đang lưu...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M4 6l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Lưu ảnh PNG
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}