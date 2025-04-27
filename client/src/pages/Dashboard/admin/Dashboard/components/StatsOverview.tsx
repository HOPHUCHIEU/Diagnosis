import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Wallet, Package } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'

interface StatsOverviewProps {
  dashboardData: {
    totalUsers: number
    totalDoctors: number
    totalRevenue: number
    totalPackageSales: number
  }
}

const StatsOverview = ({ dashboardData }: StatsOverviewProps) => {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: dashboardData.totalUsers,
      icon: <Users className='w-10 h-10 text-primary' />,
      description: 'Tổng số bệnh nhân đã đăng ký'
    },
    {
      title: 'Bác sĩ',
      value: dashboardData.totalDoctors,
      icon: <Users className='w-10 h-10 text-blue-500' />,
      description: 'Tổng số bác sĩ trong hệ thống'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(dashboardData.totalRevenue),
      icon: <Wallet className='w-10 h-10 text-yellow-500' />,
      isMonetary: true,
      description: 'Tổng doanh thu'
    },
    {
      title: 'Gói khám',
      value: dashboardData.totalPackageSales,
      icon: <Package className='w-10 h-10 text-purple-500' />,
      description: 'Tổng số gói khám đã bán'
    }
  ]

  return (
    <div className='grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 xl:grid-cols-4'>
      {stats.map((stat, index) => (
        <Card key={index} className='overflow-hidden border-l-4 rounded-lg shadow-sm border-l-primary'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>{stat.title}</p>
                <h4 className='mt-1 text-2xl font-bold'>{stat.value}</h4>
                <p className='mt-1 text-xs text-muted-foreground'>{stat.description}</p>
              </div>
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsOverview
