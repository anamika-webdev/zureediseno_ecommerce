'use client';

import { useState } from 'react';
import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, MessageCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg font-medium mb-4">ZUREE DISENO</h3>
            <p className="text-gray-600 text-sm mb-4">
              A clothing brand that celebrates the artistry of design, 
              combining modern style with timeless elegance.
            </p>
           <p className="text-gray-600 text-sm mb-4">See more styles here:</p>
<div className="flex space-x-4">
  {/* Instagram active */}
  <a
    href="https://www.instagram.com/disenozuree/?utm_source=qr&r=nametag"
    aria-label="Instagram"
    target="_blanks"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-pink-500 transition-colors"
  >
    <Instagram size={18} />
  </a>

  {/* Facebook disabled */}
  {/*<span aria-label="Facebook" className="disabled-icon text-gray-600" title="Coming Soon">
    <Facebook size={18} />
  </span>

  Twitter disabled 
  <span aria-label="Twitter" className="disabled-icon text-gray-600" title="Coming Soon">
    <Twitter size={18} />
  </span>*/}
</div>

          </div>
          
          <div>
            <h3 className="font-medium uppercase text-sm mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products/men" className="text-gray-600 hover:text-zuree-red transition-colors">Men's Collection</Link></li>
              <li><Link href="/products/women" className="text-gray-600 hover:text-zuree-red transition-colors">Women's Collection</Link></li>
              <li><Link href="/products/kids" className="text-gray-600 hover:text-zuree-red transition-colors">Kids' Collection</Link></li>
              <li><Link href="/shop" className="text-gray-600 hover:text-zuree-red transition-colors">All Collections</Link></li>
              <li><Link href="/tailoredoutfit" className="text-gray-600 hover:text-zuree-red transition-colors">Custom Design</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium uppercase text-sm mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-600 hover:text-zuree-red transition-colors">Customer Service/Get in Touch</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-zuree-red transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium uppercase text-sm mb-4">Contact</h3>
            <address className="not-italic text-sm text-gray-600 space-y-2">
              <p>USA: 2320 Ponce De Leon Blvd, Coral Gables, FL 33134</p>
              <p>India: Plot no. 23, Udyog Vihar Phase 1, Dundahera Village, Sector 20, Gurugram, Haryana 122022</p>
              <p>
                <a href="https://wa.me/+919711411526" className="flex items-center text-gray-600 hover:text-zuree-red transition-colors">
                  <MessageCircle size={18} className="mr-2 text-[#25D366] group-hover:text-zuree-red" />
                  Mobile: +91 97114 11526
                </a>
              </p>
              <p>
                <a href="mailto:Contact@zuree.in" className="flex items-center text-gray-600 hover:text-zuree-red transition-colors">
                  <Mail size={18} className="mr-2 text-[#D44638] group-hover:text-zuree-red" />
                  Contact@zuree.in
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 text-sm text-gray-600 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <p>&copy; {new Date().getFullYear()} Zuree Diseno. All rights reserved.</p>
            
            <div className="flex space-x-4">
              {/* Terms & Conditions Modal */}
              <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                <DialogTrigger asChild>
                  <button className="text-gray-600 hover:text-zuree-red transition-colors underline">
                    Terms & Conditions
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Terms & Conditions</DialogTitle>
                    <DialogDescription>
                      Please read these terms and conditions carefully before using our service.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 text-sm">
                      
                      {/* Terms and Conditions */}
                      <section>
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Terms and Conditions</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          Welcome to Zuree Diseno. These Terms and Conditions govern your use of our website 
                          Zureeglobal.com and our services, including the purchase of clothing and use of our 
                          custom design build option. By accessing or using our website, you agree to be bound 
                          by these terms, as well as all applicable Indian laws, including the Consumer Protection 
                          Act, 2019, and Consumer Protection (E-Commerce) Rules, 2020.
                        </p>
                      </section>

                      {/* General */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">1. General</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Our website and services are operated by Zuree Diseno, a company registered under the 
                          laws of India, with its registered office at Plot no 23, Udyog Vihar Sector 20 Phase 1 
                          Gurugram- 122016. You must be at least 18 years old or have parental consent to use our services.
                        </p>
                      </section>

                      {/* Use of Website */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">2. Use of Website</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">You agree to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Use the website for lawful purposes only.</li>
                          <li>Not engage in activities that may harm the website, such as hacking or introducing malware.</li>
                          <li>Provide accurate and complete information when placing orders or using the custom design tool.</li>
                        </ul>
                      </section>

                      {/* Product Information */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">3. Product Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          We strive to provide accurate product descriptions, images, and pricing. However:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Product images are for illustration purposes and may slightly vary in colour or design due to lighting or manufacturing variations.</li>
                          <li>Custom designs are based on the specifications you provide, and minor variations may occur during manufacturing.</li>
                          <li>Prices are subject to change without notice, but the price at the time of order confirmation applies.</li>
                        </ul>
                      </section>

                      {/* Orders and Payments */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">4. Orders and Payments</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>All orders are subject to availability and acceptance by Zuree Diseno.</li>
                          <li>Payments must be made through approved payment methods (e.g., credit/debit cards, UPI, net banking).</li>
                          <li>All prices are inclusive of applicable taxes unless otherwise stated.</li>
                          <li>For custom designs, you must provide accurate measurements and specifications. We are not responsible for errors in customer-provided data.</li>
                          <li>Once your order is confirmed, you will receive updates regarding your order status via email from our team at info@zureeglobal.com.
                          Products will typically be delivered within 3–7 business days from the date of dispatch. 
Delivery timelines may vary based on your location and availability of the product.</li>
                        </ul>
                      </section>

                      {/* Intellectual Property */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">5. Intellectual Property</h3>
                        <p className="text-gray-700 leading-relaxed">
                          All content on our website, including designs, logos, text, and images, is the property 
                          of Zuree Diseno or its licensors and is protected under the Copyright Act, 1957. You may 
                          not reproduce, distribute, or use our content without prior written permission.
                        </p>
                      </section>

                      {/* Limitation of Liability */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">To the extent permitted by Indian law:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>We are not liable for indirect, incidental, or consequential damages arising from your use of our website or products.</li>
                          <li>Our liability for defective products or services is limited to replacement, repair, or refund as per our Cancellation and Refund Policy.</li>
                        </ul>
                      </section>

                      {/* Governing Law and Dispute Resolution */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">7. Governing Law and Dispute Resolution</h3>
                        <p className="text-gray-700 leading-relaxed">
                          These Terms and Conditions are governed by the laws of India. Any disputes will be subject 
                          to the exclusive jurisdiction of courts in Delhi, India. You may also approach consumer forums 
                          under the Consumer Protection Act, 2019, for redressal.
                        </p>
                      </section>

                      {/* Termination */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">8. Termination</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We reserve the right to terminate or suspend your access to our website or services if you 
                          violate these terms or engage in fraudulent or unlawful activities.
                        </p>
                      </section>

                      {/* Amendments */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">9. Amendments</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We may update these Terms and Conditions from time to time. Changes will be posted on this 
                          page, and continued use of our website constitutes acceptance of the updated terms.
                        </p>
                      </section>

                      {/* Cancellation and Refund Policy */}
                      <section className="pt-6 border-t border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Cancellation and Refund Policy</h2>
                        
                        <h3 className="text-lg font-semibold mb-3">Cancellation Policy</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                          <li><strong>Before Shipment:</strong> You may cancel your order (standard or custom-designed) before it is dispatched by contacting us at contact@zureeglobal.com. A full refund will be processed within 7 business days to your original payment method.</li>
                          <li><strong>After Shipment:</strong> Once an order is dispatched, cancellation is not possible. However, you may request a return or refund as per the conditions below.</li>
                          <li><strong>Custom Design Orders:</strong>Cancellation for custom orders is only allowed before production begins. Once production starts, cancellations are not permitted due to the personalized nature of the product.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-3">Replacement Policy</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                          <li><strong>Defective or Incorrect Products:</strong> If a product is defective, damaged, or not as described within 1day of receipt of material, we will issue a replacement within 7 business days of receiving the returned item.</li>
                          <li><strong>Custom Design Issues:</strong> If a custom-designed product does not match the agreed specifications due to our error, we will offer a replacement. Refunds for custom products are not available if the error is due to incorrect customer-provided measurements or specifications.</li>
                          <li><strong>Non-Returnable Items:</strong>Custom-designed products (unless defective), discounted or clearance items, and items marked as non-returnable are not eligible for refunds.</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-3">Non-Delivery</h3>
                        <p className="text-gray-700 leading-relaxed">
                         If your order is not delivered within the estimated delivery time (3 to 7 business days) due to our error or the logistics partner's failure, you may request a full refund. Please contact us within 15 days of the expected delivery date.</p>
                      </section>

                      {/* Contact Information */}
                      <section className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          If you have any questions about these terms, please contact us:
                        </p>
                        <div className="space-y-1 text-gray-700">
                          <p>📧 Email: Contact@zureeglobal.com</p>
                          <p>📞 Phone: +91 97114 11526</p>
                          <p>📍 USA: 2320 Ponce De Leon Blvd, Coral Gables, FL 33134</p>
                          <p>📍 India: Plot no. 23, Udyog Vihar Phase 1, Dundahera Village, Sector 20, Gurugram, Haryana 122022</p>
                        </div>
                      </section>

                      {/* Last Updated */}
                      <section className="pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date().toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </section>
                    </div>
                  </ScrollArea>

                  {/* Close Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => setIsTermsOpen(false)} variant="outline">
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Privacy Policy Modal */}
              <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
                <DialogTrigger asChild>
                  <button className="text-gray-600 hover:text-zuree-red transition-colors underline">
                    Privacy Policy
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
                    <DialogDescription>
                      Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 text-sm">
                      
                      {/* Privacy Policy Introduction */}
                      <section>
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          At Zuree Diseno, we value your privacy and are committed to protecting your personal data 
                          in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), Information 
                          Technology Act, 2000, and other applicable Indian laws. This Privacy Policy outlines how we 
                          collect, use, disclose, and safeguard your information when you visit our website or use our 
                          services, including our custom design build option.
                        </p>
                      </section>

                      {/* Information We Collect */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">We may collect the following types of information:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li><strong>Personal Information:</strong> Name, email address, phone number, billing and shipping address, and payment details when you place an order or use our custom design tool.</li>
                          <li><strong>Non-Personal Information:</strong> Browser type, IP address, device type, operating system, and browsing behaviour collected through cookies and similar technologies.</li>
                          <li><strong>Custom Design Data:</strong> Measurements, design preferences, and other details you provide for custom clothing orders.</li>
                        </ul>
                      </section>

                      {/* How We Collect Information */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">2. How We Collect Information</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">We collect information:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Directly from you when you register, place an order, use the custom design tool, or contact us.</li>
                          <li>Automatically through cookies, web beacons, and analytics tools when you visit our website.</li>
                          <li>From third-party service providers, such as payment gateways or logistics partners, with your consent.</li>
                        </ul>
                      </section>

                      {/* Purpose of Data Collection */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">3. Purpose of Data Collection</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Process and fulfil your orders, including custom designs.</li>
                          <li>Communicate with you regarding order status, customer support, or promotional offers (with your consent).</li>
                          <li>Improve our website, products, and services through analytics.</li>
                          <li>Comply with legal obligations, such as tax reporting or fraud prevention.</li>
                          <li>Personalize your experience, such as recommending products or designs based on your preferences.</li>
                        </ul>
                      </section>

                      {/* Data Sharing and Disclosure */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">4. Data Sharing and Disclosure</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">We may share your information with:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li><strong>Service Providers:</strong> Payment gateways, logistics partners, and IT service providers who assist in order fulfilment and website operations.</li>
                          <li><strong>Legal Authorities:</strong> When required by law, such as in response to a court order or government request.</li>
                          <li><strong>Business Transfers:</strong> In case of a merger, acquisition, or sale of assets, your data may be transferred with prior notice.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                          <strong>We do not sell your personal data to third parties.</strong>
                        </p>
                      </section>

                      {/* Data Security */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">5. Data Security</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We implement reasonable security measures, including encryption, secure servers, and access controls, 
                          to protect your data as per the IT Act, 2000, and DPDP Act, 2023. However, no method of transmission 
                          over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                      </section>

                      {/* Data Retention */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">6. Data Retention</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We retain your personal data only for as long as necessary to fulfil the purposes outlined in this 
                          policy or as required by Indian law. For example, order-related data may be retained for tax compliance 
                          (typically 7 years under the Income Tax Act, 1961).
                        </p>
                      </section>

                      {/* Your Rights */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">7. Your Rights</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">Under the DPDP Act, 2023, you have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Access, correct, or update your personal data.</li>
                          <li>Request deletion of your data, subject to legal obligations.</li>
                          <li>Withdraw consent for data processing.</li>
                          <li>Nominate another individual to manage your data in case of incapacity.</li>
                          <li>File a complaint with the Data Protection Board of India if you believe your rights are violated.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                          To exercise these rights, contact us at <strong>Contact@Zureeglobal.com</strong>.
                        </p>
                      </section>

                      {/* Cookies and Tracking */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">8. Cookies and Tracking</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We use cookies to enhance your browsing experience and analyse website performance. You can manage 
                          cookie preferences through your browser settings. By continuing to use our website, you consent to 
                          our use of cookies as described.
                        </p>
                      </section>

                      {/* Third-Party Links */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">9. Third-Party Links</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Our website may contain links to third-party sites (e.g., payment gateways). We are not responsible 
                          for their privacy practices. Please review their policies before sharing information.
                        </p>
                      </section>

                      {/* Updates to This Policy */}
                      <section>
                        <h3 className="text-lg font-semibold mb-3">10. Updates to This Policy</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates 
                          will be posted on this page with the revised date. We encourage you to review this policy periodically.
                        </p>
                      </section>

                      {/* Contact Information */}
                      <section className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="space-y-1 text-gray-700">
                          <p>📧 Email: Contact@zureeglobal.com</p>
                          <p>📞 Phone: +91 97114 11526</p>
                          <p>📍 USA: 2320 Ponce De Leon Blvd, Coral Gables, FL 33134</p>
                          <p>📍 India: Plot no. 23, Udyog Vihar Phase 1, Dundahera Village, Sector 20, Gurugram, Haryana 122022</p>
                        </div>
                      </section>

                      {/* Last Updated */}
                      <section className="pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date().toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </section>
                    </div>
                  </ScrollArea>

                  {/* Close Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => setIsPrivacyOpen(false)} variant="outline">
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;