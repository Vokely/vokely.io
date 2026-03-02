'use client'
import { Instagram, Twitter, Copy, Check, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation'
import LinkedIn from '../icons/LinkedIn';
import { products } from '@/data/navItems';
import { useState } from 'react';

export default function Footer() {
    const [activeMenu, setActiveMenu] = useState(null);
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const supportEmail = 'support@vokely.io';

    const handleRedirection = (link)=>{
        setActiveMenu()
        router.push(link)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(supportEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

  return (
    <section id='social' className='bg-black text-white py-5 px-4 sm:px-6 md:px-10'>
        {/* Desktop Footer - Hidden on mobile */}
        <div className='hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-10 place-items-start md:place-items-center mt-10'>
            <div className='min-h-[15vh] lg:min-h-[20vh]'>
                <h3 className='font-bold text-xl'>Vokely.io</h3>
                <div className='mt-4'>
                    <div className='flex items-center gap-2 mt-2 text-sm'>
                        <Mail size={16} className='text-primary' />
                        <span className='text-gray-300'>Support:</span>
                    </div>
                    <div className='flex items-center mt-1 bg-gray-900 rounded-md p-2 pr-1 hover:bg-gray-800 transition-colors duration-300 cursor-pointer' onClick={copyToClipboard}>
                        <span className='text-gray-300 text-sm mr-2'>{supportEmail}</span>
                        <div className='bg-gray-700 p-1 rounded-md hover:bg-primary transition-colors duration-300'>
                            {copied ? <Check size={14} className='text-white' /> : <Copy size={14} className='text-white' />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Redirects */}
            {products.map((item,i)=>(
            <div className='min-h-[15vh] lg:min-h-[20vh]' key={i}>
                <h4 className='text-normal font-medium'>{item.heading}</h4>
                <div className='mt-2'>
                    {item.columns.map((col,inx)=>(
                        <p
                            className='text-blue-500 mt-1 cursor-pointer hover:text-white transition-colors duration-300'
                            key={inx}
                            onClick={()=>handleRedirection(col.link)}
                        >
                            {col.name}
                        </p>
                    ))}
                </div>
            </div>
            ))}

            {/* Social Media */}
            <div className='h-full'>
                <p className='font-medium'>Connect</p>
                <div className='flex items-center gap-5 mt-3'>
                    <a href="https://x.com/genresume_io?t=eVvGtprM6sTtylqovA93Xg&s=09" target="_blank" rel="noopener noreferrer">
                        <Twitter size={22} className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                    </a>
                    <a href="https://www.linkedin.com/company/genresume-io/" target="_blank" rel="noopener noreferrer">
                    <LinkedIn size={22} fillColor='white' className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                    </a>
                    <a href="https://www.instagram.com/vokely.io" target="_blank" rel="noopener noreferrer">
                        <Instagram size={22} className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                    </a>
                </div>
            </div>
        </div>

        {/* Mobile Footer - Only visible on mobile */}
        <div className='md:hidden flex flex-col items-center py-6'>
            <h3 className='font-bold text-xl mb-4'>Vokely.io</h3>

            {/* Support Email for Mobile */}
            <div className='mb-4 w-full max-w-[280px]'>
                <div className='flex items-center justify-center gap-2 mb-1'>
                    <Mail size={14} className='text-primary' />
                    <span className='text-gray-300 text-sm'>Support:</span>
                </div>
                <div
                    className='flex items-center justify-between bg-gray-900 rounded-md p-2 hover:bg-gray-800 transition-colors duration-300 cursor-pointer w-full'
                    onClick={copyToClipboard}
                >
                    <span className='text-gray-300 text-sm'>{supportEmail}</span>
                    <div className='bg-gray-700 p-1 rounded-md hover:bg-primary transition-colors duration-300'>
                        {copied ? <Check size={14} className='text-white' /> : <Copy size={14} className='text-white' />}
                    </div>
                </div>
            </div>

            {/* Social Media Icons */}
            <div className='flex items-center justify-center gap-6 my-4'>
                <a href="https://x.com/genresume_io?t=eVvGtprM6sTtylqovA93Xg&s=09" target="_blank" rel="noopener noreferrer">
                    <Twitter size={20} className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                </a>
                <a href="https://www.linkedin.com/company/genresume-io/" target="_blank" rel="noopener noreferrer">
                <LinkedIn size={20} fillColor='white' className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                </a>
                <a href="https://www.instagram.com/vokely.io" target="_blank" rel="noopener noreferrer">
                    <Instagram size={20} className='cursor-pointer hover:text-primary transition-colors duration-300'/>
                </a>
            </div>
        </div>

        {/* Copyright and Legal - Responsive for all devices */}
        <div className='flex flex-col sm:flex-row justify-between items-center border-t border-gray-800 mt-4 pt-4 text-xs sm:text-sm text-gray-400'>
            <p className='mb-2 sm:mb-0'>Vokely.io@2025</p>
            <p className='mb-2 sm:mb-0 hidden sm:block'>ALL RIGHTS RESERVED</p>
            <p className='text-center sm:text-right'>
                <a href="/privacy" className='cursor-pointer hover:text-white transition-colors duration-300'>Privacy Policy</a> |
                <a href="/terms" className='cursor-pointer hover:text-white transition-colors duration-300'> Terms of Service</a>|
                <a href="/cancellation" className='cursor-pointer hover:text-white transition-colors duration-300'> Cancellation Policy</a>
            </p>
        </div>
    </section>
  )
}