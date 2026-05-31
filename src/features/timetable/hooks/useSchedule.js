import { useState, useMemo } from 'react'
import { DAY_KEYS } from '../constants/timetableConstants'
import { MOCK_SCHEDULE } from '../data/mockSchedule'
import { validateRow } from '../../../services/excelService'
import { normalizeStr, beautifyName, parseSafeDate, dateToInputValue } from '../utils/timetableHelpers'

const SEMESTER_END = new Date(2026, 11, 31)

function mergeSchedule(base, mods, weekDaysArray) {
  const result = JSON.parse(JSON.stringify(base || {}))
  if (!mods || !mods.length) return result

  mods.forEach(mod => {
    const modDate = parseSafeDate(mod.date)
    if (isNaN(modDate.getTime())) return

    weekDaysArray.forEach((currentDayDate, i) => {
      const dayKey = DAY_KEYS[i]
      const currentD = parseSafeDate(currentDayDate)

      if (mod.type === 'ADD') {
        let endD = new Date(modDate)
        if (mod.endMode === 'semester') endD = new Date(SEMESTER_END)
        else if (mod.endMode === 'after') endD.setDate(endD.getDate() + mod.endAfterWeeks * 7)
        else if (mod.endMode === 'date' && mod.endDate) endD = parseSafeDate(mod.endDate)
        endD.setHours(23, 59, 59, 999)

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
      } else if (mod.type === 'EDIT' || mod.type === 'DELETE') {
        if (mod.dayKey === dayKey) {
          let isMatch = false
          if (mod.applyFuture) {
            if (currentD >= modDate) isMatch = true
          } else {
            if (currentD.getTime() === modDate.getTime()) isMatch = true
          }

          if (isMatch) {
            if (!result[dayKey]) result[dayKey] = {}
            if (mod.type === 'DELETE') delete result[dayKey][mod.period]
            else result[dayKey][mod.period] = { subject: mod.subject, teacher: mod.teacher }
          }
        }
      }
    })
  })
  return result
}

