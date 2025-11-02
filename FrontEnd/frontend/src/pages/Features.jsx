import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
const Title = (props) => <Typography variant={props.level === 1 ? 'h4' : props.level === 2 ? 'h5' : props.level === 3 ? 'h6' : 'subtitle1'} {...props} />;
const Paragraph = (props) => <Typography variant="body1" gutterBottom {...props} />;

const Features = () => {
  const mainFeatures = [
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#3B82F6' }} />,
      title: 'AI-Powered Generation',
      description: 'Leverage advanced artificial intelligence to create professional, tailored resumes that highlight your strengths and achievements.',
      color: '#667eea',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '48px', color: '#10B981' }} />,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with our built-in ATS checker and optimization tools.',
      color: '#10B981',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#F59E0B' }} />,
      title: 'Quick & Easy',
      description: 'Create a complete, professional resume in minutes with our intuitive and user-friendly interface.',
      color: '#F59E0B',
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '48px', color: '#8B5CF6' }} />,
      title: 'Multiple Formats',
      description: 'Download your resume in various formats to meet different application requirements including PDF, Word, and plain text.',
      color: '#8B5CF6',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#EF4444' }} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your personal information with third parties. GDPR compliant.',
      color: '#EF4444',
    },
    {
      icon: <CloudOutlined style={{ fontSize: '48px', color: '#06B6D4' }} />,
      title: 'Cloud-Based',
      description: 'Access your resumes from anywhere, anytime with our cloud-based platform. Multi-device access with real-time sync.',
      color: '#06B6D4',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#4F46E5' }} />,
      title: 'Multiple Templates',
      description: 'Choose from a variety of professional templates designed for different industries and career levels.',
      color: '#4F46E5',
    },
    {
      icon: <GlobalOutlined style={{ fontSize: '48px', color: '#f093fb' }} />,
      title: 'Industry-Specific',
      description: 'Get tailored suggestions based on your industry and target role with intelligent content recommendations.',
      color: '#f093fb',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFBFC', py: 6, px: 2, width: '100%' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        {/* Header */}
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
            Powerful Features for Your Success
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: '700px', mx: 'auto' }}>
            Everything you need to create the perfect resume and land your dream job
          </Typography>
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
                  <Box sx={{ 
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                    boxShadow: `0 4px 12px ${feature.color}40`,
                    mb: 2.5,
                    mx: 'auto',
                  }}>
                    <Box sx={{ fontSize: '32px', color: 'white' }}>{feature.icon}</Box>
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
                { num: 1, title: 'Describe Your Experience', desc: 'Tell us about your work history, skills, education, and career goals.', color: '#667eea' },
                { num: 2, title: 'AI Creates Your Resume', desc: 'Our AI analyzes your information and generates a professional, ATS-optimized resume.', color: '#10B981' },
                { num: 3, title: 'Download & Apply', desc: 'Review, customize if needed, and download your resume in your preferred format.', color: '#f093fb' }
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
