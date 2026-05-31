export const TEACHER_SUBJECTS = {
  'Nguyễn Quang Duy':      ['Toán'],
  'Nguyễn Thanh Trung':    ['Toán', 'Tin học'],
  'Nguyễn Thanh Dương':    ['Tiếng Việt', 'Đạo đức'],
  'Phạm Ngọc Ánh':         ['Tiếng Việt'],
  'Phạm Thị Thọ':          ['Đạo đức', 'Tự nhiên - XH'],
  'Kiều Hoàng Vy':         ['Âm nhạc', 'Mỹ thuật'],
  'Như Văn Hòa':           ['Thể dục'],
  'Nguyễn Thị Mỹ Duyên':  ['Tự nhiên - XH', 'Tiếng Việt'],
  'Đặng Thị Ngọc Huyền':  ['Tiếng Anh'],
  'Catarina Hoàng Hà':     ['Mỹ thuật', 'Âm nhạc'],
  'Hoàng Thị Hà':          ['Tin học', 'Mỹ thuật'],
}

export const SUBJECTS = [
  'Toán', 'Tiếng Việt', 'Đạo đức', 'Thể dục',
  'Tự nhiên - XH', 'Âm nhạc', 'Mỹ thuật', 'Tiếng Anh', 'Tin học', 'Khác',
]

export function getTeachersForSubject(subject) {
  return Object.entries(TEACHER_SUBJECTS)
    .filter(([, subjects]) => subjects.includes(subject))
    .map(([name]) => name)
}