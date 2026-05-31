import { useState } from 'react'
import { PERIODS, DAY_KEYS } from '../constants/timetableConstants'
import { getWeekDays, formatShortDate, isSameDay, DAYS_OF_WEEK } from '../../../utils/formatDate'
import TimetableCell from './TimetableCell'

const today = new Date()

// Đã cập nhật props thành searchFilters (số nhiều)
export default function TimetableGrid({ monday, schedule, searchFilters, onCellClick, onEditClick, onDeleteClick, onMoveClick }) {
  const weekDays = getWeekDays(monday)
  const [activeCol, setActiveCol] = useState(null)
  const [activeRow, setActiveRow] = useState(null)
  const [dragOverCell, setDragOverCell] = useState(null)

  const hasFilter = searchFilters && searchFilters.length > 0

  // KIỂM TRA LỌC THEO MẢNG
  function isMatch(cellData) {
    if (!cellData || !hasFilter) return false
    // Chỉ cần khớp 1 trong số các bộ lọc là sẽ highlight lên
    return searchFilters.some(filter => {
      if (filter.type === 'teacher') return cellData.teacher === filter.value
      if (filter.type === 'subject') return cellData.subject === filter.value
      return false
    })
  }

  function handleHeaderClick(colIdx) {
    if (hasFilter) return
    setActiveCol(prev => prev === colIdx ? null : colIdx)
    setActiveRow(null)
  }

  function handlePeriodClick(period) {
    if (hasFilter) return
    setActiveRow(prev => prev === period ? null : period)
    setActiveCol(null)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 64 }} />
          {weekDays.map((_, i) => <col key={i} />)}
        </colgroup>

        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <tr>
            <th style={{ padding: '10px 4px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', background: 'var(--color-white)', textAlign: 'center' }}>Tiết</th>
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today)
              const isHL = !hasFilter && activeCol === i
              const isLast = i === weekDays.length - 1
              return (
                <th key={i} onClick={() => handleHeaderClick(i)} style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)', borderRight: !isLast ? '1px solid var(--color-border)' : 'none', background: isHL ? '#dde8fb' : isToday ? '#eef2ff' : 'var(--color-white)', textAlign: 'center', cursor: hasFilter ? 'default' : 'pointer', userSelect: 'none', transition: 'background 0.15s' }}>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text)' }}>{DAYS_OF_WEEK[day.getDay()]}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{formatShortDate(day)}</div>
                  {isToday && (<div style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', background: 'var(--color-primary)', color: '#fff', borderRadius: 999, fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Hôm nay</div>)}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {PERIODS.map(({ period, start, end }) => {
            const rowHL = !hasFilter && activeRow === period
            return (
              <tr key={period}>
                <td onClick={() => handlePeriodClick(period)} style={{ borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', textAlign: 'center', verticalAlign: 'middle', padding: '4px 2px', background: rowHL ? '#dde8fb' : 'var(--color-white)', cursor: hasFilter ? 'default' : 'pointer', userSelect: 'none', transition: 'background 0.15s' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{period}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{start}<br />{end}</div>
                </td>

                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, today)
                  const dayKey = DAY_KEYS[i]
                  const cellData = schedule?.[dayKey]?.[period] || null
                  
                  const isTargetCell = dragOverCell === `${dayKey}-${period}`
                  const isHL = !hasFilter && (activeCol === i || rowHL)
                  const matched = hasFilter && isMatch(cellData)
                  const dimmed = hasFilter && !matched
                  const isLast = i === weekDays.length - 1

                  return (
                    <td key={i} 
                      onDragEnter={(e) => { if (!hasFilter) setDragOverCell(`${dayKey}-${period}`) }}
                      onDragLeave={(e) => { if (!hasFilter && dragOverCell === `${dayKey}-${period}`) setDragOverCell(null) }}
                      onDragOver={(e) => { if (!hasFilter) e.preventDefault() }}
                      onDrop={(e) => {
                        if (hasFilter) return
                        e.preventDefault()
                        setDragOverCell(null)
                        try {
                          const sourceStr = e.dataTransfer.getData('application/json')
                          if (!sourceStr) return
                          const source = JSON.parse(sourceStr)
                          const target = { dayKey, period, data: cellData, dayIdx: i, date: weekDays[i] }
                          if (source.dayKey === target.dayKey && source.period === target.period) return
                          onMoveClick?.({ source, target })
                        } catch (err) {}
                      }}
                      style={{ 
                        borderBottom: '1px solid var(--color-border)', 
                        borderRight: !isLast ? '1px solid var(--color-border)' : 'none', 
                        padding: '3px', verticalAlign: 'top', 
                        background: isTargetCell ? '#eff6ff' : (isHL ? '#eef3fd' : isToday && !hasFilter ? '#f5f7ff' : 'transparent'), 
                        boxShadow: isTargetCell ? 'inset 0 0 0 2px var(--color-primary)' : 'none',
                        transition: 'all 0.15s ease' 
                      }}
                    >
                      <TimetableCell
                        data={cellData}
                        isToday={isToday}
                        isHighlighted={isHL}
                        matched={matched}
                        dimmed={dimmed}
                        draggable={!hasFilter && !!cellData}
                        onDragStart={(e) => {
                          if (hasFilter || !cellData) { e.preventDefault(); return; }
                          e.dataTransfer.setData('application/json', JSON.stringify({ dayKey, period, data: cellData, dayIdx: i, date: weekDays[i] }))
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onClick={() => onCellClick?.({ day: dayKey, period, data: cellData, dayIdx: i })}
                        onEdit={() => onEditClick?.({ dayKey, period, data: cellData, dayIdx: i, date: weekDays[i] })}
                        onDelete={() => onDeleteClick?.({ dayKey, period, data: cellData, dayIdx: i, date: weekDays[i] })}
                      />
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