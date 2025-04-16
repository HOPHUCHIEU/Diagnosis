import { Button } from '@/components/ui/button'
import { Payment } from '@/redux/services/paymentApi'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { formatCurrency } from '@/utils/utils'
import { Download, Printer, RefreshCcw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { bufferToHex } from '@/utils/utils'

interface Props {
  payment: Payment
  onUpdateStatus: (payment: Payment, status: 'paid' | 'cancelled') => void
  onClose: () => void
  isUpdating?: boolean
  onRefresh?: () => void
}

export default function PaymentDetail({ payment, onUpdateStatus, onClose, isUpdating = false, onRefresh }: Props) {
  const [note, setNote] = useState('')

  const handlePrint = () => {
    window.print()
  }

  const handleApprove = () => {
    onUpdateStatus(payment, 'paid')
  }

  const handleReject = () => {
    onUpdateStatus(payment, 'cancelled')
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  // Lấy tên đầy đủ của người dùng
  const fullName = payment.user?.profile
    ? `${payment.user.profile.firstName} ${payment.user.profile.lastName}`
    : 'Không có thông tin'

  // Lấy thông tin gói khám
  const packageName = payment.package?.name || 'Không có thông tin'
  const packageFeatures = payment.package?.features || []
  const packageAppointmentCount = payment.package?.appointmentCount || 0
  const packageValidityPeriod = payment.package?.validityPeriod || 0

  return (
    <div className='space-y-6 print:p-8'>
      {/* Header */}
      <div className='flex justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>DIAGNOSIS IQ</h1>
          <p className='text-gray-500'>120 Hoàng Minh Thảo, Liên Chiểu, Đà Nẵng</p>
        </div>
        {onRefresh && (
          <Button size='sm' variant='outline' onClick={handleRefresh}>
            <RefreshCcw className='mr-2 w-4 h-4' />
            Làm mới
          </Button>
        )}
      </div>

      <div className='text-center'>
        <h2 className='text-xl font-bold'>HÓA ĐƠN THANH TOÁN</h2>
        <p className='text-sm text-gray-500'>Mã hóa đơn: {bufferToHex(payment._id)}</p>
        <p className='text-sm text-gray-500'>Ngày: {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}</p>
      </div>

      <Separator />

      {/* Customer Info */}
      <div className='space-y-4'>
        <h3 className='font-semibold'>Thông tin khách hàng:</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Tên khách hàng:</p>
            <p className='font-medium'>{fullName}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Mã khách hàng:</p>
            <p className='font-medium'>{payment.user?._id ? bufferToHex(payment.user._id) : 'Không có thông tin'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Package Details */}
      <div className='space-y-4'>
        <h3 className='font-semibold'>Chi tiết gói khám:</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Tên gói khám:</p>
            <p className='font-medium'>{packageName}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Mã gói khám:</p>
            <p className='font-medium'>
              {payment.package?._id ? bufferToHex(payment.package._id) : 'Không có thông tin'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Số lượt khám:</p>
            <p className='font-medium'>{packageAppointmentCount} lượt</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Thời hạn sử dụng:</p>
            <p className='font-medium'>{packageValidityPeriod} ngày</p>
          </div>
          <div className='col-span-2'>
            <p className='text-sm text-gray-500'>Tính năng:</p>
            <div className='flex flex-wrap gap-2 mt-1'>
              {packageFeatures.map((feature, index) => (
                <Badge key={index} variant='outline' className='py-1 text-xs'>
                  {feature}
                </Badge>
              ))}
              {packageFeatures.length === 0 && <p className='text-sm text-gray-400'>Không có tính năng</p>}
            </div>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Mô tả:</p>
            <p className='font-medium'>{payment.package?.description || 'Không có mô tả'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Info */}
      <div className='space-y-4'>
        <h3 className='font-semibold'>Thông tin thanh toán:</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Phương thức:</p>
            <p className='font-medium'>{payment.bank_code}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Trạng thái:</p>
            <Badge
              variant={
                payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'
              }
            >
              {payment.status === 'paid' && 'Đã thanh toán'}
              {payment.status === 'pending' && 'Chờ thanh toán'}
              {payment.status === 'cancelled' && 'Đã hủy'}
            </Badge>
          </div>
          {payment.payment_date && (
            <div>
              <p className='text-sm text-gray-500'>Ngày thanh toán:</p>
              <p className='font-medium'>{format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          )}
          <div>
            <p className='text-sm text-gray-500'>IP Address:</p>
            <p className='font-medium'>{payment.ip_address}</p>
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div className='flex justify-between items-center py-4 border-t border-b'>
        <h3 className='text-lg font-semibold'>Tổng tiền:</h3>
        <p className='text-2xl font-bold'>{formatCurrency(payment.total_price)}</p>
      </div>

      {/* Admin Actions */}
      <div className='space-y-4 print:hidden'>
        {payment.status === 'pending' && (
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Ghi chú:</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder='Nhập ghi chú...' rows={3} />
          </div>
        )}

        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' onClick={handlePrint}>
              <Printer className='mr-2 w-4 h-4' />
              In hóa đơn
            </Button>
          </div>

          <div className='flex gap-2'>
            <Button variant='outline' onClick={onClose}>
              Đóng
            </Button>
            {payment.status === 'pending' && (
              <>
                <Button variant='destructive' onClick={handleReject} disabled={isUpdating}>
                  {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
                </Button>
                <Button onClick={handleApprove} disabled={isUpdating}>
                  {isUpdating ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className='hidden pt-8 text-sm text-center text-gray-500 print:block'>
        <p>Xin cảm ơn quý khách!</p>
        <p>Vui lòng giữ hóa đơn để đối chiếu khi cần thiết.</p>
      </div>
    </div>
  )
}
