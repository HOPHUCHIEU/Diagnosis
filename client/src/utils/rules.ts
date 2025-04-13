import * as yup from 'yup'

const CCCD_REGX = /^[0-9]{12}$/
const EMAIL_REGX =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const schema = yup.object({
  email: yup
    .string()
    .matches(EMAIL_REGX, 'Email không đúng định dạng')
    .required('Email là bắt buộc')
    .email('Email không đúng định dạng')
    .min(5, 'Độ dài từ 5 đến 160 kí tự')
    .max(160, 'Độ dài từ 5 đến 160 kí tự'),
  fullName: yup.string().required('Nhập vào tên đầy đủ của bạn').min(2, 'Độ dài từ 2 kí tự'),
  firstName: yup.string().required('Nhập vào họ và tên lót của bạn').min(2, 'Độ dài từ 2 kí tự'),
  lastName: yup.string().required('Nhập vào tên của bạn').min(2, 'Độ dài từ 2 kí tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, 'Số điện thoại không hợp lệ'),
  license_number: yup.string().required('Số CCCD là bắt buộc').matches(CCCD_REGX, 'Số CCCD phải gồm 12 chữ số'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  birth: yup
    .date()
    .required('Ngày tháng năm sinh là bắt buộc')
    .max(new Date(), 'Ngày tháng năm sinh không thể ở tương lai')
    .typeError('Ngày tháng năm sinh không hợp lệ'),
  yearGraduation: yup
    .number()
    .required('Năm tốt nghiệp là bắt buộc')
    .min(1945, 'Năm tốt nghiệp không thể nhỏ hơn 1945')
    .max(new Date().getFullYear(), `Năm tốt nghiệp không thể lớn hơn ${new Date().getFullYear()}`)
    .typeError('Năm tốt nghiệp phải là số'),
  highestDegree: yup
    .string()
    .required('Trình độ học vấn là bắt buộc')
    .oneOf(['High School', 'Associate', 'Bachelor', 'Master', 'PhD'], 'Trình độ học vấn không hợp lệ'),
  old_password: yup
    .string()
    .required('Mật khẩu cũ là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 kí tự')
    .max(160, 'Độ dài từ 6 đến 160 kí tự'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 kí tự')
    .max(160, 'Độ dài từ 6 đến 160 kí tự'),
  confirm_password: yup
    .string()
    .required('Nhập lại mật khẩu là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 kí tự')
    .max(160, 'Độ dài từ 6 đến 160 kí tự')
    .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp'),
  roles: yup.string().oneOf(['USER', 'ADMIN', 'DOCTOR'], 'Vai trò không hợp lệ').required('Vai trò là bắt buộc'),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'BLOCK', 'UNVERIFY'], 'Trạng thái không hợp lệ')
    .required('Trạng thái là bắt buộc')
})

export const adminUpdateUserSchema = yup.object({
  firstName: yup.string().required('Nhập vào họ và tên lót của bạn').min(2, 'Độ dài từ 2 kí tự'),
  lastName: yup.string().required('Nhập vào tên của bạn').min(2, 'Độ dài từ 2 kí tự'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, 'Số điện thoại không hợp lệ'),
  birth: yup.date().nullable(),
  gender: yup.string().oneOf(['male', 'female'], 'Vui lòng chọn giới tính'),
  role: yup.string().oneOf(['user', 'doctor'], 'Vui lòng chọn vai trò'),
  address: yup.string(),
  disabled: yup.boolean(),
  isVerified: yup.boolean()
})

export type AdminUpdateUserSchema = yup.InferType<typeof adminUpdateUserSchema>

export const createUserSchema = yup.object({
  email: yup.string().required('Vui lòng nhập email').email('Email không hợp lệ'),
  password: yup.string().required('Vui lòng nhập mật khẩu').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  firstName: yup.string().required('Nhập vào họ và tên lót của bạn').min(2, 'Độ dài từ 2 kí tự'),
  lastName: yup.string().required('Nhập vào tên của bạn').min(2, 'Độ dài từ 2 kí tự'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, 'Số điện thoại không hợp lệ'),
  role: yup.string().oneOf(['user', 'doctor'], 'Vui lòng chọn vai trò').required('Vui lòng chọn vai trò'),
  gender: yup.string().oneOf(['male', 'female'], 'Vui lòng chọn giới tính').required('Vui lòng chọn giới tính'),
  birth: yup
    .date()
    .required('Vui lòng chọn ngày sinh')
    .max(new Date(), 'Ngày sinh không thể ở tương lai')
    .typeError('Ngày sinh không hợp lệ')
})

export type CreateUserSchema = yup.InferType<typeof createUserSchema>

export const doctorProfileSchema = yup.object({
  licenseNumber: yup.string().required('Vui lòng nhập số giấy phép'),
  specialties: yup.array().of(yup.string().required()).default([]),
  yearsOfExperience: yup.number().required('Vui lòng nhập số năm kinh nghiệm').min(0, 'Số năm không hợp lệ'),
  education: yup
    .array()
    .of(
      yup.object({
        degree: yup.string().required('Vui lòng nhập bằng cấp'),
        university: yup.string().required('Vui lòng nhập trường'),
        graduationYear: yup
          .number()
          .required('Vui lòng nhập năm tốt nghiệp')
          .min(1945, 'Năm tốt nghiệp không hợp lệ')
          .max(new Date().getFullYear(), 'Năm tốt nghiệp không hợp lệ'),
        specialization: yup.string().required('Vui lòng nhập chuyên ngành')
      })
    )
    .default([]),
  certificates: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required('Vui lòng nhập tên chứng chỉ'),
        issuedBy: yup.string().required('Vui lòng nhập nơi cấp'),
        issueDate: yup.string().required('Vui lòng nhập ngày cấp'),
        expiryDate: yup.string().required('Vui lòng nhập ngày hết hạn')
      })
    )
    .default([]),
  languages: yup.array().of(yup.string().required()).default(['Tiếng Việt']),
  biography: yup.string().required('Vui lòng nhập tiểu sử'),
  achievements: yup.array().of(yup.string()).default([]),
  consultationFee: yup.number().required('Vui lòng nhập phí tư vấn').min(0, 'Phí tư vấn không hợp lệ'),
  isAvailable: yup.boolean().default(true),
  profileImage: yup.string().nullable()
})

