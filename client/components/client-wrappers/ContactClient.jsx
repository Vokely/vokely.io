"use client";
import  { useState } from 'react';
import {  Mail, MessageSquareText } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import { submitContactForm } from '@/lib/fetchUtil';
import useToastStore from '@/store/toastStore';

const ContactPage = () => {
    const addToast = useToastStore((state) => state.addToast);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await submitContactForm(formData);
      // Show success toast
      if(response.ok){
        addToast('Message sent successfully!', 'success', 'top-middle', 3000);
      }else{
        throw new Error('Failed to send message. Please try again.')
      }
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      // Show error toast
      addToast(error.message || 'Failed to send message. Please try again.', 'error', 'top-middle', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
        <Navbar/>
        <div className="bg-bgviolet min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* Left Column: Contact Info & Image */}
                <div className="space-y-8 text-center md:text-left ">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 font-urbanist">
                    Contact Us
                    </h1>
                    <div className="space-y-4">
                    <div className="flex items-center justify-center md:justify-start space-x-3 ">
                        {/* Using MessageSquareText for WhatsApp - choose another icon if preferred */}
                        <MessageSquareText className="text-primary h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <p className="text-gray-600">
                        WhatsApp Number: <a href="https://wa.me/8300454953" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-hover">8300454953</a>
                        </p>
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                        <Mail className="text-primary h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <p className="text-gray-600">
                        Email: <a href="mailto:support@gmail.com" className="text-primary hover:text-hover">support@vokely.io</a>
                        </p>
                    </div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="mt-8">
                    <img
                        // IMPORTANT: Replace "" with the actual path to your image
                        src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/beta-feedback.png`}
                        alt="Contact illustration"
                        className="w-full h-full md:h-[50vh] max-w-md mx-auto object-contain" // Adjust max-w as needed
                    />
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 font-urbanist">
                    Get in Touch
                    </h2>
                    <p className="text-gray-500 mb-6">
                    Feel free to drop us a line below.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="fullName" className="sr-only">Full Name</label>
                        <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        autoComplete="name"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        autoComplete="tel"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="sr-only">Subject</label>
                        <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="sr-only">Message</label>
                        <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out disabled:opacity-70"
                        >
                        {isSubmitting ? 'SENDING...' : 'SEND'}
                        </button>
                    </div>
                    </form>
                </div>

                </div>
            </div>
        </div>
        <Footer/>
    </div>
  );
};

export default ContactPage;