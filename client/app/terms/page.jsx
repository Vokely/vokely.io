import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';

export default function TermsAndConditionsPage() {
  // Define the Last Updated Date - Remember to update this when you make changes!
  const lastUpdatedDate = 'May 4, 2025';

  return (
    <div className='bg-lightviolet/20 min-h-screen font-medium'>
      <Navbar/>
      <div className="my-10 md:mt-12 shadow-md bg-white border border-gray-100 rounded-md mx-auto px-6 py-10 max-w-4xl">
        <div className='border-b-[1px] border-gray-100'>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Terms and Conditions</h1>
            <p className="text-xl text-gray-600 mb-6">Last Updated: {lastUpdatedDate}</p>
        </div>

        {/* New "Terms of Use" Introductory Section */}
        <div className="mb-8 border-b pb-6 border-gray-200 mt-5"> {/* Added border-b and pb for separation */}
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">1.Terms of Use – Vokely.io</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms of Use (“Agreement”) constitute a legally binding contract between you, whether individually or on behalf of an organization (“you”), and Vokely.io (“Vokely,” “we,” “us,” or “our”), governing your access to and use of our website <a href="https://vokley.io" className="text-blue-600 hover:underline">https://vokley.io</a>, associated tools, applications, browser extensions, and any other platforms or services we offer (collectively referred to as the “Platform”).
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Use. If you do not agree to all the terms in this Agreement, you must immediately stop using the Platform.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may occasionally update or modify these Terms, and such updates will be reflected by the “Last Updated” date at the top of this document. While we may, at our discretion, notify you of changes, it is your responsibility to check this page regularly. Your continued use of the Platform after changes are posted constitutes your acceptance of those changes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Additional policies or terms posted on specific pages or features of the Platform—such as our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>—are incorporated into these Terms by reference and are also binding.
          </p>


          {/* Important Usage Limitations */}
          <div className="mb-4">
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">Important Usage Limitations:</h3>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li className="">
                The Platform is not intended for users subject to compliance with highly regulated industry-specific data privacy laws such as the Health Insurance Portability and Accountability Act (HIPAA), the Federal Information Security Management Act (FISMA), or the Gramm-Leach-Bliley Act (GLBA). If your use case involves compliance with such regulations, you are not permitted to use this Platform.
              </li>
            </ul>
          </div>

          {/* Eligibility */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">Eligibility:</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must be at least 18 years of age to use or register on Vokely.io. By using the Platform, you confirm that you meet this requirement.
            </p>
          </div>
        </div>
        {/* End of New "Terms of Use" Introductory Section */}


        {/* Rest of the divs with updated numbering */}

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">2. Use of Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to use our services only for lawful purposes and in accordance with these Terms. Prohibited activities include, but are not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Violating any applicable laws or regulations.</li>
            <li className="">Infringing upon the rights of others.</li>
            <li className="">Distributing harmful or malicious content.</li>
            <li className="">Attempting to gain unauthorized access to our systems.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">3. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All content on Vokely.io, including text, graphics, logos, and software, is the property of Vokely.io or its content suppliers and is protected by Indian intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">4. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To access certain features, you may need to create an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li className="">Provide accurate and complete information during registration.</li>
            <li className="">Maintain the confidentiality of your account credentials.</li>
            <li className="">Notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">5. Payment and Refund Policy</h2>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">Payment</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Certain services may require payment. By providing payment information, you authorize us to charge the applicable fees. All payments are to be made in Indian Rupees (INR) and are inclusive of applicable taxes.
          </p>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-700">Refunds</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            All purchases are final and non-refundable unless otherwise stated. In exceptional cases, we may, at our sole discretion, offer refunds. To request a refund, contact us at <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a> within 7 days of purchase.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">6. Cancellation Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may cancel your subscription at any time through your account settings. Cancellations will take effect at the end of the current billing cycle. No refunds will be provided for the remaining period of the subscription.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">7. Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your use of our services is also governed by our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, which outlines how we collect, use, and protect your information. By using our services, you consent to our data practices as described in the Privacy Policy. (Note: You should create a separate page at the /privacy route for your Privacy Policy)
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">8. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            To the fullest extent permitted by Indian law, Vokely.io shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">9. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to indemnify and hold harmless Vokely.io, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising out of or in connection with your use of our services or violation of these Terms.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">10. Governing Law and Dispute Resolution</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Tirunelveli, Tamil Nadu.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For any questions or concerns regarding these Terms, please contact us at:
          </p>
          <p className="text-gray-700 leading-relaxed mb-2">
            Email: <a href="mailto:support@vokely.io" className="text-blue-600 hover:underline">support@vokely.io</a>
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
          Address: Coimbatore-641037, India.
          </p>
        </div>

        <p className="text-sm text-gray-600 italic leading-relaxed">
          This Terms and Conditions document is designed to align with Indian legal standards and the specific services offered by Vokely.io. For comprehensive legal compliance, consider consulting with a legal professional.
        </p>
      </div>
      <Footer/>
    </div>
  );
}