export type DoctorProfileSchema = yup.InferType<typeof doctorProfileSchema>

export const patientRecordSchema = yup.object({
  occupation: yup.string().required('Vui lòng nhập nghề nghiệp'),
  bloodType: yup.string().required('Vui lòng chọn nhóm máu'),
  height: yup.number().required('Vui lòng nhập chiều cao').min(0, 'Chiều cao không hợp lệ'),
  weight: yup.number().required('Vui lòng nhập cân nặng').min(0, 'Cân nặng không hợp lệ'),
  allergies: yup.array().of(yup.string()).default([]),
  chronicDiseases: yup.array().of(yup.string()).default([]),
  familyHistory: yup.string(),
  surgeryHistory: yup.string(),
  isPregnant: yup.boolean().default(false),
  currentMedications: yup.array().of(yup.string()).default([]),
  lifestyle: yup.object({
    smoking: yup.boolean().required(),
    alcohol: yup.boolean().required(),
    exercise: yup.string(),
    diet: yup.string()
  }),
  emergencyContact: yup.object({
    name: yup.string().required('Vui lòng nhập tên người liên hệ khẩn cấp'),
    phone: yup
      .string()
      .required('Vui lòng nhập số điện thoại')
      .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, 'Số điện thoại không hợp lệ'),
    relationship: yup.string().required('Vui lòng nhập mối quan hệ')
  }),
  insurance: yup.object({
    number: yup.string().required('Vui lòng nhập số bảo hiểm'),
    provider: yup.string().required('Vui lòng nhập nhà cung cấp bảo hiểm'),
    expired: yup.string().required('Vui lòng nhập ngày hết hạn')
  })
})

export type PatientRecordSchema = yup.InferType<typeof patientRecordSchema>

export type Schema = yup.InferType<typeof schema>
