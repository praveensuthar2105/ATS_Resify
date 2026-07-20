import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Shield, Eye, Database, Lock, Users, Globe, Bell, Baby, RefreshCw, Mail } from 'lucide-react';

const AccordionItem = ({ icon: Icon, title, isFirst, defaultOpen, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen || false);

    return (
        <div className={`${isFirst ? '' : 'border-t border-slate-100'}`}>
            <button
                className="w-full flex items-center justify-between gap-4 py-5 px-1 text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <h2 className="text-base font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{title}</h2>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-teal-500' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <div className="pl-11 pr-2 text-sm text-slate-600 leading-relaxed space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20 pt-28 px-6 relative overflow-hidden">
            <SEO
                title="Privacy Policy | ATS Resify"
                description="Read the ATS Resify Privacy Policy to understand how we collect, use, and protect your personal information and resume data."
            />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[150px]" />
            </div>

            <main className="max-w-4xl mx-auto relative z-10">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-all shadow-sm">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* HERO */}
                <section className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-3 py-1.5 rounded-full mb-6 inline-block">
                        Legal
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">Policy</span>
                    </h1>
                    <p className="text-slate-500 text-base">
                        Last updated: July 20, 2025
                    </p>
                </section>

                {/* Quick Summary Banner */}
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-teal-800 mb-1">Your Privacy Matters</h3>
                        <p className="text-sm text-teal-700/80 leading-relaxed">
                            We collect only the data necessary to provide our resume building service. We never sell your personal information. You retain full ownership of your content.
                        </p>
                    </div>
                </div>

                {/* ACCORDION CONTENT */}
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-10">

                    <AccordionItem icon={Eye} title="1. Introduction" isFirst={true} defaultOpen={true}>
                        <p>
                            ATS Resify ("we", "our", or "us") operates a cloud-based SaaS platform for AI-powered resume building and ATS optimization. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our service at <strong>atsresify.com</strong> (the "Service").
                        </p>
                        <p>
                            By creating an account or using our Service, you consent to the data practices described in this policy. If you do not agree, please discontinue use of the Service immediately.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Database} title="2. Information We Collect">
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-2">2.1 Information You Provide</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Account information:</strong> Name, email address, and profile picture (obtained through Google OAuth 2.0)</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Resume data:</strong> Work experience, education, skills, projects, certifications, and other information you input to create your resume</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Uploaded documents:</strong> PDF files uploaded for ATS score analysis</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Feedback & support messages:</strong> Content you submit through our feedback or contact forms</span></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-2">2.2 Information Collected Automatically</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Usage data:</strong> Pages visited, features used, and time spent on the platform</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Device information:</strong> Browser type, operating system, and screen resolution</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Session data:</strong> JWT tokens for authentication (stored in browser localStorage)</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Log data:</strong> IP address, access times, and referring URLs for security monitoring</span></li>
                                </ul>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem icon={Lock} title="3. How We Use Your Information">
                        <p className="mb-3">We use the collected information exclusively to:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Generate and store your resume content using AI (Google Gemini)</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Compile LaTeX code into PDF documents on our servers</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Analyze resume content for ATS compatibility scoring</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Authenticate your identity and manage your account</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Improve and optimize our Service based on aggregated usage patterns</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Communicate with you about service updates, security alerts, and support responses</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Enforce our Terms of Service and prevent abuse or fraud</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={Shield} title="4. Data Storage & Security">
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Your resume data is stored in a MySQL database secured with encrypted connections</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Authentication uses industry-standard OAuth 2.0 and JWT tokens with expiration policies</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Passwords are never stored — we rely solely on Google OAuth for account security</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>PDF files generated from LaTeX are created in temporary directories and cleaned up after delivery</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>All data transmission is encrypted via HTTPS (TLS 1.2+)</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>We conduct regular security reviews and apply patches promptly</span></li>
                        </ul>
                        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                            <strong>Note:</strong> While we implement industry-standard security measures, no method of electronic transmission is 100% secure. We cannot guarantee absolute security of your data.
                        </div>
                    </AccordionItem>

                    <AccordionItem icon={Globe} title="5. Third-Party Services">
                        <p className="mb-3">We integrate with the following third-party services:</p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-1">Google OAuth 2.0</h4>
                                <p className="text-sm text-slate-500">Used for user authentication. Google's privacy policy governs data collected during the sign-in process.</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-1">Google Gemini AI</h4>
                                <p className="text-sm text-slate-500">Your resume content is sent to Google's Gemini API for AI processing. Google's AI Terms of Service apply to this data.</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-1">Google AdSense</h4>
                                <p className="text-sm text-slate-500">Third-party vendors, including Google, use cookies to serve ads based on your browsing history. You may opt out of personalized advertising via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-800">Google Ads Settings</a>.</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800 font-semibold">
                            We do not sell, trade, or rent your personal information to any third party.
                        </div>
                    </AccordionItem>

                    <AccordionItem icon={Users} title="6. Data Sharing & Disclosure">
                        <p className="mb-3">We may share your information only in these limited circumstances:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Service providers:</strong> Third-party vendors who assist in operating our platform (e.g., hosting, AI processing), bound by confidentiality obligations</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Legal compliance:</strong> When required by law, regulation, legal process, or governmental request</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Safety:</strong> To protect the rights, property, or safety of ATS Resify, our users, or the public</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets (your data would remain protected under the same privacy guarantees)</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={RefreshCw} title="7. Data Retention">
                        <p>
                            Your personal data is retained for as long as your account is active. Upon account deletion request, all associated data — including resume content, uploaded documents, and your user profile — will be permanently removed from our database within 30 days.
                        </p>
                        <p>
                            Aggregated, anonymized data that cannot identify you may be retained indefinitely for analytics and service improvement purposes.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Shield} title="8. Your Rights">
                        <p className="mb-3">Depending on your jurisdiction, you may have the following rights:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Access:</strong> Request a copy of the personal data we hold about you</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Correction:</strong> Update or correct inaccurate personal information</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Deletion:</strong> Request permanent deletion of your account and all associated data</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Portability:</strong> Export your resume data in standard formats (PDF)</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Objection:</strong> Object to certain processing of your data (e.g., marketing communications)</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Restriction:</strong> Request that we limit processing of your personal data</span></li>
                        </ul>
                        <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:praveensuthar1863@gmail.com" className="text-teal-600 underline hover:text-teal-800 font-semibold">praveensuthar1863@gmail.com</a>. We will respond within 30 days.</p>
                    </AccordionItem>

                    <AccordionItem icon={Globe} title="9. Cookies & Advertising">
                        <p className="mb-3">We use cookies and browser storage for the following purposes:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Essential cookies:</strong> Authentication tokens stored in localStorage to keep you signed in</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Preference cookies:</strong> Stored locally for UI settings and user preferences</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span><strong>Advertising cookies:</strong> Google AdSense uses cookies to serve ads based on your browsing history. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to our site and other websites</span></li>
                        </ul>
                        <p className="mt-3">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-800 font-semibold">Google Ads Settings</a>. You can also configure your browser to block or delete cookies, though this may affect Service functionality.</p>
                    </AccordionItem>

                    <AccordionItem icon={Baby} title="10. Children's Privacy">
                        <p>
                            Our Service is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16 without parental consent, we will take immediate steps to delete such information from our servers.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Globe} title="11. International Data Transfers">
                        <p>
                            Your data may be processed in servers located outside your country of residence. By using our Service, you consent to the transfer of your data to jurisdictions that may have different data protection regulations than your own. We take reasonable steps to ensure your data remains protected in accordance with this policy.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Bell} title="12. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any changes will be reflected on this page with an updated revision date. If we make material changes, we will notify you via email or a prominent notice on our Service prior to the changes taking effect. Continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Mail} title="13. Contact Us">
                        <p>
                            If you have any questions about this Privacy Policy, wish to exercise your data rights, or have concerns about how your information is handled, please contact us:
                        </p>
                        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <p className="font-semibold text-slate-700">ATS Resify — Privacy Team</p>
                            <p className="mt-1">Email: <a href="mailto:praveensuthar1863@gmail.com" className="text-teal-600 underline hover:text-teal-800 font-semibold">praveensuthar1863@gmail.com</a></p>
                            <p className="mt-1">Response Time: Within 30 business days</p>
                        </div>
                    </AccordionItem>

                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
