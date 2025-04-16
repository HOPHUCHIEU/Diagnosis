import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Eye, Lock, Unlock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useAdminUpdateUserMutation, useDeleteUserMutation, useGetAllUserQuery } from '@/redux/services/userApi'
import { bufferToHex } from '@/utils/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { User } from '@/types/user.type'

const DeleteAlert = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Hủy</AlertDialogAction>
          <AlertDialogCancel onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Actions = ({ user, onView }: { user: User; onView: (user: User) => void }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const { refetch: refetchGetAllUserQuery } = useGetAllUserQuery(null)
  const [updateUser, { isLoading: isUpdating }] = useAdminUpdateUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const handleToggleDisable = async () => {
    try {
      await updateUser({
        id: bufferToHex(user._id),
        data: { disabled: !user.disabled }
      }).unwrap()
      refetchGetAllUserQuery()
      toast.success(CustomNotification, {
        data: { title: 'Thành công!', content: `Đã ${user.disabled ? 'mở khóa' : 'khóa'} người dùng` }
      })
    } catch (error: any) {
      console.error('error', error)
      toast.error(CustomNotification, {
        data: { title: 'Thất bại!', content: error.data?.message || 'Có lỗi xảy ra' }
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser({ id: bufferToHex(user._id) }).unwrap()
      setShowDeleteAlert(false)
      refetchGetAllUserQuery()
      toast.success(CustomNotification, {
        data: { title: 'Thành công!', content: 'Đã xóa người dùng' }
      })
    } catch (error: any) {
      toast.error(CustomNotification, {
        data: { title: 'Thất bại!', content: error.data?.message || 'Có lỗi xảy ra' }
      })
    }
  }

  return (
    <>
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='w-6 h-6'>
            <MoreVertical className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem onClick={() => onView(user)}>
            <Eye className='w-4 h-4 mr-2' /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleDisable} disabled={isUpdating}>
            {user.disabled ? (
              <>
                <Unlock className='w-4 h-4 mr-2' /> Mở khóa
              </>
            ) : (
              <>
                <Lock className='w-4 h-4 mr-2' /> Khóa tài khoản
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} disabled={isDeleting} className='text-red-600'>
            <Trash2 className='w-4 h-4 mr-2' /> Xóa người dùng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hộp thoại xác nhận xóa */}
      <DeleteAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  )
}

export default Actions
