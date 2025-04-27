import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { StarRating } from './UIComponents'
import { format } from 'date-fns'
import { bufferToHex } from '@/utils/utils'

type ReviewSectionProps = {
  reviewStats: {
    average: number
    total: number
    distribution: Array<{
      stars: number
      count: number
      percentage: number
    }>
    recentReviews: any[]
  }
}

// Component hiển thị phân bố số sao đánh giá
export const RatingDistribution = ({
  distribution
}: {
  distribution: ReviewSectionProps['reviewStats']['distribution']
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col md:flex-row md:gap-8'>
          <div className='flex flex-col items-center mb-6 md:mb-0 md:w-1/3'>
            <span className='text-4xl font-bold'>
              {distribution.reduce((acc, curr) => acc + curr.count * curr.stars, 0) /
                (distribution.reduce((acc, curr) => acc + curr.count, 0) || 1)}
            </span>
            <div className='flex my-2'>
              <StarRating
                count={Math.round(
                  distribution.reduce((acc, curr) => acc + curr.count * curr.stars, 0) /
                    (distribution.reduce((acc, curr) => acc + curr.count, 0) || 1)
                )}
              />
            </div>
            <span className='text-sm text-muted-foreground'>
              Dựa trên {distribution.reduce((acc, curr) => acc + curr.count, 0)} đánh giá
            </span>
          </div>

          <div className='md:w-2/3'>
            {distribution.map((item) => (
              <div key={item.stars} className='flex items-center mb-2'>
                <div className='w-12 text-sm'>{item.stars} sao</div>
                <div className='flex-1 mx-2'>
                  <Progress value={item.percentage} className='h-2' />
                </div>
                <div className='w-16 text-sm text-right'>
                  {item.count} ({Math.round(item.percentage)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component hiển thị danh sách đánh giá gần đây
export const RecentReviews = ({ reviews }: { reviews: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {reviews.length > 0 ? (
            reviews
              .map((review) => {
                try {
                  const reviewId = bufferToHex(review._id)
                  const patientName = `${review.patient.profile.firstName} ${review.patient.profile.lastName}`
                  const patientInitials = `${review.patient.profile.firstName[0] || ''}${
                    review.patient.profile.lastName[0] || ''
                  }`.toUpperCase()

                  return (
                    <div key={reviewId} className='p-3 border-l-4 rounded-lg bg-gray-50 border-primary/50'>
                      <div className='flex items-start gap-3'>
                        <Avatar className='w-8 h-8'>
                          <AvatarImage src='' />
                          <AvatarFallback>{patientInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='flex items-center'>
                            <p className='font-medium'>{patientName}</p>
                            <span className='mx-2 text-xs text-gray-500'>•</span>
                            <div className='flex'>
                              <StarRating count={review.rating} />
                            </div>
                          </div>
                          <p className='mt-1 mb-1 text-sm text-gray-700 line-clamp-2'>{review.comment}</p>
                          <p className='text-xs text-gray-500'>{format(new Date(review.createdAt), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  )
                } catch (error) {
                  console.error('Error rendering review:', error)
                  return null
                }
              })
              .filter(Boolean)
          ) : (
            <div className='p-4 text-center'>
              <p className='text-muted-foreground'>Chưa có đánh giá nào</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component tổng hợp các thông tin đánh giá
export const ReviewSection = ({ reviewStats }: ReviewSectionProps) => {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <RatingDistribution distribution={reviewStats.distribution} />
      <RecentReviews reviews={reviewStats.recentReviews} />
    </div>
  )
}
