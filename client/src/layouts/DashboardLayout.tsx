import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react'
import { SidebarDashboard } from './components/Dashboard/sidebar-custom'
import { Navbar } from './components/Dashboard/navbar-custom'

interface Props {
  children?: React.ReactNode
}

function DashboardLayoutInner({ children }: Props) {
  console.log('DashboardLayout')
  return (
    <section className='flex w-full h-screen overflow-hidden bg-gray-50'>
      <div className='flex flex-row w-full min-h-screen mx-auto overflow-hidden bg-grid-small-gray-200 dark:bg-grid-small-gray-100/10'>
        <SidebarDashboard />
        <div className='flex flex-col w-full'>
          <header className='sticky top-0 z-30 flex items-center border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent '>
            <Navbar />
          </header>
          <div className='pt-4 pl-4 overflow-y-auto md:pr-10 xl:pr-4'>{children}</div>
        </div>
      </div>
    </section>
  )
}
const DashboardLayout = memo(DashboardLayoutInner)
export default DashboardLayout
