import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import Actions from './Actions'
import { User } from '@/types/user.type'
import { Button } from '@/components/ui/button'
import { bufferToHex } from '@/utils/utils'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export const columns = (onViewUser: (user: User) => void): ColumnDef<User>[] => [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div className='ml-1 font-semibold'>{row.index + 1}</div>
    }
  },
  {
    accessorFn: (row) => bufferToHex(row._id),
    header: 'ID',
    id: 'id',
    meta: { className: 'max-w-[120px] truncate' },
    cell: ({ row }) => {
      const id = row.getValue('id') as string

      const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          // Phương pháp 1: Sử dụng Clipboard API (hiện đại)
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(id)
              .then(() => {
                toast.success('Đã sao chép ID vào clipboard.')
              })
              .catch(() => {
                fallbackCopyToClipboard(id)
              })
          } else {
            fallbackCopyToClipboard(id)
          }
        } catch (error) {
          console.error('Không thể sao chép ID:', error)
          toast.error('Không thể sao chép ID. Vui lòng thử lại.')
        }
      }

      // Phương pháp sao chép dự phòng sử dụng document.execCommand
      const fallbackCopyToClipboard = (text: string) => {
        try {
          // Tạo một element tạm thời
          const textArea = document.createElement('textarea')
          textArea.value = text

          // Đảm bảo textArea nằm ngoài màn hình
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)

          // Chọn và sao chép nội dung
          textArea.focus()
          textArea.select()
          const success = document.execCommand('copy')

          // Xóa element tạm thời
          document.body.removeChild(textArea)

          if (success) {
            toast.success('Đã sao chép ID vào clipboard.')
          } else {
            throw new Error('Không thể sao chép')
          }
        } catch (err) {
          toast.error('Không thể sao chép ID. Vui lòng thử lại.')
        }
      }

      return (
        <div className='flex items-center gap-1'>
          <span className='font-mono text-xs truncate' title={id}>
            {id.substring(0, 8)}...
          </span>
          <Button variant='ghost' size='icon' onClick={handleCopyId} className='w-5 h-5' title='Sao chép ID'>
            <Copy className='w-3 h-3' />
          </Button>
        </div>
      )
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableHiding: false
  },
  {
    accessorFn: (row) => `${row?.profile?.firstName || ''} ${row?.profile?.lastName || ''}`,
    header: 'Họ và tên',
    id: 'fullName'
  },
  {
    accessorFn: (row) => row?.profile?.gender,
    header: 'Giới tính',
    meta: { className: 'text-center' },
    id: 'gender',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string
      return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'
    }
  },
  // {
  //   accessorFn: (row) => row?.profile?.address || '',
  //   header: 'Địa chỉ',
  //   meta: { className: 'text-center min-w-[250px]' },
  //   id: 'address'
  // },
  {
    accessorFn: (row) => row?.profile?.phone || '',
    header: 'Số điện thoại',
    meta: { className: 'text-center min-w-[150px]' },
    id: 'phone'
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    meta: { className: 'text-center min-w-[100px]' },
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Button
          className='!text-xs !px-2 !py-1 !h-6 !w-16 !font-semibold'
          effect='shine'
          variant={role === 'admin' ? 'destructive' : role === 'doctor' ? 'default' : 'secondary'}
        >
          {role.toUpperCase()}
        </Button>
      )
    }
  },
  {
    accessorKey: 'disabled',
    header: 'Trạng thái',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const disabled = row.getValue('disabled') as boolean
      return (
        <Badge
          className={`${disabled ? 'text-red-500 border-red-500 bg-red-50/90' : 'bg-primary/5 text-primary border-primary'} min-w-[100px] justify-start`}
          variant='outline'
        >
          {disabled ? '🔴 Đã khóa' : '🟢 Hoạt động'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'isVerified',
    header: 'Xác thực',
    meta: { className: 'text-center' },
    cell: ({ row }) => {
      const isVerified = row.getValue('isVerified') as boolean
      return (
        <Badge className='min-w-[100px] justify-center' variant={isVerified ? 'info' : 'warning'}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    meta: { className: 'w-[80px] text-center' },
    cell: ({ row }) => <Actions user={row.original} onView={onViewUser} />
  }
]
