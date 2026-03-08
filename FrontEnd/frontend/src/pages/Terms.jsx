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

const Terms = () => {
    return (
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
            <SEO
                title="Terms & Conditions - ATS Resify"
                description="Read the Terms and Conditions for using ATS Resify. We cover user accounts, generated content, and acceptable use of our resume builder."
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
                        Terms & <span className="text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>Conditions</span>
                    </h1>
                    <p className="text-gray-600 font-bold uppercase tracking-wide">Last updated: February 24, 2026</p>
                    <p className="text-black font-bold uppercase text-xs mt-4 bg-[#39ff14] border-2 border-black inline-block px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                        <span className="material-symbols-outlined text-[14px] align-text-bottom mr-1">mouse</span>
                        Click on any section below to expand
                    </p>
                </div>

                {/* CONTENT BORDER WRAPPER */}
                <div className="border border-black bg-[#f8f8f8] p-6 sm:p-10 shadow-[4px_4px_0px_0px_#000000] flex flex-col gap-2">

                    <AccordionItem title="1. Acceptance of Terms" isFirst={true}>
                        <p>
                            By accessing and using ATS Resify ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our Service.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="2. Description of Service">
                        <p className="mb-4">ATS Resify is an AI-powered resume building platform that allows users to:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Generate professional resumes using artificial intelligence</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Edit resumes in a live LaTeX editor with real-time preview</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Check resume ATS (Applicant Tracking System) compatibility scores</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Export resumes as professionally typeset PDF documents</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Use an AI agent for resume content improvement and job matching</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="3. User Accounts">
                        <p className="mb-4">To access certain features, you must create an account using Google OAuth authentication. You are responsible for:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Maintaining the confidentiality of your account credentials</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>All activities that occur under your account</span></li>
                            <li className="flex items-start gap-2"><span className="text-[#39ff14] font-black text-lg bg-black px-1 leading-none mt-0.5">&gt;</span> <span>Notifying us immediately of any unauthorized use of your account</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="4. User Content">
                        <p>
                            You retain ownership of all personal information and content you provide to the Service, including your resume data, work history, education details, and any other information you input. By using our Service, you grant us a limited license to process this data solely for the purpose of generating and storing your resume.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="5. AI-Generated Content">
                        <p className="mb-4">Our Service uses Google Gemini AI to generate resume content. Please note:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-black font-black text-lg bg-[#39ff14] border border-black px-1 leading-none mt-0.5">!</span> <span>AI-generated content is provided as suggestions and should be reviewed for accuracy</span></li>
                            <li className="flex items-start gap-2"><span className="text-black font-black text-lg bg-[#39ff14] border border-black px-1 leading-none mt-0.5">!</span> <span>We do not guarantee that AI-generated content will result in job interviews or offers</span></li>
                            <li className="flex items-start gap-2"><span className="text-black font-black text-lg bg-[#39ff14] border border-black px-1 leading-none mt-0.5">!</span> <span>You are responsible for verifying the accuracy of all generated content before using it</span></li>
                            <li className="flex items-start gap-2"><span className="text-black font-black text-lg bg-[#39ff14] border border-black px-1 leading-none mt-0.5">!</span> <span>ATS scores are estimates and may differ from actual ATS systems used by employers</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="6. Prohibited Uses">
                        <p className="mb-4">You agree not to use the Service to:</p>
                        <ul className="list-none space-y-2">
                            <li className="flex items-start gap-2"><span className="text-white font-black text-lg bg-red-600 border border-black px-1 leading-none mt-0.5">X</span> <span className="text-red-600">Create fraudulent or misleading resumes with false information</span></li>
                            <li className="flex items-start gap-2"><span className="text-white font-black text-lg bg-red-600 border border-black px-1 leading-none mt-0.5">X</span> <span className="text-red-600">Attempt to reverse-engineer, decompile, or disassemble the Service</span></li>
                            <li className="flex items-start gap-2"><span className="text-white font-black text-lg bg-red-600 border border-black px-1 leading-none mt-0.5">X</span> <span className="text-red-600">Interfere with or disrupt the Service or its infrastructure</span></li>
                            <li className="flex items-start gap-2"><span className="text-white font-black text-lg bg-red-600 border border-black px-1 leading-none mt-0.5">X</span> <span className="text-red-600">Use automated scripts or bots to access the Service</span></li>
                            <li className="flex items-start gap-2"><span className="text-white font-black text-lg bg-red-600 border border-black px-1 leading-none mt-0.5">X</span> <span className="text-red-600">Violate any applicable laws or regulations</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem title="7. Intellectual Property">
                        <p>
                            The Service, including its design, code, and LaTeX templates, is the intellectual property of ATS Resify. Our resume templates are provided for personal use in resume creation. You may not redistribute, sell, or commercially exploit our templates without permission.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="8. Limitation of Liability">
                        <p>
                            The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost employment opportunities, data loss, or service interruptions.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="9. Termination">
                        <p>
                            We reserve the right to suspend or terminate your account at any time for violations of these Terms. Upon termination, your right to use the Service will cease immediately, and we may delete your stored data.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="10. Changes to Terms">
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after any changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.
                        </p>
                    </AccordionItem>

                    <AccordionItem title="11. Contact">
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:contact@atsresify.com" className="font-black border-b-2 border-black hover:bg-[#39ff14] hover:text-black transition-colors pb-0.5 ml-1">contact@atsresify.com</a>.
                        </p>
                    </AccordionItem>

                </div>
            </main>
        </div>
    );
};

export default Terms;
