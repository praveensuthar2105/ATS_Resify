import React from 'react';
import './Legal.css';

const Terms = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <span className="legal-badge">LEGAL</span>
                <h1 className="legal-title">Terms & Conditions</h1>
                <p className="legal-updated">Last updated: February 24, 2026</p>

                <section className="legal-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using ATS Resify ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our Service.</p>
                </section>

                <section className="legal-section">
                    <h2>2. Description of Service</h2>
                    <p>ATS Resify is an AI-powered resume building platform that allows users to:</p>
                    <ul>
                        <li>Generate professional resumes using artificial intelligence</li>
                        <li>Edit resumes in a live LaTeX editor with real-time preview</li>
                        <li>Check resume ATS (Applicant Tracking System) compatibility scores</li>
                        <li>Export resumes as professionally typeset PDF documents</li>
                        <li>Use an AI agent for resume content improvement and job matching</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>3. User Accounts</h2>
                    <p>To access certain features, you must create an account using Google OAuth authentication. You are responsible for:</p>
                    <ul>
                        <li>Maintaining the confidentiality of your account credentials</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized use of your account</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>4. User Content</h2>
                    <p>You retain ownership of all personal information and content you provide to the Service, including your resume data, work history, education details, and any other information you input. By using our Service, you grant us a limited license to process this data solely for the purpose of generating and storing your resume.</p>
                </section>

                <section className="legal-section">
                    <h2>5. AI-Generated Content</h2>
                    <p>Our Service uses Google Gemini AI to generate resume content. Please note:</p>
                    <ul>
                        <li>AI-generated content is provided as suggestions and should be reviewed for accuracy</li>
                        <li>We do not guarantee that AI-generated content will result in job interviews or offers</li>
                        <li>You are responsible for verifying the accuracy of all generated content before using it</li>
                        <li>ATS scores are estimates and may differ from actual ATS systems used by employers</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>6. Prohibited Uses</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Create fraudulent or misleading resumes with false information</li>
                        <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
                        <li>Interfere with or disrupt the Service or its infrastructure</li>
                        <li>Use automated scripts or bots to access the Service</li>
                        <li>Violate any applicable laws or regulations</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2>7. Intellectual Property</h2>
                    <p>The Service, including its design, code, and LaTeX templates, is the intellectual property of ATS Resify. Our resume templates are provided for personal use in resume creation. You may not redistribute, sell, or commercially exploit our templates without permission.</p>
                </section>

                <section className="legal-section">
                    <h2>8. Limitation of Liability</h2>
                    <p>The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost employment opportunities, data loss, or service interruptions.</p>
                </section>

                <section className="legal-section">
                    <h2>9. Termination</h2>
                    <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms. Upon termination, your right to use the Service will cease immediately, and we may delete your stored data.</p>
                </section>

                <section className="legal-section">
                    <h2>10. Changes to Terms</h2>
                    <p>We may update these Terms from time to time. Continued use of the Service after any changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.</p>
                </section>

                <section className="legal-section">
                    <h2>11. Contact</h2>
                    <p>If you have any questions about these Terms, please contact us at <a href="mailto:contact@atsresify.com">contact@atsresify.com</a>.</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
