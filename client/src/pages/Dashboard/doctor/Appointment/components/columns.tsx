import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import { Appointment } from '@/types/appointment.type'
import { Badge } from '@/components/ui/badge'
import { bufferToHex } from '@/utils/utils'

const getStatusBadge = (status: string) => {
  const styles = {
    pending: '!bg-yellow-100 text-yellow-800',
    confirmed: '!bg-blue-100 text-blue-800',
    completed: '!bg-green-100 text-green-800',
    cancelled: '!bg-red-100 text-red-800'
  }[status]

  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }[status]

  return <Badge className={styles + ' min-w-[100px] justify-center'}>{labels}</Badge>
}

export const columns = (onView: (id: string) => void): ColumnDef<Appointment>[] => [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div className='ml-1 font-semibold'>{row.index + 1}</div>
    }
  },
  {
    accessorKey: 'patient',
    header: 'Bệnh nhân',
    cell: ({ row }) => {
      const patient = row.original.patient
      return patient.profile ? `${patient.profile.firstName} ${patient.profile.lastName}` : 'N/A'
    }
  },
  {
    accessorKey: 'appointmentDate',
    header: 'Ngày khám',
    cell: ({ row }) => format(new Date(row.original.appointmentDate), 'dd/MM/yyyy')
  },
  {
    accessorKey: 'startTime',
    header: 'Thời gian',
    cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`
  },
  {
    accessorKey: 'type',
    header: 'Hình thức',
    cell: ({ row }) => (row.original.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp')
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => getStatusBadge(row.original.status)
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant='ghost' size='icon' onClick={() => onView(bufferToHex(row.original._id))}>
        <Eye className='w-4 h-4' />
      </Button>
    )
  }
]
