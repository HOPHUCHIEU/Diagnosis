import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import path from '@/constants/path'
import { BookIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const fakeData = {
  data: {
    courses: [
      {
        id: '1',
        title: 'Khóa học React.js Cơ bản đến Nâng cao',
        category: {
          name: 'Lập trình Web Frontend'
        }
      },
      {
        id: '2',
        title: 'Node.js và Express.js cho Người mới bắt đầu',
        category: {
          name: 'Lập trình Backend'
        }
      },
      {
        id: '3',
        title: 'TypeScript từ Zero đến Hero',
        category: {
          name: 'Lập trình Web Frontend'
        }
      }
    ],
    seminars: [
      {
        id: '1',
        title: 'Workshop về Docker và Kubernetes',
        thumbnail: 'https://picsum.photos/200'
      },
      {
        id: '2',
        title: 'Hội thảo về Trí tuệ Nhân tạo',
        thumbnail: 'https://picsum.photos/200'
      }
    ]
  }
}

export default function SearchHeader() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [isLoadingFilterGlobal, setIsLoadingFilterGlobal] = useState(false)
  const [filterGlobal, setFilterGlobal] = useState<typeof fakeData | null>(null)

  const debouncedSearchValue = useDebounce(searchValue, 200)

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setFilterGlobal(null)
      return
    }

    try {
      setIsLoadingFilterGlobal(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setFilterGlobal(fakeData)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoadingFilterGlobal(false)
    }
  }

  useEffect(() => {
    handleSearch(debouncedSearchValue)
  }, [debouncedSearchValue])

  return (
    <div className='hidden items-center mx-4 space-x-2 w-full max-w-sm md:flex'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Command className='w-full' shouldFilter={false}>
            <CommandInput
              placeholder='Tìm kiếm khóa học...'
              value={searchValue}
              onValueChange={(value) => setSearchValue(value)}
              className='h-11'
            />
          </Command>
        </PopoverTrigger>
        <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
          <Command shouldFilter={false}>
            {isLoadingFilterGlobal ? (
              <CommandEmpty>Đang tìm kiếm...</CommandEmpty>
            ) : !filterGlobal?.data ? (
              <CommandEmpty>Nhập từ khóa để tìm kiếm</CommandEmpty>
            ) : (
              <CommandList>
                {filterGlobal.data.courses?.length > 0 && (
                  <CommandGroup heading='Khóa học'>
                    {filterGlobal.data.courses.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={`${path.landing}/${course.id}`}
                        onSelect={(value) => {
                          navigate(value)
                          setSearchValue('')
                          setOpen(false)
                        }}
                      >
                        <BookIcon className='mr-2 w-4 h-4 text-blue_app' />
                        <div className='flex flex-col'>
                          <span className='font-medium'>{course.title}</span>
                          <span className='text-xs text-muted-foreground'>{course.category.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {filterGlobal.data.seminars?.length > 0 && (
                  <CommandGroup heading='Hội thảo'>
                    {filterGlobal.data.seminars.map((seminar) => (
                      <CommandItem
                        key={seminar.id}
                        value={`${path.landing}/${seminar.id}`}
                        onSelect={(value) => {
                          navigate(value)
                          setSearchValue('')
                          setOpen(false)
                        }}
                      >
                        <Avatar className='mr-2 w-6 h-6'>
                          <AvatarImage src={seminar.thumbnail} />
                          <AvatarFallback>{seminar.title[0]}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{seminar.title}</span>
                          <span className='text-xs text-muted-foreground'>Hội thảo</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {filterGlobal.data.courses?.length === 0 && filterGlobal.data.seminars?.length === 0 && (
                  <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
                )}
              </CommandList>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
