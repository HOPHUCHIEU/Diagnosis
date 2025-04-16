import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PackageParams, useCreatePackageMutation } from '@/redux/services/packageApi'
import { FormProvider, useForm } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

interface ModalCreatePackageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export default function ModalCreatePackage({ open, onOpenChange }: ModalCreatePackageProps) {
  const [createPackage, { isLoading }] = useCreatePackageMutation()
  const [newFeature, setNewFeature] = useState('')

  const methods = useForm<PackageParams>({
    resolver: yupResolver(packageFormSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      appointmentCount: 1,
      price: 100000,
      isActive: true,
      validityPeriod: 365,
      features: []
    }
  })

  const { handleSubmit, control, watch, setValue, reset } = methods
  const features = watch('features')

  const onSubmit = async (data: PackageParams) => {
    try {
      const response = await createPackage(data)
      if ('data' in response) {
        toast.success(`Đã tạo gói khám: ${data.name}`)
        reset()
        onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo gói khám mới</DialogTitle>
          <DialogDescription>Thêm gói khám mới vào hệ thống.</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
                        placeholder='Thêm tính năng mới'
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type='button' onClick={addFeature}>
                        Thêm
                      </Button>
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

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
