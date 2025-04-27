import React, { useState } from 'react'
import { useDoctorDashboard, StatsOverview, ChartTabs, ReviewSection, DashboardSkeleton } from './components'

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<string>('3months')

  const { appointmentStats, appointmentTrend, workScheduleStats, reviewStats, chartData, isLoading, today } =
    useDoctorDashboard(dateFilter)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className='p-6 bg-white rounded-lg md:p-10'>
      <StatsOverview
        appointmentStats={appointmentStats}
        appointmentTrend={appointmentTrend}
        workScheduleStats={workScheduleStats}
        reviewStats={reviewStats}
        today={today}
      />

      <ChartTabs chartData={chartData} dateFilter={dateFilter} onDateFilterChange={setDateFilter} />

      <ReviewSection reviewStats={reviewStats} />
    </div>
  )
}
