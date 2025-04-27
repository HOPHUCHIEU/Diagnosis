import { Button } from '@/components/ui/button'
import { columns } from './components/Table/columns'
import { useGetAllUserQuery } from '@/redux/services/userApi'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { ModalCreateUser } from './components/ModalCreateUser'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import DetailUser from './components/DetailUser'
import { User } from '@/types/user.type'

export default function UserManage() {
  const [open, setOpen] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const { data: users, isFetching, refetch } = useGetAllUserQuery(null)

  const handleViewUser = (user: User) => {
    setViewUser(user)
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Quản lý người dùng</h1>
        <Button effect='ringHover' size='sm' className='!h-8' onClick={() => setOpen(true)}>
          <UserPlus className='w-4 h-4 mr-2' />
          Thêm người dùng
        </Button>
      </div>

      <DataTable
        columns={columns(handleViewUser)}
        data={users?.data || []}
        isLoading={isFetching}
        onReload={() => refetch()}
        headerClassName='bg-gray-200 text-sm !font-semibold'
      />

      <ModalCreateUser open={open} onOpenChange={setOpen} />

      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className='max-w-3xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          {viewUser && <DetailUser user={viewUser} onClose={() => setViewUser(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
