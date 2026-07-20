import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, FileText, ShieldCheck, User, Brain, Ban,
    Scale, AlertTriangle, XCircle, RefreshCw, CreditCard, Globe, Mail
} from 'lucide-react';

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

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20 pt-28 px-6 relative overflow-hidden">
            <SEO
                title="Terms & Conditions | ATS Resify"
                description="Read the Terms and Conditions for using ATS Resify. We cover user accounts, subscriptions, generated content, and acceptable use of our resume builder."
            />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/5 blur-[150px]" />
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
                        Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">Conditions</span>
                    </h1>
                    <p className="text-slate-500 text-base">
                        Last updated: July 20, 2025
                    </p>
                </section>

                {/* Quick Summary Banner */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-amber-800 mb-1">Important Agreement</h3>
                        <p className="text-sm text-amber-700/80 leading-relaxed">
                            By creating an account or using ATS Resify, you agree to these terms. Please read them carefully before using our platform.
                        </p>
                    </div>
                </div>

                {/* ACCORDION CONTENT */}
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-10">

                    <AccordionItem icon={FileText} title="1. Acceptance of Terms" isFirst={true} defaultOpen={true}>
                        <p>
                            By accessing and using ATS Resify ("the Service"), you accept and agree to be bound by these Terms and Conditions ("Terms"). These Terms constitute a legally binding agreement between you and ATS Resify. If you do not agree with any part of these Terms, you must immediately discontinue use of the Service.
                        </p>
                        <p>
                            We reserve the right to update these Terms at any time. Material changes will be communicated via email or an in-app notification. Your continued use of the Service after such changes constitutes acceptance.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={ShieldCheck} title="2. Description of Service">
                        <p className="mb-3">ATS Resify is a cloud-based SaaS platform that enables users to:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Generate professional resumes using artificial intelligence (Google Gemini)</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Edit resumes with a live LaTeX editor and real-time preview</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Check resume ATS (Applicant Tracking System) compatibility scores</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Match resumes against job descriptions for targeted optimization</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Export resumes as professionally typeset PDF documents</span></li>
                        </ul>
                        <p className="mt-3">
                            The Service may evolve over time. We reserve the right to modify, suspend, or discontinue any feature with reasonable notice.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={User} title="3. User Accounts & Eligibility">
                        <p className="mb-3">To access certain features, you must create an account using Google OAuth authentication. By creating an account, you represent that:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>You are at least 16 years of age</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>The information you provide is accurate and complete</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>You will maintain the security of your account credentials</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>You accept responsibility for all activities under your account</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>You will notify us immediately of any unauthorized access</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={CreditCard} title="4. Subscription & Payments">
                        <p className="mb-3">ATS Resify offers both free and premium tiers:</p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-1">Free Tier</h4>
                                <p className="text-sm text-slate-500">Access to core resume building features with limited AI generation credits and templates.</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-1">Premium Tier</h4>
                                <p className="text-sm text-slate-500">Unlimited AI generations, all templates, advanced ATS analysis, and priority support. Pricing and billing cycles are displayed at the time of subscription.</p>
                            </div>
                        </div>
                        <ul className="space-y-2 mt-4">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Payments are processed securely through third-party payment processors</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Subscriptions automatically renew unless cancelled before the renewal date</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Refund requests are evaluated on a case-by-case basis within 7 days of purchase</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>We reserve the right to adjust pricing with 30 days' advance notice</span></li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={FileText} title="5. User Content & Ownership">
                        <p>
                            You retain full ownership of all personal information and content you provide to the Service, including your resume data, work history, education details, and any other information you input. By using our Service, you grant us a limited, non-exclusive, revocable license to process this data solely for the purpose of providing, maintaining, and improving the Service.
                        </p>
                        <p>
                            You are solely responsible for the accuracy and legality of the content you provide. We do not verify the truthfulness of your resume data.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Brain} title="6. AI-Generated Content">
                        <p className="mb-3">Our Service uses Google Gemini AI to generate resume content. By using AI features, you acknowledge that:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">!</span>
                                <span>AI-generated content is provided as <strong>suggestions</strong> and should always be reviewed for accuracy</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">!</span>
                                <span>We do not guarantee that AI-generated content will result in job interviews or offers</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">!</span>
                                <span>You are responsible for verifying the accuracy of all generated content before using it in applications</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">!</span>
                                <span>ATS scores are estimates based on our proprietary algorithms and may differ from actual ATS systems used by employers</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">!</span>
                                <span>AI outputs may occasionally contain errors or inappropriate content; we disclaim liability for such outputs</span>
                            </li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={Ban} title="7. Prohibited Uses">
                        <p className="mb-3">You agree not to use the Service to:</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Create fraudulent or misleading resumes with false information</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Attempt to reverse-engineer, decompile, or disassemble the Service or its algorithms</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Interfere with, disrupt, or overload the Service or its infrastructure</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Use automated scripts, bots, or scrapers to access or extract data from the Service</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Resell, sublicense, or redistribute the Service without authorization</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✕</span>
                                <span className="text-red-700">Violate any applicable local, state, national, or international law</span>
                            </li>
                        </ul>
                    </AccordionItem>

                    <AccordionItem icon={Scale} title="8. Intellectual Property">
                        <p>
                            The Service, including its design, source code, AI models, LaTeX templates, branding, and all related intellectual property, is the exclusive property of ATS Resify. Our resume templates are provided for personal, non-commercial use in resume creation.
                        </p>
                        <p>
                            You may not copy, modify, distribute, sell, or commercially exploit any part of the Service, its templates, or generated outputs beyond personal use without our prior written consent.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={AlertTriangle} title="9. Limitation of Liability">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                            <p className="mb-3">
                                <strong>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.</strong>
                            </p>
                            <p>
                                To the maximum extent permitted by law, ATS Resify shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, including but not limited to:
                            </p>
                            <ul className="mt-3 space-y-1">
                                <li>• Lost employment opportunities or income</li>
                                <li>• Data loss or corruption</li>
                                <li>• Service interruptions or downtime</li>
                                <li>• Errors in AI-generated content</li>
                                <li>• Actions taken based on ATS score results</li>
                            </ul>
                            <p className="mt-3">
                                Our total aggregate liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
                            </p>
                        </div>
                    </AccordionItem>

                    <AccordionItem icon={ShieldCheck} title="10. Indemnification">
                        <p>
                            You agree to indemnify, defend, and hold harmless ATS Resify, its officers, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from: (a) your use of the Service, (b) your violation of these Terms, (c) your violation of any third-party rights, or (d) your content submitted through the Service.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={XCircle} title="11. Termination">
                        <p>
                            We reserve the right to suspend or terminate your account at any time for violations of these Terms, suspected fraud, or any conduct we determine is harmful to the Service or other users. Upon termination:
                        </p>
                        <ul className="space-y-2 mt-3">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Your right to use the Service will cease immediately</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>We may delete your stored data after a 30-day grace period</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Any outstanding payments remain due</span></li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" /><span>Sections that by nature should survive termination (liability, IP, indemnification) will remain in effect</span></li>
                        </ul>
                        <p className="mt-3">
                            You may terminate your account at any time by contacting us. We will process your deletion request within 30 days.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Globe} title="12. Governing Law & Disputes">
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts located in India.
                        </p>
                        <p>
                            Before initiating any legal proceedings, you agree to attempt to resolve disputes informally by contacting us at <a href="mailto:praveensuthar1863@gmail.com" className="text-teal-600 underline hover:text-teal-800 font-semibold">praveensuthar1863@gmail.com</a>. Both parties agree to engage in good-faith negotiations for at least 30 days.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={RefreshCw} title="13. Changes to Terms">
                        <p>
                            We may update these Terms from time to time. When we make material changes, we will provide notice through the Service or via email at least 14 days before the changes take effect. Continued use of the Service after any changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.
                        </p>
                    </AccordionItem>

                    <AccordionItem icon={Mail} title="14. Contact">
                        <p>If you have any questions about these Terms, please contact us:</p>
                        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <p className="font-semibold text-slate-700">ATS Resify — Legal Team</p>
                            <p className="mt-1">Email: <a href="mailto:praveensuthar1863@gmail.com" className="text-teal-600 underline hover:text-teal-800 font-semibold">praveensuthar1863@gmail.com</a></p>
                            <p className="mt-1">General: <a href="mailto:praveensuthar1863@gmail.com" className="text-teal-600 underline hover:text-teal-800 font-semibold">praveensuthar1863@gmail.com</a></p>
                        </div>
                    </AccordionItem>

                </div>
            </main>
        </div>
    );
};

export default Terms;
