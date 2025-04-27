import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  getFilteredRowModel
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Settings2, RefreshCcw, Printer, FileDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  onReload?: () => void
  className?: string
  tableClassName?: string
  headerClassName?: string
  bodyClassName?: string
  rowClassName?: string
  cellClassName?: string
  pagination?: {
    pageSize: number
    total: number
    current: number
    onChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
  }
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      <TableRow className='hover:bg-transparent'>
        {Array.from({ length: columns }).map((_, i) => (
          <TableCell key={i}>
            <Skeleton className='w-full h-6' />
          </TableCell>
        ))}
      </TableRow>
    </>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onReload,
  pagination,
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  cellClassName
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      globalFilter,
      ...(pagination
        ? {
            pagination: {
              pageSize: pagination.pageSize,
              pageIndex: pagination.current - 1
            }
          }
        : {})
    },
    ...(pagination
      ? {
          manualPagination: true,
          pageCount: Math.ceil(pagination.total / pagination.pageSize)
        }
      : {})
  })

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const tableHtml = document.getElementById('data-table')?.outerHTML
    if (!tableHtml) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo dữ liệu</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .print-header { margin-bottom: 20px; }
            .print-footer { margin-top: 20px; text-align: right; font-size: 12px; color: #666; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>Báo cáo dữ liệu</h2>
            <p>Ngày in: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          ${tableHtml}
          <div class="print-footer">
            <p>Trang 1</p>
          </div>
          <div class="no-print">
            <button onclick="window.print()">In báo cáo</button>
          </div>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Input
          placeholder='Tìm kiếm...'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='max-w-sm'
          disabled={isLoading}
        />
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            onClick={handlePrint}
            className='w-9 h-9'
            disabled={isLoading || data.length === 0}
            title='Xuất PDF/In dữ liệu'
          >
            <FileDown className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='icon' onClick={onReload} className='w-9 h-9' disabled={isLoading}>
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon' className='w-9 h-9' disabled={isLoading}>
                <Settings2 className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className={cn('overflow-x-auto rounded-md border', tableClassName)}>
        <Table id='data-table'>
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-sm font-semibold whitespace-nowrap',
                        headerClassName,
                        (header.column.columnDef.meta as any)?.className
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={bodyClassName}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <TableSkeleton key={index} columns={columns.length} />)
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn('cursor-pointer', rowClassName)}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn('whitespace-nowrap', (cell.column.columnDef.meta as any)?.className, cellClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <span>Hiển thị</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>dòng / trang</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-500'>
              Trang {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => pagination.onChange(pagination.current - 1)}
                disabled={pagination.current <= 1 || isLoading}
              >
                Trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => pagination.onChange(pagination.current + 1)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize) || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
