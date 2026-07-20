import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsentAccepted');
    if (!hasConsented) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsentAccepted', 'true');
    localStorage.setItem('termsConsentAccepted', 'true');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-container">
        {/* Accent bar */}
        <div className="cookie-accent-bar" />

        <div className="cookie-banner-body">
          <div className="cookie-banner-content">
            <div className="cookie-icon-wrap" aria-hidden="true">
              <span className="material-symbols-outlined cookie-icon-symbol">cookie</span>
            </div>

            <div className="cookie-text">
              <p id="cookie-consent-title" className="cookie-title">
                Cookies &amp; Terms
              </p>
              <p className="cookie-description">
                We use cookies to improve your experience, analyze traffic, and serve relevant ads
                (including via Google). By clicking <strong>Accept</strong>, you agree to our use of
                cookies and to our{' '}
                <Link to="/terms" className="cookie-inline-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="cookie-inline-link">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="cookie-actions">
            <div className="cookie-links">
              <Link to="/privacy" className="cookie-link">
                Privacy
              </Link>
              <span className="cookie-link-dot" aria-hidden="true">
                ·
              </span>
              <Link to="/terms" className="cookie-link">
                Terms
              </Link>
            </div>
            <button type="button" onClick={handleAccept} className="btn-cookie-accept">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Accept &amp; continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
