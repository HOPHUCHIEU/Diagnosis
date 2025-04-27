import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentStatusChart, MonthlyAppointmentsChart, TopPatientsChart } from './ChartComponents'
import { DateRangeFilter } from './DateRangeFilter'

type ChartTabsProps = {
  chartData: {
    appointmentStatus: any
    monthlyAppointments: any
    topPatients: any
  }
  dateFilter: string
  onDateFilterChange: (value: string) => void
}

export const ChartTabs = ({ chartData, dateFilter, onDateFilterChange }: ChartTabsProps) => {
  return (
    <div className='grid grid-cols-1 gap-6 my-6 md:grid-cols-3'>
      <div className='col-span-1 md:col-span-2'>
        <Tabs defaultValue='monthlyAppointments'>
          <div className='flex items-center justify-between mb-4'>
            <TabsList>
              <TabsTrigger value='monthlyAppointments'>Cuộc hẹn</TabsTrigger>
              <TabsTrigger value='topPatients'>Top bệnh nhân</TabsTrigger>
            </TabsList>
            <DateRangeFilter value={dateFilter} onChange={onDateFilterChange} />
          </div>

          <TabsContent value='monthlyAppointments'>
            <Card>
              <CardHeader>
                <CardTitle>Thống kê cuộc hẹn theo thời gian</CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <MonthlyAppointmentsChart data={chartData.monthlyAppointments} dateFilter={dateFilter} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='topPatients'>
            <Card>
              <CardHeader>
                <CardTitle>Top bệnh nhân thường xuyên khám</CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <TopPatientsChart data={chartData.topPatients} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê trạng thái cuộc hẹn</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentStatusChart data={chartData.appointmentStatus} />
        </CardContent>
      </Card>
    </div>
  )
}
