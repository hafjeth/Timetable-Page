import { useState, useMemo } from 'react'
import FilterBar from '../components/FilterBar'
import TeacherSelector from '../components/TeacherSelector'
import WeekNavigator from '../components/WeekNavigator'
import ActionButtons from '../components/ActionButtons'
import TimetableGrid from '../components/TimetableGrid'
import TeacherTimetableGrid from '../components/TeacherTimetableGrid'
import SubjectLegend from '../components/SubjectLegend'
import TeacherSubjectLegend from '../components/TeacherSubjectLegend'
import AddScheduleModal from '../modals/AddScheduleModal'
import EditScheduleModal from '../modals/EditScheduleModal'
import DeleteConfirmModal from '../modals/DeleteConfirmModal'
import MoveConfirmModal from '../modals/MoveConfirmModal'
import ImportExcelModal from '../modals/ImportExcelModal'
import Toast from '../../../components/common/Toast'
import { MOCK_SCHEDULE } from '../data/mockSchedule'
import { getWeekRange, formatShortDate, getWeekDays } from '../../../utils/formatDate'
import { VIEW_MODE, DAY_KEYS } from '../constants/timetableConstants'
import { validateRow, dateToDayKey } from '../../../services/excelService'

const SEMESTER_END = new Date(2026, 11, 31)

