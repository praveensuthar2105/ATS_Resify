import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const AccordionItem = ({ title, isFirst, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className={`${isFirst ? '' : 'border-t-2 border-black pt-6'} transition-all`}>
            <h2
                className="text-lg sm:text-xl font-bold uppercase mb-4 flex justify-between items-center cursor-pointer group hover:bg-[#39ff14] hover:text-black p-3 -ml-3 transition-colors border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 border-2 border-black inline-block transition-colors ${isOpen ? 'bg-[#39ff14] group-hover:bg-white' : 'bg-black group-hover:bg-black'}`}></span>
                    {title}
                </div>
                <span className="material-symbols-outlined font-black text-2xl">
                    {isOpen ? 'remove' : 'add'}
                </span>
            </h2>
            {isOpen && (
                <div className="pl-7 pb-4 pt-2 border-l-4 border-[#39ff14] ml-1.5 mb-4 bg-white/50 animate-[fadeIn_0.2s_ease-out]">
                    <div className="text-gray-800 font-bold text-sm sm:text-base leading-relaxed">
                        {children}
                    </div>
                </div>
            )}
        </section>
    );
};

const PrivacyPolicy = () => {
    return (
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
            <SEO
                title="Privacy Policy - ATS Resify"
                description="Read the ATS Resify Privacy Policy to understand how we collect, use, and protect your personal information and resume data."
            />
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
            </Helmet>

            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">

                {/* HEADER */}
                <div className="mb-12 border-b-4 border-black pb-8">
                    <div className="inline-block border-2 border-black bg-black text-[#39ff14] px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6 shadow-[2px_2px_0px_0px_#39ff14]">
                        LEGAL DOCUMENT
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase relative inline-block">
                        Privacy <span className="text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>Policy</span>
                    </h1>
                    <p className="text-gray-600 font-bold uppercase tracking-wide">Last updated: February 24, 2026</p>
                    <p className="text-black font-bold uppercase text-xs mt-4 bg-[#39ff14] border-2 border-black inline-block px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                        <span className="material-symbols-outlined text-[14px] align-text-bottom mr-1">mouse</span>
                        Click on any section below to expand
                    </p>
                </div>

                {/* CONTENT BORDER WRAPPER */}
                <div className="border border-black bg-[#f8f8f8] p-6 sm:p-10 shadow-[4px_4px_0px_0px_#000000] flex flex-col gap-2">

                    <AccordionItem title="1. Introduction" isFirst={true}>
                        <p>
                            ATS Resify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our AI-powered resume building service.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="2. Information We Collect">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold uppercase mb-2 bg-black text-white inline-block px-2 py-1">2.1 Information You Provide</h3>
                                <ul className="list-none space-y-2 mt-2">
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Account information:</strong> Name, email address, and profile picture (obtained through Google OAuth)</span></li>
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Resume data:</strong> Work experience, education, skills, projects, certifications, and other information you input to create your resume</span></li>
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Uploaded documents:</strong> PDF files uploaded for ATS score analysis</span></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold uppercase mb-2 bg-black text-white inline-block px-2 py-1">2.2 Information Collected Automatically</h3>
                                <ul className="list-none space-y-2 mt-2">
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Usage data:</strong> Pages visited, features used, and time spent on the platform</span></li>
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Device information:</strong> Browser type, operating system, and screen resolution</span></li>
                                    <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Session data:</strong> JWT tokens for authentication (stored in browser localStorage)</span></li>
                                </ul>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem title="3. How We Use Your Information">
                        <p className="mb-4">We use the collected information to:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Generate and store your resume content using AI (Google Gemini)</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Compile LaTeX code into PDF documents on our servers</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Analyze resume content for ATS compatibility scoring</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Authenticate your identity and manage your account</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Improve and optimize our Service</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Communicate with you about service updates</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="4. Data Storage & Security">
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Your resume data is stored in a MySQL database secured with encrypted connections</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Authentication uses industry-standard OAuth 2.0 and JWT tokens</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>AI-generated responses are temporarily cached in Redis for performance optimization</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>PDF files generated from LaTeX are created in temporary directories and cleaned up after delivery</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>We use HTTPS for all data transmission</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="5. Third-Party Services">
                        <p className="mb-4">We integrate with the following third-party services:</p>
                        <ul className="list-none space-y-4 mb-4 pl-1">
                            <li className="flex items-start gap-2 border-l-4 border-black pl-4">
                                <span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span>
                                <span><strong>Google OAuth 2.0:</strong> For user authentication. Google's privacy policy applies to data collected during sign-in.</span>
                            </li>
                            <li className="flex items-start gap-2 border-l-4 border-black pl-4">
                                <span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span>
                                <span><strong>Google Gemini AI:</strong> Your resume content is sent to Google's Gemini API for AI processing. Google's AI data usage policies apply.</span>
                            </li>
                        </ul>
                        <p className="uppercase bg-[#39ff14] inline-block px-2 border-2 border-black mt-2">We do not sell, trade, or rent your personal information to anyone.</p>
                    </AccordionItem>

                    <AccordionItem title="6. Data Retention">
                        <p>
                            Your personal data is retained for as long as your account is active. Upon account deletion by an administrator, all associated data (resume content, user profile) is permanently removed from our database.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="7. Your Rights">
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Access:</strong> Request a copy of the data we hold about you</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Correction:</strong> Update inaccurate personal information</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Deletion:</strong> Request deletion of your account and associated data</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Portability:</strong> Export your resume data in standard formats (PDF)</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="8. Cookies & Display Advertising">
                        <p className="mb-4">We use cookies and browser storage for authentication and UI settings. Additionally, we use third-party advertising companies to serve ads when you visit our website:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Authentication token:</strong> Stored in localStorage to keep you signed in</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>User preferences:</strong> Stored locally for UI settings</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span><strong>Google AdSense:</strong> Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</span></li>
                            <li className="flex items-start gap-2"><span className="text-black font-black text-lg bg-[#39ff14] border border-black px-1 leading-none mt-0.5">!</span> <span>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline decoration-2 decoration-[#39ff14] hover:bg-[#39ff14] transition-colors">Ads Settings</a>.</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="9. Children's Privacy">
                        <p>
                            Our Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="11. Contact Us">
                        <p>
                            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at <a href="mailto:privacy@atsresify.com" className="font-black border-b-2 border-black hover:bg-[#39ff14] hover:text-black transition-colors pb-0.5 ml-1">privacy@atsresify.com</a>.
                        </p>
                    </AccordionItem>

                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
