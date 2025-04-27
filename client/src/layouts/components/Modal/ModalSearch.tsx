import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import path from '@/constants/path'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Sử dụng fake data tạm thời
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

export default function ModalSearch() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
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

  const handleItemClick = (type: 'course' | 'seminar', item: any) => {
    navigate(`${path.landing}/${item.id}`)
    setIsOpen(false)
    setSearchValue('')
  }

  return (
    <div className='block md:hidden'>
      <Button variant='ghost' size='icon' className='rounded-full hover:bg-gray-200' onClick={() => setIsOpen(true)}>
        <Search className='w-5 h-5' />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='top-[5%] translate-y-0 gap-0'>
          <DialogHeader>
            <DialogTitle>Tìm kiếm khóa học</DialogTitle>
          </DialogHeader>

          <div className='mt-4'>
            <Input
              placeholder='Tìm kiếm khóa học'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='h-11'
            />
          </div>

          <ScrollArea className='mt-4 max-h-[60vh]'>
            {isLoadingFilterGlobal ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='w-6 h-6 animate-spin' />
              </div>
            ) : (
              <>
                {filterGlobal?.data.courses && filterGlobal.data.courses.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Khóa học</h4>
                    <div className='space-y-2'>
                      {filterGlobal.data.courses.map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50'
                          onClick={() => handleItemClick('course', item)}
                        >
                          <BookOpen className='w-5 h-5 text-blue-600' />
                          <div>
                            <div className='font-medium'>{item.title}</div>
                            <div className='text-sm text-muted-foreground'>{item.category.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filterGlobal?.data.seminars && filterGlobal.data.seminars.length > 0 && (
                  <div className='mt-4 space-y-2'>
                    <h4 className='font-medium'>Hội thảo</h4>
                    <div className='space-y-2'>
                      {filterGlobal.data.seminars.map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50'
                          onClick={() => handleItemClick('seminar', item)}
                        >
                          <Avatar className='w-8 h-8'>
                            <AvatarImage src={item.thumbnail} />
                            <AvatarFallback>{item.title[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>{item.title}</div>
                            <div className='text-sm text-muted-foreground'>Hội thảo</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!filterGlobal ||
                  (filterGlobal.data.courses.length === 0 && filterGlobal.data.seminars.length === 0)) &&
                  searchValue && <div className='py-8 text-center text-muted-foreground'>Không tìm thấy kết quả</div>}

                {!searchValue && !filterGlobal?.data && (
                  <div className='py-8 text-center text-muted-foreground'>Nhập từ khóa để tìm kiếm</div>
                )}
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
