import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    type = 'website',
    name = 'ATS Resify',
    href
}) => {
    // Use the provided href or fallback to the current URL if running in browser
    const canonicalUrl = href || (typeof window !== 'undefined' ? window.location.href : 'https://atsresify.me/');
    const fullTitle = title ? `${title} | ATS Resify` : 'ATS Resify — Free AI Resume Builder & ATS Checker';
    const metaDescription = description || "Build professional, ATS-optimized resumes with AI in minutes. Check your ATS score, edit with a live LaTeX editor, and export PDF resumes for free.";

    // Temporarily disabled due to npm network errors preventing react-helmet-async installation



    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />

            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:site_name" content={name} />

            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
        </Helmet>
    );

};

export default SEO;
