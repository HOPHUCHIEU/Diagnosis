import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Star, MessageSquare, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDoctorReviewsQuery } from '@/redux/services/publicApi'
import { bufferToHex } from '@/utils/utils'
import { Progress } from '@/components/ui/progress'

interface DoctorReviewListProps {
  doctorId: string
}

export default function DoctorReviewList({ doctorId }: DoctorReviewListProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching } = useGetDoctorReviewsQuery(
    {
      id: doctorId,
      page,
      limit: 5
    },
    {
      refetchOnMountOrArgChange: true
    }
  )

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Skeleton className='w-32 h-6' />
          <Skeleton className='w-20 h-6' />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className='p-4 space-y-3 rounded-lg border'>
            <div className='flex gap-3 items-start'>
              <Skeleton className='w-10 h-10 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='w-32 h-4' />
                <div className='flex gap-1'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Skeleton key={s} className='w-4 h-4' />
                  ))}
                </div>
                <Skeleton className='w-full h-14' />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || !data.data.reviews.length) {
    return (
      <div className='p-6 text-center bg-gray-50 rounded-lg'>
        <h3 className='mb-2 text-lg font-medium'>Chưa có đánh giá</h3>
        <p className='text-gray-500'>Bác sĩ này chưa có đánh giá nào</p>
      </div>
    )
  }

  const { reviews, pagination, stats } = data.data

  // Tính phân phối số lượng đánh giá theo sao
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length || 0
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
    return { stars, count, percentage }
  })

  return (
    <div className='space-y-6'>
      {/* Phần tổng quan đánh giá */}
      <div className='grid grid-cols-1 gap-6 pb-6 border-b md:grid-cols-2'>
        <div className='flex flex-col justify-center items-center'>
          <div className='flex flex-col items-center'>
            <div className='text-5xl font-bold'>{stats.averageRating.toFixed(1)}</div>
            <div className='flex mt-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className='mt-1 text-sm text-gray-500'>{stats.totalReviews} đánh giá</p>
          </div>
        </div>

        <div className='space-y-2'>
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className='flex items-center text-sm'>
              <div className='flex gap-1 items-center w-12'>
                {stars} <Star className='w-3 h-3 text-gray-400' />
              </div>
              <div className='flex-1 mx-3'>
                <Progress value={percentage} className='h-2' />
              </div>
              <div className='w-8 text-right text-gray-500'>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div className='space-y-4'>
        {reviews.map((review) => {
          const reviewId = bufferToHex(review._id)
          const patientName = `${review.patient.profile.firstName} ${review.patient.profile.lastName}`
          const patientInitials =
            `${review.patient.profile.firstName[0]}${review.patient.profile.lastName[0]}`.toUpperCase()

          return (
            <div key={reviewId} className='p-4 bg-white rounded-lg border transition-all hover:border-primary/20'>
              <div className='flex gap-3'>
                <Avatar className='w-10 h-10'>
                  <AvatarImage src='' />
                  <AvatarFallback>{patientInitials}</AvatarFallback>
                </Avatar>

                <div className='flex-1'>
                  <div className='flex flex-col justify-between items-start sm:flex-row'>
                    <div className='mb-2'>
                      <p className='font-medium'>{patientName}</p>
                      <div className='flex gap-1 items-center mt-1'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                        <span className='ml-1 text-xs text-gray-500'>
                          {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>

                    {review.isVerified && (
                      <Badge variant='outline' className='flex items-center text-green-600 border-green-200'>
                        <Check className='mr-1 w-3 h-3' />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>

                  {review.tags?.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-2'>
                      {review.tags.map((tag, i) => (
                        <Badge key={i} variant='secondary' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className='mt-2 text-gray-700'>{review.comment}</p>

                  {/* Admin/Doctor Reply */}
                  {review.adminReply && (
                    <div className='p-3 mt-3 bg-gray-50 rounded-md'>
                      <div className='flex gap-2'>
                        <MessageSquare className='w-4 h-4 text-primary shrink-0 mt-0.5' />
                        <div>
                          <p className='text-sm font-medium'>Phản hồi từ Bác sĩ</p>
                          <p className='text-gray-600'>{review.adminReply}</p>
                          <p className='mt-1 text-xs text-gray-500'>
                            {review.adminReplyAt && format(new Date(review.adminReplyAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className='flex gap-2 justify-center pt-4'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center px-3'
            disabled={page === 1 || isFetching}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className='mr-1 w-4 h-4' />
            Trước
          </Button>
          <span className='flex items-center px-3 text-sm'>
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center px-3'
            disabled={page === pagination.totalPages || isFetching}
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
          >
            Sau
            <ChevronRight className='ml-1 w-4 h-4' />
          </Button>
        </div>
      )}
    </div>
  )
}
