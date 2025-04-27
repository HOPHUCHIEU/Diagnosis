import React from 'react'
import { Heart, Brain, Eye, Shield, Stethoscope, Thermometer } from 'lucide-react'

const ServiceCard = ({ title, description, icon: Icon }: any) => {
  return (
    <div className='p-6 bg-white rounded-lg border border-gray-100 shadow-md transition-shadow hover:shadow-lg'>
      <div className='flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-primary/10'>
        <Icon className='w-6 h-6 text-primary' />
      </div>
      <h3 className='mb-2 text-xl font-semibold'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}

const Services = () => {
  const services = [
    {
      title: 'Tim Mạch',
      description: 'Chuyên gia tim mạch hàng đầu giúp chẩn đoán và điều trị các bệnh lý tim mạch.',
      icon: Heart
    },
    {
      title: 'Nội Tổng Hợp',
      description: 'Giải quyết các vấn đề sức khỏe tổng quát với đội ngũ bác sĩ giàu kinh nghiệm.',
      icon: Stethoscope
    },
    {
      title: 'Thần Kinh',
      description: 'Chăm sóc và điều trị các bệnh lý thần kinh với phương pháp tiên tiến.',
      icon: Brain
    },
    {
      title: 'Nhãn Khoa',
      description: 'Chăm sóc sức khỏe đôi mắt và điều trị các bệnh về mắt hiệu quả.',
      icon: Eye
    },
    {
      title: 'Miễn Dịch & Dị Ứng',
      description: 'Điều trị các bệnh dị ứng và rối loạn miễn dịch với phương pháp hiện đại.',
      icon: Shield
    },
    {
      title: 'Nhi Khoa',
      description: 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên.',
      icon: Thermometer
    }
  ]

  return (
    <section className='py-16'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Dịch Vụ Y Tế</h2>
          <p className='text-lg text-gray-600'>
            Chúng tôi cung cấp nhiều dịch vụ y tế chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => (
            <ServiceCard key={index} title={service.title} description={service.description} icon={service.icon} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
