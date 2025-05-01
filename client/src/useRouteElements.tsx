import { memo, useMemo } from 'react'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import path from './constants/path'
import { useAppSelector } from './redux/store'
import DefaultLayout from './layouts/DefaultLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { SignIn, SignUp, VerifyEmail, ForgotPassword } from './pages/NotAuth'
import { Page_404 } from './pages/NotFound'
import { About, DoctorProfile, Landing, Service, Contact } from './pages/Landing'
import { Profile } from './pages/Dashboard/user'
import {
  AppointmentDoctor,
  DashboardDoctor,
  ProfileDoctor,
  SettingsDoctor,
  WorkScheduleDoctor
} from './pages/Dashboard/doctor'
import {
  AppointmentManage,
  DashboardAdmin,
  PackageManage,
  PaymentManage,
  ProfileAdmin,
  SettingsAdmin,
  UserManage,
  WorkSchedule
} from './pages/Dashboard/admin'
import VideoRoom from './pages/VideoCall/VideoRoom'

type ProtectedRouteProps = {
  allowedRole: 'user' | 'admin' | 'doctor'
}

function useAuth() {
  const { isAuthenticated, role: roleUser } = useAppSelector((state) => state.authState)

  const isAdmin = isAuthenticated && roleUser === 'admin'
  const isDoctor = isAuthenticated && roleUser === 'doctor'
  const isUser = isAuthenticated && roleUser === 'user'
  const isAuth = isAuthenticated && (isAdmin || isUser || isDoctor)

  return { isAuthenticated, roleUser, isAdmin, isDoctor, isUser, isAuth }
}

const rejectedRoutes = [
  {
    path: path.signin,
    element: <SignIn />
  },
  {
    path: path.register,
    element: <SignUp />
  },
  {
    path: path.verifyEmail,
    element: <VerifyEmail />
  },
  {
    path: path.forgotPassword,
    element: <ForgotPassword />
  }
]

const publicRoutes = [
  {
    path: path.about,
    element: <About />
  },
  {
    path: path.services,
    element: <Service />
  },
  {
    path: path.contact,
    element: <Contact />
  },
  {
    path: path.profileDoctorPublic,
    element: <DoctorProfile />
  }
]

const userRoutes = [
  {
    path: path.profile,
    element: <Profile />
  }
]

const adminRoutes = [
  {
    path: path.dashboard_admin,
    element: <DashboardAdmin />
  },
  {
    path: path.userManage,
    element: <UserManage />
  },
  {
    path: path.paymentManage,
    element: <PaymentManage />
  },
  {
    path: path.workSchedule,
    element: <WorkSchedule />
  },
  {
    path: path.appointmentAdmin,
    element: <AppointmentManage />
  },
  {
    path: path.profileAdmin,
    element: <ProfileAdmin />
  },
  {
    path: path.settingsAdmin,
    element: <SettingsAdmin />
  },
  {
    path: path.packageManage,
    element: <PackageManage />
  }
]

const doctorRoutes = [
  {
    path: path.dashboard,
    element: <DashboardDoctor />
  },
  {
    path: path.profileDoctor,
    element: <ProfileDoctor />
  },
  {
    path: path.workScheduleDoctor,
    element: <WorkScheduleDoctor />
  },
  {
    path: path.appoitmentDoctor,
    element: <AppointmentDoctor />
  },
  {
    path: path.settings,
    element: <SettingsDoctor />
  }
]

const videoCallRoutes = [
  {
    path: path.videoRoom,
    element: <VideoRoom />
  }
]

const ProtectedRouteComponent = memo(({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, roleUser } = useAuth()
  const isAllowed = isAuthenticated && roleUser === allowedRole

  if (!isAllowed) {
    return <Navigate to={allowedRole === 'user' ? path.signin : path.landing} replace />
  }

  const Layout = allowedRole === 'user' ? DefaultLayout : DashboardLayout
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
})

const RejectedRouteComponent = memo(() => {
  const { isAuth } = useAuth()
  if (isAuth) return <Navigate to={path.landing} />

  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  )
})

const PublicRouteComponent = memo(() => (
  <DefaultLayout>
    <Outlet />
  </DefaultLayout>
))

// Component cho các trang không cần layout (như trang video call)
const NoLayoutComponent = memo(() => <Outlet />)

const UseRouteElements = () => {
  const routes = useMemo(
    () => [
      {
        path: '',
        element: <RejectedRouteComponent />,
        children: rejectedRoutes
      },
      {
        path: '',
        index: true,
        element: (
          <DefaultLayout>
            <Landing />
          </DefaultLayout>
        )
      },
      {
        path: '',
        element: <PublicRouteComponent />,
        children: publicRoutes
      },
      {
        path: '',
        element: <ProtectedRouteComponent allowedRole='user' />,
        children: userRoutes
      },
      {
        path: '',
        element: <ProtectedRouteComponent allowedRole='admin' />,
        children: adminRoutes
      },
      {
        path: '',
        element: <ProtectedRouteComponent allowedRole='doctor' />,
        children: doctorRoutes
      },
      {
        path: '',
        element: <NoLayoutComponent />,
        children: videoCallRoutes
      },
      {
        path: '*',
        element: (
          <DefaultLayout>
            <Page_404 />
          </DefaultLayout>
        )
      }
    ],
    []
  )
  return useRoutes(routes)
}

export default UseRouteElements
