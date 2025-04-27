import React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardSkeleton = () => {
  return (
    <div className='p-6 bg-white rounded-lg md:p-10'>
      {/* Skeleton cho StatsOverview - 4 thẻ thay vì 5 */}
      <div className='grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 xl:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='p-6 shadow-sm'>
            <div className='flex justify-between items-center'>
              <div className='space-y-2'>
                <Skeleton className='w-24 h-5' />
                <Skeleton className='w-32 h-8' />
              </div>
              <Skeleton className='w-12 h-12 rounded-full' />
            </div>
          </Card>
        ))}
      </div>

      {/* Skeleton cho MonthlyAppointmentsChart */}
      <div className='mb-8'>
        <Card className='p-6 shadow-sm'>
          <div className='flex justify-between items-center mb-4'>
            <Skeleton className='w-48 h-6' />
            <Skeleton className='w-32 h-8 rounded-md' />
          </div>
          <div className='h-[350px]'>
            <Skeleton className='w-full h-full' />
          </div>
        </Card>
      </div>

      {/* Skeleton cho AppointmentStatusChart */}
      <div className='mb-8'>
        <Card className='p-6 shadow-sm'>
          <Skeleton className='mb-4 w-48 h-6' />
          <div className='flex justify-center items-center h-[300px]'>
            <Skeleton className='w-[300px] h-[300px] rounded-full' />
          </div>
        </Card>
      </div>

      {/* Skeleton cho ReviewManagement */}
      <Card className='p-6 shadow-sm'>
        <div className='flex justify-between items-center mb-6'>
          <Skeleton className='w-40 h-6' />
        </div>
        <div className='border rounded-md'>
          <div className='p-4'>
            <div className='flex mb-4'>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className='mr-4 w-1/7 h-6' />
              ))}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className='py-4 border-t'>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 items-center'>
                    <Skeleton className='w-8 h-8 rounded-full' />
                    <Skeleton className='w-24 h-5' />
                  </div>
                  <div className='flex gap-2'>
                    <Skeleton className='w-6 h-6 rounded-full' />
                    <Skeleton className='w-6 h-6 rounded-full' />
                    <Skeleton className='w-6 h-6 rounded-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardSkeleton
