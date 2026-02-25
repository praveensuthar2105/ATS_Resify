import React from 'react';
import './Legal.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <span className="legal-badge">PRIVACY</span>
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-updated">Last updated: February 24, 2026</p>

                <section className="legal-section">
                    <h2>1. Introduction</h2>
                    <p>ATS Resify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our AI-powered resume building service.</p>
                </section>

                <section className="legal-section">
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Information You Provide</h3>
                    <ul>
                        <li><strong>Account information:</strong> Name, email address, and profile picture (obtained through Google OAuth)</li>
                        <li><strong>Resume data:</strong> Work experience, education, skills, projects, certifications, and other information you input to create your resume</li>
                        <li><strong>Uploaded documents:</strong> PDF files uploaded for ATS score analysis</li>
                    </ul>
                    <h3>2.2 Information Collected Automatically</h3>
                    <ul>
                        <li><strong>Usage data:</strong> Pages visited, features used, and time spent on the platform</li>
                        <li><strong>Device information:</strong> Browser type, operating system, and screen resolution</li>
                        <li><strong>Session data:</strong> JWT tokens for authentication (stored in browser localStorage)</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul>
                        <li>Generate and store your resume content using AI (Google Gemini)</li>
                        <li>Compile LaTeX code into PDF documents on our servers</li>
                        <li>Analyze resume content for ATS compatibility scoring</li>
                        <li>Authenticate your identity and manage your account</li>
                        <li>Improve and optimize our Service</li>
                        <li>Communicate with you about service updates</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>4. Data Storage & Security</h2>
                    <ul>
                        <li>Your resume data is stored in a MySQL database secured with encrypted connections</li>
                        <li>Authentication uses industry-standard OAuth 2.0 and JWT tokens</li>
                        <li>AI-generated responses are temporarily cached in Redis for performance optimization</li>
                        <li>PDF files generated from LaTeX are created in temporary directories and cleaned up after delivery</li>
                        <li>We use HTTPS for all data transmission</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>5. Third-Party Services</h2>
                    <p>We integrate with the following third-party services:</p>
                    <ul>
                        <li><strong>Google OAuth 2.0:</strong> For user authentication. Google's privacy policy applies to data collected during sign-in.</li>
                        <li><strong>Google Gemini AI:</strong> Your resume content is sent to Google's Gemini API for AI processing. Google's AI data usage policies apply.</li>
                    </ul>
                    <p>We do not sell, trade, or rent your personal information to anyone.</p>
                </section>

                <section className="legal-section">
                    <h2>6. Data Retention</h2>
                    <p>Your personal data is retained for as long as your account is active. Upon account deletion by an administrator, all associated data (resume content, user profile) is permanently removed from our database.</p>
                </section>

                <section className="legal-section">
                    <h2>7. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
                        <li><strong>Correction:</strong> Update inaccurate personal information</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                        <li><strong>Portability:</strong> Export your resume data in standard formats (PDF)</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>8. Cookies</h2>
                    <p>We use minimal cookies and browser storage:</p>
                    <ul>
                        <li><strong>Authentication token:</strong> Stored in localStorage to keep you signed in</li>
                        <li><strong>User preferences:</strong> Stored locally for UI settings</li>
                    </ul>
                    <p>We do not use third-party tracking cookies or analytics cookies.</p>
                </section>

                <section className="legal-section">
                    <h2>9. Children's Privacy</h2>
                    <p>Our Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
                </section>

                <section className="legal-section">
                    <h2>10. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
                </section>

                <section className="legal-section">
                    <h2>11. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at <a href="mailto:privacy@atsresify.com">privacy@atsresify.com</a>.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
