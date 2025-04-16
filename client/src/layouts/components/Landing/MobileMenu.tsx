import { Link, useLocation } from 'react-router-dom'
import React, { useState } from 'react'
import { useAppSelector } from '@/redux/store'
import { Menu as MenuIcon, X } from 'lucide-react'
import { animateScroll as scroll, Link as LinkScroll } from 'react-scroll'
import path from '@/constants/path'
import { logOut } from '@/redux/features/auth.slice'
import { useDispatch } from 'react-redux'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const MobileMenu = () => {
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const authenticated = useAppSelector((auth) => auth.authState.isAuthenticated)
  const role = useAppSelector((auth) => auth.authState.role)
  const [open, setOpen] = useState(false)

  const handleLogOut = () => {
    dispatch(logOut())
    setOpen(false)
  }

  return (
    <div className='block md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='rounded-full hover:bg-gray-200'>
            <MenuIcon className='w-5 h-5' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-full p-0'>
          <SheetHeader className='p-4 border-b'>
            <SheetTitle className='flex justify-center'>
              <img src='./landing/logo.svg' height={120} width={120} alt='' />
            </SheetTitle>
          </SheetHeader>

          <nav className='flex flex-col'>
            {(role === 'USER' || !authenticated) && (
              <Link
                to={!authenticated ? '/sign-in' : role === 'ADMIN' ? '/dashboard_admin' : '/dashboard'}
                className='px-4 py-2 hover:bg-accent'
                onClick={() => {
                  setOpen(false)
                  scroll.scrollToTop({ duration: 300, smooth: true })
                }}
              >
                {authenticated ? 'Dashboard' : 'Đăng nhập'}
              </Link>
            )}

            <Link
              to={path.landing}
              className='px-4 py-2 hover:bg-accent'
              onClick={() => {
                setOpen(false)
                scroll.scrollToTop({ duration: 300, smooth: true })
              }}
            >
              Trang chủ
            </Link>

            {authenticated && (
              <Link
                to={role === 'ADMIN' ? path.profileAdmin : role === 'DOCTOR' ? path.profileDoctor : path.profile}
                className='px-4 py-2 hover:bg-accent'
                onClick={() => {
                  setOpen(false)
                  scroll.scrollToTop({ duration: 300, smooth: true })
                }}
              >
                Trang cá nhân
              </Link>
            )}

            <Link
              to={path.signin}
              className={`px-4 py-2 hover:bg-accent ${authenticated ? 'hover:bg-red-300' : ''}`}
              onClick={handleLogOut}
            >
              {authenticated ? 'Đăng xuất' : 'Đăng nhập'}
            </Link>

            <Accordion type='single' collapsible>
              <AccordionItem value='services'>
                <AccordionTrigger className='px-4 font-bold text-blue_app'>Danh mục</AccordionTrigger>
                <AccordionContent>
                  <Link
                    to={path.landing}
                    className='block px-6 py-2 hover:bg-accent'
                    onClick={() => {
                      setOpen(false)
                      scroll.scrollToTop({ duration: 300, smooth: true })
                    }}
                  >
                    Khóa Diagnosis
                  </Link>
                  <Link
                    to={path.landing}
                    className='block px-6 py-2 hover:bg-accent'
                    onClick={() => {
                      setOpen(false)
                      scroll.scrollToTop({ duration: 300, smooth: true })
                    }}
                  >
                    Hội thảo trực tuyến
                  </Link>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='policies'>
                <AccordionTrigger className='px-4 font-bold text-blue_app'>Chính sách</AccordionTrigger>
                <AccordionContent>
                  <Link to={path.landing} className='block px-6 py-2 hover:bg-accent' onClick={() => setOpen(false)}>
                    Hướng dẫn thanh toán VNPAY-QR
                  </Link>
                  <Link to={path.landing} className='block px-6 py-2 hover:bg-accent' onClick={() => setOpen(false)}>
                    Chính sách bảo mật thông tin
                  </Link>
                  <Link to={path.landing} className='block px-6 py-2 hover:bg-accent' onClick={() => setOpen(false)}>
                    Chính sách vận chuyển & giao nhận
                  </Link>
                  <Link to={path.landing} className='block px-6 py-2 hover:bg-accent' onClick={() => setOpen(false)}>
                    Chính sách đổi trả & hoàn tiền
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
