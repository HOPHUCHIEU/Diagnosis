import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Star, MessageSquare, Clock, Check, X, Trash, EyeOff, Eye, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { useAppSelector } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'
import {
  useCreateReviewMutation,
  useGetAppointmentReviewsQuery,
  useRespondToReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation
} from '@/redux/services/reviewApi'

interface ReviewSectionProps {
  appointmentId: string
  isCompleted: boolean
  userRole?: 'patient' | 'doctor' | 'admin'
}

export default function ReviewSection({ appointmentId, isCompleted, userRole = 'patient' }: ReviewSectionProps) {
  const { data, isLoading, refetch } = useGetAppointmentReviewsQuery(appointmentId, { refetchOnMountOrArgChange: true })
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation()
  const [respondToReview, { isLoading: isRespondingReview }] = useRespondToReviewMutation()
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation()
  const [toggleVisibility, { isLoading: isTogglingVisibility }] = useToggleReviewVisibilityMutation()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [response, setResponse] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState('')

  const auth = useAppSelector((state) => state.authState)
  const userId = auth.user?._id ? bufferToHex(auth.user._id) : ''

  const canCreateReview =
    isCompleted &&
    userRole === 'patient' &&
    (!data?.data.reviews.length ||
      data?.data.reviews.length < 1 ||
      !data?.data.reviews.some((r) => bufferToHex(r.patient._id) === userId))

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const handleSubmitReview = async () => {
    try {
      await createReview({
        appointmentId,
        rating,
        comment,
        tags
      }).unwrap()

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đã gửi đánh giá của bạn'
        }
      })

      setShowReviewForm(false)
      setComment('')
      setRating(5)
      setTags([])
      refetch()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể gửi đánh giá'
        }
      })
    }
  }

  const handleRespond = async () => {
    if (!selectedReviewId || !response.trim()) return

    try {
      await respondToReview({
        reviewId: selectedReviewId,
        response
      }).unwrap()

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đã phản hồi đánh giá'
        }
      })

      setShowResponseForm(false)
      setResponse('')
      setSelectedReviewId('')
      refetch()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể phản hồi đánh giá'
        }
      })
    }
  }

  const handleOpenDeleteConfirm = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setConfirmDeleteOpen(true)
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    try {
      await deleteReview(reviewToDelete).unwrap()

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đã xóa đánh giá'
        }
      })

      setConfirmDeleteOpen(false)
      setReviewToDelete('')
      refetch()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể xóa đánh giá'
        }
      })
    }
  }

  const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      await toggleVisibility({
        reviewId,
        isVisible: !currentVisibility
      }).unwrap()

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: !currentVisibility ? 'Đã hiển thị đánh giá' : 'Đã ẩn đánh giá'
        }
      })

      refetch()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể thay đổi trạng thái hiển thị'
        }
      })
    }
  }

  const predefinedTags = ['Chuyên nghiệp', 'Tận tâm', 'Hiệu quả', 'Chăm sóc tốt', 'Thân thiện', 'Giải thích rõ ràng']

  if (isLoading) {
    return (
      <div className='py-4'>
        <div className='flex items-center space-x-2'>
          <div className='w-24 h-6 bg-gray-200 rounded animate-pulse'></div>
        </div>
      </div>
    )
  }

  const reviews = data?.data.reviews || []

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-base font-medium'>Đánh giá ({reviews.length})</h3>
        {canCreateReview && (
          <Button size='sm' onClick={() => setShowReviewForm(true)} className='bg-primary hover:bg-primary/90'>
            <Star className='mr-2 w-4 h-4' />
            Viết đánh giá
          </Button>
        )}
      </div>

      {showReviewForm && (
        <div className='p-4 bg-gray-50 rounded-lg border'>
          <h4 className='mb-3 font-medium'>Đánh giá của bạn</h4>

          <div className='mb-4'>
            <p className='mb-1 text-sm font-medium'>Mức độ hài lòng</p>
            <div className='flex gap-1 items-center'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type='button' onClick={() => handleRatingChange(star)} className='p-1'>
                  <Star className={`w-6 h-6 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
              <span className='ml-2 text-sm text-gray-600'>{rating} sao</span>
            </div>
          </div>

          <div className='mb-4'>
            <label className='mb-1 text-sm font-medium'>Nhận xét của bạn</label>
            <Textarea
              placeholder='Chia sẻ trải nghiệm của bạn với bác sĩ...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className='min-h-[100px]'
            />
          </div>

          <div className='mb-4'>
            <p className='mb-2 text-sm font-medium'>Gắn thẻ</p>
            <div className='flex flex-wrap gap-2'>
              {predefinedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer ${tags.includes(tag) ? 'bg-primary' : 'hover:bg-primary/10'}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className='flex gap-2 justify-end'>
            <Button
              variant='outline'
              onClick={() => {
                setShowReviewForm(false)
                setRating(5)
                setComment('')
                setTags([])
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview || !comment.trim()}>
              {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className='p-4 text-center bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {reviews.map((review) => {
            const reviewId = bufferToHex(review._id)
            const patientName = `${review.patient.profile.firstName} ${review.patient.profile.lastName}`
            const patientInitials =
              `${review.patient.profile.firstName[0]}${review.patient.profile.lastName[0]}`.toUpperCase()

            // Xác định xem người dùng hiện tại có phải là người đã tạo review này không
            const isReviewCreator = userRole === 'patient' && bufferToHex(review.patient._id) === userId

            return (
              <div
                key={reviewId}
                className={`p-4 bg-white rounded-lg border shadow-sm ${!review.isVisible ? 'opacity-60' : ''}`}
              >
                <div className='flex gap-3'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src='' />
                    <AvatarFallback>{patientInitials}</AvatarFallback>
                  </Avatar>

                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-medium'>{patientName}</p>
                        <div className='flex gap-1 items-center mt-1'>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                          <span className='ml-1 text-xs text-gray-500'>
                            {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>

                      <div className='flex gap-2 items-center'>
                        {review.isVerified && (
                          <Badge variant='outline' className='flex items-center text-green-600 border-green-200'>
                            <Check className='mr-1 w-3 h-3' />
                            Đã xác thực
                          </Badge>
                        )}

                        {!review.isVisible && (
                          <Badge variant='outline' className='flex items-center text-slate-600 border-slate-200'>
                            <EyeOff className='mr-1 w-3 h-3' />
                            Đã ẩn
                          </Badge>
                        )}
                      </div>
                    </div>

                    {review.tags?.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {review.tags.map((tag, i) => (
                          <Button size='sm' key={i} className='py-1 text-xs h-fit' effect='shine'>
                            {tag}
                          </Button>
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

                    {/* Action buttons */}
                    <div className='flex gap-2 items-center mt-3'>
                      {/* Admin/Doctor can respond */}
                      {!review.adminReply && userRole === 'doctor' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setShowResponseForm(true)
                            setSelectedReviewId(reviewId)
                          }}
                          disabled={showResponseForm && selectedReviewId === reviewId}
                        >
                          <MessageSquare className='mr-1 w-3 h-3' />
                          Phản hồi
                        </Button>
                      )}

                      {/* Admin can toggle visibility */}
                      {userRole === 'admin' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleToggleVisibility(reviewId, review.isVisible)}
                          disabled={isTogglingVisibility}
                        >
                          {review.isVisible ? (
                            <>
                              <EyeOff className='mr-1 w-3 h-3' />
                              Ẩn đánh giá
                            </>
                          ) : (
                            <>
                              <Eye className='mr-1 w-3 h-3' />
                              Hiện đánh giá
                            </>
                          )}
                        </Button>
                      )}

                      {/* User can delete their own review or admin can delete any review */}
                      {(isReviewCreator || userRole === 'admin') && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-red-500 hover:bg-red-50 hover:text-red-600'
                          onClick={() => handleOpenDeleteConfirm(reviewId)}
                        >
                          <Trash className='mr-1 w-3 h-3' />
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Response Form */}
                {showResponseForm && selectedReviewId === reviewId && (
                  <div className='p-3 mt-3 ml-12 bg-gray-50 rounded-md'>
                    <label className='mb-1 text-sm font-medium'>Phản hồi của bạn</label>
                    <Textarea
                      placeholder='Nhập phản hồi của bạn...'
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className='min-h-[80px] mb-2'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setShowResponseForm(false)
                          setSelectedReviewId('')
                          setResponse('')
                        }}
                      >
                        <X className='mr-1 w-3 h-3' />
                        Hủy
                      </Button>
                      <Button size='sm' disabled={isRespondingReview || !response.trim()} onClick={handleRespond}>
                        <Check className='mr-1 w-3 h-3' />
                        {isRespondingReview ? 'Đang gửi...' : 'Gửi phản hồi'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className='bg-red-500 hover:bg-red-600'
              disabled={isDeletingReview}
            >
              {isDeletingReview ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
