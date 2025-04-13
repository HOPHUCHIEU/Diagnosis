const path = {
  landing: '/',
  about: '/about',
  signin: '/sign-in',
  register: '/register',
  services: '/services',
  contact: '/contact',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  logout: '/logout',
  // User
  profile: '/profile',
  profileDoctorPublic: '/doctor/:doctorId',
  payment: '/payment',
  booking: '/booking',
  // Doctor
  dashboard: '/dashboard',
  profileDoctor: '/profile-doctor',
  settings: '/settings',
  workScheduleDoctor: '/doctor-work-schedule',
  appoitmentDoctor: '/doctor-appointment',

  // Admin
  dashboard_admin: '/dashboard-admin',
  userManage: '/user-manage',
  paymentManage: '/payment-manage',
  appointmentAdmin: '/appointment-manage',
  profileAdmin: '/profile-admin',
  settingsAdmin: '/settings-admin',
  workSchedule: '/work-schedule',
  packageManage: '/package-manage',

  // Video Call
  videoRoom: '/room/:roomId'
} as const
export default path
