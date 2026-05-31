import { useState, useEffect, useRef, useMemo } from 'react'
import { PERIODS, DAY_KEYS } from '../constants/timetableConstants'
import { SUBJECTS, getTeachersForSubject } from '../data/teacherSubjects'
import { DAYS_OF_WEEK } from '../../../utils/formatDate'

const SEMESTER_END = new Date(2026, 4, 23)

const REPEAT_OPTIONS = [
  { key: 'none',    label: 'Không lặp',           sub: 'Chỉ thêm 1 tiết này' },
  { key: 'weekly',  label: 'Mỗi tuần',             sub: 'Lặp đúng thứ này mỗi tuần' },
  { key: 'daily',   label: 'Mỗi ngày trong tuần',  sub: 'Thứ 2 → Thứ 7 mỗi tuần' },
  { key: 'custom',  label: 'Tuỳ chỉnh',            sub: 'Chọn các thứ cụ thể' },
]

const DAY_SHORT = ['THai', 'TBa', 'TTư', 'TNăm', 'TSáu', 'TBảy']

function formatDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function dateToInputValue(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function inputValueToDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function calcTotalPeriods({ startDate, repeatDayIndices, endMode, endAfterWeeks, endDate }) {
  if (!repeatDayIndices.length) return 0

  let endD = new Date(startDate)
  if (endMode === 'semester') {
    endD = new Date(SEMESTER_END)
  } else if (endMode === 'after') {
    endD.setDate(endD.getDate() + Number(endAfterWeeks) * 7)
  } else if (endMode === 'date' && endDate) {
    endD = inputValueToDate(endDate)
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const end = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate())

  if (end < start) return 0

  let count = 0
  const cur = new Date(start)

  while (cur <= end) {
    const currentDayIndex = cur.getDay() === 0 ? 6 : cur.getDay() - 1 
    if (repeatDayIndices.includes(currentDayIndex)) {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export default function AddScheduleModal({ isOpen, initialDay, initialPeriod, weekDays, lop, onClose, onSave }) {
  const [day, setDay] = useState(0)
  const [period, setPeriod] = useState(initialPeriod ?? 1)
  const [subject, setSubject] = useState('')
  const [teacher, setTeacher] = useState('')
  const [repeat, setRepeat] = useState('none')

  const [endMode, setEndMode] = useState('semester')
  const [endAfterWeeks, setEndAfterWeeks] = useState(10)
  const [endDate, setEndDate] = useState(dateToInputValue(SEMESTER_END))
  const [customDays, setCustomDays] = useState([])

  const [subjectOpen, setSubjectOpen] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const subjectRef = useRef()
  const teacherRef = useRef()

  useEffect(() => {
    if (isOpen) {
      const defaultDay = initialDay ?? 0
      const boundedDay = weekDays && defaultDay >= weekDays.length ? weekDays.length - 1 : defaultDay
      
      setDay(boundedDay)
      setPeriod(initialPeriod ?? 1)
      setSubject('')
      setTeacher('')
      setRepeat('none')
      setEndMode('semester')
      setEndAfterWeeks(10)
      setEndDate(dateToInputValue(SEMESTER_END))
      setCustomDays([])
    }
  }, [isOpen, initialDay, initialPeriod, weekDays])

  useEffect(() => {
    function handle(e) {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) setSubjectOpen(false)
      if (teacherRef.current && !teacherRef.current.contains(e.target)) setTeacherOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const availableTeachers = subject ? getTeachersForSubject(subject) : []
  const startDate = weekDays?.[day] || new Date()

  const repeatDayIndices = useMemo(() => {
    if (repeat === 'weekly') return [day]
    if (repeat === 'daily') return [0, 1, 2, 3, 4, 5]
    if (repeat === 'custom') return customDays
    return []
  }, [repeat, day, customDays])

  const totalPeriods = useMemo(() => {
    if (repeat === 'none') return 1
    return calcTotalPeriods({
      startDate,
      repeatDayIndices,
      endMode,
      endAfterWeeks,
      endDate
    })
  }, [repeat, startDate, repeatDayIndices, endMode, endAfterWeeks, endDate])

  const previewText = useMemo(() => {
    if (repeat === 'none') return null
    
    const endLabel = endMode === 'semester'
      ? `đến hết học kỳ (${formatDate(SEMESTER_END)})`
      : endMode === 'after'
        ? `đến sau ${endAfterWeeks} tuần`
        : `đến ngày ${endDate ? formatDate(inputValueToDate(endDate)) : '...'}`

    if (repeat === 'weekly') {
      const dayName = weekDays?.[day] ? DAYS_OF_WEEK[weekDays[day].getDay()] : ''
      return `Lặp mỗi ${dayName} — ${endLabel}`
    }
    if (repeat === 'daily') return `Lặp mỗi ngày trong tuần — ${endLabel}`
    if (repeat === 'custom') {
      if (!customDays.length) return `Chưa chọn ngày nào — ${endLabel}`
      const names = customDays.map(i => DAY_SHORT[i]).join(', ')
      return `Lặp mỗi ${names} — ${endLabel}`
    }
    return null
  }, [repeat, day, weekDays, endMode, endAfterWeeks, endDate, customDays])

  if (!isOpen) return null

  function handleSave() {
    if (!subject) return
    onSave?.({ 
      day: DAY_KEYS[day], 
      period, 
      subject, 
      teacher, 
      repeat,
      date: dateToInputValue(startDate),
      endMode,
      endAfterWeeks,
      endDate,
      customDays
    })
    onClose()
  }
  
  function toggleCustomDay(idx) {
    setCustomDays(prev => {
      if (prev.includes(idx)) {
        return prev.filter(d => d !== idx)
      } else {
        return [...prev, idx].sort((a, b) => a - b)
      }
    })
  }

  const showEndConfig = repeat === 'weekly' || repeat === 'daily' || repeat === 'custom'
  const showOverrideWarning = repeat === 'daily' || (repeat === 'custom' && customDays.length > 1)
  
  const inputStyle = { 
    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', 
    borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-md)', 
    color: 'var(--color-text)', outline: 'none', background: 'var(--color-white)', 
    cursor: 'pointer', appearance: 'none', boxSizing: 'border-box' 
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, maxHeight: '92vh', overflowY: 'auto', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1001 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="var(--color-primary)" strokeWidth="1.4"/>
              <path d="M1 6h12" stroke="var(--color-primary)" strokeWidth="1.4"/>
              <path d="M4.5 1v2M9.5 1v2" stroke="var(--color-primary)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            Thêm tiết học — Lớp {lop}
          </span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Thứ + Tiết */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label required>Thứ</Label>
              <select value={day} onChange={e => setDay(Number(e.target.value))} style={{ ...inputStyle, backgroundImage: arrowSvg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 }}>
                {(weekDays || []).map((d, i) => (
                  <option key={i} value={i}>{DAYS_OF_WEEK[d.getDay()]} ({String(d.getDate()).padStart(2,'0')}/{String(d.getMonth()+1).padStart(2,'0')})</option>
                ))}
              </select>
            </div>
            <div>
              <Label required>Tiết</Label>
              <select value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ ...inputStyle, backgroundImage: arrowSvg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 }}>
                {PERIODS.map(p => (<option key={p.period} value={p.period}>{p.period}: {p.start}–{p.end}</option>))}
              </select>
            </div>
          </div>

          {/* Môn học */}
          <div ref={subjectRef} style={{ position: 'relative' }}>
            <Label required>Môn học</Label>
            <button onClick={() => setSubjectOpen(p => !p)} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ color: subject ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>{subject || '-- Chọn môn --'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {!subject && (<p style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Chọn môn trước — danh sách GV tự lọc</p>)}
            {subjectOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, overflow: 'hidden' }}>
                {SUBJECTS.map((s) => (
                  <div key={s} 
                    onClick={() => { setSubject(s); setTeacher(''); setSubjectOpen(false) }} 
                    style={{ padding: '9px 14px', fontSize: 'var(--font-size-md)', cursor: 'pointer', color: subject === s ? '#fff' : 'var(--color-text)', background: subject === s ? 'var(--color-primary)' : 'transparent' }} 
                    onMouseEnter={e => { if (subject !== s) e.currentTarget.style.background = '#f5f6fa' }} 
                    onMouseLeave={e => { if (subject !== s) e.currentTarget.style.background = 'transparent' }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Giáo viên */}
          <div ref={teacherRef} style={{ position: 'relative' }}>
            <Label>Giáo viên</Label>
            <button 
              onClick={() => subject && setTeacherOpen(p => !p)} 
              disabled={!subject} 
              style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: teacher ? 'var(--color-text)' : 'var(--color-text-secondary)', opacity: subject ? 1 : 0.6, cursor: subject ? 'pointer' : 'not-allowed' }}
            >
              <span>{teacher || (subject ? '-- Chọn giáo viên --' : '-- Chọn môn trước --')}</span>
              {subject && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            {teacherOpen && subject && (
              <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, overflow: 'hidden' }}>
                {availableTeachers.map((t) => (
                  <div key={t} 
                    onClick={() => { setTeacher(t); setTeacherOpen(false) }} 
                    style={{ padding: '9px 14px', fontSize: 'var(--font-size-md)', cursor: 'pointer', color: teacher === t ? '#fff' : 'var(--color-text)', background: teacher === t ? 'var(--color-primary)' : 'transparent' }} 
                    onMouseEnter={e => { if (teacher !== t) e.currentTarget.style.background = '#f5f6fa' }} 
                    onMouseLeave={e => { if (teacher !== t) e.currentTarget.style.background = 'transparent' }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lặp lịch */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 0 1 9.5-2M12 2v3h-3" stroke="var(--color-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7a5 5 0 0 1-9.5 2M2 12V9h3" stroke="var(--color-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text)' }}>Lặp lịch</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REPEAT_OPTIONS.map(opt => {
                const active = repeat === opt.key
                return (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-sm)', background: active ? 'var(--color-primary-light)' : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name="repeat" value={opt.key} checked={active} onChange={() => setRepeat(opt.key)} style={{ marginTop: 2, accentColor: 'var(--color-primary)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: active ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                  </label>
                )
              })}
            </div>

            {repeat === 'custom' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {DAY_SHORT.map((label, idx) => {
                  const checked = customDays.includes(idx)
                  return (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 6, background: checked ? 'var(--color-primary-light)' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? 'var(--color-primary)' : 'var(--color-text)', userSelect: 'none' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCustomDay(idx)} style={{ accentColor: 'var(--color-primary)', width: 13, height: 13 }} />
                      {label}
                    </label>
                  )
                })}
              </div>
            )}

            {showEndConfig && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Kết thúc lặp</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                      <input type="radio" name="endMode" value="semester" checked={endMode === 'semester'} onChange={() => setEndMode('semester')} style={{ accentColor: 'var(--color-primary)' }} />
                      <span>Hết học kỳ <span style={{ color: 'var(--color-text-secondary)' }}>({formatDate(SEMESTER_END)})</span></span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                      <input type="radio" name="endMode" value="after" checked={endMode === 'after'} onChange={() => setEndMode('after')} style={{ accentColor: 'var(--color-primary)' }} />
                      <span>Sau</span>
                      <input 
                        type="number" min={1} max={52} value={endAfterWeeks} 
                        onChange={e => { setEndAfterWeeks(Math.max(1, Number(e.target.value))); setEndMode('after'); }} 
                        onClick={() => setEndMode('after')} 
                        style={{ width: 50, padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', textAlign: 'center', outline: 'none' }} 
                      />
                      <span>tuần</span>
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                    <input type="radio" name="endMode" value="date" checked={endMode === 'date'} onChange={() => setEndMode('date')} style={{ accentColor: 'var(--color-primary)' }} />
                    <span>Đến ngày</span>
                    <input 
                      type="date" value={endDate} 
                      onChange={e => { setEndDate(e.target.value); setEndMode('date'); }} 
                      onClick={() => setEndMode('date')} 
                      style={{ padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', outline: 'none' }} 
                    />
                  </label>
                </div>
              </div>
            )}

            {previewText && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13 }}>
                <div style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 6.5a5.5 5.5 0 0 1 9.5-3.5M11.5 1.5v3h-3" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6.5a5.5 5.5 0 0 1-9.5 3.5M1.5 11.5v-3h3" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {previewText}
                  </span>
                </div>
                <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: 12 }}>
                  Sẽ tạo <strong style={{ color: 'var(--color-primary)' }}>{totalPeriods} tiết</strong> trong thời khóa biểu.
                </div>
              </div>
            )}
            
            {showOverrideWarning && (
              <div style={{ marginTop: 12, fontSize: '13px', color: '#dc2626' }}>
                <strong style={{ fontWeight: 700 }}>Lưu ý:</strong><br />Lịch trong khung giờ này sẽ bị thay thế (nếu có).
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, background: '#fff', zIndex: 2 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text)', fontSize: 'var(--font-size-md)', cursor: 'pointer' }}>
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            disabled={!subject} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: 'none', 
              borderRadius: 'var(--radius-sm)', background: subject ? 'var(--color-primary)' : '#94a3b8', 
              color: '#fff', fontSize: 'var(--font-size-md)', fontWeight: 600, cursor: subject ? 'pointer' : 'not-allowed' 
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {repeat === 'none' ? 'Lưu tiết học' : `Lưu ${totalPeriods} tiết`}
          </button>
        </div>
      </div>
    </>
  )
}

function Label({ children, required }) { 
  return (
    <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
  ) 
}

const arrowSvg = `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`