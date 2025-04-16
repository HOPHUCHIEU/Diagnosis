import React, { useState } from 'react'
import { useGetAllAppointmentsQuery } from '@/redux/services/appointmentApi'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Appointment } from '@/types/appointment.type'
import AppointmentDetail from './components/AppointmentDetail'

export default function AppointmentManage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)

  const { data, isFetching, refetch } = useGetAllAppointmentsQuery({
    page,
    limit: pageSize
  })

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Quản lý lịch hẹn</h1>

      <DataTable<Appointment, unknown>
        columns={columns((id) => setSelectedAppointment(id))}
        data={data?.data?.appointments || []}
        onReload={refetch}
        isLoading={isFetching}
        pagination={{
          pageSize,
          total: data?.data?.pagination.total || 0,
          current: page,
          onChange: (newPage) => setPage(newPage),
          onPageSizeChange: handlePageSizeChange
        }}
      />

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className='max-w-3xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          {selectedAppointment && (
            <AppointmentDetail appointmentId={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
