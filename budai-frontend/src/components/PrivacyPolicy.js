import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
      <div className="max-w-4xl mx-auto bg-[#151235] p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Data Collection and Usage</h2>
            <p className="mb-4">We collect and process your data to provide our AI chat services. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Information you provide directly to us</li>
              <li>Usage data and interaction with our services</li>
              <li>Technical data about your device and connection</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            <p>We use this information to improve our services, personalize your experience, and ensure the security of our platform.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Your Rights</h2>
            <p className="mb-4">Under applicable data protection laws, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Right to access your data - request a copy of your personal data</li>
              <li>Right to correct your data - update or correct inaccurate information</li>
              <li>Right to delete your data - request deletion of your personal data</li>
              <li>Right to export your data - receive your data in a structured format</li>
              <li>Right to restrict processing - limit how we use your data</li>
              <li>Right to object - oppose the processing of your data</li>
            </ul>
            <p>To exercise any of these rights, please contact our support team.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Security</h2>
            <p className="mb-4">We implement strict security measures to protect your data, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Monitoring for unauthorized access attempts</li>
            </ul>
            <p>While we take these precautions, no system is completely secure. We continuously work to protect your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Cookie Usage</h2>
            <p className="mb-4">Our website uses different types of cookies to enhance your experience:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-medium text-white">Necessary Cookies:</span>
                {" "}Essential for the website to function properly. These cannot be disabled.
              </li>
              <li>
                <span className="font-medium text-white">Preference Cookies:</span>
                {" "}Remember your settings and preferences for future visits.
              </li>
              <li>
                <span className="font-medium text-white">Analytics Cookies:</span>
                {" "}Help us understand how visitors use our website to improve our services.
              </li>
              <li>
                <span className="font-medium text-white">Marketing Cookies:</span>
                {" "}Used to deliver personalized advertisements and track campaign effectiveness.
              </li>
            </ul>
            <p className="mb-4">
              You can manage your cookie preferences at any time through our{" "}
              <a href="/privacy-center" className="text-blue-400 hover:underline">
                Privacy Center
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Updates to This Policy</h2>
            <p>We may update this privacy policy from time to time to reflect changes in our practices or for legal requirements. We will notify you of any material changes by posting the updated policy on our website.</p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm mt-2">
              If you have any questions about this privacy policy, please contact us at{" "}
              <a href="mailto:privacy@example.com" className="text-blue-400 hover:underline">
                privacy@example.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;