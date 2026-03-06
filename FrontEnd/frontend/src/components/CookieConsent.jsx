import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasConsented = localStorage.getItem('cookieConsentAccepted');
        if (!hasConsented) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsentAccepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-container">
            <div className="cookie-banner-content">
                <div className="cookie-icon">🍪</div>
                <div className="cookie-text">
                    <p className="cookie-title">We value your privacy</p>
                    <p className="cookie-description">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                </div>
            </div>
            <div className="cookie-actions">
                <a href="/privacy" className="cookie-link">Privacy Policy</a>
                <button onClick={handleAccept} className="btn-cookie-accept">Accept All</button>
            </div>
        </div>
    );
};

export default CookieConsent;
