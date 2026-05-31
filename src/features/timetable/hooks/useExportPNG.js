import { useRef } from 'react'
import { formatShortDate } from '../../../utils/formatDate'
import { VIEW_MODE } from '../constants/timetableConstants'
import { normalizeStr } from '../utils/timetableHelpers'

export function useExportPNG({ viewMode, lop, selectedTeacher, monday, saturday, setToast }) {
  const exportRef = useRef(null)

  async function handleExportPNG() {
    if (!exportRef.current) return

    const html2canvas = (await import('html2canvas')).default

    try {
      setToast({ message: 'Đang tạo ảnh, vui lòng không cuộn trang...', type: 'info' })

      const el = exportRef.current

      const originalStyles = {
        overflow: el.style.overflow,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
        width: el.style.width,
      }

      el.style.overflow = 'visible'
      el.style.height = 'auto'
      el.style.maxHeight = 'none'

      const scrollableChildren = Array.from(el.querySelectorAll('*')).filter(child => {
        const s = window.getComputedStyle(child)
        return s.overflow === 'auto' || s.overflow === 'scroll'
          || s.overflowY === 'auto' || s.overflowX === 'auto'
          || s.overflowY === 'scroll' || s.overflowX === 'scroll'
      })

      const childOriginals = scrollableChildren.map(child => {
        const saved = {
          el: child,
          overflow: child.style.overflow,
          overflowY: child.style.overflowY,
          overflowX: child.style.overflowX,
          height: child.style.height,
          maxHeight: child.style.maxHeight,
        }
        child.style.overflow = 'visible'
        child.style.overflowY = 'visible'
        child.style.overflowX = 'visible'
        child.style.height = 'auto'
        child.style.maxHeight = 'none'
        return saved
      })

      await new Promise(resolve => setTimeout(resolve, 80))

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
        width: el.scrollWidth,
        height: el.scrollHeight,
        onclone: (doc) => {
          doc.querySelectorAll('[data-html2canvas-ignore]').forEach(e => {
            e.style.display = 'none'
          })
          doc.querySelectorAll('*').forEach(e => {
            const s = window.getComputedStyle(e)
            if (s.overflow === 'hidden' || s.overflowY === 'hidden') {
              e.style.overflow = 'visible'
              e.style.height = 'auto'
              e.style.maxHeight = 'none'
            }
          })
        }
      })

      Object.assign(el.style, originalStyles)
      childOriginals.forEach(({ el, overflow, overflowY, overflowX, height, maxHeight }) => {
        el.style.overflow = overflow
        el.style.overflowY = overflowY
        el.style.overflowX = overflowX
        el.style.height = height
        el.style.maxHeight = maxHeight
      })

      const dataURL = canvas.toDataURL('image/png')
      const weekStr = `${formatShortDate(monday).replace('/', '')}-${formatShortDate(saturday).replace('/', '')}`
      const prefix = viewMode === VIEW_MODE.THEO_LOP
        ? `Lop_${lop}`
        : `GV_${normalizeStr(selectedTeacher)}`
      const defaultFileName = `TKB_${prefix}_Tuan_${weekStr}.png`

      if (window.showSaveFilePicker) {
        try {
          const blob = await (await fetch(dataURL)).blob()
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: defaultFileName,
            types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
          })
          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()
          setToast({ message: 'Lưu ảnh PNG thành công!', type: 'success' })
          return
        } catch (err) {
          if (err.name === 'AbortError') return
        }
      }

      const link = document.createElement('a')
      link.href = dataURL
      link.download = defaultFileName
      link.click()
      setToast({ message: 'Xuất ảnh PNG thành công!', type: 'success' })
    } catch (error) {
      console.error('Lỗi khi xuất ảnh:', error)
      setToast({ message: 'Có lỗi xảy ra khi tạo ảnh', type: 'error' })
    }
  }

  return { exportRef, handleExportPNG }
}