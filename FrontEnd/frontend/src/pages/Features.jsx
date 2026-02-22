import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import LockIcon from '@mui/icons-material/Lock';

const Features = () => {
  const mainFeatures = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'AI-Powered Generation',
      description: 'Advanced AI generates professional summaries, experience bullets, project descriptions, and skill recommendations tailored to your target role.',
      color: '#3B82F6',
      accent: '#0ea5e9',
    },
    {
      icon: <CodeIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Live LaTeX Editor',
      description: 'Full-featured Monaco-based LaTeX editor with syntax highlighting, auto-completion, and instant server-side PDF compilation using pdflatex.',
      color: '#8B5CF6',
      accent: '#a855f7',
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'ATS Score Checker',
      description: 'Upload your resume to get an AI-powered ATS score with keyword analysis, formatting checks, strengths, weaknesses, and actionable recommendations.',
      color: '#10B981',
      accent: '#22c55e',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'AI Resume Agent',
      description: 'Interactive chat agent that improves bullet points, analyzes job matches, identifies keyword gaps, and tailors content to specific job descriptions.',
      color: '#F59E0B',
      accent: '#f97316',
    },
    {
      icon: <SyncAltIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Real-time Sync',
      description: 'WebSocket-powered live synchronization between form editor, JSON editor, and LaTeX code. Edit in any mode — all views stay perfectly in sync.',
      color: '#06B6D4',
      accent: '#22d3ee',
    },
    {
      icon: <LockIcon sx={{ fontSize: 32, color: 'white' }} />,
      title: 'Secure Authentication',
      description: 'OAuth 2.0 login with JWT-based authentication and secure one-time authorization code exchange. Your data stays protected.',
      color: '#EF4444',
      accent: '#f87171',
    }
  ];

  const microHighlights = [
    { label: 'Advanced AI Engine' },
    { label: 'Live LaTeX → PDF' },
    { label: 'WebSocket Sync' },
    { label: 'ATS Keyword Analysis' },
    { label: 'Job Description Matching' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFBFC', py: 6, px: 2, width: '100%' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="PLATFORM FEATURES" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Built for Job-Winning Resumes
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: '760px', mx: 'auto' }}>
            AI-powered content generation, professional LaTeX typesetting, ATS optimization, and real-time collaboration — everything in one platform.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 3 }}>
            {microHighlights.map((item, idx) => (
              <Chip key={idx} label={item.label} variant="outlined" sx={{ borderRadius: 999, fontWeight: 600 }} />
            ))}
          </Stack>
        </Box>

        {/* Main Features Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            mb: 6,
          }}
        >
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${feature.color}30`,
                  borderColor: feature.color,
                }
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 30% 30%, ${feature.accent || feature.color}44, transparent 60%), linear-gradient(135deg, ${feature.color} 0%, ${(feature.accent || feature.color)}dd 100%)`,
                      boxShadow: `0 10px 28px ${feature.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 8,
                        borderRadius: '50%',
                        border: `1px solid ${(feature.accent || feature.color)}33`,
                        opacity: 0.9,
                      }}
                    />
                    <Box sx={{ fontSize: '34px', zIndex: 1 }}>{feature.icon}</Box>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    color: 'text.primary',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    textAlign: 'center',
                    flexGrow: 1,
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* How It Works */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 4, color: 'text.primary' }}>
              How It Works
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 4,
              }}
            >
              {[
                { num: 1, title: 'Enter Your Details', desc: 'Fill in your experience, education, skills, and projects using our guided form editor — or let the AI generate content from scratch.', color: '#667eea' },
                { num: 2, title: 'AI Generates & Optimizes', desc: 'Our AI creates impactful bullet points, professional summaries, and optimizes your content for ATS keyword matching.', color: '#10B981' },
                { num: 3, title: 'Edit & Export PDF', desc: 'Fine-tune in the LaTeX editor, check your ATS score, and download a beautifully typeset PDF — ready to submit.', color: '#f093fb' }
              ].map((step, idx) => (
                <Box key={idx} sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 800,
                    mx: 'auto',
                    mb: 2,
                    boxShadow: `0 8px 16px ${step.color}40`
                  }}>
                    {step.num}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {step.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Features;

