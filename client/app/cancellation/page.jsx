import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import React from 'react';

export default function CancellationRefundPolicyPage() {
  return (
    <div className='bg-lightviolet/20 min-h-screen'> {/* Ensure background covers the view */}
      <Navbar/>
      {/* Container styled similarly to other policy pages */}
      <div className="my-10 md:mt-12 shadow-md bg-white border border-gray-100 rounded-md mx-auto px-6 py-10 max-w-4xl">

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Cancellation and Refund Policy</h1>

        <p className="text-sm text-gray-600 mb-4">Effective Date: 4 May 2025</p>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">Introduction</h2> {/* Changed heading slightly for clarity */}
          <p className="text-gray-700 leading-relaxed mb-4">
            At Vokely.io, we are dedicated to providing high-quality, AI-powered career development tools to our users. This Cancellation and Refund Policy outlines the terms and conditions under which cancellations and refunds are processed. By purchasing our services, you agree to this policy.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">1. Nature of Purchase</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Vokely.io offers a one-time purchase model, granting users lifetime access to our suite of services, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li >AI Resume Builder: Create professional, job-winning resumes using our intuitive AI technology.</li>
            <li >AI Mock Interviewer: Practice interviews with AI-driven insights to boost your confidence.</li>
            <li >AI Roadmap Generator: Generate personalized career roadmaps to guide your professional development.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            This model does not involve recurring payments or subscriptions.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">2. Cancellation Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Given the nature of our services:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li >Immediate Access: Upon successful payment, users gain immediate access to the purchased services.</li>
            <li >No Cancellation: Once a purchase is completed, cancellations are not permitted as the service is delivered instantly.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">3. Refund Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We understand that situations may arise where a refund is requested. Our refund policy is as follows:
          </p>

          <div className="mb-4"> {/* Container for subdivs */}
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">3.1. Eligibility for Refunds</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds may be considered under the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li >Technical Issues: If you experience technical problems that prevent you from using our services effectively, and we are unable to resolve the issue within a reasonable time frame.</li>
              <li >Service Not as Described: If the service does not match the description provided on our website.</li>
              <li >Unauthorized Charges: If you notice unauthorized charges on your account.</li>
            </ul>
          </div>

          <div className="mb-4"> {/* Container for subdivs */}
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">3.2. Refund Request Process</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To request a refund:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li >Contact Support: Email our support team at <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a> within 7 days of your purchase.</li>
              <li >Provide Details: Include your full name, email address associated with the account, reason for the refund request, and any relevant supporting documentation or screenshots.</li>
              <li >Review Process: Our team will review your request and respond within 5 business days.</li>
            </ul>
          </div>

          <div> {/* No mb-4 on the last subdiv container */}
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">3.3. Non-Refundable Situations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds will not be issued in the following cases:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li >Change of mind after purchase.</li>
              <li >Failure to utilize the service due to lack of technical knowledge or incompatibility with your device.</li>
              <li >Partial use of the service.</li>
              <li >Requests made after 7 days from the date of purchase.</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">4. Refund Processing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Approved refunds will be processed within 7-10 business days to the original payment method. Please note that processing times may vary depending on your bank or payment provider.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">5. Chargebacks</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Initiating a chargeback without contacting our support team for resolution may result in the suspension or termination of your account. We encourage users to reach out to us first to resolve any issues.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">6. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We reserve the right to modify this Cancellation and Refund Policy at any time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
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