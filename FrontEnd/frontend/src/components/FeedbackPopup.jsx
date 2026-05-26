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
      setError('PLEASE CHOOSE A RATING.');
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
        throw new Error(data.error || 'FAILED TO TRANSMIT FEEDBACK.');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'AN ERROR OCCURRED.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = () => {
    const value = hoverRating || formData.rating;
    return value > 0 ? ['', 'POOR', 'FAIR', 'GOOD', 'VERY GOOD', 'EXCELLENT'][value] : 'CHOOSE RATING';
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-brutal-white uppercase select-none">
      <div className="w-full max-w-lg bg-brutal-black brutal-border p-6 md:p-8 relative brutal-shadow-white animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-neon-green text-lg bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>

        {/* Accent boxes */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-neon-green border-2 border-brutal-white"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-neon-green border-2 border-brutal-white"></div>

        {submitted ? (
          <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-6xl text-neon-green animate-bounce">check_circle</span>
            <h3 className="text-xl font-black">FEEDBACK TRANSMITTED</h3>
            <p className="text-xs text-slate-400 font-mono italic">SESSION ACTIVE. REMAINING ON THIS PAGE...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-green animate-pulse"></span>
                TRANSMIT FEEDBACK //
              </h3>
              <p className="text-[10px] text-slate-500 lowercase mt-1">help us refine the resume optimization engine.</p>
            </div>

            {error && (
              <div className="p-3 border border-red-500 bg-red-500/10 text-red-500 text-xs font-bold">
                ERROR: {error}
              </div>
            )}

            {/* Rating Stars */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400">01 // RATING_INDEX</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-2xl bg-transparent border-none cursor-pointer p-0 leading-none transition-colors ${
                        star <= (hoverRating || formData.rating) ? 'text-neon-green' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 border border-slate-700 text-neon-green bg-neon-green/5">
                  {getRatingLabel()}
                </span>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400">02 // MESSAGE_DUMP</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="> TELL US WHAT YOU LIKED OR WHAT COULD BE IMPROVED..."
                rows={3}
                required
                className="w-full bg-black/40 border-2 border-brutal-white p-3 font-mono text-xs brutal-scrollbar focus:outline-none focus:border-neon-green transition-colors resize-none text-brutal-white"
              />
            </div>

            {/* Authenticated fields (optional display/hide) */}
            {!isAuthenticated && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">03 // NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="NAME"
                    required
                    className="bg-black/40 border-2 border-brutal-white p-3 font-mono text-xs focus:outline-none focus:border-neon-green text-brutal-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">04 // EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="EMAIL"
                    required
                    className="bg-black/40 border-2 border-brutal-white p-3 font-mono text-xs focus:outline-none focus:border-neon-green text-brutal-white"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 border-brutal-white bg-transparent text-brutal-white font-bold text-xs hover:bg-white/10 btn-brutal transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 border-2 border-brutal-white bg-neon-green text-black font-black text-xs btn-brutal cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {submitting ? 'TRANSMITTING...' : 'SUBMIT PROTOCOL'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPopup;