function parseYMD(str) {
  if (!str) return new Date()
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dateToInputValue(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function TimetablePage() {
  const [khoi, setKhoi] = useState('khoi-1')
  const [lop, setLop] = useState('1D')
  const [viewMode, setViewMode] = useState(VIEW_MODE.THEO_LOP)
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const [searchFilters, setSearchFilters] = useState([]) 
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  
  const [modifications, setModifications] = useState({}) 
  
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addInitDay, setAddInitDay] = useState(0)
  const [addInitPeriod, setAddInitPeriod] = useState(1)
  
  const [editModalData, setEditModalData] = useState(null)
  const [deleteModalData, setDeleteModalData] = useState(null)
  const [moveModalData, setMoveModalData] = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  
  const [toast, setToast] = useState(null)

  const { monday, saturday } = getWeekRange(currentDate)
  const weekDaysDates = getWeekDays(monday)

  function mergeSchedule(base, mods, weekDaysArray) {
    const result = JSON.parse(JSON.stringify(base || {}))
    if (!mods || !mods.length) return result

    mods.forEach(mod => {
      const modDate = parseYMD(mod.date)
      modDate.setHours(0,0,0,0)

      weekDaysArray.forEach((currentDayDate, i) => {
        const dayKey = DAY_KEYS[i]
        const currentD = new Date(currentDayDate)
        currentD.setHours(0,0,0,0)

        if (mod.type === 'ADD') {
          let endD = new Date(modDate)
          if (mod.endMode === 'semester') endD = new Date(SEMESTER_END)
          else if (mod.endMode === 'after') endD.setDate(endD.getDate() + mod.endAfterWeeks * 7)
          else if (mod.endMode === 'date' && mod.endDate) endD = parseYMD(mod.endDate)
          endD.setHours(23,59,59,999)

          if (currentD >= modDate && currentD <= endD) {
            let isMatch = false
            const dayIndex = currentD.getDay() === 0 ? 6 : currentD.getDay() - 1 

            if (mod.repeat === 'none' && currentD.getTime() === modDate.getTime()) isMatch = true
            else if (mod.repeat === 'weekly' && currentD.getDay() === modDate.getDay()) isMatch = true
            else if (mod.repeat === 'daily') isMatch = true
            else if (mod.repeat === 'custom' && mod.customDays?.includes(dayIndex)) isMatch = true

            if (isMatch) {
              if (!result[dayKey]) result[dayKey] = {}
              result[dayKey][mod.period] = { subject: mod.subject, teacher: mod.teacher }
            }
          }
        } 
        else if (mod.type === 'EDIT' || mod.type === 'DELETE') {
          if (mod.dayKey === dayKey) {
            let isMatch = false
            if (mod.applyFuture) {
              if (currentD >= modDate) isMatch = true
            } else {
              if (currentD.getTime() === modDate.getTime()) isMatch = true
            }

            if (isMatch) {
              if (!result[dayKey]) result[dayKey] = {}
              if (mod.type === 'DELETE') {
                delete result[dayKey][mod.period]
              } else {
                result[dayKey][mod.period] = { subject: mod.subject, teacher: mod.teacher }
              }
            }
          }
        }
      })
    })
    return result
  }

  const baseSchedule = MOCK_SCHEDULE[lop] || {}
  const schedule = mergeSchedule(baseSchedule, modifications[lop] || [], weekDaysDates)

  const fullSchoolScheduleForWeek = useMemo(() => {
    const result = {}
    const allClasses = new Set([...Object.keys(MOCK_SCHEDULE), ...Object.keys(modifications)])
    allClasses.forEach(className => {
      const base = MOCK_SCHEDULE[className] || {}
      const localArr = modifications[className] || []
      result[className] = mergeSchedule(base, localArr, weekDaysDates)
    })
    return result
  }, [modifications, currentDate])

  const teacherSchedule = useMemo(() => {
    if (!selectedTeacher) return {}
    const res = {}
    Object.entries(fullSchoolScheduleForWeek).forEach(([lopName, lopSchedule]) => {
      Object.entries(lopSchedule).forEach(([dayKey, daySchedule]) => {
        Object.entries(daySchedule).forEach(([period, cell]) => {
          if (cell.teacher === selectedTeacher) {
            if (!res[dayKey]) res[dayKey] = {}
            res[dayKey][Number(period)] = { subject: cell.subject, lop: lopName }
          }
        })
      })
    })
    return res
  }, [fullSchoolScheduleForWeek, selectedTeacher])

  const teacherSubjects = useMemo(() => {
    if (!selectedTeacher) return []
    const subjects = new Set()
    Object.values(fullSchoolScheduleForWeek).forEach(lopSchedule => {
      Object.values(lopSchedule).forEach(daySchedule => {
        Object.values(daySchedule).forEach(cell => {
          if (cell.teacher === selectedTeacher) subjects.add(cell.subject)
        })
      })
    })
    return [...subjects]
  }, [fullSchoolScheduleForWeek, selectedTeacher])

  function handlePrev() { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }
  function handleNext() { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }
  function handleToday() { setCurrentDate(new Date()) }
  function handleViewModeChange(mode) { setViewMode(mode); setSearchFilters([]) }

  function handleFilterSelect(newFilter) {
    if (!newFilter) return
    setSearchFilters(prev => {
      const isExist = prev.find(f => f.type === newFilter.type && f.value === newFilter.value)
      if (isExist) return prev
      return [...prev, newFilter]
    })
  }

  function removeFilter(indexToRemove) {
    setSearchFilters(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  function handleSaveAdd(config) {
    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), { type: 'ADD', ...config }] }))
    setToast({ message: 'Thêm tiết học thành công', type: 'success' })
  }

  function handleSaveEdit({ subject, teacher, applyFuture }) {
    const { dayKey, period, date } = editModalData
    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), { type: 'EDIT', date: dateToInputValue(date), dayKey, period, subject, teacher, applyFuture }] }))
    setEditModalData(null)
    setToast({ message: 'Thay đổi thành công', type: 'success' })
  }

  function handleConfirmDelete({ applyFuture }) {
    const { dayKey, period, date } = deleteModalData
    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), { type: 'DELETE', date: dateToInputValue(date), dayKey, period, applyFuture }] }))
    setDeleteModalData(null)
    setToast({ message: 'Xóa môn học thành công', type: 'success' }) 
  }

  function handleConfirmMove({ applyFuture }) {
    const { source, target } = moveModalData
    const newMods = []

    newMods.push({ type: 'DELETE', date: dateToInputValue(new Date(source.date)), dayKey: source.dayKey, period: source.period, applyFuture })
    if (target.data) {
      newMods.push({ type: 'DELETE', date: dateToInputValue(new Date(target.date)), dayKey: target.dayKey, period: target.period, applyFuture })
    }

    newMods.push({
      type: 'ADD', date: dateToInputValue(new Date(target.date)), day: target.dayKey, period: target.period,
      subject: source.data.subject, teacher: source.data.teacher, repeat: applyFuture ? 'weekly' : 'none', 
      endMode: applyFuture ? 'semester' : 'date', endDate: dateToInputValue(new Date(target.date)), customDays: applyFuture ? [target.dayIdx] : []
    })

    if (target.data) {
      newMods.push({
        type: 'ADD', date: dateToInputValue(new Date(source.date)), day: source.dayKey, period: source.period,
        subject: target.data.subject, teacher: target.data.teacher, repeat: applyFuture ? 'weekly' : 'none', 
        endMode: applyFuture ? 'semester' : 'date', endDate: dateToInputValue(new Date(source.date)), customDays: applyFuture ? [source.dayIdx] : []
      })
    }

    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), ...newMods] }))
    setMoveModalData(null)
    setToast({ message: target.data ? 'Đổi tiết thành công' : 'Di chuyển tiết thành công', type: 'success' })
  }

  // LOGIC ĐÃ FIX: Nhận biến applyFuture và phân luồng lặp lịch
  function handleImport(rows, applyFuture = true) {
    let count = 0
    setModifications(prev => {
      const next = { ...prev }
      for (const row of rows) {
        const { valid } = validateRow(row)
        if (!valid) continue
        const dayKey = dateToDayKey(row.date)
        const lopKey = row.className
        const d = new Date(row.date)
        
        if (!next[lopKey]) next[lopKey] = []
        next[lopKey].push({ 
          type: 'ADD', 
          day: dayKey, 
          period: row.period, 
          subject: row.subject, 
          teacher: row.teacher || '', 
          // Đã thêm logic kiểm tra lặp lịch tương lai
          repeat: applyFuture ? 'weekly' : 'none', 
          endMode: applyFuture ? 'semester' : 'date',
          date: dateToInputValue(d),
          endDate: dateToInputValue(d) 
        })
        count++
      }
      return next
    })
    
    const importedClasses = [...new Set(rows.map(r => r.className))]
    if (!importedClasses.includes(lop) && importedClasses.length > 0) setLop(importedClasses[0])
    setToast({ message: `Import thành công ${count} tiết học`, type: 'success' })
    setImportModalOpen(false)
  }

  if (viewMode === VIEW_MODE.THEO_LOP) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FilterBar 
          khoi={khoi} lop={lop} viewMode={viewMode} 
          searchFilter={searchFilters.length > 0 ? searchFilters[searchFilters.length - 1] : null} 
          onKhoiChange={k => { setKhoi(k); setLop('') }} onLopChange={setLop} 
          onViewModeChange={handleViewModeChange} onFilterSelect={handleFilterSelect} 
        />
        
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px var(--spacing-md)', borderBottom: '1px solid var(--color-border)', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <CalendarIcon />
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Thời khóa biểu</span>
              {lop && <Pill>{`Lớp ${lop}`}</Pill>}
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Tuần: {formatShortDate(monday)}/{monday.getFullYear()} – {formatShortDate(saturday)}/{saturday.getFullYear()}
              </span>
              
              {searchFilters.length > 0 && searchFilters.map((filter, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#eff6ff', border: '1px solid var(--color-primary)', borderRadius: 999, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {filter.label}
                  <button onClick={() => removeFilter(idx)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 16, padding: '0 0 0 4px', lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <WeekNavigator currentDate={currentDate} onPrev={handlePrev} onNext={handleNext} onToday={handleToday} />
              <ActionButtons onImport={() => setImportModalOpen(true)} onExport={() => {}} onAdd={() => { setAddInitDay(0); setAddInitPeriod(1); setAddModalOpen(true); }} />
            </div>
          </div>

          <TimetableGrid 
            monday={monday} schedule={schedule} searchFilters={searchFilters} 
            onCellClick={({ period, data, dayIdx }) => { if (!data) { setAddInitDay(dayIdx); setAddInitPeriod(period); setAddModalOpen(true); } }} 
            onEditClick={(info) => setEditModalData(info)}
            onDeleteClick={(info) => setDeleteModalData(info)}
            onMoveClick={(info) => setMoveModalData(info)}
          />
          <SubjectLegend />
        </div>

        <AddScheduleModal isOpen={addModalOpen} initialDay={addInitDay} initialPeriod={addInitPeriod} weekDays={weekDaysDates} lop={lop} onClose={() => setAddModalOpen(false)} onSave={handleSaveAdd} />
        <EditScheduleModal isOpen={!!editModalData} data={editModalData} onClose={() => setEditModalData(null)} onSave={handleSaveEdit} />
        <DeleteConfirmModal isOpen={!!deleteModalData} data={deleteModalData} onClose={() => setDeleteModalData(null)} onConfirm={handleConfirmDelete} />
        <MoveConfirmModal isOpen={!!moveModalData} data={moveModalData} onClose={() => setMoveModalData(null)} onConfirm={handleConfirmMove} />
        <ImportExcelModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImport} />
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FilterBar 
        khoi={khoi} lop={lop} viewMode={viewMode} 
        searchFilter={searchFilters.length > 0 ? searchFilters[searchFilters.length - 1] : null} 
        onKhoiChange={k => { setKhoi(k); setLop('') }} onLopChange={setLop} 
        onViewModeChange={handleViewModeChange} onFilterSelect={handleFilterSelect} 
      />
      
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden' }}>
        <TeacherSelector selectedTeacher={selectedTeacher} onSelect={setSelectedTeacher} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px var(--spacing-md)', borderBottom: '1px solid var(--color-border)', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarIcon />
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Thời khóa biểu</span>
              {selectedTeacher ? <Pill color="blue">{`G.v ${selectedTeacher}`}</Pill> : <Pill color="gray">Chọn giáo viên</Pill>}
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Tuần: {formatShortDate(monday)}/{monday.getFullYear()} – {formatShortDate(saturday)}/{saturday.getFullYear()}
              </span>

              {searchFilters.length > 0 && searchFilters.map((filter, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#eff6ff', border: '1px solid var(--color-primary)', borderRadius: 999, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {filter.label}
                  <button onClick={() => removeFilter(idx)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 16, padding: '0 0 0 4px', lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <WeekNavigator currentDate={currentDate} onPrev={handlePrev} onNext={handleNext} onToday={handleToday} />
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-white)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#6b7280" strokeWidth="1.4"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Xuất PNG
              </button>
            </div>
          </div>
          
          {!selectedTeacher ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-text-secondary)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="9" r="5" stroke="var(--color-primary)" strokeWidth="1.8"/><path d="M4 25c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginBottom: 4 }}>Chọn giáo viên để xem lịch dạy</div>
                <div style={{ fontSize: 'var(--font-size-sm)' }}>Hệ thống hiển thị tất cả tiết dạy trong tuần, kèm tên lớp.</div>
              </div>
            </div>
          ) : (
            <>
              <TeacherTimetableGrid monday={monday} schedule={teacherSchedule} />
              <TeacherSubjectLegend subjects={teacherSubjects} />
            </>
          )}
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="var(--color-primary)" strokeWidth="1.5"/>
      <path d="M1 7h14" stroke="var(--color-primary)" strokeWidth="1.5"/>
      <path d="M5 1v3M11 1v3" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function Pill({ children, color = 'blue' }) {
  const s = color === 'blue' ? { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' } : { bg: '#f1f5f9', color: 'var(--color-text-secondary)' }
  return <span style={{ padding: '2px 8px', background: s.bg, color: s.color, borderRadius: 999, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{children}</span>
}