export function useSchedule({ lop, weekDaysDates, setToast }) {
  const [modifications, setModifications] = useState({})

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
  }, [modifications, weekDaysDates])

  function checkTeacherConflict(dayKey, period, teacher, currentLop) {
    if (!teacher) return null

    let actualDayKey = dayKey
    if (typeof dayKey === 'number' || (typeof dayKey === 'string' && !isNaN(Number(dayKey)))) {
      actualDayKey = DAY_KEYS[Number(dayKey)]
    }
    if (!actualDayKey) return null

    const normTeacher = normalizeStr(teacher)
    for (const [lopName, lopSchedule] of Object.entries(fullSchoolScheduleForWeek)) {
      if (lopName === currentLop) continue
      if (lopSchedule[actualDayKey]?.[period]) {
        if (normalizeStr(lopSchedule[actualDayKey][period].teacher) === normTeacher) {
          return lopName
        }
      }
    }
    return null
  }

  function handleSaveAdd(config) {
    const conflictLop = checkTeacherConflict(config.day, config.period, config.teacher, lop)
    if (conflictLop) {
      setToast({ message: `Cảnh báo: Giáo viên ${config.teacher} đang kẹt dạy lớp ${conflictLop} vào thời gian này!`, type: 'error' })
      return
    }
    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), { type: 'ADD', ...config }] }))
    setToast({ message: 'Thêm tiết học thành công', type: 'success' })
  }

  function handleSaveEdit({ subject, teacher, applyFuture }, editModalData) {
    const { dayKey, period, date } = editModalData
    const conflictLop = checkTeacherConflict(dayKey, period, teacher, lop)
    if (conflictLop) {
      setToast({ message: `Cảnh báo: Giáo viên ${teacher} đang kẹt dạy lớp ${conflictLop} vào thời gian này!`, type: 'error' })
      return false
    }
    setModifications(prev => ({
      ...prev,
      [lop]: [...(prev[lop] || []), { type: 'EDIT', date: dateToInputValue(date), dayKey, period, subject, teacher, applyFuture }]
    }))
    setToast({ message: 'Thay đổi thành công', type: 'success' })
    return true
  }

  function handleConfirmDelete({ applyFuture }, deleteModalData) {
    const { dayKey, period, date } = deleteModalData
    setModifications(prev => ({
      ...prev,
      [lop]: [...(prev[lop] || []), { type: 'DELETE', date: dateToInputValue(date), dayKey, period, applyFuture }]
    }))
    setToast({ message: 'Xóa môn học thành công', type: 'success' })
  }

  function handleConfirmMove({ applyFuture }, moveModalData) {
    const { source, target } = moveModalData
    const newMods = []

    const conflictSource = checkTeacherConflict(target.dayKey, target.period, source.data.teacher, lop)
    if (conflictSource) {
      setToast({ message: `Lỗi Di Chuyển: Giáo viên ${source.data.teacher} kẹt dạy lớp ${conflictSource} tại thời gian này!`, type: 'error' })
      return false
    }

    if (target.data) {
      const conflictTarget = checkTeacherConflict(source.dayKey, source.period, target.data.teacher, lop)
      if (conflictTarget) {
        setToast({ message: `Lỗi Đổi Tiết: Giáo viên ${target.data.teacher} kẹt dạy lớp ${conflictTarget} tại thời gian này!`, type: 'error' })
        return false
      }
    }

    newMods.push({ type: 'DELETE', date: dateToInputValue(new Date(source.date)), dayKey: source.dayKey, period: source.period, applyFuture })
    if (target.data) {
      newMods.push({ type: 'DELETE', date: dateToInputValue(new Date(target.date)), dayKey: target.dayKey, period: target.period, applyFuture })
    }

    newMods.push({
      type: 'ADD', date: dateToInputValue(new Date(target.date)), day: target.dayKey, period: target.period,
      subject: source.data.subject, teacher: source.data.teacher,
      repeat: applyFuture ? 'weekly' : 'none',
      endMode: applyFuture ? 'semester' : 'date', endDate: dateToInputValue(new Date(target.date)),
      customDays: applyFuture ? [target.dayIdx] : []
    })

    if (target.data) {
      newMods.push({
        type: 'ADD', date: dateToInputValue(new Date(source.date)), day: source.dayKey, period: source.period,
        subject: target.data.subject, teacher: target.data.teacher,
        repeat: applyFuture ? 'weekly' : 'none',
        endMode: applyFuture ? 'semester' : 'date', endDate: dateToInputValue(new Date(source.date)),
        customDays: applyFuture ? [source.dayIdx] : []
      })
    }

    setModifications(prev => ({ ...prev, [lop]: [...(prev[lop] || []), ...newMods] }))
    setToast({ message: target.data ? 'Đổi tiết thành công' : 'Di chuyển tiết thành công', type: 'success' })
    return true
  }

  function handleImport(rows, applyFuture = true, setToastFn, currentLop, setLop) {
    let count = 0
    let conflictError = null

    setModifications(prev => {
      const next = { ...prev }
      const pendingSlots = new Map()

      // Pass 1: validate conflicts
      for (const row of rows) {
        const { valid } = validateRow(row)
        if (!valid || !row.teacher) continue

        const d = parseSafeDate(row.date)
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
        const dayKey = DAY_KEYS[dayIndex]
        const period = Number(row.period)
        const normT = normalizeStr(row.teacher)

        const existingConflictLop = checkTeacherConflict(dayKey, period, row.teacher, row.className)
        if (existingConflictLop) {
          conflictError = `Lỗi Import: GV ${beautifyName(row.teacher)} đang kẹt dạy lớp ${existingConflictLop} (Tiết ${period}, ${dayKey}). Hãy sửa lại file Excel!`
          return prev
        }

        const slotKey = `${normT}_${dayKey}_${period}`
        if (pendingSlots.has(slotKey) && pendingSlots.get(slotKey) !== row.className) {
          conflictError = `Lỗi Import: Trong file Excel, GV ${beautifyName(row.teacher)} bị xếp dạy 2 lớp (${pendingSlots.get(slotKey)} và ${row.className}) cùng lúc ở Tiết ${period}, ${dayKey}.`
          return prev
        }
        pendingSlots.set(slotKey, row.className)
      }

      // Pass 2: apply
      for (const row of rows) {
        const { valid } = validateRow(row)
        if (!valid) continue

        const d = parseSafeDate(row.date)
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
        const dayKey = DAY_KEYS[dayIndex]
        const lopKey = row.className

        if (!next[lopKey]) next[lopKey] = []
        next[lopKey].push({
          type: 'ADD',
          day: dayKey,
          period: Number(row.period),
          subject: row.subject,
          teacher: row.teacher ? beautifyName(row.teacher) : '',
          repeat: applyFuture ? 'weekly' : 'none',
          endMode: applyFuture ? 'semester' : 'date',
          date: dateToInputValue(d),
          endDate: dateToInputValue(d)
        })
        count++
      }
      return next
    })

    if (conflictError) {
      setToast({ message: conflictError, type: 'error' })
      return { success: false }
    }

    const importedClasses = [...new Set(rows.map(r => r.className))]
    return { success: true, count, importedClasses }
  }

  return {
    modifications,
    schedule,
    fullSchoolScheduleForWeek,
    handleSaveAdd,
    handleSaveEdit,
    handleConfirmDelete,
    handleConfirmMove,
    handleImport,
  }
}