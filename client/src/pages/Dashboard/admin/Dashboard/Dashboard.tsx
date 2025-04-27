import React from 'react'
import { useDashboardQuery } from '@/redux/services/userApi'
import {
  StatsOverview,
  AppointmentStatusChart,
  ReviewManagement,
  DashboardSkeleton,
  MonthlyAppointmentsChart
} from './components'

interface DashboardData {
  totalUsers: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  totalPackageSales: number
  appointmentStatusBreakdown: {
    cancelled: number
    confirmed: number
    completed: number
  }
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardQuery(null)

  // Kiểm tra dữ liệu đang tải
  if (isLoading || !data) {
    return <DashboardSkeleton />
  }

  const dashboardData: DashboardData = data.data

  // Chỉnh sửa dữ liệu cho statsOverview để loại bỏ tổng số cuộc hẹn
  const filteredDashboardData = {
    ...dashboardData
    // Không truyền totalAppointments vào StatsOverview
  }

  return (
    <div className='p-6 bg-white rounded-lg md:p-10'>
      {/* Phần tổng quan thống kê (đã loại bỏ card tổng số cuộc hẹn) */}
      <StatsOverview dashboardData={filteredDashboardData} />

      {/* Biểu đồ cuộc hẹn theo thời gian - Component mới */}
      <div className='grid grid-cols-1 gap-4 mb-8 lg:grid-cols-3'>
        <div className='col-span-2'>
          <MonthlyAppointmentsChart />
        </div>
        <AppointmentStatusChart appointmentStatusBreakdown={dashboardData.appointmentStatusBreakdown} />
      </div>

      {/* Quản lý đánh giá */}
      <ReviewManagement />
    </div>
  )
}
