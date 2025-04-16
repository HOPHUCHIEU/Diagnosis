import { Payment, useGetMyPaymentsQuery } from '@/redux/services/paymentApi'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, RefreshCcw, TriangleAlert } from 'lucide-react'
import PaymentDetail from './PaymentDetail'
import { bufferToHex } from '@/utils/utils'
import { DataTable } from '@/components/ui/data-table'
import { paymentColumns } from './columns'
import { Button } from '@/components/ui/button'

export default function PaymentHistory() {
  const { data, isFetching, error, refetch } = useGetMyPaymentsQuery(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)

  const payments = data?.data || []

  // Chuyển đổi payment từ API thành định dạng bảng
  const tableData = payments.map((payment) => ({
    id: bufferToHex(payment._id),
    date: payment.createdAt,
    amount: payment.total_price,
    status: payment.status,
    method: payment.bank_code,
    paymentDate: payment.payment_date,
    package: payment.package,
    originalData: payment
  }))

  const handleViewPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <TriangleAlert className='w-4 h-4' />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.</AlertDescription>
      </Alert>
    )
  }

  const selectedPayment = tableData.find((payment) => payment.id === selectedPaymentId)?.originalData

  return (
    <div className='space-y-4'>
      {tableData.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-gray-500'>Bạn chưa có giao dịch thanh toán nào.</p>
        </div>
      ) : (
        <DataTable
          columns={paymentColumns(handleViewPayment)}
          data={tableData}
          isLoading={isFetching}
          onReload={() => refetch()}
        />
      )}

      {selectedPayment && (
        <Dialog open={!!selectedPaymentId} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
          <DialogContent className='max-w-3xl'>
            <PaymentDetail payment={selectedPayment} onClose={() => setSelectedPaymentId(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
