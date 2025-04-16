import { Package, PackageParams, useUpdatePackageMutation } from '@/redux/services/packageApi'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'
import { bufferToHex, formatCurrency } from '@/utils/utils'

interface DetailPackageProps {
  pkg: Package
  onClose?: () => void
}

const packageFormSchema = yup.object({
  name: yup.string().min(2, 'Tên gói phải có ít nhất 2 ký tự').required('Tên gói là bắt buộc'),
  description: yup.string().min(5, 'Mô tả phải có ít nhất 5 ký tự').required('Mô tả là bắt buộc'),
  appointmentCount: yup.number().min(1, 'Số lượt khám phải lớn hơn 0').required('Số lượt khám là bắt buộc'),
  price: yup.number().min(1000, 'Giá tiền phải lớn hơn 1.000 VND').required('Giá tiền là bắt buộc'),
  isActive: yup.boolean().required('Trạng thái là bắt buộc'),
  validityPeriod: yup.number().min(1, 'Thời hạn phải lớn hơn 0 ngày').required('Thời hạn là bắt buộc'),
  features: yup.array().of(yup.string()).min(1, 'Phải có ít nhất 1 tính năng').required('Tính năng là bắt buộc')
})

export default function DetailPackage({ pkg, onClose }: DetailPackageProps) {
  const [updatePackage, { isLoading }] = useUpdatePackageMutation()
  const [newFeature, setNewFeature] = useState('')

  const methods = useForm<PackageParams>({
    resolver: yupResolver(packageFormSchema) as any,
    defaultValues: {
      name: pkg.name,
      description: pkg.description,
      appointmentCount: pkg.appointmentCount,
      price: pkg.price,
      isActive: pkg.isActive,
      validityPeriod: pkg.validityPeriod,
      features: pkg.features
    }
  })

  const { handleSubmit, control, watch, setValue } = methods
  const features = watch('features')

  const onSubmit = async (data: PackageParams) => {
    try {
      const response = await updatePackage({
        id: bufferToHex(pkg._id),
        body: data
      })
      if ('data' in response) {
        toast.success(`Đã cập nhật gói khám: ${data.name}`)
        onClose?.()
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setValue('features', [...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setValue(
      'features',
      features.filter((_, i) => i !== index)
    )
  }

  return (
    <Tabs defaultValue='info' className='w-full'>
      <TabsList>
        <TabsTrigger value='info'>Thông tin</TabsTrigger>
        <TabsTrigger value='edit'>Chỉnh sửa</TabsTrigger>
      </TabsList>
      <TabsContent value='info' className='p-4'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-semibold'>Thông tin cơ bản</h3>
            <div className='grid grid-cols-2 gap-4 mt-2'>
              <div>
                <p className='text-sm text-gray-500'>Tên gói</p>
                <p className='font-medium'>{pkg.name}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Giá tiền</p>
                <p className='font-medium'>{formatCurrency(pkg.price)}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Số lượt khám</p>
                <p className='font-medium'>{pkg.appointmentCount} lượt</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Thời hạn</p>
                <p className='font-medium'>{pkg.validityPeriod} ngày</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Trạng thái</p>
                <Badge
                  className={`${pkg.isActive ? 'bg-primary/5 text-primary border-primary' : 'text-red-500 border-red-500 bg-red-50/90'} mt-1`}
                  variant='outline'
                >
                  {pkg.isActive ? '🟢 Hoạt động' : '🔴 Ngừng hoạt động'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold'>Mô tả</h3>
            <p className='mt-2'>{pkg.description}</p>
          </div>

          <div>
            <h3 className='text-lg font-semibold'>Tính năng</h3>
            <div className='flex flex-wrap gap-2 mt-2'>
              {pkg.features.map((feature, index) => (
                <Badge key={index} variant='outline' className='text-sm'>
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold'>Thông tin thêm</h3>
            <div className='grid grid-cols-2 gap-4 mt-2'>
              <div>
                <p className='text-sm text-gray-500'>Ngày tạo</p>
                <p className='font-medium'>{new Date(pkg.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Cập nhật lần cuối</p>
                <p className='font-medium'>{new Date(pkg.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value='edit'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='p-4 space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên gói</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên gói' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá tiền (VND)</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} placeholder='Nhập giá tiền' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='appointmentCount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượt khám</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} placeholder='Nhập số lượt khám' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='validityPeriod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời hạn (ngày)</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} placeholder='Nhập thời hạn' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập mô tả chi tiết về gói khám'
                      className='resize-none min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: string) => field.onChange(value === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                      className='flex flex-row space-x-4'
                    >
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='true' />
                        </FormControl>
                        <FormLabel className='cursor-pointer'>Hoạt động</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='false' />
                        </FormControl>
                        <FormLabel className='cursor-pointer'>Ngừng hoạt động</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='features'
              render={() => (
                <FormItem>
                  <FormLabel>Tính năng</FormLabel>
                  <div className='space-y-4'>
                    <div className='flex space-x-2'>
                      <Input
                        placeholder='Thêm tính năng mới (Enter để thêm)'
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {features.map((feature, index) => (
                        <Badge key={index} variant='secondary' className='px-3 py-1 text-sm'>
                          {feature}
                          <X className='ml-2 w-3 h-3 cursor-pointer' onClick={() => removeFeature(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </TabsContent>
    </Tabs>
  )
}
