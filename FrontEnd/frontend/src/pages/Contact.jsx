import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import './Contact.css';

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
            // Route through Vercel proxy to avoid Mixed Content errors
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
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
            <SEO
                title="Contact Us - ATS Resify"
                description="Get in touch with the ATS Resify team. Have a question, suggestion, or want to report a bug? We'd love to hear from you."
            />
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

            </Helmet>

            <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* HERO SECTION */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-block border-2 border-black bg-[#39ff14] text-black px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        GET IN TOUCH
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter uppercase relative inline-block">
                        Contact <span className="text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>Us</span>
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#39ff14]"></div>
                    </h1>
                    <p className="mt-8 text-gray-700 text-lg max-w-2xl mx-auto font-bold">
                        &gt; System prompt: Awaiting input. Have a question, suggestion, or want to report a bug? Execute communication protocol below. _
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* FORM AREA */}
                    <div className="lg:col-span-7">
                        <div className="bg-gray-50 border-2 border-black p-8 relative group transition-colors duration-500 shadow-[4px_4px_0px_0px_#000000]">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#39ff14]"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff14]"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#39ff14]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#39ff14]"></div>
                            <h2 className="text-2xl font-bold mb-8 uppercase tracking-wide border-b-2 border-black pb-4">
                                <span className="text-[#39ff14] mr-2">/</span>Send us a message
                            </h2>

                            {/* Status Messages */}
                            {submitted && (
                                <div className="mb-6 p-4 border-2 border-black bg-[#39ff14] text-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    MESSAGE TRANSMITTED SUCCESSFULLY. AWAITING RESPONSE.
                                </div>
                            )}
                            {error && (
                                <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-600 font-bold uppercase text-sm shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
                                    <span className="material-symbols-outlined">error</span>
                                    ERROR: {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="name">Name</label>
                                        <input
                                            className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] text-black placeholder-gray-400 px-4 py-3 transition-colors outline-none"
                                            id="name" name="name" placeholder="YOUR NAME" type="text"
                                            value={formData.name} onChange={handleChange} required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="email">Email</label>
                                        <input
                                            className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] text-black placeholder-gray-400 px-4 py-3 transition-colors outline-none"
                                            id="email" name="email" placeholder="YOU@EXAMPLE.COM" type="email"
                                            value={formData.email} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="subject">Subject</label>
                                    <input
                                        className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] text-black placeholder-gray-400 px-4 py-3 transition-colors outline-none"
                                        id="subject" name="subject" placeholder="WHAT'S THIS ABOUT?" type="text"
                                        value={formData.subject} onChange={handleChange} required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="message">Message</label>
                                    <textarea
                                        className="brutal-scrollbar w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] text-black placeholder-gray-400 px-4 py-3 transition-colors outline-none resize-none"
                                        id="message" name="message" placeholder="TELL US MORE..." rows="5"
                                        value={formData.message} onChange={handleChange} required
                                    ></textarea>
                                </div>
                                <button
                                    className={`w-full bg-[#39ff14] text-black font-bold text-lg uppercase py-4 border-2 border-black hover:bg-black hover:text-[#39ff14] shadow-[4px_4px_0px_0px_#000000] active:shadow-none transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'TRANSMITTING...' : 'SEND MESSAGE'}
                                    {!submitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* SIDEBAR AREA */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-6 uppercase tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#39ff14] border-2 border-black inline-block"></span>
                                Other ways to reach us
                            </h3>
                            <div className="space-y-4">

                                <a href="mailto:contact@atsresify.com" className="bg-gray-100 border-2 border-black p-4 flex items-center gap-4 hover:border-[#39ff14] hover:bg-white transition-colors group cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] no-underline flex-1 block">
                                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-[#39ff14] transition-colors shrink-0">
                                        <span className="material-symbols-outlined">email</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Email</div>
                                        <div className="text-black font-bold group-hover:text-[#39ff14] transition-colors break-all text-sm sm:text-base">contact@atsresify.com</div>
                                    </div>
                                </a>

                                <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" target="_blank" rel="noopener noreferrer" className="bg-gray-100 border-2 border-black p-4 flex items-center gap-4 hover:border-[#39ff14] hover:bg-white transition-colors group cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] no-underline flex-1 block">
                                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-[#39ff14] transition-colors shrink-0">
                                        <span className="material-symbols-outlined">code</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Github</div>
                                        <div className="text-black font-bold group-hover:text-[#39ff14] transition-colors text-sm sm:text-base">Report Issues &amp; Contribute</div>
                                    </div>
                                </a>

                                <div className="bg-gray-100 border-2 border-black p-4 flex items-center gap-4 hover:border-[#39ff14] hover:bg-white transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 block">
                                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-[#39ff14] transition-colors shrink-0">
                                        <span className="material-symbols-outlined">place</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Location</div>
                                        <div className="text-black font-bold text-sm sm:text-base">Global Network // HQ: India</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="bg-gray-100 border-2 border-black p-6 mt-8 shadow-[4px_4px_0px_0px_#000000]">
                            <h3 className="text-xl font-bold mb-6 uppercase tracking-wide flex items-center gap-2 border-b-2 border-black pb-4">
                                <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>&gt;</span> FAQ
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-black mb-2 flex items-start gap-2 text-sm sm:text-base">
                                        <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>Q:</span> Is ATS Resify free to use?
                                    </h4>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed pl-6 border-l-2 border-black ml-2 font-bold">
                                        Yes! ATS Resify is free to use for generating resumes, checking ATS scores, and exporting PDFs.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-black mb-2 flex items-start gap-2 text-sm sm:text-base">
                                        <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>Q:</span> Is my data secure?
                                    </h4>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed pl-6 border-l-2 border-black ml-2 font-bold">
                                        Absolutely. We use industry-standard encryption protocols. Read our <span className="text-black font-bold underline decoration-[#39ff14] decoration-2 cursor-pointer">Privacy Policy</span> for complete details.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-black mb-2 flex items-start gap-2 text-sm sm:text-base">
                                        <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>Q:</span> Can I contribute to the project?
                                    </h4>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed pl-6 border-l-2 border-black ml-2 font-bold">
                                        Yes! Check out our <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" className="text-black font-bold underline decoration-[#39ff14] decoration-2">GitHub repository</a> for contribution guidelines.
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
