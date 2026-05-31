export const SCHOOL_TEACHERS = [
  "Nguyễn Quang Duy", "Nguyễn Thanh Trung", "Nguyễn Thanh Dương",
  "Kiều Hoàng Vy", "Phạm Ngọc Ánh", "Phạm Thị Thọ",
  "Nguyễn Thị Mỹ Duyên", "Đặng Thị Ngọc Huyền",
  "Catarina Hoàng Hà", "Nhữ Văn Hòa", "Hoàng Thị Hà"
];

export const MOCK_SCHEDULE = {
  '1D': {}, 
  '1A': {
    'Thu Tu': {
      1: { subject: 'Toán', teacher: 'Nguyễn Quang Duy' },
      2: { subject: 'Tiếng Việt', teacher: 'Phạm Ngọc Ánh' },
      3: { subject: 'Âm nhạc', teacher: 'Kiều Hoàng Vy' }
    },
    'Thu Nam': {
      1: { subject: 'Tiếng Việt', teacher: 'Phạm Ngọc Ánh' },
      2: { subject: 'Mỹ thuật', teacher: 'Catarina Hoàng Hà' },
      4: { subject: 'Toán', teacher: 'Nguyễn Quang Duy' }
    },
    'Thu Sau': {
      1: { subject: 'Thể dục', teacher: 'Nhữ Văn Hòa' },
      3: { subject: 'Tiếng Anh', teacher: 'Đặng Thị Ngọc Huyền' }
    }
  },
  '1B': {
    'Thu Tu': {
      3: { subject: 'Toán', teacher: 'Nguyễn Quang Duy' },
      4: { subject: 'Tiếng Việt', teacher: 'Phạm Ngọc Ánh' }
    },
    'Thu Nam': {
      3: { subject: 'Tiếng Anh', teacher: 'Đặng Thị Ngọc Huyền' }
    },
    'Thu Sau': {
      2: { subject: 'Âm nhạc', teacher: 'Kiều Hoàng Vy' },
      4: { subject: 'Thể dục', teacher: 'Nhữ Văn Hòa' }
    }
  },
  '2A': {
    'Thu Tu': {
      5: { subject: 'Đạo đức', teacher: 'Phạm Thị Thọ' },
      6: { subject: 'Tiếng Việt', teacher: 'Nguyễn Thanh Dương' }
    },
    'Thu Nam': {
      5: { subject: 'Toán', teacher: 'Nguyễn Quang Duy' },
      6: { subject: 'Tự nhiên - Xã hội', teacher: 'Nguyễn Thị Mỹ Duyên' }
    }
  },
  '6A': {
    'Thu Sau': {
      5: { subject: 'Toán', teacher: 'Nguyễn Thanh Trung' },
      6: { subject: 'Tin học', teacher: 'Hoàng Thị Hà' }
    }
  }
};