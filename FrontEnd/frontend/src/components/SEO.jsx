import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    type = 'website',
    name = 'ATS Resify',
    image = 'https://atsresify.me/og-image.png',
    href,
    noindex = false
}) => {
    // Generate clean canonical URL (stripping search params and hashes)
    const canonicalUrl = href || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://atsresify.me/');
    const fullTitle = title ? (title.includes('ATS Resify') ? title : `${title} | ATS Resify`) : 'ATS Resify — Free AI Resume Builder & ATS Score Checker';
    const metaDescription = description || "Build professional, ATS-optimized resumes with AI in minutes. Check your ATS score, edit with a live LaTeX editor, and export PDF resumes for free.";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />

            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={name} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
