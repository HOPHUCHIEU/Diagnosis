import { useState, useEffect, useCallback } from 'react'
import { MobileMenu } from './MobileMenu'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { animateScroll as scroll } from 'react-scroll'
import { useAppSelector } from '@/redux/store'
import CardUser from '../CardUser'
import path from '@/constants/path'
import { ModalSearch } from '../Modal'
import { useTranslation } from 'react-i18next'
import { ModeToggleI18n } from '@/components/Global/mode-toggle-i18'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const Container = styled.div`
  .ant-drawer .antd-drawer-content-wrapper .antd-drawer-content .ant-drawer-body {
    padding: 0px !important;
  }
`

export const Header = () => {
  const { i18n, t } = useTranslation('landing')
  const [scrollActive, setScrollActive] = useState(false)
  const user = useAppSelector((auth) => auth.authState.user)

  useEffect(() => {
    localStorage.setItem('preferredTheme', 'light')
  }, [])

  const handleScroll = useCallback(() => {
    setScrollActive(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleScrollToTop = useCallback(() => {
    scroll.scrollToTop({ duration: 300, smooth: true })
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-250 ease-out bg-white ${scrollActive ? 'shadow-md' : ''}`}
    >
      <nav className='flex items-center justify-between max-w-screen-xl px-6 py-4 mx-auto'>
        {/* Logo */}
        <Link to={path.landing} className='text-2xl font-bold text-black'>
          <img src='/landing/logo.svg' alt='Logo' className='h-8' />
        </Link>

        {/* Navigation Links */}
        <ul className='hidden space-x-2 text-black md:flex '>
          <li>
            <Link
              to={path.landing}
              className={
                buttonVariants({ effect: 'hoverUnderline', variant: 'link' }) +
                ' hover:!text-primary !font-normal !text-base'
              }
            >
              {t('header.home')}
            </Link>
          </li>
          <li>
            <Link
              to={path.about}
              className={
                buttonVariants({ effect: 'hoverUnderline', variant: 'link' }) +
                ' hover:!text-primary !font-normal !text-base'
              }
            >
              {t('header.about')}
            </Link>
          </li>
          <li>
            <Link
              to={path.services}
              className={
                buttonVariants({ effect: 'hoverUnderline', variant: 'link' }) +
                ' hover:!text-primary !font-normal !text-base'
              }
            >
              {t('header.services')}
            </Link>
          </li>
          <li>
            <Link
              to={path.contact}
              className={
                buttonVariants({ effect: 'hoverUnderline', variant: 'link' }) +
                ' hover:!text-primary !font-normal !text-base'
              }
            >
              {t('header.contact')}
            </Link>
          </li>
        </ul>

        {/* Login / Register Button */}
        <div className='flex items-center text-lg font-Medium'>
          <ModeToggleI18n />
          <MobileMenu />
          <span className='hidden ml-2 w-max md:block'>
            {user && <CardUser />}
            {!user && (
              <div className='flex items-center w-max'>
                <Link
                  className={cn(buttonVariants({ effect: 'shineHover' }), '!rounded-full !px-3 !py-2 min-w-[98px]')}
                  to={path.signin}
                  onClick={() => handleScrollToTop}
                >
                  {t('header.login')}
                </Link>
              </div>
            )}
          </span>
        </div>
      </nav>
    </header>
  )
}
