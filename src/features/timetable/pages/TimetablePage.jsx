import { useState } from 'react'
import FilterBar from '../components/FilterBar'
import TeacherSelector from '../components/TeacherSelector'
import WeekNavigator from '../components/WeekNavigator'
import ActionButtons from '../components/ActionButtons'
import TimetableGrid from '../components/TimetableGrid'
import TeacherTimetableGrid from '../components/TeacherTimetableGrid'
import SubjectLegend from '../components/SubjectLegend'
import TeacherSubjectLegend from '../components/TeacherSubjectLegend'
import TimetableHeader from '../components/TimetableHeader'
import AddScheduleModal from '../modals/AddScheduleModal'
import EditScheduleModal from '../modals/EditScheduleModal'
import DeleteConfirmModal from '../modals/DeleteConfirmModal'
import MoveConfirmModal from '../modals/MoveConfirmModal'
import ImportExcelModal from '../modals/ImportExcelModal'
import ExportImageModal from '../modals/ExportImageModal'
import Toast from '../../../components/common/Toast'
import { getWeekRange, getWeekDays } from '../../../utils/formatDate'
import { VIEW_MODE } from '../constants/timetableConstants'
import { useSchedule } from '../hooks/useSchedule'
import { useTeacherView } from '../hooks/useTeacherView'
import { useExportPNG } from '../hooks/useExportPNG'

