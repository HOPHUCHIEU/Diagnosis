import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton = () => {
  return (
    <div className='p-4 sm:p-6'>
      <div className='p-6 bg-white rounded-lg md:p-10'>
        {/* Skeleton cho phần tổng quan */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='w-full h-40' />
          ))}
        </div>

        {/* Skeleton cho phần biểu đồ chính */}
        <div className='my-6'>
          <Skeleton className='w-full h-80' />
        </div>

        {/* Skeleton cho phần đánh giá */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {[1, 2].map((i) => (
            <Skeleton key={i} className='w-full h-60' />
          ))}
        </div>
      </div>
    </div>
  )
}
