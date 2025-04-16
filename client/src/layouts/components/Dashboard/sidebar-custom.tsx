import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sidebarAdmin, sidebarDoctor } from '@/data/dummy'
import { useAppSelector } from '@/redux/store'
import path from '@/constants/path'

export function SidebarDashboard() {
  const role = useAppSelector((auth) => auth.authState.role)
  const [open, setOpen] = useState(false)
  // console.log(menuItems);
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className='justify-between gap-10'>
        <div className='flex flex-col flex-1 overflow-x-hidden overflow-y-auto'>
          {open ? <Logo /> : <LogoIcon />}
          <div className='flex flex-col gap-2 mt-8'>
            {role === 'admin' && sidebarAdmin.map((item, index) => <SidebarLink key={index} link={item} />)}
            {role === 'doctor' && sidebarDoctor.map((item, index) => <SidebarLink key={index} link={item} />)}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: 'Settings',
              href: role === 'admin' ? path.settingsAdmin : path.settings,
              icon: <Settings className='flex-shrink-0 w-5 h-5 rounded-full' />
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
export const Logo = () => {
  return (
    <Link to='#' className='relative z-20 flex items-center py-1 space-x-2 text-sm font-normal text-black'>
      <div className='flex-shrink-0 w-6 h-5 bg-black rounded-tl-lg rounded-tr-sm rounded-bl-sm rounded-br-lg dark:bg-white' />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='font-medium text-black whitespace-pre dark:text-white'
      >
        Diagnosis IQ
      </motion.span>
    </Link>
  )
}
export const LogoIcon = () => {
  return (
    <Link to='#' className='relative z-20 flex items-center py-1 space-x-2 text-sm font-normal text-black'>
      <div className='flex-shrink-0 w-6 h-5 bg-black rounded-tl-lg rounded-tr-sm rounded-bl-sm rounded-br-lg dark:bg-white' />
    </Link>
  )
}
