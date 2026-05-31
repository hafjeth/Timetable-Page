import { useState, useEffect, useRef } from 'react'
import { SUBJECTS, getTeachersForSubject } from '../data/teacherSubjects'

const DAY_SHORT = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export default function EditScheduleModal({ isOpen, data, onClose, onSave }) {
  const [subject, setSubject] = useState('')
  const [teacher, setTeacher] = useState('')
  const [applyFuture, setApplyFuture] = useState(false)

  const [subjectOpen, setSubjectOpen] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const subjectRef = useRef()
  const teacherRef = useRef()

  useEffect(() => {
    if (isOpen && data) {
      setSubject(data.data?.subject || '')
      setTeacher(data.data?.teacher || '')
      setApplyFuture(false)
    }
  }, [isOpen, data])

  useEffect(() => {
    function handle(e) {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) setSubjectOpen(false)
      if (teacherRef.current && !teacherRef.current.contains(e.target)) setTeacherOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (!isOpen || !data) return null

  const availableTeachers = subject ? getTeachersForSubject(subject) : []
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-md)', color: 'var(--color-text)', outline: 'none', background: 'var(--color-white)', cursor: 'pointer', boxSizing: 'border-box' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 440, background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 1001 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L10 4.5L3.5 11H1V8.5L7.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            Sửa tiết — {DAY_SHORT[data.dayIdx]}, Tiết {data.period}
          </span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div ref={subjectRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Môn học <span style={{color: '#ef4444'}}>*</span></label>
            <button onClick={() => setSubjectOpen(p => !p)} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ color: subject ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>{subject || '-- Chọn môn học --'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {subjectOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                {SUBJECTS.map((s) => (
                  <div key={s} onClick={() => { setSubject(s); setTeacher(''); setSubjectOpen(false) }} style={{ padding: '9px 14px', fontSize: 'var(--font-size-md)', cursor: 'pointer', color: subject === s ? '#fff' : 'var(--color-text)', background: subject === s ? 'var(--color-primary)' : 'transparent' }} onMouseEnter={e => { if (subject !== s) e.currentTarget.style.background = '#f5f6fa' }} onMouseLeave={e => { if (subject !== s) e.currentTarget.style.background = 'transparent' }}>{s}</div>
                ))}
              </div>
            )}
          </div>

          <div ref={teacherRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Giáo viên</label>
            <button onClick={() => subject && setTeacherOpen(p => !p)} disabled={!subject} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: teacher ? 'var(--color-text)' : 'var(--color-text-secondary)', opacity: subject ? 1 : 0.6 }}>
              <span>{teacher || '-- Chọn giáo viên giảng dạy --'}</span>
              {subject && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            {subject && availableTeachers.length > 0 && (
              <p style={{ marginTop: 4, fontSize: '11px', color: 'var(--color-text-secondary)' }}>{availableTeachers.length} GV dạy được môn {subject}</p>
            )}
            {teacherOpen && subject && (
              <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, overflow: 'hidden' }}>
                {availableTeachers.map((t) => (
                  <div key={t} onClick={() => { setTeacher(t); setTeacherOpen(false) }} style={{ padding: '9px 14px', fontSize: 'var(--font-size-md)', cursor: 'pointer', color: teacher === t ? '#fff' : 'var(--color-text)', background: teacher === t ? 'var(--color-primary)' : 'transparent' }} onMouseEnter={e => { if (teacher !== t) e.currentTarget.style.background = '#f5f6fa' }} onMouseLeave={e => { if (teacher !== t) e.currentTarget.style.background = 'transparent' }}>{t}</div>
                ))}
              </div>
            )}
          </div>

          <div onClick={() => setApplyFuture(!applyFuture)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: applyFuture ? '5px solid var(--color-primary)' : '1px solid var(--color-border)', background: '#fff', transition: 'all 0.15s' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>Áp dụng thay đổi cho các tuần tiếp theo.</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Tùy chỉnh</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--color-border)', background: '#f8fafc', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500 }}>Hủy</button>
          <button onClick={() => onSave({ subject, teacher, applyFuture })} disabled={!subject} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: subject ? 'var(--color-primary)' : '#94a3b8', color: '#fff', fontWeight: 600, cursor: subject ? 'pointer' : 'not-allowed' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  )
}