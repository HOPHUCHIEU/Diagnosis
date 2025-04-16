import path from '@/constants/path'
import { logOut } from '@/redux/features/auth.slice'
import { authApi } from '@/redux/services/authApi'
import { useAppSelector } from '@/redux/store'
import { getAvatarUrl } from '@/utils/user'
import { CreditCard, Home, LogOut, User } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'

export default function CardUser() {
  const { i18n, t } = useTranslation('landing')
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const user = useAppSelector((state) => state.authState.user)
  const role = useAppSelector((auth) => auth.authState.role)

  const handleLogout = () => {
    dispatch(logOut())
    dispatch(authApi.util.resetApiState())
  }

  if (!user) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='box-border flex items-center h-full cursor-pointer max-w-fit'>
          <Avatar>
            <AvatarImage src={getAvatarUrl(user ?? undefined)} alt='Avatar' />
            <AvatarFallback>{user?.profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <p className='ml-2 text-sm max-w-[180px] truncate'>
            <span className='hidden md:contents'>Hi, </span>
            <span className='hidden overflow-hidden md:contents'>{user?.profile?.fullName}</span>
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuGroup>
          {role !== 'user' && (
            <DropdownMenuItem>
              <Home className='w-4 h-4 mr-2' />
              <Link to={pathname.match('dashboard') ? '/' : role === 'admin' ? path.dashboard_admin : path.dashboard}>
                {pathname.match('dashboard') ? 'Landing' : 'Dashboard'}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <User className='w-4 h-4 mr-2' />
            <Link
              to={
                user.role === 'admin' ? path.profileAdmin : user.role === 'doctor' ? path.profileDoctor : path.profile
              }
            >
              {' '}
              {t('user.profile')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='!text-red-600 rounded-md cursor-pointer hover:!bg-red-500 hover:!text-white'
          onClick={handleLogout}
        >
          <LogOut className='w-4 h-4 mr-2' />
          <span>{t('header.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
