import { Button } from '@/components/ui/button'
import { Payment } from '@/redux/services/paymentApi'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/utils'
import { Printer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { bufferToHex } from '@/utils/utils'

interface Props {
  payment: Payment
  onClose: () => void
}

export default function PaymentDetail({ payment, onClose }: Props) {
  const handlePrint = () => {
    window.print()
  }

  // Lấy thông tin gói khám
  const packageName = payment.package?.name || 'Không có thông tin'
  const packageFeatures = payment.package?.features || []
  const packageAppointmentCount = payment.package?.appointmentCount || 0
  const packageValidityPeriod = payment.package?.validityPeriod || 0

  return (
    <div className='space-y-6 print:p-8'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>DIAGNOSIS IQ</h1>
        <p className='text-gray-500'>120 Hoàng Minh Thảo, Liên Chiểu, Đà Nẵng</p>
        <p className='text-gray-500'>Hotline: 1900 1234</p>
      </div>

      <div className='text-center'>
        <h2 className='text-xl font-bold'>HÓA ĐƠN THANH TOÁN</h2>
        <p className='text-sm text-gray-500'>Mã hóa đơn: {bufferToHex(payment._id)}</p>
        <p className='text-sm text-gray-500'>Ngày: {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}</p>
      </div>

      <Separator />

      {/* Package Info */}
      <div className='space-y-4'>
        <h3 className='font-semibold'>Chi tiết gói khám:</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Tên gói khám:</p>
            <p className='font-medium'>{packageName}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Số lượt khám:</p>
            <p className='font-medium'>{packageAppointmentCount} lượt</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Thời hạn sử dụng:</p>
            <p className='font-medium'>{packageValidityPeriod} ngày</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Mô tả:</p>
            <p className='font-medium'>{payment.package?.description || 'Không có mô tả'}</p>
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
        </div>
      </div>

      {/* Total Amount */}
      <div className='flex justify-between items-center py-4 border-t border-b'>
        <h3 className='text-lg font-semibold'>Tổng tiền:</h3>
        <p className='text-2xl font-bold'>{formatCurrency(payment.total_price)}</p>
      </div>

      {/* Actions */}
      <div className='flex justify-between print:hidden'>
        <div className='flex gap-2'>
          <Button size='sm' variant='outline' onClick={handlePrint}>
            <Printer className='mr-2 w-4 h-4' />
            In hóa đơn
          </Button>
        </div>

        <Button variant='outline' onClick={onClose}>
          Đóng
        </Button>
      </div>

      {/* Print Footer */}
      <div className='hidden pt-8 text-sm text-center text-gray-500 print:block'>
        <p>Xin cảm ơn quý khách!</p>
        <p>Vui lòng giữ hóa đơn để đối chiếu khi cần thiết.</p>
      </div>
    </div>
  )
}
