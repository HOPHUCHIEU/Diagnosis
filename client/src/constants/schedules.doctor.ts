export const LANGUAGES = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn'] as const

export const SPECIALTIES = [
  'Tim mạch',
  'Nội khoa',
  'Nhi khoa',
  'Sản phụ khoa',
  'Da liễu',
  'Thần kinh',
  'Mắt',
  'Tai mũi họng',
  'Răng hàm mặt',
  'Ung bướu'
] as const

export const DEGREES = [
  'Bác sĩ Y khoa',
  'Bác sĩ Chuyên khoa I',
  'Bác sĩ Chuyên khoa II',
  'Thạc sĩ Y học',
  'Tiến sĩ Y học',
  'Phó Giáo sư',
  'Giáo sư'
] as const

export type Language = (typeof LANGUAGES)[number]
export type Specialty = (typeof SPECIALTIES)[number]
export type Degree = (typeof DEGREES)[number]
