import { ChevronRight } from 'lucide-react'
import CardUser from '../CardUser'
import { useLocation } from 'react-router-dom'
import path from '@/constants/path'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const breadcrumbNameMap: Record<string, string> = {
  // Doctor
  [path.dashboard]: 'Dashboard',
  [path.profileDoctor]: 'Profile Doctor',
  [path.settings]: 'Settings',
  [path.workScheduleDoctor]: 'Work Schedule',
  [path.appoitmentDoctor]: 'Appointment Manage',
  // Admin
  [path.dashboard_admin]: 'Admin Dashboard',
  [path.userManage]: 'User Manage',
  [path.paymentManage]: 'Payment Manage',
  [path.workSchedule]: 'Work Schedule Manage',
  [path.profileAdmin]: 'Profile Admin',
  [path.settingsAdmin]: 'Settings',
  [path.appointmentAdmin]: 'Appointment Manage',
  [path.packageManage]: 'Package Manage'
}

export const Navbar = () => {
  const location = useLocation()
  const pathSnippets = location.pathname.split('/').filter((i) => i)
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    const title = breadcrumbNameMap[url] || url
    return { href: url, title }
  })

  return (
    <div className='flex items-center w-[-webkit-fill-available] justify-between py-2 bg-background border-b border-border z-50'>
      <div className='flex items-center'>
        <nav className='hidden ml-5 md:flex' aria-label='Breadcrumb'>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.href}>
                  <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className='w-4 h-4' />
                    </BreadcrumbSeparator>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
      </div>
      <div className='flex items-center mr-4'>
        <CardUser />
      </div>
    </div>
  )
}
