import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCreateUserMutation, useGetAllUserQuery } from '@/redux/services/userApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'
import { createUserSchema, type CreateUserSchema } from '@/utils/rules'
import { CreateUserInput } from '@/types/user.type'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalCreateUser({ open, onOpenChange }: Props) {
  const [createUser, { isLoading }] = useCreateUserMutation()
  const { refetch: refetchGetAllUserQuery } = useGetAllUserQuery(null)
  const form = useForm<CreateUserSchema>({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      gender: 'male'
    }
  })

  const onSubmit = async (values: CreateUserSchema) => {
    try {
      const userData: CreateUserInput = {
        ...values,
        fullName: `${values.firstName} ${values.lastName}`,
        birth: format(values.birth, 'yyyy-MM-dd'),
        address: '',
        avatar: '',
        disabled: false,
        isVerified: false
      }

      await createUser(userData).unwrap()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Tạo người dùng mới thành công'
        }
      })
      form.reset()
      refetchGetAllUserQuery()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: error.data?.message || 'Có lỗi xảy ra'
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='lg:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='Mật khẩu' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input placeholder='Họ' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder='Tên' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder='Số điện thoại' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='birth'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn giới tính' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='male'>Nam</SelectItem>
                      <SelectItem value='female'>Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn vai trò' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='user'>Người dùng</SelectItem>
                      <SelectItem value='doctor'>Bác sĩ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='!justify-center'>
              <Button className='min-w-[150px]' effect='ringHover' type='submit' disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
