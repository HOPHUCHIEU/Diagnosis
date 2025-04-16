import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/utils'
import { Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentData {
  id: string
  packageId: string
  packageName: string
  userId: string
  userName: string
  date: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  method: string
  paymentDate?: string
}

export const paymentColumns = (onView: (payment: PaymentData) => void): ColumnDef<PaymentData>[] => [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div className='ml-1 font-semibold'>{row.index + 1}</div>
    }
  },
  {
    accessorKey: 'id',
    header: 'Mã giao dịch',
    cell: ({ row }) => {
      const id = row.getValue('id') as string

      const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(id)
        toast.success('Đã sao chép mã giao dịch')
      }

      return (
        <div className='flex gap-1 items-center'>
          <span className='font-medium'>{id.substring(0, 8)}...</span>
          <Button variant='ghost' size='icon' onClick={handleCopyId} className='w-5 h-5' title='Sao chép mã giao dịch'>
            <Copy className='w-3 h-3' />
          </Button>
        </div>
      )
    }
  },
  {
    accessorKey: 'userName',
    header: 'Khách hàng',
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string
      return <div>{userName}</div>
    }
  },
  {
    accessorKey: 'packageName',
    header: 'Gói khám',
    cell: ({ row }) => {
      const packageName = row.getValue('packageName') as string
      return <div>{packageName}</div>
    }
  },
  {
    accessorKey: 'date',
    header: 'Ngày tạo',
    cell: ({ row }) => {
      const date = row.getValue('date') as string
      return <div>{format(new Date(date), 'dd/MM/yyyy HH:mm')}</div>
    }
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return <div className='font-medium'>{formatCurrency(amount)}</div>
    }
  },
  {
    accessorKey: 'method',
    header: 'Phương thức',
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return <div>{method}</div>
    }
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'paid' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
          {status === 'paid' && 'Đã thanh toán'}
          {status === 'pending' && 'Chờ thanh toán'}
          {status === 'cancelled' && 'Đã hủy'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => {
      const payment = row.original
      return (
        <Button variant='ghost' size='icon' onClick={() => onView(payment)}>
          <Eye className='w-4 h-4' />
        </Button>
      )
    }
  }
]
