import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import React from 'react';

export default function ShippingDeliveryPolicyPage() {
  return (
    <div className='bg-lightviolet/20 min-h-screen'> {/* Ensure background covers the view */}
      <Navbar/>
      {/* Container styled similarly to other policy pages */}
      <div className="my-10 md:mt-12 shadow-md bg-white border border-gray-100 rounded-md mx-auto px-6 py-10 max-w-4xl">

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Shipping and Delivery Policy</h1>

        <p className="text-sm text-gray-600 mb-4">Effective Date: 4 May 2025</p>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Vokely.io, we specialize in providing digital, AI-powered career development tools. As a Software-as-a-Service (SaaS) platform, all our offerings are delivered electronically. This Shipping and Delivery Policy outlines the terms related to the delivery of our digital services.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">1. Nature of Our Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Vokely.io offers the following digital services:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li>AI Resume Builder: Craft professional resumes using our AI-driven templates and suggestions.</li>
            <li>AI Mock Interviewer: Prepare for interviews with simulated AI-driven interview sessions.</li>
            <li>AI Roadmap Generator: Receive personalized career roadmaps to guide your professional journey.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            All services are accessible online and do not involve any physical products or shipments.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">2. Delivery Method</h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li>Digital Access: Upon successful payment, users gain immediate access to the purchased services through their Vokely.io account.</li>
            <li>No Physical Shipping: As our services are entirely digital, there is no physical shipping involved.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">3. Delivery Timeframe</h2>
           <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li>Immediate Availability: Services are available instantly after payment confirmation.</li>
            <li>Account Setup: Users can access their purchased services by logging into their Vokely.io account.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">4. Access Issues</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you experience any issues accessing your purchased services, please contact our support team at <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a>. We are committed to resolving access issues promptly.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">5. International Access</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Vokely.io's digital services are accessible globally. However, users are responsible for ensuring that accessing our services complies with local laws and regulations in their respective countries.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">6. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We reserve the right to modify this Shipping and Delivery Policy at any time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">7. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions or concerns about this policy, please contact us at:
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            Email: <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a>
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
          Address: Coimbatore-641037, India.
          </p>
        </div>

        <p className="text-sm text-gray-600 italic leading-relaxed">
          This policy is designed to align with Indian legal standards and the specific services offered by Vokely.io. For comprehensive legal compliance, consider consulting with a legal professional.
        </p>
      </div>
      <Footer/>
    </div>
  );
}