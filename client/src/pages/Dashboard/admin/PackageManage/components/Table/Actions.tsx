import { Button } from '@/components/ui/button'
import { Package, useDeletePackageMutation, useUpdatePackageMutation } from '@/redux/services/packageApi'
import { Eye, MoreHorizontal, Lock, Unlock, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { bufferToHex } from '@/utils/utils'

interface ActionsProps {
  pkg: Package
  onView: (pkg: Package) => void
}

export default function Actions({ pkg, onView }: ActionsProps) {
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation()
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openToggleDialog, setOpenToggleDialog] = useState(false)

  const handleDelete = async () => {
    try {
      const response = await deletePackage(bufferToHex(pkg._id))
      if ('data' in response) {
        toast.success(`Đã xóa gói khám: ${pkg.name}`)
        setOpenDeleteDialog(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi xóa gói khám')
      console.log('error', error)
    }
  }

  const handleToggleActive = async () => {
    try {
      const response = await updatePackage({
        id: bufferToHex(pkg._id),
        body: {
          isActive: !pkg.isActive
        }
      })
      if ('data' in response) {
        const action = pkg.isActive ? 'khóa' : 'mở khóa'
        toast.success(`Đã ${action} gói khám: ${pkg.name}`)
        setOpenToggleDialog(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi thay đổi trạng thái gói khám')
      console.log('error', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='p-0 w-8 h-8'>
            <span className='sr-only'>Mở menu</span>
            <MoreHorizontal className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => onView(pkg)}>
            <Eye className='mr-2 w-4 h-4' />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenToggleDialog(true)}>
            {pkg.isActive ? (
              <>
                <Lock className='mr-2 w-4 h-4' />
                Khóa
              </>
            ) : (
              <>
                <Unlock className='mr-2 w-4 h-4' />
                Mở khóa
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)} className='text-red-500'>
            <Trash className='mr-2 w-4 h-4' />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa gói khám</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa gói khám <span className='font-semibold'>{pkg.name}</span>? Thao tác này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpenDeleteDialog(false)}>
              Hủy
            </Button>
            <Button type='button' variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openToggleDialog} onOpenChange={setOpenToggleDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{pkg.isActive ? 'Xác nhận khóa gói khám' : 'Xác nhận mở khóa gói khám'}</DialogTitle>
            <DialogDescription>
              {pkg.isActive ? (
                <>
                  Bạn có chắc chắn muốn khóa gói khám <span className='font-semibold'>{pkg.name}</span>? Khi khóa, gói
                  khám sẽ không được hiển thị cho người dùng.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn mở khóa gói khám <span className='font-semibold'>{pkg.name}</span>? Khi mở khóa,
                  gói khám sẽ được hiển thị cho người dùng.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpenToggleDialog(false)}>
              Hủy
            </Button>
            <Button
              type='button'
              variant={pkg.isActive ? 'destructive' : 'default'}
              onClick={handleToggleActive}
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang xử lý...' : pkg.isActive ? 'Khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
