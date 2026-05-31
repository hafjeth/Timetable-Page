import { useState, useRef, useCallback } from 'react'
import { parseExcelFile, validateRow, formatDateVN, dateToDayKey, downloadSampleExcel } from '../../../services/excelService'

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Tải lên file', 'Kiểm tra dữ liệu', 'Hoàn thành']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 24 }}>
      {steps.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'var(--color-primary)' : active ? 'var(--color-primary)' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
                transition: 'all 0.2s',
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : idx
                }
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : done ? 'var(--color-text-secondary)' : '#94a3b8',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 60, height: 2, background: done ? 'var(--color-primary)' : '#e2e8f0',
                margin: '0 4px', marginBottom: 20,
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Upload ────────────────────────────────────────────────────────────
function UploadStep({ onFileParsed }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Vui lòng chọn file .xlsx')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const rows = await parseExcelFile(file)
      if (rows.length === 0) throw new Error('File không có dữ liệu hợp lệ.')
      onFileParsed({ file, rows })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : error ? '#ef4444' : '#cbd5e1'}`,
          borderRadius: 10,
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#eef2ff' : '#fafbff',
          transition: 'all 0.15s',
          marginBottom: 16,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #e2e8f0',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Đang đọc file...</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <UploadIcon />
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
              Kéo thả hoặc{' '}
              <span style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                click chọn file .xlsx
              </span>
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>Tối đa 5 MB</p>
          </>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5"/><path d="M7 4.5V7.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="9.5" r="0.75" fill="#ef4444"/></svg>
          <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
        </div>
      )}

      <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <strong>Cấu trúc:</strong>&nbsp;
          A: Ngày (dd/MM/yyyy) | B: Tiết số | C: Tên lớp | D: Môn học | E: Giáo viên (tùy chọn)
        </span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Step 2: Preview & Validate ────────────────────────────────────────────────
function PreviewStep({ file, rows, onChangeFile, applyFuture, setApplyFuture }) {
  const teachers = [...new Set(rows.map(r => r.teacher).filter(Boolean))]
  const validatedRows = rows.map(r => ({
    ...r,
    ...validateRow(r),
    dayKey: dateToDayKey(r.date),
  }))
  const invalidCount = validatedRows.filter(r => !r.valid).length
  const validCount = validatedRows.length - invalidCount

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16 }}>
        <CheckCircleIcon color="#16a34a" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
            File "{file.name}" đã được tải lên thành công
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>
            Hệ thống đã nhận diện được {validCount} tiết học và {teachers.length} giáo viên.
          </div>
        </div>
        <button onClick={onChangeFile} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Thay đổi file
        </button>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
              <tr>
                {['Ngày', 'Tiết', 'Lớp', 'Môn', 'GV', 'Trạng thái'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', borderBottom: '1px solid #e2e8f0', fontSize: 12 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validatedRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                  <td style={tdStyle}>{formatDateVN(row.date)}</td>
                  <td style={tdStyle}>{row.period}</td>
                  <td style={tdStyle}>{row.className}</td>
                  <td style={tdStyle}>{row.subject}</td>
                  <td style={tdStyle}>{row.teacher || '—'}</td>
                  <td style={tdStyle}>
                    {row.valid
                      ? <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>Hợp lệ</span>
                      : <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12 }} title={row.error}>Lỗi</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* CHECKBOX CHÈN VÀO ĐÂY */}
      <div onClick={() => setApplyFuture(!applyFuture)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', padding: '10px', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 8 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: applyFuture ? '5px solid var(--color-primary)' : '1px solid #cbd5e1', background: '#fff' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Áp dụng lịch này cho đến hết học kỳ</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Tự động lặp lại vào các tuần tiếp theo</span>
        </div>
      </div>

      {/* Warning */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 0, fontSize: 12, color: '#1e40af' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><rect x="1" y="2" width="12" height="10" rx="2" stroke="#3b82f6" strokeWidth="1.3"/><path d="M4 6h6M4 8.5h4" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span>Hệ thống sẽ ghi đè lên các tiết học đã tồn tại trong tuần hiện tại.</span>
      </div>
    </div>
  )
}

const tdStyle = { padding: '7px 10px', borderBottom: '1px solid #f1f5f9', color: 'var(--color-text)' }

// ─── Step 3: Done ──────────────────────────────────────────────────────────────
function DoneStep({ count }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14L11 20L23 8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)', marginBottom: 4 }}>
          Import thành công!
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Đã thêm <strong>{count}</strong> tiết học.
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function ImportExcelModal({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState(1)
  const [fileData, setFileData] = useState(null)
  const [applyFuture, setApplyFuture] = useState(true)
  const [importedCount, setImportedCount] = useState(0)

  function handleFileParsed(data) {
    setFileData(data)
    setStep(2)
  }

  function handleConfirm() {
    if (!fileData) return
    const count = fileData.rows.filter(r => validateRow(r).valid).length
    onImport(fileData.rows, applyFuture)
    setImportedCount(count)
    setStep(3)
  }

  function handleClose() {
    onClose()
    setTimeout(() => {
      setStep(1)
      setFileData(null)
      setApplyFuture(true)
    }, 200)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>Import Thời Khóa Biểu</span>
          <button onClick={handleClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {step < 3 && <StepIndicator step={step} />}

          {step === 1 && <UploadStep onFileParsed={handleFileParsed} />}
          {step === 2 && fileData && (
            <PreviewStep
              file={fileData.file}
              rows={fileData.rows}
              onChangeFile={() => setStep(1)}
              applyFuture={applyFuture}
              setApplyFuture={setApplyFuture}
            />
          )}
          {step === 3 && <DoneStep count={importedCount} />}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={downloadSampleExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Tải file mẫu
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {step < 3 && (
              <button onClick={handleClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 500, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                Đóng
              </button>
            )}
            {step === 2 && (
              <button
                onClick={handleConfirm}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', cursor: 'pointer' }}
              >
                Xác nhận import
              </button>
            )}
            {step === 3 && (
              <button onClick={handleClose} style={{ padding: '8px 24px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', cursor: 'pointer' }}>
                Hoàn thành
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadIcon({ size = 24, color = '#64748b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12M8 7L12 3L16 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function CheckCircleIcon({ color = '#16a34a', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5"/>
      <path d="M5 8L7 10L11 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}