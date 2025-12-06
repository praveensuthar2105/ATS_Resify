import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Divider, Chip, CircularProgress, LinearProgress, Snackbar, Alert, Stack } from '@mui/material';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { resumeAPI } from '../services/api';

const Title = (props) => <Typography variant={props.level === 2 ? 'h4' : props.level === 3 ? 'h5' : props.level === 4 ? 'h6' : 'subtitle1'} {...props} />;
const Paragraph = (props) => <Typography variant="body1" gutterBottom {...props} />;
const Text = (props) => <Typography variant="body2" component="span" {...props} />;

// Lightweight Donut chart using pure SVG (no extra dependencies)
const DonutChart = ({ value = 0, size = 180, thickness = 16, color = '#1976d2', bg = '#e5e7eb', label, sublabel }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke={bg} strokeWidth={thickness} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {label && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>}
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{clamped}%</Typography>
        {sublabel && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{sublabel}</Typography>}
      </Box>
    </Box>
  );
};

const AtsChecker = () => {
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });

  const handleUpload = async (file) => {
    setUploading(true);
    setAtsResult(null);
    
    try {
      const response = await resumeAPI.calculateAtsScore(file);
      console.log('Raw ATS Response:', response);

      // Normalize backend response to UI-friendly shape
      const normalized = normalizeAtsResponse(response);
      console.log('Normalized ATS Result:', normalized);
      setAtsResult(normalized);
      setSnack({ open: true, type: 'success', text: 'ATS score calculated successfully!' });
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      setSnack({ open: true, type: 'error', text: error.response?.data?.message || 'Failed to calculate ATS score. Please try again.' });
      setFileList([]);
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf';
    const isDoc = file.type === 'application/msword';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isPdf && !isDoc && !isDocx) {
      setSnack({ open: true, type: 'error', text: 'You can only upload PDF or Word documents!' });
      return;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      setSnack({ open: true, type: 'error', text: 'File must be smaller than 5MB!' });
      return;
    }
    setFileList([file]);
    handleUpload(file);
  };

  const getColorByScore = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const getTagColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'gold';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const parseTenScale = (val) => {
    // Convert "7/10" -> 70, supports number strings
    if (!val) return null;
    if (typeof val === 'number') return Math.round(val * 10);
    const match = String(val).match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      const den = parseInt(match[2], 10) || 10;
      return Math.round((num / den) * 100);
    }
    const numOnly = parseInt(String(val).replace(/[^\d]/g, ''), 10);
    return isNaN(numOnly) ? null : numOnly;
  };

  const normalizeAtsResponse = (res) => {
    // Backend returns { think, data } where data contains the ATS fields.
    const payload = res?.data ?? res ?? {};

    // Support multiple possible field names for robustness
    const rawScore = payload?.atsScore ?? payload?.overallScore ?? payload?.score;
    const percent = typeof rawScore === 'string'
      ? parseInt(String(rawScore).replace(/[^\d]/g, ''), 10)
      : (typeof rawScore === 'number' ? rawScore : null);

    const breakdown = payload?.scoreBreakdown ?? payload?.breakdown ?? {};
    const strengths = Array.isArray(payload?.strengths) ? payload.strengths : [];
    const weaknesses = Array.isArray(payload?.weaknesses) ? payload.weaknesses : [];
    const suggestions = Array.isArray(payload?.detailedSuggestions) ? payload.detailedSuggestions : (Array.isArray(payload?.suggestions) ? payload.suggestions : []);

    return {
      score: Number.isFinite(percent) ? percent : null,
      breakdownPercent: {
        keywordMatch: parseTenScale(breakdown.keywordMatch ?? breakdown.keywordMatchScore),
        formatting: parseTenScale(breakdown.formatting ?? breakdown.formattingScore),
        sectionCompleteness: parseTenScale(breakdown.sectionCompleteness ?? breakdown.sectionCompletenessScore),
      },
      strengths,
      weaknesses,
      suggestions,
      // Legacy fields fallback
      keywords: payload?.keywords || [],
      missingKeywords: payload?.missingKeywords || [],
      feedback: payload?.feedback,
    };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #ffffff 100%)', p: '32px 16px', width: '100%' }}>
      <Box sx={{ maxWidth: '1100px', mx: 'auto', width: '100%' }}>
        <Card sx={{ boxShadow: 6, mb: 4, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 60%, #1e293b 100%)', color: 'white' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: 1, opacity: 0.85 }}>ATS READINESS</Typography>
                <Title level={2} sx={{ color: 'white', mb: 1, mt: 0.5 }}>Score your resume for ATS in minutes</Title>
                <Paragraph sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 680, mb: 2 }}>
                  Upload your PDF or Word resume to get instant scoring, keyword coverage, and section-level guidance tailored for Applicant Tracking Systems.
                </Paragraph>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="PDF / DOC / DOCX" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
                  <Chip label="< 5 MB" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
                  <Chip label="Keyword insights" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Chip label="Fast analysis" color="success" sx={{ fontWeight: 700, bgcolor: 'rgba(16,185,129,0.18)', color: 'white', borderColor: 'rgba(255,255,255,0.35)' }} variant="outlined" />
                <Chip label="ATS friendly templates" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 3, mb: 3 }}>
              <CardContent>
                <Title level={3} sx={{ mb: 1 }}>Upload & analyze</Title>
                <Paragraph sx={{ color: 'text.secondary', mb: 2 }}>Drop in your resume to get ATS scoring, keyword coverage, and prioritized fixes.</Paragraph>

                <Box sx={{ textAlign: 'center', border: '1px dashed #d0d7de', borderRadius: 2, p: 4, mb: 3, bgcolor: '#fff' }}>
                  <Box sx={{ fontSize: 48, color: '#2563eb', mb: 1 }}>
                    <FileTextOutlined />
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>Click to select a file or drag and drop</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>Accepted: PDF, DOC, DOCX • Max 5MB</Typography>
                  <Button variant="contained" startIcon={<UploadOutlined />} component="label" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Select File'}
                    <input hidden type="file" accept=".pdf,.doc,.docx" onChange={onPickFile} />
                  </Button>
                </Box>

                {uploading && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress />
                    <Paragraph sx={{ mt: 2, color: 'text.secondary' }}>Analyzing your resume...</Paragraph>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 3, mb: 3 }}>
              <CardContent>
                <Title level={4} sx={{ mb: 1 }}>ATS-friendly checklist</Title>
                <Paragraph sx={{ color: 'text.secondary', mb: 2 }}>Quick wins to boost your score before you upload.</Paragraph>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.25 }}>
                  {[
                    'Use standard headings: Summary, Experience, Education, Skills',
                    'Keep fonts simple (Inter, Arial, Calibri) and avoid images',
                    'Mirror keywords from the job description naturally',
                    'Prefer bullet points, avoid dense paragraphs',
                    'Export to PDF for consistency unless a DOCX is required',
                  ].map((item, idx) => (
                    <Box key={idx} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleOutlined style={{ color: '#10b981', fontSize: 18, marginTop: 2 }} />
                      <Text>{item}</Text>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {atsResult && (
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Title level={3} sx={{ mb: 3 }}>ATS Analysis Results</Title>

            {/* Visual Overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Overall Score Donut */}
              {atsResult.score !== null && (
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <DonutChart
                    value={atsResult.score}
                    size={180}
                    thickness={18}
                    color={atsResult.score >= 80 ? '#10B981' : atsResult.score >= 60 ? '#F59E0B' : '#EF4444'}
                    label="Overall Score"
                    sublabel={getScoreStatus(atsResult.score)}
                  />
                </Grid>
              )}

              {/* Score Breakdown Mini Bars */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Title level={4} sx={{ mb: 1 }}>Breakdown</Title>
                    {['keywordMatch','formatting','sectionCompleteness'].map((k) => {
                      const labels = {
                        keywordMatch: 'Keyword Match',
                        formatting: 'Formatting',
                        sectionCompleteness: 'Section Completeness'
                      };
                      const val = atsResult?.breakdownPercent?.[k];
                      if (val === null || val === undefined) return null;
                      return (
                        <Box key={k} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Text sx={{ fontWeight: 600 }}>{labels[k]}</Text>
                            <Text>{val}%</Text>
                          </Box>
                          <LinearProgress variant="determinate" value={val} />
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              {/* Keyword Coverage Donut */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                {(() => {
                  const covered = Array.isArray(atsResult?.keywords) ? atsResult.keywords.length : 0;
                  const missing = Array.isArray(atsResult?.missingKeywords) ? atsResult.missingKeywords.length : 0;
                  const total = covered + missing;
                  if (total === 0) return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Text sx={{ color: 'text.secondary' }}>No keyword data</Text>
                    </Box>
                  );
                  const pct = Math.round((covered / total) * 100);
                  return (
                    <DonutChart
                      value={pct}
                      size={180}
                      thickness={18}
                      color="#3B82F6"
                      label="Keyword Coverage"
                      sublabel={`${covered}/${total} keywords`}
                    />
                  );
                })()}
              </Grid>
            </Grid>

            {/* Detailed Score Breakdown */}
            {(atsResult.breakdownPercent?.keywordMatch !== null || atsResult.breakdownPercent?.formatting !== null || atsResult.breakdownPercent?.sectionCompleteness !== null) && (
              <Box sx={{ mb: 4 }}>
                <Title level={4} sx={{ mb: 2 }}>Score Breakdown</Title>
                <Grid container spacing={2}>
                  {atsResult.breakdownPercent?.keywordMatch !== null && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Text sx={{ fontWeight: 600 }}>Keyword Match</Text>
                          <LinearProgress variant="determinate" value={atsResult.breakdownPercent.keywordMatch} sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {atsResult.breakdownPercent?.formatting !== null && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Text sx={{ fontWeight: 600 }}>Formatting</Text>
                          <LinearProgress variant="determinate" value={atsResult.breakdownPercent.formatting} sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {atsResult.breakdownPercent?.sectionCompleteness !== null && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Text sx={{ fontWeight: 600 }}>Section Completeness</Text>
                          <LinearProgress variant="determinate" value={atsResult.breakdownPercent.sectionCompleteness} sx={{ mt: 1 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Strengths */}
            {atsResult.strengths && atsResult.strengths.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Title level={4} sx={{ mb: 2 }}>
                  <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />
                  Strengths
                </Title>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {atsResult.strengths.map((strength, index) => (
                    <Box component="li" key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <CheckCircleOutlined style={{ color: '#10b981', marginTop: 4, marginRight: 8, fontSize: 16 }} />
                      <Text>{strength}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Weaknesses */}
            {atsResult.weaknesses && atsResult.weaknesses.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Title level={4} sx={{ mb: 2 }}>
                  <CloseCircleOutlined style={{ color: '#ef4444', marginRight: 8 }} />
                  Areas for Improvement
                </Title>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {atsResult.weaknesses.map((weakness, index) => (
                    <Box component="li" key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <CloseCircleOutlined style={{ color: '#ef4444', marginTop: 4, marginRight: 8, fontSize: 16 }} />
                      <Text>{weakness}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Detailed Suggestions */}
            {atsResult.suggestions && atsResult.suggestions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Title level={4} sx={{ mb: 2 }}>💡 Detailed Suggestions</Title>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {atsResult.suggestions.map((sug, index) => (
                    <Box component="li" key={index} sx={{ mb: 1.5 }}>
                      <Text sx={{ fontWeight: 600 }}>{sug.section}:</Text> <Text>{sug.suggestion}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Suggestions by Section (graphical) */}
            {atsResult.suggestions && atsResult.suggestions.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Title level={4} sx={{ mb: 2 }}>📊 Suggestions by Section</Title>
                {(() => {
                  const counts = atsResult.suggestions.reduce((acc, s) => {
                    const key = s.section || 'General';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {});
                  const max = Math.max(...Object.values(counts));
                  return (
                    <Box>
                      {Object.entries(counts).map(([section, count]) => (
                        <Box key={section} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Text sx={{ fontWeight: 600 }}>{section}</Text>
                            <Text>{count}</Text>
                          </Box>
                          <LinearProgress variant="determinate" value={(count / max) * 100} />
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </Box>
            )}

            {/* Optional: legacy Keywords support */}
            {atsResult.keywords && atsResult.keywords.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Title level={4} sx={{ mb: 2 }}>
                  🔑 Detected Keywords
                </Title>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {atsResult.keywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Optional: legacy Missing Keywords support */}
            {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Title level={4} sx={{ mb: 2 }}>
                  ⚠️ Suggested Keywords to Add
                </Title>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {atsResult.missingKeywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} color="warning" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Optional: legacy Overall Feedback support */}
            {atsResult.feedback && (
              <Box sx={{ bgcolor: '#eff6ff', p: 2, borderRadius: 1 }}>
                <Title level={5} sx={{ mb: 1 }}>Overall Feedback</Title>
                <Paragraph>{atsResult.feedback}</Paragraph>
              </Box>
            )}
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card sx={{ mt: 4, background: 'linear-gradient(to right, #EFF6FF, #F3E8FF)' }}>
          <CardContent>
            <Title level={4}>What is an ATS Score?</Title>
            <Paragraph>
              An Applicant Tracking System (ATS) is software used by employers to manage job applications.
              Your ATS score indicates how well your resume is formatted and optimized for these systems.
            </Paragraph>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Text sx={{ fontWeight: 600, color: '#059669' }}>✓ Good ATS Practices:</Text>
                <Box component="ul" sx={{ mt: 1, pl: 2, fontSize: '0.875rem' }}>
                  <li>Use standard fonts and formatting</li>
                  <li>Include relevant keywords</li>
                  <li>Use clear section headings</li>
                  <li>Avoid images and graphics</li>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Text sx={{ fontWeight: 600, color: '#dc2626' }}>✗ Poor ATS Practices:</Text>
                <Box component="ul" sx={{ mt: 1, pl: 2, fontSize: '0.875rem' }}>
                  <li>Complex tables and columns</li>
                  <li>Headers and footers</li>
                  <li>Special characters</li>
                  <li>Unconventional section names</li>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AtsChecker;
