export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const

export const RELATIONSHIPS = ['Vợ/Chồng', 'Cha/Mẹ', 'Con', 'Anh/Chị/Em', 'Ông/Bà', 'Họ hàng', 'Bạn', 'Khác'] as const

export const INSURANCE_PROVIDERS = [
  'Bảo hiểm y tế nhà nước',
  'Bảo Việt',
  'Prudential',
  'Manulife',
  'AIA',
  'Dai-ichi Life',
  'FWD',
  'Khác'
] as const

export type BloodType = (typeof BLOOD_TYPES)[number]
export type Relationship = (typeof RELATIONSHIPS)[number]
export type InsuranceProvider = (typeof INSURANCE_PROVIDERS)[number]
