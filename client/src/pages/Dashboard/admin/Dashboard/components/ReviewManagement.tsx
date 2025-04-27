import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  useGetAllReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation
} from '@/redux/services/reviewApi'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Trash2, MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { bufferToHex } from '@/utils/utils'

interface ReviewDetail {
  _id: Buffer
  patient: {
    _id: Buffer
    profile: {
      _id: Buffer
      firstName: string
      lastName: string
    }
  }
  doctor: {
    _id: Buffer
    profile: {
      _id: Buffer
      firstName: string
      lastName: string
    }
  }
  appointment: {
    _id: Buffer
    appointmentDate: string
    type: string
  }
  rating: number
  comment: string
  isVerified: boolean
  tags: string[]
  isVisible: boolean
  createdAt: string
  updatedAt: string
  adminReply?: string
  adminReplyAt?: string
}

const ReviewManagement = () => {
  const [page, setPage] = useState(1)
  const [detailReview, setDetailReview] = useState<ReviewDetail | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data, isLoading, refetch } = useGetAllReviewsQuery({
    page,
    limit: 10
  })

  const [toggleVisibility] = useToggleReviewVisibilityMutation()
  const [deleteReview] = useDeleteReviewMutation()

  const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      await toggleVisibility({
        reviewId,
        isVisible: !currentVisibility
      }).unwrap()

      toast.success(currentVisibility ? 'Đã ẩn đánh giá thành công' : 'Đã hiển thị đánh giá thành công')

      refetch()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái hiển thị')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId).unwrap()
      toast.success('Đã xóa đánh giá thành công')
      setConfirmDelete(null)
      refetch()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa đánh giá')
    }
  }

  return (
    <Card className='p-6 shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-medium'>Quản lý đánh giá</h3>
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead className='w-20'>Đánh giá</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className='py-10 text-center'>
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : !data?.data.reviews || data.data.reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-10 text-center'>
                  Không có đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              data.data.reviews.map((review) => (
                <TableRow key={bufferToHex(review._id)}>
                  <TableCell>
                    {review.patient?.profile?.firstName} {review.patient?.profile?.lastName}
                  </TableCell>
                  <TableCell>
                    {review.doctor?.profile?.firstName} {review.doctor?.profile?.lastName}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center'>
                      <Star className='w-4 h-4 mr-1 text-yellow-400' />
                      <span>{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-xs truncate'>{review.comment}</TableCell>
                  <TableCell>{format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                  <TableCell>
                    <Badge variant={review.isVisible ? 'default' : 'secondary'}>
                      {review.isVisible ? 'Hiển thị' : 'Ẩn'}
                    </Badge>
                  </TableCell>
                  <TableCell className='space-x-1 text-right'>
                    <Button variant='ghost' size='icon' onClick={() => setDetailReview(review)}>
                      <MessageSquare className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleToggleVisibility(bufferToHex(review._id), review.isVisible)}
                    >
                      {review.isVisible ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => setConfirmDelete(bufferToHex(review._id))}>
                      <Trash2 className='w-4 h-4 text-destructive' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.data.pagination && data.data.pagination.totalPages > 1 && (
        <Pagination className='mt-4'>
          <PaginationContent>
            <PaginationItem>
              {page === 1 ? (
                <Button variant='ghost' size='icon' disabled className='opacity-50 cursor-not-allowed'>
                  <ChevronLeft className='w-4 h-4' />
                </Button>
              ) : (
                <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
              )}
            </PaginationItem>

            {Array.from({ length: data.data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              {page === data.data.pagination.totalPages ? (
                <Button variant='ghost' size='icon' disabled className='opacity-50 cursor-not-allowed'>
                  <ChevronRight className='w-4 h-4' />
                </Button>
              ) : (
                <PaginationNext onClick={() => setPage((p) => p + 1)} />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Chi tiết đánh giá */}
      <Dialog open={!!detailReview} onOpenChange={(open) => !open && setDetailReview(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogDescription>
              Đánh giá được tạo ngày{' '}
              {detailReview && format(new Date(detailReview.createdAt), 'dd/MM/yyyy', { locale: vi })}
            </DialogDescription>
          </DialogHeader>

          {detailReview && (
            <div className='space-y-4'>
              <div>
                <h4 className='text-sm font-medium'>Thông tin</h4>
                <p className='mt-1 text-sm'>
                  <span className='font-medium'>Bệnh nhân:</span> {detailReview.patient?.profile?.firstName}{' '}
                  {detailReview.patient?.profile?.lastName}
                </p>
                <p className='mt-1 text-sm'>
                  <span className='font-medium'>Bác sĩ:</span> {detailReview.doctor?.profile?.firstName}{' '}
                  {detailReview.doctor?.profile?.lastName}
                </p>
                <div className='flex items-center mt-1'>
                  <span className='mr-2 text-sm font-medium'>Đánh giá:</span>
                  <div className='flex items-center'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < detailReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-sm font-medium'>Nội dung đánh giá</h4>
                <p className='mt-1 text-sm whitespace-pre-wrap'>{detailReview.comment}</p>
              </div>

              {detailReview.tags && detailReview.tags.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium'>Tags</h4>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {detailReview.tags.map((tag: string) => (
                      <Badge variant='outline' key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {detailReview.adminReply && (
                <div>
                  <h4 className='text-sm font-medium'>Phản hồi của Admin</h4>
                  <p className='mt-1 text-sm'>{detailReview.adminReply}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Phản hồi vào:{' '}
                    {format(new Date(detailReview.adminReplyAt || new Date()), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className='flex gap-2 sm:justify-start'>
            <Button variant='secondary' onClick={() => setDetailReview(null)}>
              Đóng
            </Button>
            {detailReview && (
              <>
                <Button
                  variant={detailReview.isVisible ? 'outline' : 'default'}
                  onClick={() => {
                    if (detailReview) {
                      handleToggleVisibility(bufferToHex(detailReview._id), detailReview.isVisible)
                      setDetailReview(null)
                    }
                  }}
                >
                  {detailReview.isVisible ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}
                </Button>
                <Button
                  variant='destructive'
                  onClick={() => {
                    if (detailReview) {
                      setConfirmDelete(bufferToHex(detailReview._id))
                      setDetailReview(null)
                    }
                  }}
                >
                  Xóa đánh giá
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Xác nhận xóa */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='sm:justify-start'>
            <Button variant='secondary' onClick={() => setConfirmDelete(null)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={() => confirmDelete && handleDeleteReview(confirmDelete)}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ReviewManagement
