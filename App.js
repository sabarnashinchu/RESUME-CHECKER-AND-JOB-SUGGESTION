import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Fade,
} from '@mui/material';
import ResumeUploader from './components/ResumeUploader';
import AnalysisResults from './components/AnalysisResults';
import ATSAnalysis from './components/ATSAnalysis';
import ResumePreview from './components/ResumePreview';

const API_URL = 'http://localhost:8080/api/resumes';

const jobLinks = {
  SOFTWARE_DEVELOPER: [
    { name: 'Naukri', url: 'https://www.naukri.com/software-developer-jobs' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/software-developer-jobs/' },
    { name: 'Indeed', url: 'https://www.indeed.com/q-Software-Developer-jobs.html' }
  ],
  DATA_SCIENTIST: [
    { name: 'Naukri', url: 'https://www.naukri.com/data-scientist-jobs' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/data-scientist-jobs/' },
    { name: 'Indeed', url: 'https://www.indeed.com/q-Data-Scientist-jobs.html' }
  ],
  DEVOPS_ENGINEER: [
    { name: 'Naukri', url: 'https://www.naukri.com/devops-engineer-jobs' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/devops-engineer-jobs/' },
    { name: 'Indeed', url: 'https://www.indeed.com/q-DevOps-Engineer-jobs.html' }
  ]
};

const fetchLinkedInTopPositions = async (username) => {
  const response = await fetch(
    `https://linkedin-data-api.p.rapidapi.com/profiles/positions/top?username=${encodeURIComponent(username)}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
        'x-rapidapi-key': '9a112aad3dmsh5a50b188323c33bp1aaa12jsndbe396a76321'
      }
    }
  );
  const data = await response.json();
  return data.data || [];
};

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [atsResults, setAtsResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [suggestedRole, setSuggestedRole] = useState(null);
  const [positions, setPositions] = useState([]);
  const [linkedinUsername, setLinkedinUsername] = useState('');

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      
      setSuggestedRole(data.suggestedRole);

      // Set general analysis results
      setAnalysisResults({
        score: data.analysis.overallScore,
        suggestions: data.analysis.suggestions,
        strengths: data.analysis.strengths,
        weaknesses: data.analysis.weaknesses,
      });

      // Set ATS analysis results
      setAtsResults({
        atsScore: data.atsScore,
        keywordMatches: data.keywords,
        formatScore: data.formatScore,
        missingKeywords: data.analysis.missingKeywords,
        formatIssues: data.analysis.formatIssues,
        suggestedKeywords: data.analysis.suggestedKeywords,
      });
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFetchPositions = async () => {
    if (!linkedinUsername) return;
    const data = await fetchLinkedInTopPositions(linkedinUsername);
    setPositions(data);
  };

  return (
    <Container maxWidth="md" disableGutters sx={{
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #43cea2, #185a9d, #6dd5ed, #2193b0)',
      backgroundSize: '400% 400%',
      animation: 'bgGradientMove 12s ease-in-out infinite',
      '@keyframes bgGradientMove': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
      },
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Box sx={{
        width: '100%',
        py: 2,
        px: 0,
        background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
        color: 'white',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: { xs: 22, sm: 28 },
        letterSpacing: 1,
        boxShadow: '0 2px 12px 0 rgba(33,147,176,0.10)',
        mb: 2,
        zIndex: 10,
        position: 'sticky',
        top: 0,
      }}>
        <span style={{ fontWeight: 800, fontFamily: 'inherit', letterSpacing: 2 }}>Resume Quality Checker</span>
      </Box>
      <Box sx={{ my: 4, flex: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Upload your resume to get instant feedback and improvement suggestions
        </Typography>

        <Fade in={!loading} timeout={1200}>
          <Paper elevation={8} sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 6,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 60%, rgba(109,213,237,0.15) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            maxWidth: 700,
            mx: 'auto',
            mt: 2,
          }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <>
                <ResumeUploader onFileUpload={handleFileUpload} />
                {file && <ResumePreview file={file} />}
                {suggestedRole && (
                  <Box
                    sx={{
                      mt: 4,
                      mb: 2,
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(33,147,176,0.15)',
                      boxShadow: '0 4px 32px 0 rgba(33,147,176,0.10)',
                      backdropFilter: 'blur(8px)',
                      border: '1.5px solid rgba(33,147,176,0.18)',
                      transition: 'background 0.8s',
                      position: 'relative',
                      overflow: 'hidden',
                      '::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(120deg, #43cea2 0%, #185a9d 100%)',
                        opacity: 0.12,
                        zIndex: 0,
                      },
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="h5" sx={{ color: '#2193b0', fontWeight: 700, mb: 1, zIndex: 1, position: 'relative' }}>
                      Suggested IT Role: {suggestedRole.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </Typography>
                    <Box sx={{ mt: 2, zIndex: 1, position: 'relative' }}>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ color: '#185a9d', fontWeight: 500 }}>
                        Apply for jobs:
                      </Typography>
                      <a
                        href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(suggestedRole.replace(/_/g, ' '))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          margin: '0 10px',
                          textDecoration: 'none',
                          color: '#fff',
                          fontWeight: 'bold',
                          background: 'linear-gradient(90deg, #0072b1, #00c6ff)',
                          padding: '12px 28px',
                          borderRadius: '28px',
                          transition: 'background 0.4s, color 0.4s',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                          fontSize: '1.1rem',
                          display: 'inline-block',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #00c6ff, #0072b1)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #0072b1, #00c6ff)')}
                      >
                        LinkedIn Jobs for {suggestedRole.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </a>
                    </Box>
                  </Box>
                )}
                {(analysisResults || atsResults) && (
                  <Box sx={{ mt: 4 }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      centered
                      sx={{ mb: 3 }}
                    >
                      <Tab label="General Analysis" />
                      <Tab label="ATS Analysis" />
                    </Tabs>

                    {activeTab === 0 && analysisResults && (
                      <AnalysisResults results={analysisResults} />
                    )}
                    
                    {activeTab === 1 && atsResults && (
                      <ATSAnalysis results={atsResults} />
                    )}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Fade>
      </Box>
      {/* Footer */}
      <Box sx={{
        width: '100%',
        py: 2,
        px: 0,
        background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
        color: 'white',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: { xs: 14, sm: 16 },
        letterSpacing: 1,
        boxShadow: '0 -2px 12px 0 rgba(33,147,176,0.10)',
        mt: 4,
        zIndex: 10,
      }}>
        &copy; {new Date().getFullYear()} Resume Quality Checker &mdash; Crafted with <span style={{color:'#ff4081', fontWeight:700}}>♥</span> by Your Team
      </Box>
    </Container>
  );
}

export default App; 