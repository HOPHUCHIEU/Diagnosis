import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'
import { Package, useGetAllActivePackagesQuery } from '@/redux/services/packageApi'
import { bufferToHex } from '@/utils/utils'
import { useCreatePaymentUrlMutation } from '@/redux/services/paymentApi'
import { toast } from 'react-toastify'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const BANK_CODES = [
  { value: 'VNBANK', label: 'Ngân hàng nội địa' },
  { value: 'VNPAYQR', label: 'Quét QR VNPAY' },
  { value: 'INTCARD', label: 'Thẻ quốc tế' }
]

interface Props {
  onClose: () => void
}

export default function BuyPackageDialog({ onClose }: Props) {
  const { data: packagesData, isLoading } = useGetAllActivePackagesQuery(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [bankCode, setBankCode] = useState<string>('VNBANK')
  const [createPaymentUrl, { isLoading: isCreatingPayment }] = useCreatePaymentUrlMutation()

  const handlePurchase = async () => {
    if (selectedPackage) {
      try {
        const packageId = bufferToHex(selectedPackage._id)
        const response = await createPaymentUrl({
          packageId,
          bankCode: bankCode as 'VNBANK' | 'VNPAYQR' | 'INTCARD',
          language: 'vi'
        }).unwrap()

        // Chuyển hướng người dùng đến URL thanh toán
        if (response.data?.paymentUrl) {
          // Mở URL trong tab mới
          window.open(response.data.paymentUrl, '_blank')

          // Đóng dialog
          onClose()

          // Thông báo cho người dùng
          toast.info('Đang chuyển hướng đến trang thanh toán. Vui lòng chờ trong giây lát...')
        } else {
          toast.error('Không thể tạo URL thanh toán. Vui lòng thử lại sau.')
        }
      } catch (error) {
        console.error('Lỗi khi tạo liên kết thanh toán:', error)
        toast.error('Đã xảy ra lỗi khi tạo liên kết thanh toán. Vui lòng thử lại.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className='flex flex-col justify-center items-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
        <p className='mt-4 text-sm text-gray-500'>Đang tải danh sách gói khám...</p>
      </div>
    )
  }

  const packages = packagesData?.data || []

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>Mua lượt khám bệnh</h2>
        <p className='text-sm text-gray-500'>Chọn gói khám phù hợp với nhu cầu của bạn</p>
      </div>

      {packages.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-gray-500'>Không có gói khám nào đang được bán.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {packages.map((pkg) => (
            <Card
              key={bufferToHex(pkg._id)}
              className={`cursor-pointer transition-all ${
                selectedPackage && bufferToHex(selectedPackage._id) === bufferToHex(pkg._id)
                  ? 'border-primary ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardHeader>
                <CardTitle className='min-w-[155px]'>{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{formatCurrency(pkg.price)}</div>
                <div className='mt-4 space-y-2'>
                  {pkg.features.map((feature, index) => (
                    <div key={index} className='flex items-center text-sm'>
                      <CheckCircle className='mr-2 w-4 h-4 text-green-500' />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className='text-sm text-gray-500'>{formatCurrency(pkg.price / pkg.appointmentCount)}/lượt</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedPackage && (
        <div className='p-4 mt-4 rounded-md border bg-slate-50'>
          <h3 className='mb-2 text-sm font-semibold'>Chọn phương thức thanh toán</h3>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Chọn phương thức thanh toán' />
            </SelectTrigger>
            <SelectContent>
              {BANK_CODES.map((bank) => (
                <SelectItem key={bank.value} value={bank.value}>
                  {bank.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='flex gap-2 justify-end pt-4'>
        <Button variant='outline' onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handlePurchase} disabled={!selectedPackage || isCreatingPayment}>
          {isCreatingPayment ? (
            <>
              <Loader2 className='mr-2 w-4 h-4 animate-spin' />
              Đang xử lý...
            </>
          ) : (
            'Tiến hành thanh toán'
          )}
        </Button>
      </div>
    </div>
  )
}
