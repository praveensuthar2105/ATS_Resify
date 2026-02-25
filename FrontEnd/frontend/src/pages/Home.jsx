import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Grid, Stack, Container, Chip } from '@mui/material';
import {
  ArrowRightOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloudOutlined,
  RocketOutlined,
  StarFilled,
} from '@ant-design/icons';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: '32px' }} />,
      title: 'A draft in 10 mins',
      description: 'The AI builder is 10x faster than doing it on your own.',
      color: '#6366F1',
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '32px' }} />,
      title: 'Zero mistakes',
      description: "Don't stress over typos; you'll sound great!",
      color: '#10B981',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '32px' }} />,
      title: 'ATS Optimized',
      description: 'Your resume will be 100% ATS compliant. Recruiters will see you.',
      color: '#8B5CF6',
    },
    {
      icon: <RocketOutlined style={{ fontSize: '32px' }} />,
      title: 'Get paid 7% more',
      description: 'We can help you negotiate a higher starting salary.',
      color: '#F59E0B',
    },
  ];

  return (
    <Box sx={{ width: '100%', bgcolor: '#FFFFFF' }}>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ color: 'white' }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 3,
                    lineHeight: 1.2,
                  }}
                >
                  ATS Resify gets you promoted
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    fontWeight: 400,
                    mb: 4,
                    opacity: 0.95,
                    lineHeight: 1.6,
                  }}
                >
                  Only 2% of resumes win. Yours will be one of them.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/generate')}
                    sx={{
                      bgcolor: 'white',
                      color: '#764ba2',
                      height: 56,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Create my resume
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/ats-checker')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      height: 56,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Upload my resume
                  </Button>
                </Stack>

                {/* Trust Badges */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <StarFilled key={i} style={{ color: '#FCD34D', fontSize: '18px' }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
                      4.5 out of 5 | 50,000+ reviews
                    </Typography>
                  </Box>
                  <Box sx={{ borderLeft: '1px solid rgba(255,255,255,0.3)', pl: 3, py: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      39% more likely
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      to land the job
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    top: '15%',
                    right: '10%',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }} />

                  <Box sx={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '5%',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }} />

                  <Box sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '20%',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #E5E7EB',
                  boxShadow: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    borderColor: feature.color,
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      bgcolor: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.1rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: '#F9FAFB', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Way beyond a resume builder
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 8,
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Every tool you need to create, optimize, and land your dream job
          </Typography>

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Chip
                  label="AI-powered"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: '#EEF2FF',
                    color: '#6366F1',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Step-by-step guidance
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, flexGrow: 1 }}>
                  No need to think much. We guide you through every step of the process.
                  We show you what to add, and where to add it. It's clear and simple.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowRightOutlined />}
                  onClick={() => navigate('/generate')}
                  sx={{ textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
                >
                  Create my resume
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Chip
                  label="AI-powered"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: '#FEF3C7',
                    color: '#F59E0B',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  AI writes for you
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, flexGrow: 1 }}>
                  Stuck? Click to add phrases that sound professional. Our AI helps you
                  articulate your experience in the best possible way.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowRightOutlined />}
                  onClick={() => navigate('/generate')}
                  sx={{ textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
                >
                  Try AI writer
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Chip
                  label="ATS-optimized"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: '#D1FAE5',
                    color: '#10B981',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Instant ATS scoring
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, flexGrow: 1 }}>
                  Upload your resume and get instant feedback. We analyze your resume
                  against ATS systems and provide detailed suggestions to improve your score.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowRightOutlined />}
                  onClick={() => navigate('/ats-checker')}
                  sx={{ textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
                >
                  Check my resume
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Chip
                  label="Professional"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: '#F3E8FF',
                    color: '#8B5CF6',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  ATS-Optimized Template
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, flexGrow: 1 }}>
                  Our professionally designed template passes ATS screening with 95%+ success rate.
                  Your resume will look polished and get noticed by recruiters.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ArrowRightOutlined />}
                  onClick={() => navigate('/generate')}
                  sx={{ textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
                >
                  Create Resume
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Start now and get hired faster
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              opacity: 0.9,
              mb: 5,
              fontWeight: 400,
            }}
          >
            Join thousands of job seekers who got hired with our ATS Resify
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/generate')}
            sx={{
              bgcolor: 'white',
              color: '#764ba2',
              height: 64,
              px: 6,
              fontSize: '1.2rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#f8f9fa',
                transform: 'translateY(-3px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s',
            }}
          >
            Create my resume
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
