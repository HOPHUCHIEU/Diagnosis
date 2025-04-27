import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CalendarDaysIcon, StarIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

import { TrendIndicator, StarRating, ShiftCheck } from './UIComponents'

type StatsOverviewProps = {
  appointmentStats: any
  appointmentTrend: any
  workScheduleStats: any
  reviewStats: any
  today: Date
}

// Component hiển thị card thông tin tổng quan về bác sĩ
export const WelcomeCard = () => {
  const { user } = useSelector((state: RootState) => state.authState)
  const today = new Date()

  return (
    <Card className='col-span-1 xl:col-span-1'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl'>Chào mừng, {user?.profile?.fullName || 'Bác sĩ'}</CardTitle>
        <CardDescription>{format(today, 'EEEE, dd/MM/yyyy', { locale: vi })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4 mt-4'>
          <div className='mb-2 text-lg font-medium'>Thống kê tháng này</div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>Cuộc hẹn</span>
              <div className='flex items-center'>
                <span className='text-xl font-bold'>0</span>
              </div>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>Đã hoàn thành</span>
              <div className='flex items-center'>
                <span className='text-xl font-bold text-green-500'>0</span>
              </div>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>Tái khám</span>
              <span className='text-xl font-bold text-violet-500'>0</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-muted-foreground'>Đã hủy</span>
              <span className='text-xl font-bold text-red-500'>0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component hiển thị thông tin lịch làm việc
export const ScheduleCard = ({ workScheduleStats }: { workScheduleStats: any }) => {
  return (
    <Card className='col-span-1 xl:col-span-1'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Lịch làm việc</CardTitle>
      </CardHeader>
      <CardContent className='pt-2'>
        <div className='space-y-4'>
          <div className='p-3 text-center border rounded-md'>
            <CalendarDaysIcon className='w-6 h-6 mx-auto mb-1 text-indigo-500' />
            <div className='text-lg font-semibold'>{workScheduleStats.thisMonth}</div>
            <div className='text-xs text-muted-foreground'>Ngày làm việc tháng này</div>
          </div>

          <div>
            <div className='mb-2 text-sm font-medium'>Lịch hôm nay</div>
            {workScheduleStats.todaySchedule ? (
              <div className='p-3 border rounded-md'>
                {ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'morning' }) && (
                  <>
                    <div className='flex justify-between'>
                      <div className='text-sm text-muted-foreground'>Ca sáng</div>
                      <div className='text-sm font-medium'>
                        {workScheduleStats.todaySchedule.schedules.morningStart} -{' '}
                        {workScheduleStats.todaySchedule.schedules.morningEnd}
                      </div>
                    </div>
                    {(ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'afternoon' }) ||
                      ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'evening' })) && (
                      <Separator className='my-2' />
                    )}
                  </>
                )}
                {ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'afternoon' }) && (
                  <>
                    <div className='flex justify-between'>
                      <div className='text-sm text-muted-foreground'>Ca chiều</div>
                      <div className='text-sm font-medium'>
                        {workScheduleStats.todaySchedule.schedules.afternoonStart} -{' '}
                        {workScheduleStats.todaySchedule.schedules.afternoonEnd}
                      </div>
                    </div>
                    {ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'evening' }) && (
                      <Separator className='my-2' />
                    )}
                  </>
                )}
                {ShiftCheck({ schedule: workScheduleStats.todaySchedule, shift: 'evening' }) && (
                  <div className='flex justify-between'>
                    <div className='text-sm text-muted-foreground'>Ca tối</div>
                    <div className='text-sm font-medium'>
                      {workScheduleStats.todaySchedule.schedules.eveningStart} -{' '}
                      {workScheduleStats.todaySchedule.schedules.eveningEnd}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='p-3 text-sm text-center border border-dashed rounded-md text-muted-foreground'>
                Không có lịch làm việc hôm nay
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component hiển thị thông tin đánh giá cơ bản
export const RatingOverview = ({ reviewStats }: { reviewStats: any }) => {
  return (
    <div className='flex h-full min-h-[160px] w-full flex-row gap-4 rounded-lg border border-blue-500 bg-gradient-to-r from-blue-500 to-blue-700 p-6'>
      <div className='flex flex-col justify-around w-full'>
        <div className='mb-2 text-base text-blue-100'>Đánh giá trung bình</div>
        <div className='text-2xl font-bold text-white break-all'>{reviewStats.average.toFixed(1)}</div>
        <div className='flex text-yellow-300'>
          <StarRating count={Math.round(reviewStats.average)} />
          <span className='ml-2 text-sm text-blue-100'>({reviewStats.total} đánh giá)</span>
        </div>
      </div>
      <div className='p-3 my-auto text-blue-100 bg-blue-600 rounded-full'>
        <StarIcon className='w-8 h-8' />
      </div>
    </div>
  )
}

// Component tổng hợp thống kê cho phần đầu trang Dashboard
export const StatsOverview = ({
  appointmentStats,
  appointmentTrend,
  workScheduleStats,
  reviewStats
}: StatsOverviewProps) => {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
      <Card className='col-span-1 xl:col-span-1'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl'>
            Chào mừng, {useSelector((state: RootState) => state.authState.user?.profile?.fullName || 'Bác sĩ')}
          </CardTitle>
          <CardDescription>{format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 mt-4'>
            <div className='mb-2 text-lg font-medium'>Thống kê tháng này</div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col'>
                <span className='text-sm text-muted-foreground'>Cuộc hẹn</span>
                <div className='flex items-center'>
                  <span className='text-xl font-bold'>{appointmentStats.total}</span>
                  {appointmentTrend.totalChange !== 0 && <TrendIndicator value={appointmentTrend.totalChange} />}
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-sm text-muted-foreground'>Đã hoàn thành</span>
                <div className='flex items-center'>
                  <span className='text-xl font-bold text-green-500'>{appointmentStats.completed}</span>
                  {appointmentTrend.completedChange !== 0 && (
                    <TrendIndicator value={appointmentTrend.completedChange} />
                  )}
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-sm text-muted-foreground'>Tái khám</span>
                <span className='text-xl font-bold text-violet-500'>{appointmentStats.followUp}</span>
              </div>
              <div className='flex flex-col'>
                <span className='text-sm text-muted-foreground'>Đã hủy</span>
                <span className='text-xl font-bold text-red-500'>{appointmentStats.cancelled}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleCard workScheduleStats={workScheduleStats} />
      <RatingOverview reviewStats={reviewStats} />
    </div>
  )
}
