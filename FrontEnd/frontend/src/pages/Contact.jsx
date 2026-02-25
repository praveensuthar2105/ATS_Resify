import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';
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

    const contactInfo = [
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            ),
            label: 'Email',
            value: 'contact@atsresify.com',
            href: 'mailto:contact@atsresify.com',
            color: '#6366f1',
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
            ),
            label: 'GitHub',
            value: 'Report Issues & Contribute',
            href: 'https://github.com/praveensuthar2105/AI_Powered_Resume_Builder',
            color: '#333',
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            ),
            label: 'Location',
            value: 'India',
            href: null,
            color: '#22c55e',
        },
    ];

    return (
        <div className="contact-page">
            {/* Hero */}
            <section className="contact-hero">
                <span className="contact-badge">GET IN TOUCH</span>
                <h1 className="contact-title">Contact <span className="gradient-text">Us</span></h1>
                <p className="contact-subtitle">
                    Have a question, suggestion, or want to report a bug? We'd love to hear from you.
                </p>
            </section>

            <div className="contact-layout">
                {/* Contact Form */}
                <div className="contact-form-wrapper">
                    <h2>Send us a message</h2>
                    {submitted && (
                        <div className="success-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            Message sent successfully! We'll get back to you soon.
                        </div>
                    )}
                    {error && <div className="error-message" style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', marginBottom: '16px' }}>{error}</div>}
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us more..." required />
                        </div>
                        <button type="submit" className="submit-btn">
                            Send Message
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </form>
                </div>

                {/* Contact Info Cards */}
                <div className="contact-info-wrapper">
                    <h2>Other ways to reach us</h2>
                    <div className="contact-info-cards">
                        {contactInfo.map((info, index) => (
                            <div key={index} className="contact-info-card">
                                <div className="info-icon" style={{ background: `${info.color}10`, color: info.color }}>
                                    {info.icon}
                                </div>
                                <div className="info-details">
                                    <span className="info-label">{info.label}</span>
                                    {info.href ? (
                                        <a href={info.href} target="_blank" rel="noopener noreferrer" className="info-value">{info.value}</a>
                                    ) : (
                                        <span className="info-value">{info.value}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Teaser */}
                    <div className="faq-teaser">
                        <h3>Frequently Asked Questions</h3>
                        <div className="faq-item">
                            <strong>Is ATS Resify free to use?</strong>
                            <p>Yes! ATS Resify is free to use for generating resumes, checking ATS scores, and exporting PDFs.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Is my data safe?</strong>
                            <p>Absolutely. We use OAuth 2.0, JWT tokens, and encrypted database connections. Read our <a href="/privacy">Privacy Policy</a> for details.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Can I contribute to the project?</strong>
                            <p>Yes! Check out our <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" target="_blank" rel="noopener noreferrer">GitHub repository</a> for contribution guidelines.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
