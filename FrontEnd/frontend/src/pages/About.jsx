import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Avatar, Paper, Chip } from '@mui/material';
import {
  RocketOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  CloudOutlined,
} from '@ant-design/icons';

const About = () => {
  const values = [
    {
      icon: <BulbOutlined style={{ fontSize: '32px' }} />,
      title: 'AI-Powered',
      description: 'Utilizing AI technology to generate professional resumes quickly and efficiently.',
    },
    {
      icon: <HeartOutlined style={{ fontSize: '32px' }} />,
      title: 'Simple & Easy',
      description: 'Clean, intuitive interface designed for ease of use.',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '32px' }} />,
      title: 'ATS Friendly',
      description: 'Generates resumes optimized for Applicant Tracking Systems.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '32px' }} />,
      title: 'Open Source',
      description: 'Built as a learning project to explore AI integration in web applications.',
    },
  ];

  const milestones = [
    {
      year: '2025',
      title: 'Project Started',
      description: 'Began development of AI Resume Builder as a learning project.',
    },
    {
      year: '2025',
      title: 'Backend Development',
      description: 'Built Spring Boot backend with Gemini AI integration.',
    },
    {
      year: '2025',
      title: 'Frontend Development',
      description: 'Created React frontend with Ant Design components.',
    },
    {
      year: '2025',
      title: 'In Development',
      description: 'Continuously improving features and functionality.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFBFC', py: 6, px: 2, width: '100%' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            About AI Resume Builder
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: '800px', mx: 'auto', lineHeight: 1.8 }}>
            <strong>Developed an AI-powered resume builder</strong> using Spring Boot 3.3.5 and React 18, integrating Google Gemini 2.0 Flash API 
            via Spring RestClient to transform user descriptions into professional LaTeX code, automatically compiling to PDF with MiKTeX across 
            4 ATS-optimized templates (Modern, Professional, Creative, ATS-Focused).<br/><br/>
            <strong>Engineered robust backend services</strong> including custom prompt template engine for AI content generation, JSON response parsing, 
            PDF text extraction using Apache PDFBox for ATS score analysis, and automated LaTeX compilation pipeline with error handling for reliable production deployment.<br/><br/>
            <strong>Implemented secure authentication</strong> with Spring Security and Google OAuth2 login, JWT token-based sessions, user role management, 
            and MySQL 8.0 persistence using Spring Data JPA and Hibernate ORM with HikariCP connection pooling.
          </Typography>
        </Box>

        {/* Project Info */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  <Box sx={{ 
                    flexShrink: 0,
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <RocketOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                      Project Goal
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      To create a functional AI-powered resume builder that demonstrates the practical
                      application of modern web technologies including React, Spring Boot, and AI APIs.
                      This project serves as a hands-on learning experience in full-stack development.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                  borderColor: 'warning.main'
                }
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  <Box sx={{ 
                    flexShrink: 0,
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
                  }}>
                    <TrophyOutlined style={{ fontSize: '32px', color: 'white' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                      Technology Stack
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      Frontend built with React and Material UI. Backend powered by
                      Spring Boot with integration to Google's Gemini AI for intelligent resume
                      generation and ATS scoring capabilities.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Key Features */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 4, color: 'text.primary' }}>
            Key Features
          </Typography>
          <Grid container spacing={2.5}>
            {values.map((value, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card 
                  sx={{ 
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { 
                      transform: 'translateY(-6px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      mb: 2
                    }}>
                      <Box sx={{ color: '#667eea' }}>{value.icon}</Box>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.875rem' }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Development Timeline */}
        <Card 
          sx={{ 
            mb: 5,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 4, color: 'text.primary' }}>
              Development Timeline
            </Typography>
            <Grid container spacing={3}>
              {milestones.map((m, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 2,
                      background: i % 2 === 0 
                        ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                        : 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s',
                      '&:hover': { 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: i % 2 === 0 ? '#667eea' : '#f093fb',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Typography 
                      variant="overline" 
                      sx={{ 
                        color: i % 2 === 0 ? '#667eea' : '#f093fb',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      {m.year}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                      {m.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      {m.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Box sx={{ mt: 5 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 700, 
              mb: 1.5, 
              color: 'text.primary',
              fontSize: { xs: '1.75rem', md: '2rem' }
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Create your perfect resume in three simple steps
          </Typography>
          
          <Box sx={{ position: 'relative' }}>
            {/* Connection Line for Desktop */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: '60px',
                left: '20%',
                right: '20%',
                height: '3px',
                background: 'linear-gradient(90deg, #667eea 0%, #f093fb 50%, #4facfe 100%)',
                borderRadius: '2px',
                display: { xs: 'none', md: 'block' },
                zIndex: 0,
                opacity: 0.3,
              }}
            />

            <Grid container spacing={3}>
              {[
                { 
                  num: '01',
                  icon: <CodeOutlined style={{ fontSize: '32px' }} />, 
                  title: 'Input Your Details', 
                  desc: 'Provide your work experience, skills, and education through our simple form.',
                  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#667eea',
                  bgColor: '#EEF2FF'
                },
                { 
                  num: '02',
                  icon: <BulbOutlined style={{ fontSize: '32px' }} />, 
                  title: 'AI Processing', 
                  desc: 'Gemini AI analyzes your information and generates a professional resume.',
                  gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#f093fb',
                  bgColor: '#FDF4FF'
                },
                { 
                  num: '03',
                  icon: <CloudOutlined style={{ fontSize: '32px' }} />, 
                  title: 'Download & Apply', 
                  desc: 'Review and download your resume as a professional PDF file.',
                  gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: '#4facfe',
                  bgColor: '#F0FDFF'
                }
              ].map((step, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Card
                    sx={{
                      position: 'relative',
                      height: '100%',
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: 'divider',
                      background: 'white',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'visible',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px ${step.color}30`,
                        borderColor: step.color,
                        '& .step-number': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                        '& .icon-box': {
                          transform: 'scale(1.05)',
                        }
                      }
                    }}
                  >
                    {/* Step Number Badge */}
                    <Box
                      className="step-number"
                      sx={{
                        position: 'absolute',
                        top: -16,
                        right: 16,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: step.gradient,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        boxShadow: `0 4px 12px ${step.color}50`,
                        border: '3px solid white',
                        transition: 'transform 0.3s',
                      }}
                    >
                      {step.num}
                    </Box>

                    <CardContent sx={{ p: 3, pt: 4 }}>
                      {/* Icon */}
                      <Box
                        className="icon-box"
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: 2.5,
                          background: step.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2.5,
                          color: step.color,
                          transition: 'transform 0.3s',
                        }}
                      >
                        {step.icon}
                      </Box>

                      {/* Title */}
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
                        {step.title}
                      </Typography>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary', 
                          lineHeight: 1.7,
                          textAlign: 'center',
                          fontSize: '0.875rem',
                        }}
                      >
                        {step.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default About;
