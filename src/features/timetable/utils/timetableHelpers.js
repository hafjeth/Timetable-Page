import { MOCK_SCHEDULE } from '../data/mockSchedule'

// Lấy danh sách tất cả giáo viên từ toàn bộ schedule
export function getAllTeachers() {
  const teachers = {}
  Object.values(MOCK_SCHEDULE).forEach(lopSchedule => {
    Object.values(lopSchedule).forEach(daySchedule => {
      Object.values(daySchedule).forEach(({ subject, teacher }) => {
        if (!teachers[teacher]) teachers[teacher] = { name: teacher, subjectSet: new Set() }
        teachers[teacher].subjectSet.add(subject)
      })
    })
  })
  return Object.values(teachers).map(t => ({
    name: t.name,
    subjects: [...t.subjectSet],
    label: `${t.name} (${[...t.subjectSet].join(', ')})`,
  })).sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

// Build schedule theo giáo viên: { dayKey: { period: { subject, lop } } }
export function getScheduleByTeacher(teacherName) {
  const result = {}
  Object.entries(MOCK_SCHEDULE).forEach(([lop, lopSchedule]) => {
    Object.entries(lopSchedule).forEach(([day, daySchedule]) => {
      Object.entries(daySchedule).forEach(([period, cell]) => {
        if (cell.teacher === teacherName) {
          if (!result[day]) result[day] = {}
          result[day][Number(period)] = { subject: cell.subject, lop }
        }
      })
    })
  })
  return result
}

// Lấy danh sách môn GV đó dạy
export function getSubjectsByTeacher(teacherName) {
  const subjects = new Set()
  Object.values(MOCK_SCHEDULE).forEach(lopSchedule => {
    Object.values(lopSchedule).forEach(daySchedule => {
      Object.values(daySchedule).forEach(cell => {
        if (cell.teacher === teacherName) subjects.add(cell.subject)
      })
    })
  })
  return [...subjects]
}