'use client'
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import React, { useRef } from 'react';

export default function PrivacyPolicyPage() {
    const contentRef = useRef(null);

  const handleDownloadText = () => {
    if (contentRef.current) {
      // Get the text content of the main container div
      const textContent = contentRef.current.textContent || '';

      // Create a Blob from the text content
      const blob = new Blob([textContent], { type: 'text/plain' });

      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'PrivacyPolicy.txt'; // Set the desired file name

      // Append the link to the body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up by revoking the object URL
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className='bg-lightviolet/20 min-h-screen font-medium'> {/* Ensure background covers the view */}
      <Navbar/>
      {/* Container styled similarly to Terms and Conditions */}
      <div ref={contentRef}  className="my-10 md:mt-12 shadow-md bg-white border border-gray-100 rounded-md mx-auto px-6 py-10 max-w-4xl">
        <div className='border-b-[1px] border-gray-100 pb-5 flex justify-between'>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Privacy Policy</h1>
                <p className="text-xl text-gray-600">Effective Date: 4 May 2025</p>
            </div>
            <div className="flex justify-end items-center"> {/* Position button to the right */}
                <button
                    onClick={handleDownloadText}
                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 focus:outline-none"
                >
                    Download
                </button>
             </div>
        </div>
        

        <div className="my-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">Welcome to Vokely.io</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Vokely.io ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website and use our services.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Register on our website.</li>
            <li className="">Use our resume-building services.</li>
            <li className="">Contact us for support or inquiries.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            The personal information we collect may include:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Full name</li>
            <li className="">Email address</li>
            <li className="">Phone number</li>
            <li className="">Resume details (education, work experience, skills)</li>
            <li className="">Payment information (if applicable)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            We also collect non-personal information such as browser type, operating system, and website usage data through cookies and similar technologies.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Provide and maintain our services.</li>
            <li className="">Improve user experience and website functionality.</li>
            <li className="">Process transactions and send related information.</li>
            <li className="">Respond to user inquiries and provide support.</li>
            <li className="">Send promotional communications (only if you have opted-in).</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">3. Sharing Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Service providers who assist in operating our website and services.</li>
            <li className="">Law enforcement agencies, if required by law.</li>
            <li className="">Third parties in connection with a merger, acquisition, or sale of assets.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is entirely secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">5. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Under Indian law, you have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Access the personal information we hold about you.</li>
            <li className="">Request correction or deletion of your personal information.</li>
            <li className="">Withdraw consent for data processing.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            To exercise these rights, please contact us at <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a>.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies to enhance your Browse experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of our website.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">7. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites and encourage you to read their privacy policies.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">8. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">10. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            Email: <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a>
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
          Address: Coimbatore-641037, India.
          </p>
        </div>

        <p className="text-sm text-gray-600 italic leading-relaxed">
          This Privacy Policy is designed to align with Indian legal standards and the specific services offered by Vokely.io. For comprehensive legal compliance, consider consulting with a legal professional.
        </p>
      </div>
      <Footer/>
    </div>
  );
}