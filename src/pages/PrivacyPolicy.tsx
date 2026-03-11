import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-6">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> March 11, 2026
          </p>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Timeline ("we," "our," or "us"). Timeline is a web application accessible at{" "}
              <a href="https://timeline-rho-two.vercel.app/" className="text-primary hover:underline">
                https://timeline-rho-two.vercel.app/
              </a>{" "}
              that allows users to create, manage, and visualize timelines and events. We are committed to protecting your personal information and your right to privacy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have in relation to it. Please read this policy carefully. If you disagree with its terms, please discontinue use of our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="font-bold mb-2">2.1 Information You Provide Directly</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use Timeline, you may voluntarily provide us with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Account registration details, such as name and email address</li>
              <li>Timeline and event content you create, including titles, descriptions, and dates</li>
              <li>Profile information or settings you configure within the application</li>
              <li>Communications you send to us, such as support requests or feedback</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2">2.2 Information Collected Automatically</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you access our application, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Log data including IP address, browser type, operating system, and pages visited</li>
              <li>Usage data such as features accessed, interactions, and session duration</li>
              <li>Device information including hardware model, screen resolution, and language settings</li>
              <li>Cookies and similar tracking technologies (see Section 5)</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2">2.3 Information from Third Parties</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you sign in using a third-party service (such as Google or GitHub), we may receive basic profile information from that service, subject to your authorization and their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>To provide, operate, and maintain the Timeline application</li>
              <li>To personalize your experience and remember your preferences</li>
              <li>To process and complete transactions or requests</li>
              <li>To send administrative information such as confirmations and updates</li>
              <li>To respond to your comments, questions, and requests for support</li>
              <li>To monitor and analyze usage patterns to improve our services</li>
              <li>To detect, prevent, and address technical issues or security threats</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will not use your information for purposes materially different from those stated here without obtaining your prior consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">4. Legal Basis for Processing (EEA/UK Users)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are located in the European Economic Area or United Kingdom, our legal basis for collecting and using your personal data depends on the information concerned and the context:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Contract:</strong> Processing necessary to perform our contract with you (i.e., to provide the service)</li>
              <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate interests, such as improving our services, provided those interests are not overridden by your rights</li>
              <li><strong>Consent:</strong> Where you have given us clear consent to process your data for a specific purpose</li>
              <li><strong>Legal Obligation:</strong> Where we must process data to comply with applicable law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">5. Cookies & Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Timeline uses cookies and similar technologies to enhance your experience. Cookies are small text files stored on your device. We use the following types:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Essential Cookies:</strong> Necessary for the application to function correctly. These cannot be disabled.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and choices (e.g., theme, language).</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the application so we can improve it.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling non-essential cookies may affect certain features of the application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">6. Sharing of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our application (e.g., hosting, analytics), bound by confidentiality obligations.</li>
              <li><strong>Legal Requirements:</strong> If required by law, regulation, or valid legal process (such as a court order).</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of all or substantially all of our assets, with appropriate confidentiality protections.</li>
              <li><strong>With Your Consent:</strong> In any other case, only with your explicit consent.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as necessary to provide services and comply with our legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days, unless a longer retention period is required by law.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Anonymized or aggregated data that cannot identify you may be retained indefinitely for analytical purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">8. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular review of our data collection, storage, and processing practices</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">9. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Request that we limit how we use your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to our processing of your data based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw that consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any of these rights, please contact us at the details provided in Section 12. We will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Timeline is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information promptly. If you believe a child has provided us with their data, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">11. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our application may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information to them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">12. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Timeline is hosted on Vercel and may process data in the United States or other countries where our service providers operate. If you are located outside these regions, your data may be transferred to and processed in a jurisdiction with different data protection laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Where required, we implement appropriate safeguards for such transfers, including Standard Contractual Clauses approved by applicable authorities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we do, we will revise the "Effective Date" at the top of this document. We encourage you to review this policy periodically.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              For material changes, we will provide more prominent notice, such as an in-app notification or email to the address on your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="text-muted-foreground">
              <p><strong>Timeline Application</strong></p>
              <p>Website: <a href="https://timeline-rho-two.vercel.app/" className="text-primary hover:underline">https://timeline-rho-two.vercel.app/</a></p>
              <p>For privacy-related inquiries, please use the contact form available within the application.</p>
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

export default PrivacyPolicy;
