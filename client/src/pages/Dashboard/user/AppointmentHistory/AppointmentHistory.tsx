import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useGetMyAppointmentsQuery } from '@/redux/services/appointmentApi'
import { Appointment } from '@/types/appointment.type'
import { appointmentColumns } from './components/columns'
import AppointmentDetail from './components/AppointmentDetail'

export default function AppointmentHistory() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)

  const { data, isFetching, refetch } = useGetMyAppointmentsQuery({
    page,
    limit: pageSize
  })

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Lịch sử khám bệnh</h1>

      <DataTable<Appointment, unknown>
        columns={appointmentColumns((id) => setSelectedAppointment(id))}
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
