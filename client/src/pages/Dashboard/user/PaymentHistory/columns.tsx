import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/types/appointment.type'
import { formatCurrency } from '@/utils/utils'
import { Button } from '@/components/ui/button'
import { Eye, Copy } from 'lucide-react'
import { Package } from '@/redux/services/packageApi'
import { toast } from 'sonner'

export const appointmentColumns: ColumnDef<Appointment, unknown>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div className='ml-1 font-semibold'>{row.index + 1}</div>
    }
  },
  {
    id: 'date',
    accessorKey: 'appointmentDate',
    header: 'Ngày khám',
    accessorFn: (row) => format(new Date(row.appointmentDate), 'dd/MM/yyyy')
  },
  {
    id: 'time',
    accessorKey: 'startTime',
    header: 'Giờ khám',
    accessorFn: (row) => `${row.startTime} - ${row.endTime}`
  },
  {
    id: 'doctor',
    accessorKey: 'doctor',
    header: 'Bác sĩ',
    accessorFn: (row) => `${row.doctor.profile?.firstName} ${row.doctor.profile?.lastName}`
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Hình thức',
    cell: ({ row }) => (
      <Badge variant='outline'>{row.getValue('type') === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</Badge>
    ),
    accessorFn: (row) => row.type
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as Appointment['status']

      const variant: any = {
        completed: 'default',
        pending: 'secondary',
        confirmed: 'outline',
        cancelled: 'destructive'
      }[status]

      const label = {
        completed: 'Hoàn thành',
        pending: 'Chờ khám',
        confirmed: 'Đã xác nhận',
        cancelled: 'Đã hủy'
      }[status]

      return <Badge variant={variant}>{label}</Badge>
    },
    accessorFn: (row) => row.status
  }
]

interface PaymentData {
  id: string
  date: string
  amount: number
  status: string
  method: string
  paymentDate?: string
  originalData?: any
}

export const paymentColumns = (onView?: (id: string) => void): ColumnDef<PaymentData>[] => [
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
    accessorKey: 'date',
    header: 'Ngày tạo',
    cell: ({ row }) => {
      const date = row.getValue('date') as string
      return <span>{format(new Date(date), 'dd/MM/yyyy HH:mm')}</span>
    }
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return <span className='font-medium'>{formatCurrency(amount)}</span>
    }
  },
  {
    accessorKey: 'method',
    header: 'Phương thức',
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return <span>{method}</span>
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
    cell: ({ row }) => {
      const payment = row.original

      return onView ? (
        <Button variant='ghost' size='icon' onClick={() => onView(payment.id)}>
          <Eye className='w-4 h-4' />
        </Button>
      ) : null
    }
  }
]
