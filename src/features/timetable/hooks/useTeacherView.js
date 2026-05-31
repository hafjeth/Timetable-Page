import { useMemo } from 'react'
import { SCHOOL_TEACHERS } from '../data/mockSchedule'
import { normalizeStr, beautifyName } from '../utils/timetableHelpers'

export function useTeacherView({ fullSchoolScheduleForWeek, selectedTeacher }) {
  const allTeachers = useMemo(() => {
    const teacherMap = new Map()
    SCHOOL_TEACHERS.forEach(name => {
      teacherMap.set(normalizeStr(name), { originalName: name, subjectSet: new Set() })
    })

    Object.values(fullSchoolScheduleForWeek).forEach(lopSchedule => {
      Object.values(lopSchedule).forEach(daySchedule => {
        Object.values(daySchedule).forEach(({ subject, teacher }) => {
          if (teacher) {
            const norm = normalizeStr(teacher)
            if (!teacherMap.has(norm)) {
              teacherMap.set(norm, { originalName: beautifyName(teacher), subjectSet: new Set() })
            }
            if (subject) teacherMap.get(norm).subjectSet.add(subject)
          }
        })
      })
    })

    return Array.from(teacherMap.values())
      .map(t => ({
        name: t.originalName,
        subjects: Array.from(t.subjectSet).join(', '),
        label: t.originalName,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'))
  }, [fullSchoolScheduleForWeek])

  const teacherSchedule = useMemo(() => {
    if (!selectedTeacher) return {}
    const res = {}
    const normSelected = normalizeStr(selectedTeacher)

    Object.entries(fullSchoolScheduleForWeek).forEach(([lopName, lopSchedule]) => {
      Object.entries(lopSchedule).forEach(([dayKey, daySchedule]) => {
        Object.entries(daySchedule).forEach(([period, cell]) => {
          if (normalizeStr(cell.teacher) === normSelected) {
            if (!res[dayKey]) res[dayKey] = {}
            const p = Number(period)

            if (!res[dayKey][p]) {
              res[dayKey][p] = {
                subject: cell.subject || '',
                subjectName: cell.subject || '',
                lop: lopName,
                className: lopName,
                class: lopName,
                teacher: cell.teacher || '',
                isConflict: false,
              }
            } else {
              res[dayKey][p].lop += `, ${lopName}`
              res[dayKey][p].className += `, ${lopName}`
              res[dayKey][p].class += `, ${lopName}`
              if (cell.subject && !String(res[dayKey][p].subject).includes(cell.subject)) {
                res[dayKey][p].subject += ` / ${cell.subject}`
                res[dayKey][p].subjectName += ` / ${cell.subject}`
              }
              res[dayKey][p].isConflict = true
            }
          }
        })
      })
    })
    return res
  }, [fullSchoolScheduleForWeek, selectedTeacher])

  const teacherSubjects = useMemo(() => {
    if (!selectedTeacher) return []
    const subjects = new Set()
    const normSelected = normalizeStr(selectedTeacher)

    Object.values(fullSchoolScheduleForWeek).forEach(lopSchedule => {
      Object.values(lopSchedule).forEach(daySchedule => {
        Object.values(daySchedule).forEach(cell => {
          if (normalizeStr(cell.teacher) === normSelected && cell.subject) {
            subjects.add(cell.subject)
          }
        })
      })
    })
    return [...subjects]
  }, [fullSchoolScheduleForWeek, selectedTeacher])

  return { allTeachers, teacherSchedule, teacherSubjects }
}