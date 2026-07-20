import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/public/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message');
            }
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pt-32 pb-20 px-6 relative overflow-hidden">
            <SEO
                title="Contact & Support | ATS Resify"
                description="Get in touch with the ATS Resify team. Have a question, suggestion, or want to report a bug? We'd love to hear from you."
            />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/5 blur-[150px]" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                
                {/* HERO SECTION */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-3 py-1.5 rounded-full mb-6 inline-block">
                        Support & Contact
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">Touch</span>
                    </h1>
                    <p className="mt-6 text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                        Have a question, suggestion, or want to report a bug? Send us a message and we'll get back to you shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* FORM AREA */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-10">
                            <h2 className="text-2xl font-bold mb-8 text-slate-800">
                                Send us a message
                            </h2>

                            {/* Status Messages */}
                            {submitted && (
                                <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-3 border border-emerald-100 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-semibold">Message transmitted successfully. Awaiting response.</span>
                                </div>
                            )}
                            {error && (
                                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100 shadow-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="name">Name</label>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                                            id="name" name="name" placeholder="Jane Doe" type="text"
                                            value={formData.name} onChange={handleChange} required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="email">Email</label>
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                                            id="email" name="email" placeholder="jane@example.com" type="email"
                                            value={formData.email} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="subject">Subject</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                                        id="subject" name="subject" placeholder="What's this about?" type="text"
                                        value={formData.subject} onChange={handleChange} required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="message">Message</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400 resize-none h-32"
                                        id="message" name="message" placeholder="Tell us more..." rows="5"
                                        value={formData.message} onChange={handleChange} required
                                    ></textarea>
                                </div>
                                <button
                                    className={`w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 mt-4 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Transmitting...' : 'Send Message'}
                                    {!submitting && <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* SIDEBAR AREA */}
                    <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
                        
                        {/* Direct Contacts */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold mb-6 text-slate-800">
                                Other ways to reach us
                            </h3>
                            <div className="flex flex-col gap-4">
                                <a href="mailto:praveensuthar1863@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100 transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 group-hover:text-teal-600 shadow-sm transition-colors shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Support</div>
                                        <div className="text-sm font-bold text-slate-800">praveensuthar1863@gmail.com</div>
                                    </div>
                                </a>

                                <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 group-hover:text-slate-900 shadow-sm transition-colors shrink-0">
                                        <GithubIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Developer GitHub</div>
                                        <div className="text-sm font-bold text-slate-800">Report Issues & Contribute</div>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</div>
                                        <div className="text-sm font-bold text-slate-800">Global Network HQ: India</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
                            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-teal-400" />
                                Quick FAQ
                            </h3>
                            <div className="flex flex-col gap-6 relative z-10">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1.5 text-teal-300">Is ATS Resify free to use?</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Yes! ATS Resify is free to use for generating resumes, checking ATS scores, and exporting PDFs.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1.5 text-teal-300">Is my data secure?</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Absolutely. We use industry-standard encryption protocols. Refer to our Privacy Policy for more details.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
