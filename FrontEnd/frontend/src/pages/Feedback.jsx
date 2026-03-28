import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';

const Feedback = () => {
    const [formData, setFormData] = useState({ name: '', email: '', rating: 0, message: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.rating === 0) {
            setError('Please select a rating');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/public/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit feedback');
            }
            setSubmitted(true);
            setFormData({ name: '', email: '', rating: 0, message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingLabel = () => {
        const value = hoverRating || formData.rating;
        return value > 0 ? ['', 'poor', 'fair', 'good', 'very good', 'excellent'][value] : 'select rating';
    };

    return (
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono uppercase selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <SEO
                title="CareerAI - Feedback"
                description="Help us improve ATS Resify by sharing your experience. We value your opinion to build better AI resume tools."
            />
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
            </Helmet>

            <main className="flex-grow py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black text-black mb-8 w-fit text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                        WE VALUE YOUR OPINION
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase text-black">
                        SHARE YOUR <span className="bg-[#39ff14] text-black px-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">FEEDBACK</span>
                    </h1>
                    <p className="text-sm text-[#333333] max-w-2xl mx-auto lowercase leading-relaxed font-bold">
                        help us improve ats resify by sharing your experience. your feedback directly shapes our product.
                    </p>
                </div>

                <div className="w-full max-w-3xl bg-white border-2 border-black p-8 md:p-12 relative shadow-[6px_6px_0px_0px_#39ff14]">
                    {/* Corner Accents */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#39ff14] border-2 border-black"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#39ff14] border-2 border-black"></div>

                    <h2 className="text-2xl font-black mb-8 uppercase text-black border-b-2 border-black pb-4">HOW WAS YOUR EXPERIENCE?</h2>

                    {submitted && (
                        <div className="mb-8 p-4 border-2 border-black bg-[#39ff14] text-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            FEEDBACK TRANSMITTED SUCCESSFULLY. THANK YOU!
                        </div>
                    )}
                    {error && (
                        <div className="mb-8 p-4 border-2 border-red-500 bg-red-100 text-red-600 font-bold uppercase text-sm shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
                            <span className="material-symbols-outlined">error</span>
                            ERROR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase text-black" htmlFor="name">NAME</label>
                                <input
                                    className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] outline-none text-black px-4 py-3 text-sm placeholder:text-gray-400 font-mono transition-colors"
                                    id="name" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="YOUR NAME" type="text" required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase text-black" htmlFor="email">EMAIL</label>
                                <input
                                    className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] outline-none text-black px-4 py-3 text-sm placeholder:text-gray-400 font-mono transition-colors"
                                    id="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="YOU@EXAMPLE.COM" type="email" required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-2 uppercase text-black">RATING</label>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none focus:ring-2 focus:ring-[#39ff14] bg-transparent border-none p-0 cursor-pointer"
                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-4xl transition-colors ${star <= (hoverRating || formData.rating)
                                                    ? 'text-[#39ff14]'
                                                    : 'text-gray-300'
                                                    }`}
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-[#333333] lowercase font-bold">{getRatingLabel()}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-2 uppercase text-black" htmlFor="message">YOUR FEEDBACK</label>
                            <textarea
                                className="w-full bg-white border-2 border-black focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14] outline-none text-black px-4 py-3 text-sm placeholder:text-gray-400 font-mono transition-colors h-32 resize-none brutal-scrollbar"
                                id="message" name="message" value={formData.message} onChange={handleChange}
                                placeholder="TELL US WHAT YOU LIKED, WHAT COULD BE IMPROVED..."
                            ></textarea>
                        </div>

                        <button
                            className={`w-full bg-[#39ff14] text-black font-black text-lg py-4 border-2 border-black hover:bg-black hover:text-[#39ff14] shadow-[4px_4px_0px_0px_#000000] active:shadow-none transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}
                            {!submitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Feedback;
