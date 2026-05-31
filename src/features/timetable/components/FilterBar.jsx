import { useState, useRef, useEffect, useMemo } from 'react'
import { KHOI_LIST, LOP_BY_KHOI, VIEW_MODE } from '../constants/timetableConstants'
import { SUBJECT_COLORS } from '../../../utils/colors'

export default function FilterBar({ khoi, lop, viewMode, onKhoiChange, onLopChange, onViewModeChange, onFilterSelect, searchFilter, allSchedule = {} }) {
  const lopList = LOP_BY_KHOI[khoi] || []
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef()

  const index = useMemo(() => {
    const teachers = {}
    const subjects = {}
    Object.values(allSchedule).forEach(lopSchedule => {
      Object.values(lopSchedule).forEach(daySchedule => {
        Object.values(daySchedule).forEach(({ subject, teacher }) => {
          if (teacher) {
            if (!teachers[teacher]) teachers[teacher] = { name: teacher, subjectSet: new Set(), count: 0 }
            teachers[teacher].subjectSet.add(subject)
            teachers[teacher].count++
          }
          if (subject) {
            if (!subjects[subject]) subjects[subject] = { name: subject, teacherSet: new Set(), count: 0 }
            subjects[subject].teacherSet.add(teacher)
            subjects[subject].count++
          }
        })
      })
    })
    return {
      teachers: Object.values(teachers).map(t => ({ name: t.name, subjects: [...t.subjectSet].join(', '), count: t.count })),
      subjects: Object.values(subjects).map(s => ({ name: s.name, count: s.count, numTeachers: s.teacherSet.size })),
    }
  }, [allSchedule])

  const keyword = search.trim().toLowerCase()
  const filteredTeachers = useMemo(() => keyword ? index.teachers.filter(t => t.name.toLowerCase().includes(keyword) || t.subjects.toLowerCase().includes(keyword)) : [], [keyword, index])
  const filteredSubjects = useMemo(() => keyword ? index.subjects.filter(s => s.name.toLowerCase().includes(keyword)) : [], [keyword, index])
  const hasResults = filteredTeachers.length > 0 || filteredSubjects.length > 0

  useEffect(() => {
    function handle(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSelectTeacher(t) {
    setSearch(t.name)
    setShowDropdown(false)
    onFilterSelect?.({ type: 'teacher', value: t.name, label: `G.v ${t.name}` })
  }

  function handleSelectSubject(s) {
    setSearch(s.name)
    setShowDropdown(false)
    onFilterSelect?.({ type: 'subject', value: s.name, label: `Môn: ${s.name}` })
  }

  function handleClearSearch() {
    setSearch('')
    setShowDropdown(false)
    onFilterSelect?.(null)
  }

  const labelStyle = {
    fontSize: 11, color: '#9ca3af', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4,
  }

  const selectStyle = {
    padding: '8px 28px 8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    fontSize: 13, color: 'var(--color-text)', background: 'var(--color-white)',
    cursor: 'pointer', appearance: 'none', outline: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  }

  return (
    <div style={{
      background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)',
      padding: '16px 24px', display: 'flex', alignItems: 'flex-end', gap: 24,
    }}>
      {viewMode === VIEW_MODE.THEO_LOP && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Khối</label>
            <select value={khoi} onChange={e => onKhoiChange(e.target.value)} style={{ ...selectStyle, minWidth: 120 }}>
              {KHOI_LIST.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Lớp</label>
            <select value={lop} onChange={e => onLopChange(e.target.value)} style={{ ...selectStyle, minWidth: 100 }}>
              {lopList.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </>
      )}

      <div ref={searchRef} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <label style={labelStyle}>Tìm kiếm</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text" value={search} placeholder="Gõ tên GV hoặc môn học..."
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); if (!e.target.value) onFilterSelect?.(null) }}
            onFocus={() => { if (search) setShowDropdown(true) }}
            style={{
              padding: '8px 56px 8px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--color-text)', width: 300, outline: 'none', transition: 'border-color 0.2s',
            }}
          />
          {search && (
            <button onClick={handleClearSearch} style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          )}
          <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M9.5 9.5L12 12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {showDropdown && keyword && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: 340, background: '#fff',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)', zIndex: 200, overflow: 'hidden',
          }}>
            {!hasResults && <div style={{ padding: '16px', fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Không tìm thấy kết quả</div>}

            {filteredTeachers.length > 0 && (
              <>
                <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb' }}>
                  Giáo viên ({filteredTeachers.length})
                </div>
                {filteredTeachers.map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', gap: 12 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleSelectTeacher(t)}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                      {t.name.split(' ').pop()?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subjects}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {filteredSubjects.length > 0 && (
              <>
                <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb', borderTop: filteredTeachers.length > 0 ? '1px solid var(--color-border)' : 'none' }}>
                  Môn học ({filteredSubjects.length})
                </div>
                {filteredSubjects.map(s => {
                  const color = SUBJECT_COLORS[s.name] || { bg: '#f8fafc', border: '#94a3b8', dot: '#94a3b8' }
                  return (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', gap: 12 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => handleSelectSubject(s)}>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: color.bg, border: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color.dot }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.numTeachers} GV phụ trách</div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        {[{ mode: VIEW_MODE.THEO_LOP, label: 'Theo lớp' }, { mode: VIEW_MODE.THEO_GIAO_VIEN, label: 'Theo giáo viên' }].map(({ mode, label }) => {
          const isActive = viewMode === mode
          return (
            <button key={mode} onClick={() => onViewModeChange(mode)} style={{
              padding: '8px 18px', borderRadius: 999,
              border: `1px solid ${isActive ? '#bfdbfe' : 'var(--color-border)'}`,
              background: isActive ? 'var(--color-primary-light)' : 'var(--color-white)',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}