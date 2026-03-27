import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';

export default function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div className="terms-page">
            <div className="terms-container">
                <div className="terms-header">
                    <button 
                        className="back-button" 
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Terms & Conditions</h1>
                </div>

                <div className="terms-content">
                    <section className="terms-section">
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to INZU Property Rental Platform ("INZU", "we", "us", or "our"). 
                            These Terms and Conditions ("Terms") govern your access to and use of the INZU 
                            platform, including our website, mobile applications, and related services 
                            (collectively, the "Service").
                        </p>
                        <p>
                            By accessing or using the Service, you agree to be bound by these Terms. 
                            If you do not agree to these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>2. Eligibility</h2>
                        <p>
                            You must be at least 18 years old to use the Service. By using the Service, 
                            you represent and warrant that you are at least 18 years of age and have the 
                            legal capacity to enter into these Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>3. Account Registration</h2>
                        <p>
                            To access certain features of the Service, you must create an account. 
                            You agree to:
                        </p>
                        <ul>
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Keep your password secure and confidential</li>
                            <li>Notify us immediately of any unauthorized access to your account</li>
                            <li>Accept responsibility for all activities that occur under your account</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>4. User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                            <li>Post false, misleading, or fraudulent property listings</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Interfere with or disrupt the Service or servers</li>
                            <li>Attempt to gain unauthorized access to any part of the Service</li>
                            <li>Use automated systems to access the Service without permission</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>5. Property Listings</h2>
                        <p>
                            Property owners who list properties on INZU represent and warrant that:
                        </p>
                        <ul>
                            <li>They have the legal right to list and rent/sell the property</li>
                            <li>All information provided is accurate and complete</li>
                            <li>Property images are authentic and current</li>
                            <li>The property complies with all applicable laws and regulations</li>
                            <li>They will respond to inquiries in a timely and professional manner</li>
                        </ul>
                        <p>
                            INZU reserves the right to remove any listing that violates these Terms 
                            or is deemed inappropriate.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>6. Inquiries and Communication</h2>
                        <p>
                            The Service provides a messaging system for users to communicate about 
                            properties. You agree to:
                        </p>
                        <ul>
                            <li>Use the messaging system only for legitimate property inquiries</li>
                            <li>Communicate respectfully and professionally</li>
                            <li>Not share personal contact information in initial messages (for safety)</li>
                            <li>Report any suspicious or inappropriate behavior</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>7. Fees and Payments</h2>
                        <p>
                            INZU is currently free to use for property seekers and property owners. 
                            We reserve the right to introduce fees for certain features in the future, 
                            with advance notice to users.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>8. Intellectual Property</h2>
                        <p>
                            The Service and its content, including but not limited to text, graphics, 
                            logos, images, and software, are the property of INZU or its licensors and 
                            are protected by copyright, trademark, and other intellectual property laws.
                        </p>
                        <p>
                            You may not copy, modify, distribute, sell, or lease any part of the Service 
                            without our express written permission.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>9. Privacy and Data Protection</h2>
                        <p>
                            Your privacy is important to us. Our collection and use of personal information 
                            is governed by our Privacy Policy. By using the Service, you consent to our 
                            collection and use of personal data as described in the Privacy Policy.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>10. Disclaimers</h2>
                        <p>
                            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                            EITHER EXPRESS OR IMPLIED. INZU DOES NOT WARRANT THAT:
                        </p>
                        <ul>
                            <li>The Service will be uninterrupted, secure, or error-free</li>
                            <li>Property listings are accurate, complete, or current</li>
                            <li>Any property owner or seeker is trustworthy or reliable</li>
                            <li>Any transaction will be completed successfully</li>
                        </ul>
                        <p>
                            INZU is a platform that connects property owners and seekers. We are not 
                            responsible for the quality, safety, legality, or accuracy of any property 
                            listing or transaction.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>11. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, INZU SHALL NOT BE LIABLE FOR ANY 
                            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY 
                            LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR 
                            ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>12. Indemnification</h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless INZU and its officers, 
                            directors, employees, and agents from any claims, liabilities, damages, 
                            losses, and expenses arising out of or related to your use of the Service, 
                            violation of these Terms, or violation of any rights of another.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>13. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account and access to the 
                            Service at any time, with or without notice, for any reason, including if we 
                            believe you have violated these Terms.
                        </p>
                        <p>
                            You may terminate your account at any time through the Settings page. Upon 
                            termination, your right to use the Service will immediately cease.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>14. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws 
                            of the Republic of Rwanda, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>15. Dispute Resolution</h2>
                        <p>
                            Any disputes arising out of or relating to these Terms or the Service shall 
                            be resolved through good faith negotiations. If negotiations fail, disputes 
                            shall be submitted to the competent courts of Rwanda.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>16. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify users 
                            of any material changes by posting the updated Terms on the Service and 
                            updating the "Last Updated" date below.
                        </p>
                        <p>
                            Your continued use of the Service after changes are posted constitutes your 
                            acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>17. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p>
                            Email: support@inzu.rw<br />
                            Address: Kigali, Rwanda
                        </p>
                    </section>

                    <section className="terms-section">
                        <p className="last-updated">
                            <strong>Last Updated:</strong> January 2025
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