export default function TimetablePage() {
  // ─── UI state ──────────────────────────────────────────────────────────────
  const [khoi, setKhoi] = useState('khoi-1')
  const [lop, setLop] = useState('1D')
  const [viewMode, setViewMode] = useState(VIEW_MODE.THEO_LOP)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchFilters, setSearchFilters] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [toast, setToast] = useState(null)

  // ─── Modal state ───────────────────────────────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addInitDay, setAddInitDay] = useState(0)
  const [addInitPeriod, setAddInitPeriod] = useState(1)
  const [editModalData, setEditModalData] = useState(null)
  const [deleteModalData, setDeleteModalData] = useState(null)
  const [moveModalData, setMoveModalData] = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // ─── Tuần hiện tại ─────────────────────────────────────────────────────────
  const { monday, saturday } = getWeekRange(currentDate)
  const weekDaysDates = getWeekDays(monday)

  // ─── Business logic hooks ──────────────────────────────────────────────────
  const {
    schedule,
    fullSchoolScheduleForWeek,
    handleSaveAdd,
    handleSaveEdit,
    handleConfirmDelete,
    handleConfirmMove,
    handleImport,
  } = useSchedule({ lop, weekDaysDates, setToast })

  const { allTeachers, teacherSchedule, teacherSubjects } = useTeacherView({
    fullSchoolScheduleForWeek,
    selectedTeacher,
  })

  const { exportRef, handleExportPNG } = useExportPNG({
    viewMode, lop, selectedTeacher, monday, saturday, setToast,
  })

  // ─── Navigation handlers ───────────────────────────────────────────────────
  function handlePrev() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }
  function handleNext() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }
  function handleToday() { setCurrentDate(new Date()) }

  function handleViewModeChange(mode) {
    setViewMode(mode)
    setSearchFilters([])
  }

  // ─── Filter handlers ───────────────────────────────────────────────────────
  function handleFilterSelect(newFilter) {
    if (!newFilter) return
    setSearchFilters(prev => {
      const exists = prev.find(f => f.type === newFilter.type && f.value === newFilter.value)
      return exists ? prev : [...prev, newFilter]
    })
  }
  function removeFilter(idx) {
    setSearchFilters(prev => prev.filter((_, i) => i !== idx))
  }

  // ─── Modal handlers ────────────────────────────────────────────────────────
  function openAddModal(dayIdx = 0, period = 1) {
    setAddInitDay(dayIdx)
    setAddInitPeriod(period)
    setAddModalOpen(true)
  }

  function onSaveEdit(payload) {
    const ok = handleSaveEdit(payload, editModalData)
    if (ok) setEditModalData(null)
  }

  function onConfirmDelete(payload) {
    handleConfirmDelete(payload, deleteModalData)
    setDeleteModalData(null)
  }

  function onConfirmMove(payload) {
    const ok = handleConfirmMove(payload, moveModalData)
    if (ok) setMoveModalData(null)
  }

  function onImport(rows, applyFuture) {
    const result = handleImport(rows, applyFuture)
    if (result.success) {
      if (!result.importedClasses.includes(lop) && result.importedClasses.length > 0) {
        setLop(result.importedClasses[0])
      }
      setToast({ message: `Import thành công ${result.count} tiết học`, type: 'success' })
      setImportModalOpen(false)
    }
  }

  // ─── Shared props cho header ────────────────────────────────────────────────
  const weekNavNode = (
    <WeekNavigator
      currentDate={currentDate}
      onPrev={handlePrev}
      onNext={handleNext}
      onToday={handleToday}
    />
  )

  // ─── Render: chế độ theo lớp ───────────────────────────────────────────────
  if (viewMode === VIEW_MODE.THEO_LOP) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FilterBar
          khoi={khoi} lop={lop} viewMode={viewMode}
          searchFilter={searchFilters.length > 0 ? searchFilters[searchFilters.length - 1] : null}
          onKhoiChange={k => { setKhoi(k); setLop('') }}
          onLopChange={setLop}
          onViewModeChange={handleViewModeChange}
          onFilterSelect={handleFilterSelect}
          allSchedule={fullSchoolScheduleForWeek}
        />

        {/* Vùng được chụp ảnh */}
        <div
          ref={exportRef}
          style={{
            flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            background: 'var(--color-white)',
            borderTop: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <TimetableHeader
            pill={{ label: `Lớp ${lop}`, color: 'blue' }}
            monday={monday}
            saturday={saturday}
            searchFilters={searchFilters}
            onRemoveFilter={removeFilter}
            weekNavigator={weekNavNode}
            actions={
              <ActionButtons
                onImport={() => setImportModalOpen(true)}
                onExport={() => setExportModalOpen(true)}
                onAdd={() => openAddModal(0, 1)}
              />
            }
          />

          <TimetableGrid
            monday={monday}
            schedule={schedule}
            searchFilters={searchFilters}
            onCellClick={({ period, data, dayIdx }) => {
              if (!data) openAddModal(dayIdx, period)
            }}
            onEditClick={info => setEditModalData(info)}
            onDeleteClick={info => setDeleteModalData(info)}
            onMoveClick={info => setMoveModalData(info)}
          />
          <SubjectLegend />
        </div>

        {/* Modals */}
        <AddScheduleModal
          isOpen={addModalOpen} initialDay={addInitDay} initialPeriod={addInitPeriod}
          weekDays={weekDaysDates} lop={lop}
          onClose={() => setAddModalOpen(false)} onSave={handleSaveAdd}
        />
        <EditScheduleModal
          isOpen={!!editModalData} data={editModalData}
          onClose={() => setEditModalData(null)} onSave={onSaveEdit}
        />
        <DeleteConfirmModal
          isOpen={!!deleteModalData} data={deleteModalData}
          onClose={() => setDeleteModalData(null)} onConfirm={onConfirmDelete}
        />
        <MoveConfirmModal
          isOpen={!!moveModalData} data={moveModalData}
          onClose={() => setMoveModalData(null)} onConfirm={onConfirmMove}
        />
        <ImportExcelModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={onImport}
        />
        <ExportImageModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          exportRef={exportRef}
          viewMode={viewMode}
          lop={lop}
          selectedTeacher={selectedTeacher}
          monday={monday}
          saturday={saturday}
          setToast={setToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  // ─── Render: chế độ theo giáo viên ────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FilterBar
        khoi={khoi} lop={lop} viewMode={viewMode}
        searchFilter={searchFilters.length > 0 ? searchFilters[searchFilters.length - 1] : null}
        onKhoiChange={k => { setKhoi(k); setLop('') }}
        onLopChange={setLop}
        onViewModeChange={handleViewModeChange}
        onFilterSelect={handleFilterSelect}
        allSchedule={fullSchoolScheduleForWeek}
      />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden' }}>
        <TeacherSelector
          selectedTeacher={selectedTeacher}
          onSelect={setSelectedTeacher}
          teachers={allTeachers}
        />

        {/* Vùng được chụp ảnh */}
        <div
          ref={exportRef}
          style={{
            flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            background: 'var(--color-white)',
            borderTop: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <TimetableHeader
            pill={selectedTeacher
              ? { label: `G.v ${selectedTeacher}`, color: 'blue' }
              : { label: 'Chọn giáo viên', color: 'gray' }
            }
            monday={monday}
            saturday={saturday}
            searchFilters={searchFilters}
            onRemoveFilter={removeFilter}
            weekNavigator={weekNavNode}
            actions={
              <button
                onClick={() => setExportModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-white)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10v2h10v-2" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M7 2v7M4.5 4.5L7 2l2.5 2.5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Xuất PNG
              </button>
            }
          />

          {!selectedTeacher ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, color: 'var(--color-text-secondary)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="9" r="5" stroke="var(--color-primary)" strokeWidth="1.8" />
                  <path d="M4 25c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginBottom: 4 }}>
                  Chọn giáo viên để xem lịch dạy
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)' }}>
                  Hệ thống hiển thị tất cả tiết dạy trong tuần, kèm tên lớp.
                </div>
              </div>
            </div>
          ) : (
            <>
              <TeacherTimetableGrid
                monday={monday}
                schedule={teacherSchedule}
                searchFilters={searchFilters}
              />
              <TeacherSubjectLegend subjects={teacherSubjects} />
            </>
          )}
        </div>
      </div>

      <ExportImageModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        exportRef={exportRef}
        viewMode={viewMode}
        lop={lop}
        selectedTeacher={selectedTeacher}
        monday={monday}
        saturday={saturday}
        setToast={setToast}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}