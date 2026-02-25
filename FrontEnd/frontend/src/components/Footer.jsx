import React from 'react';
import { Box, Container, Grid, Stack, Typography, Link as MLink, Divider } from '@mui/material';
import { HeartFilled, GithubOutlined, LinkedinOutlined, TwitterOutlined, MailOutlined } from '@ant-design/icons';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#111827',
        color: '#F9FAFB',
        mt: 0,
        pt: 12,
        pb: 6,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ATS Resify
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF', lineHeight: 1.8, mb: 4, fontSize: '0.95rem' }}>
              Create professional, ATS-friendly resumes powered by cutting-edge AI technology.
              Stand out from the crowd and land your dream job faster.
            </Typography>
            <Stack direction="row" spacing={2}>
              {[
                { icon: <GithubOutlined />, href: '#', label: 'GitHub' },
                { icon: <LinkedinOutlined />, href: '#', label: 'LinkedIn' },
                { icon: <TwitterOutlined />, href: '#', label: 'Twitter' },
                { icon: <MailOutlined />, href: 'mailto:contact@atsresify.me', label: 'Email' },
              ].map((social, idx) => (
                <MLink
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                    fontSize: '20px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'translateY(-3px)',
                    }
                  }}
                >
                  {social.icon}
                </MLink>
              ))}
            </Stack>
          </Grid>

          {/* Product Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Product
            </Typography>
            <Stack spacing={2.5}>
              {[
                { to: '/generate', label: 'Create Resume' },
                { to: '/ats-checker', label: 'ATS Checker' },
                { to: '/features', label: 'Features' },
                { to: '/about', label: 'About Us' },
                { to: '/team', label: 'Our Team' },
              ].map((link, idx) => (
                <MLink
                  key={idx}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  sx={{
                    color: '#9CA3AF',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    display: 'block',
                    '&:hover': {
                      color: 'white',
                      paddingLeft: '4px',
                    }
                  }}
                >
                  {link.label}
                </MLink>
              ))}
            </Stack>
          </Grid>
          {/* Legal & Support Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Legal & Support
            </Typography>
            <Stack spacing={2.5}>
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/feedback', label: 'Feedback' },
              ].map((link, idx) => (
                <MLink
                  key={idx}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  sx={{
                    color: '#9CA3AF',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    display: 'block',
                    '&:hover': {
                      color: 'white',
                      paddingLeft: '4px',
                    }
                  }}
                >
                  {link.label}
                </MLink>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} ATS Resify. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
            }}
          >
            Made with <HeartFilled style={{ color: '#EF4444', fontSize: '14px' }} /> by students
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

