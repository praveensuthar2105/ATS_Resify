import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FeedbackPopup = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', rating: 0, message: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill user details if logged in
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        rating: 0,
        message: ''
      });
      setSubmitted(false);
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setError('Please select a rating.');
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
        throw new Error(data.error || 'Failed to transmit feedback.');
      }

      setSubmitted(true);
      localStorage.setItem('hasSubmittedFeedback', 'true');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = () => {
    const value = hoverRating || formData.rating;
    return value > 0 ? ['Choose Rating', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😃', 'Excellent! 🤩'][value] : 'Choose Rating';
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] block">close</span>
        </button>

        {submitted ? (
          <div className="text-center py-10 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/30 rounded-full flex items-center justify-center text-teal-500 dark:text-teal-400 shadow-inner">
              <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Feedback Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Thank you for helping us improve Resify.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Share Your Feedback
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Help us refine the AI resume builder and ATS scanner.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            {/* Rating Stars */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">01. Rating</label>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl bg-transparent border-none cursor-pointer p-1 transition-all hover:scale-125 active:scale-90"
                    >
                      <span className={`material-symbols-outlined text-3xl block leading-none font-variation-fill ${
                        star <= (hoverRating || formData.rating) 
                          ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                          : 'text-slate-200 dark:text-slate-800'
                      }`} style={{ fontVariationSettings: star <= (hoverRating || formData.rating) ? "'FILL' 1" : "'FILL' 0" }}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">
                  {getRatingLabel()}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">02. Comments</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="What did you like? What can we improve?"
                rows={3}
                required
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all resize-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Authenticated fields */}
            {!isAuthenticated && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">03. Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">04. Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-teal-500/10 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md border-0"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                  Submitting Feedback...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPopup;
