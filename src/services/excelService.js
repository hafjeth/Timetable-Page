/**
 * excelService.js
 * Parse file .xlsx thời khóa biểu
 * Cấu trúc cột: A: Ngày (dd/MM/yyyy) | B: Tiết số | C: Tên lớp | D: Môn học | E: Giáo viên (tùy chọn)
 *
 * Cần cài: npm install xlsx
 */
import * as XLSX from 'xlsx'

/**
 * Đọc file .xlsx và trả về danh sách các tiết học thô
 * @param {File} file
 * @returns {Promise<Array>} rows - mảng object { date, period, className, subject, teacher }
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        const parsed = []

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          // Bỏ qua hàng trống hoặc header
          if (!row[0] || !row[1] || !row[2] || !row[3]) continue

          // Cột A: Ngày — hỗ trợ cả Date object (xlsx cellDates) và string dd/MM/yyyy
          let dateObj = null
          if (row[0] instanceof Date) {
            dateObj = row[0]
          } else if (typeof row[0] === 'string') {
            const parts = row[0].split('/')
            if (parts.length === 3) {
              // dd/MM/yyyy
              dateObj = new Date(
                parseInt(parts[2]),
                parseInt(parts[1]) - 1,
                parseInt(parts[0])
              )
            }
          }

          if (!dateObj || isNaN(dateObj.getTime())) continue

          const period = parseInt(row[1])
          if (isNaN(period) || period < 1 || period > 10) continue

          parsed.push({
            date: dateObj,
            period,
            className: String(row[2]).trim(),
            subject: String(row[3]).trim(),
            teacher: row[4] ? String(row[4]).trim() : '',
          })
        }

        resolve(parsed)
      } catch (err) {
        reject(new Error('Không thể đọc file. Vui lòng kiểm tra định dạng .xlsx.'))
      }
    }

    reader.onerror = () => reject(new Error('Lỗi đọc file.'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Chuyển ngày sang dayKey dùng trong schedule state
 * dayOfWeek: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
 */
const DAY_KEY_MAP = {
  1: 'Thu Hai',
  2: 'Thu Ba',
  3: 'Thu Tu',
  4: 'Thu Nam',
  5: 'Thu Sau',
  6: 'Thu Bay',
}

export function dateToDayKey(date) {
  return DAY_KEY_MAP[date.getDay()] || null
}

/**
 * Format date thành chuỗi dd/MM/yyyy để hiển thị
 */
export function formatDateVN(date) {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

/**
 * Validate một row parsed
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRow(row) {
  const dayKey = dateToDayKey(row.date)
  if (!dayKey) return { valid: false, error: 'Ngày không hợp lệ (chỉ Thứ 2 → Thứ 7)' }
  if (!row.subject) return { valid: false, error: 'Thiếu tên môn học' }
  if (!row.className) return { valid: false, error: 'Thiếu tên lớp' }
  return { valid: true }
}

/**
 * Chuyển danh sách rows đã parse thành schedule object
 * schedule[lop][dayKey][period] = { subject, teacher }
 */
export function rowsToSchedule(rows) {
  const schedule = {}

  for (const row of rows) {
    const { valid } = validateRow(row)
    if (!valid) continue

    const dayKey = dateToDayKey(row.date)
    const lop = row.className

    if (!schedule[lop]) schedule[lop] = {}
    if (!schedule[lop][dayKey]) schedule[lop][dayKey] = {}

    schedule[lop][dayKey][row.period] = {
      subject: row.subject,
      teacher: row.teacher || '',
    }
  }

  return schedule
}

/**
 * Tạo file Excel mẫu để tải về
 */
export function downloadSampleExcel() {
  const sampleData = [
    ['Ngày (dd/MM/yyyy)', 'Tiết số', 'Tên lớp', 'Môn học', 'Giáo viên (tùy chọn)'],
    ['18/05/2026', 1, '1D', 'Toán', 'Nguyễn Quang Duy'],
    ['18/05/2026', 2, '1D', 'Tiếng Việt', 'Phạm Ngọc Ánh'],
    ['18/05/2026', 3, '1D', 'Âm nhạc', 'Kiều Hoàng Vy'],
    ['19/05/2026', 1, '1D', 'Tiếng Việt', 'Phạm Ngọc Ánh'],
    ['19/05/2026', 2, '1D', 'Toán', 'Nguyễn Quang Duy'],
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(sampleData)
  ws['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, ws, 'ThoiKhoaBieu')
  XLSX.writeFile(wb, 'TKB_mau.xlsx')
}