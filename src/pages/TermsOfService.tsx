import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-6">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> March 11, 2026
          </p>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Timeline web application ("Service") available at{" "}
              <a href="https://timeline-rho-two.vercel.app/" className="text-primary hover:underline">
                https://timeline-rho-two.vercel.app/
              </a>, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These Terms constitute a legally binding agreement between you and Timeline ("we," "us," or "our"). We reserve the right to update these Terms at any time, and your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">2. Description of the Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Timeline is a web-based application that enables users to create, organize, and visualize events on interactive timelines. Features may include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Creating and editing timelines with custom events and date ranges</li>
              <li>Adding titles, descriptions, dates, and other metadata to events</li>
              <li>Viewing and sharing timelines in various formats</li>
              <li>Organizing events by categories, tags, or custom groupings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice or liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>You are at least 13 years of age (or the age of digital consent in your jurisdiction, whichever is higher)</li>
              <li>You have the legal capacity to enter into binding agreements</li>
              <li>Your use of the Service does not violate any applicable law or regulation</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">4. User Accounts</h2>
            
            <h3 className="font-bold mb-2">4.1 Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.
            </p>

            <h3 className="font-bold mb-2">4.2 Account Security</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized access or security breach. We are not liable for any loss arising from unauthorized use of your account.
            </p>

            <h3 className="font-bold mb-2">4.3 Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time through the application settings. We reserve the right to suspend or terminate your account if we determine, in our sole discretion, that you have violated these Terms or engaged in conduct harmful to the Service or other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">5. User Content</h2>
            
            <h3 className="font-bold mb-2">5.1 Ownership</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain full ownership of all content you create and submit through the Service ("User Content"), including timeline data, event descriptions, and any other materials. We do not claim ownership of your User Content.
            </p>

            <h3 className="font-bold mb-2">5.2 License to Us</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By submitting User Content, you grant Timeline a non-exclusive, worldwide, royalty-free, sublicensable license to use, store, display, reproduce, and distribute your User Content solely as necessary to provide and improve the Service. This license terminates when you delete your content or account, subject to any backup or caching periods.
            </p>

            <h3 className="font-bold mb-2">5.3 Content Standards</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are solely responsible for your User Content. You agree not to submit content that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Is unlawful, harmful, threatening, abusive, defamatory, or obscene</li>
              <li>Infringes any intellectual property right, privacy right, or other right of any third party</li>
              <li>Contains malware, viruses, or other malicious code</li>
              <li>Constitutes spam, unsolicited advertising, or commercial solicitation</li>
              <li>Impersonates any person, entity, or organization</li>
              <li>Violates any applicable local, national, or international law or regulation</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right, but not the obligation, to review, remove, or disable access to any User Content that we determine, in our sole discretion, violates these standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">6. Acceptable Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Service, our systems, or other users' accounts</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Introduce any malicious or technically harmful material</li>
              <li>Use automated tools (bots, scrapers, crawlers) to access the Service without our written permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use the Service to transmit spam or conduct phishing activities</li>
              <li>Collect or harvest personal information of other users without consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content (excluding User Content), features, functionality, design, source code, trademarks, and logos are and will remain the exclusive property of Timeline and its licensors. These are protected by copyright, trademark, and other applicable intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may not copy, modify, distribute, sell, or lease any part of the Service or its content, nor may you reverse engineer or attempt to extract the source code of the Service, unless you have our written permission or are permitted to do so by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">8. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may integrate with or contain links to third-party services, platforms, or websites. These integrations are provided for convenience, and we do not endorse or assume responsibility for any third-party content, products, or services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Your use of third-party services is governed by their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or reliability of any third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, TIMELINE DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-4">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Some jurisdictions do not allow the exclusion of implied warranties, so the above exclusions may not apply to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TIMELINE, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Loss of profits, revenue, data, or goodwill</li>
              <li>Service interruptions or unavailability</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Any other losses arising from your use of or inability to use the Service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              In no event shall our total liability to you exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) one hundred US dollars (USD $100).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Some jurisdictions do not allow limitations on certain types of liability. In such cases, the limitations above will apply to the fullest extent permitted by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Timeline and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-4">
              <li>Your use of or access to the Service</li>
              <li>Your User Content</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of a third party</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">12. Governing Law & Dispute Resolution</h2>
            
            <h3 className="font-bold mb-2">12.1 Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles.
            </p>

            <h3 className="font-bold mb-2">12.2 Informal Resolution</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before filing a formal dispute, we encourage you to contact us first to try to resolve the matter informally. We will make good-faith efforts to resolve any complaint within 30 days.
            </p>

            <h3 className="font-bold mb-2">12.3 Dispute Resolution</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any dispute, controversy, or claim arising out of or relating to these Terms or the Service that cannot be resolved informally shall be resolved through binding arbitration or in the courts of competent jurisdiction, as determined by applicable law.
            </p>

            <h3 className="font-bold mb-2">12.4 Class Action Waiver</h3>
            <p className="text-muted-foreground leading-relaxed">
              To the extent permitted by law, you waive any right to participate in a class-action lawsuit or class-wide arbitration against Timeline.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">13. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">14. Service Availability & Modifications</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We strive to keep the Service available at all times, but we do not guarantee uninterrupted availability. The Service may be temporarily unavailable due to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Scheduled maintenance or updates</li>
              <li>Emergency maintenance or security patching</li>
              <li>Circumstances beyond our reasonable control (force majeure)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">15. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms remain in effect while you use the Service. We may suspend or terminate your access at any time, with or without cause, and with or without notice. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your right to access the Service will immediately cease</li>
              <li>We may delete your account and User Content in accordance with our data retention policies</li>
              <li>Provisions of these Terms that by their nature should survive termination shall survive</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Sections including Intellectual Property, Disclaimers, Limitation of Liability, Indemnification, and Governing Law shall survive any termination of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">16. Severability & Waiver</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">17. Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Timeline regarding your use of the Service and supersede all prior agreements, understandings, representations, and warranties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">18. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="text-muted-foreground">
              <p><strong>Timeline Application</strong></p>
              <p>Website: <a href="https://timeline-rho-two.vercel.app/" className="text-primary hover:underline">https://timeline-rho-two.vercel.app/</a></p>
              <p>For legal inquiries, please use the contact form available within the application.</p>
            </div>
          </section>

          <p className="text-muted-foreground text-sm mt-8">
            <strong>Last updated:</strong> March 11, 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
