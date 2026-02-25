import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import './Feedback.css';

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
            const res = await fetch(`${API_BASE_URL.replace('/api', '')}/api/public/feedback`, {
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

    const StarRating = () => (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hoverRating || formData.rating) ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= (hoverRating || formData.rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
            <span className="rating-label">
                {formData.rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating] : 'Select rating'}
            </span>
        </div>
    );

    return (
        <div className="feedback-page">
            <section className="feedback-hero">
                <span className="feedback-badge">WE VALUE YOUR OPINION</span>
                <h1 className="feedback-title">Share Your <span className="gradient-text">Feedback</span></h1>
                <p className="feedback-subtitle">
                    Help us improve ATS Resify by sharing your experience. Your feedback directly shapes our product.
                </p>
            </section>

            <div className="feedback-container">
                <div className="feedback-form-wrapper">
                    <h2>How was your experience?</h2>
                    {submitted && (
                        <div className="success-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            Thank you for your feedback! We appreciate your time.
                        </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fb-name">Name</label>
                                <input type="text" id="fb-name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fb-email">Email</label>
                                <input type="email" id="fb-email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Rating</label>
                            <StarRating />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fb-message">Your Feedback</label>
                            <textarea id="fb-message" name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us what you liked, what could be improved..." />
                        </div>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                            {!submitting && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
