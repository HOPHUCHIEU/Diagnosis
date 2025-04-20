import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { bufferToHex } from '@/utils/utils'
import { ArrowRight, Search, Award } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Input } from '@/components/ui/input'
import { DoctorProfile } from '@/types/doctor.type'

export default function ListDoctor({ listDoctor }: { listDoctor: DoctorProfile[] }) {
  const navigate = useNavigate()
  const { t } = useTranslation('landing')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDoctors = listDoctor.filter((doctor) => {
    const fullName = `${doctor.doctor?.profile?.firstName} ${doctor.doctor?.profile?.lastName}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    // Tìm kiếm theo tên
    const nameMatch = fullName.includes(searchLower)

    // Tìm kiếm theo chuyên khoa
    const specialtyMatch = doctor.specialties?.some((specialty) => specialty.toLowerCase().includes(searchLower))

    return nameMatch || specialtyMatch
  })

  return (
    <section className='px-6 py-16 bg-gray-50 sm:px-0 sm:-mx-1/1'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-16 max-w-2xl text-center'>
          <h2 className='text-3xl font-bold md:text-4xl'>{t('listDoctor.title')}</h2>
          <p className='mt-4 text-gray-500'>{t('listDoctor.subtitle')}</p>

          {/* Add search input */}
          <div className='relative mx-auto mt-8 max-w-md bg-white'>
            <Search className='absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2' />
            <Input
              type='text'
              placeholder={t('listDoctor.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 rounded-full'
            />
          </div>
        </div>

        <div className='relative'>
          <Carousel
            opts={{
              align: 'start',
              loop: filteredDoctors.length > 4
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-4'>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor, index) => (
                  <CarouselItem
                    key={bufferToHex(doctor._id) + index}
                    className='pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4'
                  >
                    <Card className='overflow-hidden h-full'>
                      <div className='flex flex-col h-full'>
                        <div className='flex items-center p-4 pb-0 w-full'>
                          <Avatar className='w-16 h-16 border-4 border-white'>
                            <AvatarImage src={doctor.doctor?.profile?.avatar} />
                            <AvatarFallback>{doctor.doctor?.profile?.lastName}</AvatarFallback>
                          </Avatar>
                          <div className='ml-4'>
                            <h3 className='text-lg font-semibold capitalize'>
                              {doctor.doctor?.profile?.firstName} {doctor.doctor?.profile?.lastName}
                            </h3>
                            <div className='flex gap-1 items-center mt-1 text-sm text-gray-600'>
                              <Award className='w-3 h-3 text-amber-500' />
                              <span>{doctor.yearsOfExperience} {t('listDoctor.experience')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className='flex flex-wrap gap-2 p-4 pt-3'>
                          {doctor.specialties?.slice(0, 3).map((specialty, idx) => (
                            <Badge
                              key={idx}
                              variant={idx % 2 === 0 ? 'secondary' : 'outline'}
                              className='truncate max-w-[120px]'
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {doctor.specialties?.length > 3 && (
                            <Badge variant='outline' className='bg-gray-50'>
                              +{doctor.specialties.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Bio */}
                        {doctor.biography && (
                          <div className='px-4 pb-3'>
                            <p className='text-sm text-gray-600 line-clamp-2'>{doctor.biography}</p>
                          </div>
                        )}

                        <div className='mt-auto'>
                          <div className='h-[1px] w-full bg-gray-200' />
                          <Button
                            className='w-full justify-between !no-underline text-primary hover:!text-primary'
                            size='sm'
                            variant='link'
                            effect='expandIcon'
                            Icon={ArrowRight}
                            iconPlacement='right'
                            onClick={() => navigate(`/doctor/${bufferToHex(doctor._id)}`)}
                          >
                            {t('listDoctor.bookAppointment')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className='pl-4 basis-full'>
                  <div className='py-8 text-center text-gray-500'>
                    {t('listDoctor.noResults')}
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {filteredDoctors.length > 4 && (
              <>
                <CarouselPrevious className='absolute -left-12 top-1/2' />
                <CarouselNext className='absolute -right-12 top-1/2' />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  )
}
