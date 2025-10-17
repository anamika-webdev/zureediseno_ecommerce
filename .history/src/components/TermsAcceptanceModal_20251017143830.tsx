'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, FileText, Shield, Check } from 'lucide-react';

const TermsAcceptanceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show modal for admin or dashboard routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return;
    }

    // Check if user has already accepted terms
    const termsAccepted = localStorage.getItem('termsAccepted');
    const termsAcceptedDate = localStorage.getItem('termsAcceptedDate');
    
    if (!termsAccepted) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleAccept = () => {
    if (!hasAccepted) {
      alert('Please check the box to accept the terms and conditions');
      return;
    }
    
    // Store acceptance in localStorage
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());
    setIsOpen(false);
  };

  const handleDecline = () => {
    // Optionally redirect or show a message
    alert('You must accept the terms and conditions to use this website');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl m-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Terms & Conditions</h2>
                <p className="text-sm text-red-100">Please review and accept to continue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setShowTerms(true)}
            className={`flex-1 px-6 py-3 font-semibold transition-all ${
              showTerms
                ? 'bg-white text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Terms & Conditions
          </button>
          <button
            onClick={() => setShowTerms(false)}
            className={`flex-1 px-6 py-3 font-semibold transition-all ${
              !showTerms
                ? 'bg-white text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="inline h-4 w-4 mr-2" />
            Privacy Policy
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] px-6 py-6 text-sm text-gray-700">
          {showTerms ? (
            <div className="space-y-4">
              <p className="leading-relaxed">
                Welcome to <strong>Zuree Diseno</strong>. These Terms and Conditions govern your use of our website 
                <strong> Zureeglobal.com</strong> and our services, including the purchase of clothing and use of our 
                custom design build option. By accessing or using our website, you agree to be bound 
                by these terms, as well as all applicable Indian laws, including the Consumer Protection 
                Act, 2019, and Consumer Protection (E-Commerce) Rules, 2020.
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="leading-relaxed">
                  By using our website, you confirm that you are at least 18 years old or have the consent 
                  of a parent/guardian. If you do not agree with these terms, please do not use our services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Use of Website</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You agree to use our website for lawful purposes only.</li>
                  <li>You must not misuse our website by introducing viruses, malware, or harmful material.</li>
                  <li>Unauthorized access or attempts to breach security are prohibited.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Products and Services</h3>
                <p className="leading-relaxed mb-2">
                  We offer ready-made clothing and a custom design build option where customers can submit 
                  their design preferences.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Product descriptions and images are for reference only.</li>
                  <li>Custom designs are subject to feasibility and approval.</li>
                  <li>Prices are in INR and include applicable taxes unless stated otherwise.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Orders and Payments</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Orders are subject to acceptance and availability.</li>
                  <li>Payment must be made through secure methods (credit/debit cards, UPI, etc.).</li>
                  <li>We are not liable for payment gateway issues.</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm">
                  <strong>Note:</strong> For complete terms including Cancellation, Refund, and other policies, 
                  please review the full document accessible from our footer.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="leading-relaxed">
                At <strong>Zuree Diseno</strong>, we value your privacy and are committed to protecting your personal data 
                in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), Information 
                Technology Act, 2000, and other applicable Indian laws.
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Personal Information:</strong> Name, email, phone number, shipping address, payment details</li>
                  <li><strong>Design Data:</strong> Custom design preferences, measurements, images uploaded</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Process and fulfill your orders, including custom designs</li>
                  <li>Communicate order status and customer support</li>
                  <li>Improve our website, products, and services</li>
                  <li>Comply with legal obligations</li>
                  <li>Personalize your experience</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Data Security</h3>
                <p className="leading-relaxed">
                  We implement reasonable security measures, including encryption, secure servers, and access controls, 
                  to protect your data as per the IT Act, 2000, and DPDP Act, 2023. However, no method of transmission 
                  over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Your Rights</h3>
                <p className="leading-relaxed">Under the DPDP Act, 2023, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Access, correct, or update your personal data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>File a complaint with the Data Protection Board of India</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm">
                  <strong>Contact:</strong> For privacy concerns, contact us at{' '}
                  <a href="mailto:Contact@zureeglobal.com" className="text-blue-600 underline">
                    Contact@zureeglobal.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Acceptance */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="accept-terms"
              checked={hasAccepted}
              onChange={(e) => setHasAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="accept-terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
              I have read and accept the <strong>Terms & Conditions</strong> and{' '}
              <strong>Privacy Policy</strong> of Zuree Diseno.
            </label>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasAccepted}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                hasAccepted
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Check className="inline h-5 w-5 mr-2" />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptanceModal;