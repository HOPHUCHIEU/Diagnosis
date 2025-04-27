import path from '@/constants/path'
import {
  CalendarDays,
  CircleUserRound,
  CreditCard,
  FolderClock,
  LayoutDashboard,
  Package,
  UsersRound
} from 'lucide-react'

export const sidebarAdmin = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className='flex-shrink-0 w-5 h-5' />,
    href: path.dashboard_admin
  },
  {
    label: 'Quản lý người dùng',
    icon: <UsersRound className='flex-shrink-0 w-5 h-5' />,
    href: path.userManage
  },
  {
    label: 'Quản lý hóa đơn',
    icon: <CreditCard className='flex-shrink-0 w-5 h-5' />,
    href: path.paymentManage
  },
  {
    label: 'Quản lý lịch hẹn',
    icon: <FolderClock className='flex-shrink-0 w-5 h-5' />,
    href: path.appointmentAdmin
  },
  {
    label: 'Quản lý gói khám',
    icon: <Package className='flex-shrink-0 w-5 h-5' />,
    href: path.packageManage
  },
  {
    label: 'Lịch làm việc',
    icon: <CalendarDays className='flex-shrink-0 w-5 h-5' />,
    href: path.workSchedule
  },
  {
    label: 'Profile',
    icon: <CircleUserRound className='flex-shrink-0 w-5 h-5' />,
    href: path.profileAdmin
  }
]
export const sidebarDoctor = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className='flex-shrink-0 w-5 h-5' />,
    href: path.dashboard
  },
  {
    label: 'Lịch làm việc',
    icon: <CalendarDays className='flex-shrink-0 w-5 h-5' />,
    href: path.workScheduleDoctor
  },
  {
    label: 'Lịch hẹn',
    icon: <FolderClock className='flex-shrink-0 w-5 h-5' />,
    href: path.appoitmentDoctor
  },
  {
    label: 'Profile',
    icon: <CircleUserRound className='flex-shrink-0 w-5 h-5' />,
    href: path.profileDoctor
  }
]
