<<<<<<< HEAD
import React from 'react'
import { Calendar, Video, Stethoscope, ArrowRight } from 'lucide-react'

interface StepProps {
  number: number
  title: string
  description: string
  icon: React.ElementType
}

const Step = ({ number, title, description, icon: Icon }: StepProps) => {
=======
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    stepKey: "step1",
    image: "/landing/appointment.svg",
  },
  {
    stepKey: "step2",
    image: "/landing/tele.svg",
  },
  {
    stepKey: "step3",
    image: "/landing/dashboard.svg",
  },
  {
    stepKey: "step4",
    image: "/landing/quick_consultant.svg",
  },
] as const;

export default function HowItWorks() {
  const { t } = useTranslation();

  const getTranslation = (key: string) => {
    return t(key as any);
  };

>>>>>>> 83ce7fb136b27a5e9574eea92476249fa1b1248f
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{getTranslation("howItWorks.title")}</h2>
        <p className="text-gray-600">{getTranslation("howItWorks.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <Card key={step.stepKey} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <img
                  src={step.image}
                  alt={getTranslation(`howItWorks.steps.${step.stepKey}.title`)}
                  className="w-24 h-24 mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  {getTranslation(`howItWorks.steps.${step.stepKey}.title`)}
                </h3>
                <p className="text-gray-600 text-center">
                  {getTranslation(`howItWorks.steps.${step.stepKey}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
<<<<<<< HEAD
      <h3 className='mb-2 text-xl font-semibold'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
=======
>>>>>>> 83ce7fb136b27a5e9574eea92476249fa1b1248f
    </div>
  );
}
<<<<<<< HEAD

const HowItWorks = () => {
  const steps: StepProps[] = [
    {
      number: 1,
      title: 'Đặt lịch khám',
      description: 'Chọn bác sĩ chuyên khoa phù hợp và đặt lịch khám dễ dàng trực tuyến.',
      icon: Calendar
    },
    {
      number: 2,
      title: 'Tư vấn trực tuyến',
      description: 'Kết nối với bác sĩ qua video call an toàn và riêng tư, không cần ra khỏi nhà.',
      icon: Video
    },
    {
      number: 3,
      title: 'Nhận chẩn đoán',
      description: 'Bác sĩ sẽ tư vấn, chẩn đoán và cung cấp phương pháp điều trị phù hợp.',
      icon: Stethoscope
    },
    {
      number: 4,
      title: 'Tái khám',
      description: 'Đặt lịch tái khám để bác sĩ theo dõi tình trạng sức khỏe theo đề xuất.',
      icon: ArrowRight
    }
  ]

  return (
    <section className='py-16 bg-white'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Cách Thức Hoạt Động</h2>
          <p className='text-lg text-gray-600'>
            Quy trình đơn giản để kết nối với bác sĩ và nhận tư vấn y tế chất lượng cao
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <Step key={index} number={step.number} title={step.title} description={step.description} icon={step.icon} />
          ))}
        </div>

        <div className='flex justify-center mt-12'>
          <div className='relative w-3/4 h-1 bg-gray-200 rounded-full md:hidden'></div>
          <div className='hidden relative w-3/4 h-1 bg-gray-200 rounded-full md:block'>
            <div className='absolute top-0 left-0 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-1/4 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-2/4 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-3/4 w-1/4 h-1 rounded-full bg-primary'></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
=======
>>>>>>> 83ce7fb136b27a5e9574eea92476249fa1b1248f
