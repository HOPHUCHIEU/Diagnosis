import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Package } from '@/redux/services/packageApi'
import Actions from './Actions'
import { formatCurrency } from '@/utils/utils'

export const columns = (onViewPackage: (pkg: Package) => void): ColumnDef<Package>[] => [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div className='ml-1 font-semibold'>{row.index + 1}</div>
    }
  },
  {
    accessorKey: 'name',
    header: 'Tên gói',
    enableHiding: false
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    meta: { className: 'min-w-[250px]' }
  },
  {
    accessorKey: 'appointmentCount',
    header: 'Số lượt khám',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const count = row.getValue('appointmentCount') as number
      return <span className='font-medium'>{count}</span>
    }
  },
  {
    accessorKey: 'price',
    header: 'Giá tiền',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return <span className='font-medium'>{formatCurrency(price)}</span>
    }
  },
  {
    accessorKey: 'validityPeriod',
    header: 'Thời hạn (ngày)',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const days = row.getValue('validityPeriod') as number
      return <span className='font-medium'>{days}</span>
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge
          className={`${isActive ? 'bg-primary/5 text-primary border-primary' : 'text-red-500 border-red-500 bg-red-50/90'} min-w-[100px] justify-center`}
          variant='outline'
        >
          {isActive ? '🟢 Hoạt động' : '🔴 Ngừng hoạt động'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    meta: { className: 'w-[80px] text-center' },
    cell: ({ row }) => <Actions pkg={row.original} onView={onViewPackage} />
  }
]
