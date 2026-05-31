import { useState } from 'react'
import { PERIODS, DAY_KEYS } from '../constants/timetableConstants'
import { getWeekDays, formatShortDate, isSameDay, DAYS_OF_WEEK } from '../../../utils/formatDate'
import { SUBJECT_COLORS } from '../../../utils/colors'

const today = new Date()

export default function TeacherTimetableGrid({ monday, schedule }) {
  // Bỏ .slice(0, 5) để hiển thị đầy đủ 6 ngày (Thứ 2 -> Thứ 7)
  const weekDays = getWeekDays(monday)
  const [activeCol, setActiveCol] = useState(null)
  const [activeRow, setActiveRow] = useState(null)

  return (
    <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 64 }} />
          {weekDays.map((_, i) => <col key={i} />)}
        </colgroup>

        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <tr>
            <th style={{
              padding: '10px 4px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
              color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
              borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)',
              background: 'var(--color-white)', textAlign: 'center',
            }}>Tiết</th>

            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today)
              const isHL = activeCol === i
              const isLast = i === weekDays.length - 1 // Fix border phải cho cột Thứ 7
              return (
                <th key={i} onClick={() => setActiveCol(p => p === i ? null : i)}
                  style={{
                    padding: '10px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    borderRight: isLast ? 'none' : '1px solid var(--color-border)',
                    background: isHL ? '#dde8fb' : isToday ? '#eef2ff' : 'var(--color-white)',
                    textAlign: 'center', cursor: 'pointer', userSelect: 'none',
                  }}>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {DAYS_OF_WEEK[day.getDay()]}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {formatShortDate(day)}
                  </div>
                  {isToday && (
                    <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', background: 'var(--color-primary)', color: '#fff', borderRadius: 999, fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                      Hôm nay
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {PERIODS.map(({ period, start, end }) => {
            const rowHL = activeRow === period
            return (
              <tr key={period}>
                <td onClick={() => setActiveRow(p => p === period ? null : period)} style={{
                  borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)',
                  textAlign: 'center', verticalAlign: 'middle', padding: '4px 2px',
                  background: rowHL ? '#dde8fb' : 'var(--color-white)',
                  cursor: 'pointer', userSelect: 'none',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{period}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{start}<br />{end}</div>
                </td>

                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, today)
                  const dayKey = DAY_KEYS[i]
                  const cell = schedule?.[dayKey]?.[period] || null
                  const isHL = activeCol === i || rowHL
                  const isLast = i === weekDays.length - 1
                  const color = cell ? (SUBJECT_COLORS[cell.subject] || { bg: '#f8fafc', border: '#94a3b8' }) : null

                  return (
                    <td key={i} style={{
                      borderBottom: '1px solid var(--color-border)',
                      borderRight: isLast ? 'none' : '1px solid var(--color-border)',
                      padding: '3px', verticalAlign: 'top',
                      background: isHL ? '#eef3fd' : isToday ? '#f5f7ff' : 'transparent',
                    }}>
                      {cell ? (
                        <div style={{
                          minHeight: 56, height: '100%',
                          borderRadius: 'var(--radius-sm)',
                          background: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                          padding: '6px 10px',
                          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
                          cursor: 'pointer',
                        }}>
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: color.border, lineHeight: 1.4 }}>
                            {cell.subject}
                          </span>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginTop: 2 }}>
                            Lớp {cell.lop}
                          </span>
                        </div>
                      ) : (
                        <div style={{ minHeight: 56, borderRadius: 'var(--radius-sm)', background: 'transparent' }} />
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}