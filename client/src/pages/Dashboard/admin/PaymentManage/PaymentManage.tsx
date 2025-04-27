import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Payment,
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useUpdatePaymentStatusMutation
} from '@/redux/services/paymentApi'
import PaymentDetail from './components/PaymentDetail'
import { paymentColumns } from './components/columns'
import { bufferToHex } from '@/utils/utils'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw } from 'lucide-react'

export default function PaymentManage() {
  const { data, isFetching, refetch } = useGetAllPaymentsQuery(null)
  const [updateStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation()
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)

  // Sử dụng useGetPaymentByIdQuery khi có selectedPaymentId
  const {
    data: paymentDetailData,
    isLoading: isLoadingDetail,
    refetch: refetchDetail
  } = useGetPaymentByIdQuery(selectedPaymentId || '', {
    skip: !selectedPaymentId
  })

  const payments = data?.data || []

  // Chuyển đổi payment từ API thành định dạng bảng
  const tableData = payments.map((payment) => {
    // Tạo các trường phái sinh từ dữ liệu gốc
    const userId = payment.user?._id ? bufferToHex(payment.user._id) : 'N/A'
    const userName = payment.user?.profile
      ? `${payment.user.profile.firstName} ${payment.user.profile.lastName}`
      : 'N/A'

    const packageId = payment.package?._id ? bufferToHex(payment.package._id) : 'N/A'
    const packageName = payment.package?.name || 'N/A'

    return {
      id: bufferToHex(payment._id),
      packageId,
      packageName,
      userId,
      userName,
      date: payment.createdAt,
      amount: payment.total_price,
      status: payment.status,
      method: payment.bank_code,
      paymentDate: payment.payment_date
    }
  })

  const handleViewPayment = (payment: any) => {
    setSelectedPaymentId(payment.id)
  }

  const handleUpdateStatus = async (payment: Payment, newStatus: 'paid' | 'cancelled') => {
    try {
      await updateStatus({
        id: bufferToHex(payment._id),
        status: newStatus
      }).unwrap()

      toast.success(`Đã cập nhật trạng thái thanh toán thành ${newStatus === 'paid' ? 'Đã thanh toán' : 'Đã hủy'}`)
      setSelectedPaymentId(null)
      refetch()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Lỗi khi cập nhật trạng thái thanh toán')
    }
  }

  const handleCloseDetail = () => {
    setSelectedPaymentId(null)
  }

  // Chi tiết thanh toán từ API
  const paymentDetail = paymentDetailData?.data

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Quản lý thanh toán</h1>
        <Button size='sm' variant='outline' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className='w-4 h-4 mr-2' />
          Làm mới
        </Button>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Thống kê thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            <div className='p-4 rounded-lg bg-blue-50'>
              <h3 className='text-sm font-medium text-blue-700'>Tổng giao dịch</h3>
              <p className='text-2xl font-bold'>{payments.length}</p>
            </div>
            <div className='p-4 rounded-lg bg-green-50'>
              <h3 className='text-sm font-medium text-green-700'>Đã thanh toán</h3>
              <p className='text-2xl font-bold'>{payments.filter((p) => p.status === 'paid').length}</p>
            </div>
            <div className='p-4 rounded-lg bg-yellow-50'>
              <h3 className='text-sm font-medium text-yellow-700'>Chờ thanh toán</h3>
              <p className='text-2xl font-bold'>{payments.filter((p) => p.status === 'pending').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={paymentColumns(handleViewPayment)}
        data={tableData}
        isLoading={isFetching}
        onReload={() => refetch()}
        headerClassName='bg-gray-200 text-sm !font-semibold'
      />

      <Dialog open={!!selectedPaymentId} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
        <DialogContent className='max-w-3xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          {isLoadingDetail ? (
            <div className='flex flex-col items-center justify-center h-full'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
              <p className='mt-4 text-sm text-gray-500'>Đang tải thông tin thanh toán...</p>
            </div>
          ) : paymentDetail ? (
            <PaymentDetail
              payment={paymentDetail}
              onUpdateStatus={handleUpdateStatus}
              onClose={handleCloseDetail}
              isUpdating={isUpdating}
              onRefresh={refetchDetail}
            />
          ) : (
            <div className='py-8 text-center'>
              <p className='text-gray-500'>Không tìm thấy thông tin thanh toán.</p>
              <Button variant='outline' onClick={handleCloseDetail} className='mt-4'>
                Đóng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
