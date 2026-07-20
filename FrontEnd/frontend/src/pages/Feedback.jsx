import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { Star, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

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
        return value > 0 ? ['', 'Needs Work', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating';
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
            <SEO
                title="Feedback | ATS Resify"
                description="Help us improve ATS Resify by sharing your experience. We value your opinion to build better AI resume tools."
            />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-amber-400/5 blur-[150px]" />
            </div>

            <main className="w-full max-w-3xl relative z-10 flex flex-col items-center">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-5 text-teal-600 shadow-sm border border-teal-100">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
                        Share Your Feedback
                    </h1>
                    <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Help us improve ATS Resify by sharing your experience. Your feedback directly shapes the future of our product.
                    </p>
                </div>

                <div className="w-full bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-12">
                    <h2 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
                        How was your experience?
                    </h2>

                    {submitted && (
                        <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-3 border border-emerald-100 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">Feedback transmitted successfully. Thank you for your input!</span>
                        </div>
                    )}
                    
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100 shadow-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="name">Full Name</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                                    id="name" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="Jane Doe" type="text" required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="email">Email Address</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                                    id="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="jane@example.com" type="email" required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Overall Rating</label>
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl w-fit">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isActive = star <= (hoverRating || formData.rating);
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                            >
                                                <Star 
                                                    className={`w-8 h-8 transition-colors ${isActive ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className={`text-sm font-semibold ml-2 ${hoverRating || formData.rating ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {getRatingLabel()}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide" htmlFor="message">Your Feedback</label>
                            <textarea
                                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400 resize-none"
                                id="message" name="message" value={formData.message} onChange={handleChange}
                                placeholder="Tell us what you liked, or what could be improved..."
                            ></textarea>
                        </div>

                        <button
                            className={`w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                'Submitting...'
                            ) : (
                                <>
                                    Submit Feedback
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Feedback;
