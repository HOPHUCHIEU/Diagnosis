import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Building2, Mail, Phone, Clock, LucideIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContactFormData {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

export default function Contact() {
    const { t } = useTranslation('landing')

    const contactSchema = yup.object().shape({
        name: yup.string().required(t('validation.required', { field: t('contact.form.name').toLowerCase() })),
        email: yup
            .string()
            .required(t('validation.required', { field: t('contact.form.email').toLowerCase() }))
            .email(t('validation.email')),
        phone: yup
            .string()
            .required(t('validation.required', { field: t('contact.form.phone').toLowerCase() }))
            .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, t('validation.phone')),
        subject: yup.string().required(t('validation.required', { field: t('contact.form.subject').toLowerCase() })),
        message: yup.string().required(t('validation.required', { field: t('contact.form.message').toLowerCase() }))
    })

    const form = useForm<ContactFormData>({
        resolver: yupResolver(contactSchema)
    })

    const onSubmit = async (data: ContactFormData) => {
        try {
            // Here you would typically send the data to your backend
            console.log('Form data:', data)

            toast.success(CustomNotification, {
                data: {
                    title: 'Success',
                    content: t('contact.form.success')
                }
            })
            form.reset()
        } catch (error) {
            toast.error(CustomNotification, {
                data: {
                    title: 'Error',
                    content: t('contact.form.error')
                }
            })
        }
    }

    const ContactInfo = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
        <div className="flex items-start gap-3 text-gray-600">
            <Icon className="w-5 h-5 mt-1 text-primary" />
            <div>
                <p className="font-medium text-gray-700">{label}</p>
                <p>{value}</p>
            </div>
        </div>
    )

    return (
        <div className="container py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">{t('contact.hero.title')}</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">{t('contact.hero.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Contact Form */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('contact.form.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.form.name')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.form.email')}</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.form.phone')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('contact.form.subject')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('contact.form.message')}</FormLabel>
                                            <FormControl>
                                                <Textarea rows={5} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" effect="ringHover" className="w-full">
                                    {t('contact.form.submit')}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('contact.info.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ContactInfo
                            icon={Building2}
                            label={t('contact.info.address.label')}
                            value={t('contact.info.address.value')}
                        />
                        <ContactInfo
                            icon={Mail}
                            label={t('contact.info.email.label')}
                            value={t('contact.info.email.value')}
                        />
                        <ContactInfo
                            icon={Phone}
                            label={t('contact.info.phone.label')}
                            value={t('contact.info.phone.value')}
                        />
                        <ContactInfo
                            icon={Clock}
                            label={t('contact.info.hours.label')}
                            value={t('contact.info.hours.value')}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}