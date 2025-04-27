import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Package, useGetAllPackagesQuery } from '@/redux/services/packageApi'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { columns } from './components/Table/columns'
import { PackagePlus } from 'lucide-react'
import DetailPackage from './components/DetailPackage'
import ModalCreatePackage from './components/ModalCreatePackage'

export default function PackageManage() {
  const [open, setOpen] = useState(false)
  const [viewPackage, setViewPackage] = useState<Package | null>(null)
  const { data: packages, isFetching, refetch } = useGetAllPackagesQuery(null)

  const handleViewPackage = (pkg: Package) => {
    setViewPackage(pkg)
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Quản lý gói khám</h1>
        <Button effect='ringHover' size='sm' className='!h-8' onClick={() => setOpen(true)}>
          <PackagePlus className='w-4 h-4 mr-2' />
          Thêm gói khám
        </Button>
      </div>

      <DataTable
        columns={columns(handleViewPackage)}
        data={packages?.data || []}
        isLoading={isFetching}
        onReload={() => refetch()}
        headerClassName='bg-gray-200 text-sm !font-semibold'
      />

      <ModalCreatePackage open={open} onOpenChange={setOpen} />

      <Dialog open={!!viewPackage} onOpenChange={(open) => !open && setViewPackage(null)}>
        <DialogContent className='max-w-3xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          {viewPackage && <DetailPackage pkg={viewPackage} onClose={() => setViewPackage(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
