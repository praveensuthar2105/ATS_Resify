import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress, 
  Snackbar, 
  Alert, 
  Container, 
  Chip, 
  Paper,
  LinearProgress,
  Divider,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { 
  FileTextOutlined, 
  SendOutlined, 
  BulbOutlined, 
  CheckCircleOutlined, 
  ThunderboltOutlined,
  RocketOutlined,
  StarFilled,
  TrophyOutlined,
  BankOutlined,
  BulbFilled,
  SafetyOutlined
} from '@ant-design/icons';
import { resumeAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const GenerateResume = () => {
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const navigate = useNavigate();

  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      icon: <RocketOutlined />,
      description: 'Clean, contemporary design perfect for tech and creative roles',
      color: '#2563EB',
      tone: 'Dynamic and confident language with modern terminology'
    },
    {
      id: 'ats',
      name: 'ATS-Optimized',
      icon: <SafetyOutlined />,
      description: 'Simple, ATS-friendly format that passes automated screening',
      color: '#059669',
      tone: 'Clear, straightforward, and keyword-focused'
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: <BulbFilled />,
      description: 'Bold and unique design for designers and creative professionals',
      color: '#DC2626',
      tone: 'Expressive and innovative language showcasing creativity'
    },
    {
      id: 'executive',
      name: 'Executive',
      icon: <TrophyOutlined />,
      description: 'Elegant, sophisticated layout for senior-level positions',
      color: '#7C3AED',
      tone: 'Formal, authoritative, and achievement-focused'
    }
  ];

  const handleGenerateResume = async (e) => {
    e.preventDefault();
    
    if (!description || description.length < 50) {
      setSnack({ open: true, type: 'error', text: 'Please provide at least 50 characters for better results' });
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.generateResume(description, selectedTemplate);
      console.log('Backend response:', response);
      
      // Save response with template type
      const resumeWithTemplate = {
        ...response,
        selectedTemplate: selectedTemplate
      };
      localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
      setSnack({ open: true, type: 'success', text: 'Resume generated successfully!' });
      
      setTimeout(() => {
        navigate('/edit-resume');
      }, 1000);
    } catch (error) {
      console.error('Error generating resume:', error);
      setSnack({ 
        open: true, 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to generate resume. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getQualityScore = () => {
    if (charCount < 50) return 0;
    if (charCount < 150) return 33;
    if (charCount < 300) return 66;
    return 100;
  };

  const getQualityColor = () => {
    const score = getQualityScore();
    if (score < 33) return '#EF4444';
    if (score < 66) return '#F59E0B';
    return '#10B981';
  };

  const getQualityLabel = () => {
    const score = getQualityScore();
    if (score < 33) return 'Needs more details';
    if (score < 66) return 'Good start';
    return 'Excellent!';
  };

  const tips = [
    {
      text: 'Mention your target role and years of experience',
      example: '"Senior Software Engineer with 5 years..."'
    },
    {
      text: 'List 6–10 core technical skills or competencies',
      example: '"Skilled in React, Node.js, AWS..."'
    },
    {
      text: 'Include degrees, certifications, and institutions',
      example: '"B.S. in Computer Science from MIT"'
    },
    {
      text: 'Add 1–2 quantified achievements if possible',
      example: '"Increased sales by 35%..."'
    },
  ];

  const examplePrompts = [
    {
      title: 'Software Engineer',
      text: 'I am a Full Stack Developer with 3 years of experience in React, Node.js, and MongoDB. I have a Bachelor\'s degree in Computer Science...'
    },
    {
      title: 'Marketing Manager',
      text: 'Experienced Marketing Manager with 5+ years leading digital campaigns. Expert in SEO, content strategy, and analytics...'
    },
    {
      title: 'Data Analyst',
      text: 'Data Analyst with expertise in Python, SQL, and Tableau. Proven track record of deriving insights from complex datasets...'
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFBFC', pb: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          pt: { xs: 12, md: 14 }, 
          pb: { xs: 10, md: 12 }, 
          color: 'white', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
            <Chip 
              icon={<ThunderboltOutlined style={{ color: 'white' }} />} 
              label="AI-Powered" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                fontWeight: 600, 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }} 
            />
            <Chip 
              icon={<StarFilled style={{ color: '#FCD34D' }} />} 
              label="Free" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                fontWeight: 600, 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }} 
            />
          </Stack>

          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 2.5, 
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            Create Your Perfect Resume
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 400, 
              opacity: 0.95, 
              maxWidth: 650, 
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.15rem' }
            }}
          >
            Share your professional background and our advanced AI will craft a polished, 
            ATS-friendly resume tailored to your experience in seconds.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Main Form */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 }, bgcolor: 'white' }}>
                  <Box component="form" onSubmit={handleGenerateResume}>
                    
                    {/* Template Selection */}
                    <Box sx={{ mb: 4 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <StarFilled style={{ color: '#F59E0B' }} />
                        Choose Your Resume Style
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {templates.map((template) => (
                          <Grid item xs={12} sm={6} key={template.id}>
                            <Paper
                              onClick={() => setSelectedTemplate(template.id)}
                              sx={{
                                p: 2.5,
                                cursor: 'pointer',
                                border: selectedTemplate === template.id 
                                  ? `2px solid ${template.color}` 
                                  : '2px solid #E5E7EB',
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                bgcolor: selectedTemplate === template.id 
                                  ? `${template.color}08` 
                                  : 'white',
                                '&:hover': {
                                  borderColor: template.color,
                                  boxShadow: `0 4px 12px ${template.color}20`,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Box 
                                  sx={{ 
                                    fontSize: '24px', 
                                    color: template.color,
                                    mt: 0.5
                                  }}
                                >
                                  {template.icon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      mb: 0.5,
                                      color: selectedTemplate === template.id ? template.color : 'text.primary'
                                    }}
                                  >
                                    {template.name}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'block',
                                      lineHeight: 1.5,
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {template.description}
                                  </Typography>
                                  {selectedTemplate === template.id && (
                                    <Chip
                                      label="Selected"
                                      size="small"
                                      sx={{
                                        mt: 1,
                                        bgcolor: template.color,
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: '20px'
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <FileTextOutlined style={{ color: '#667eea' }} />
                        Tell Us About Yourself
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'text.secondary', lineHeight: 1.7 }}
                      >
                        Describe your professional background, skills, experience, and achievements. 
                        The more details you provide, the better your resume will be.
                      </Typography>
                    </Box>

                    <TextField
                      multiline
                      rows={12}
                      fullWidth
                      placeholder="Example: I am a software engineer with 5 years of experience in web development. I specialize in React, Node.js, and cloud technologies. I have a Bachelor's degree in Computer Science from XYZ University. In my current role, I led a team of 4 developers and increased application performance by 40%..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setCharCount(e.target.value.length);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#F9FAFB',
                          fontSize: '0.95rem',
                          lineHeight: 1.7,
                          '& fieldset': {
                            borderColor: '#E5E7EB',
                            borderWidth: '1.5px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#667eea'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        }
                      }}
                    />

                    {/* Quality Indicator */}
                    <Box sx={{ mt: 2.5, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <BulbOutlined />
                          Content Quality: <strong style={{ color: getQualityColor() }}>{getQualityLabel()}</strong>
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: charCount < 50 ? 'error.main' : 'text.secondary', 
                            fontWeight: 600 
                          }}
                        >
                          {charCount} characters
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getQualityScore()} 
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#E5E7EB',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getQualityColor(),
                            borderRadius: 3,
                            transition: 'all 0.3s'
                          }
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading || charCount < 50}
                      sx={{
                        height: 56,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: '#E5E7EB',
                          color: '#9CA3AF'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={22} sx={{ color: 'white', mr: 1.5 }} />
                          Generating Your Resume...
                        </>
                      ) : (
                        <>
                          <RocketOutlined style={{ marginRight: 8, fontSize: '18px' }} />
                          Generate My Resume
                        </>
                      )}
                    </Button>
                  </Box>
                </Box>

                {/* Example Prompts */}
                <Box sx={{ bgcolor: '#F9FAFB', p: { xs: 2.5, sm: 3, md: 4 }, borderTop: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.secondary' }}>
                    💡 Quick Start Examples
                  </Typography>
                  <Grid container spacing={2}>
                    {examplePrompts.map((example, idx) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: '1px solid #E5E7EB',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            height: '100%',
                            '&:hover': {
                              borderColor: '#667eea',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            setDescription(example.text);
                            setCharCount(example.text.length);
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#667eea' }}>
                            {example.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              lineHeight: 1.5
                            }}
                          >
                            {example.text}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 100 } }}>
              {/* Writing Tips */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2.5, sm: 3, md: 3.5 }, 
                  borderRadius: 3, 
                  border: '1px solid #E5E7EB',
                  bgcolor: 'white',
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box 
                    sx={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                      color: '#F59E0B'
                    }}
                  >
                    <BulbOutlined style={{ fontSize: '22px' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Writing Tips
                  </Typography>
                </Box>

                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {tips.map((tip, index) => (
                    <Box key={index}>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          gap: 1.5, 
                          mb: 2,
                          alignItems: 'flex-start' 
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                            color: '#10B981', 
                            flexShrink: 0, 
                            mt: 0.25,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.primary', 
                              lineHeight: 1.6,
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            {tip.text}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              display: 'block'
                            }}
                          >
                            {tip.example}
                          </Typography>
                        </Box>
                      </Box>
                      {index < tips.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Pro Tip Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1px solid #C7D2FE'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1.5,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <ThunderboltOutlined /> Pro Tips
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.7,
                    mb: 1.5
                  }}
                >
                  • Use action verbs like "led," "developed," "achieved"
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.7,
                    mb: 1.5
                  }}
                >
                  • Include numbers and metrics when possible
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.7
                  }}
                >
                  • Focus on accomplishments, not just responsibilities
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.type}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GenerateResume;
