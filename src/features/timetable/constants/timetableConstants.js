export const PERIODS = [
  { period: 1,  start: '07:30', end: '08:15' },
  { period: 2,  start: '08:15', end: '09:00' },
  { period: 3,  start: '09:30', end: '10:15' },
  { period: 4,  start: '10:15', end: '11:00' },
  { period: 5,  start: '11:00', end: '11:45' },
  { period: 6,  start: '13:00', end: '13:45' },
  { period: 7,  start: '13:45', end: '14:30' },
  { period: 8,  start: '15:00', end: '15:45' },
  { period: 9,  start: '15:45', end: '16:30' },
  { period: 10, start: '16:30', end: '17:15' },
]

export const KHOI_LIST = [
  { value: 'khoi-1', label: 'Khối 01' },
  { value: 'khoi-2', label: 'Khối 02' },
  { value: 'khoi-3', label: 'Khối 03' },
  { value: 'khoi-4', label: 'Khối 04' },
  { value: 'khoi-5', label: 'Khối 05' },
]

export const LOP_BY_KHOI = {
  'khoi-1': ['1A', '1B', '1C', '1D', '1E'],
  'khoi-2': ['2A', '2B', '2C', '2D'],
  'khoi-3': ['3A', '3B', '3C', '3D'],
  'khoi-4': ['4A', '4B', '4C', '4D'],
  'khoi-5': ['5A', '5B', '5C', '5D'],
}

export const VIEW_MODE = {
  THEO_LOP: 'theo-lop',
  THEO_GIAO_VIEN: 'theo-giao-vien',
}

// Thứ Hai → Thứ Bảy (6 ngày)
export const DAY_KEYS = ['Thu Hai', 'Thu Ba', 'Thu Tu', 'Thu Nam', 'Thu Sau', 'Thu Bay']