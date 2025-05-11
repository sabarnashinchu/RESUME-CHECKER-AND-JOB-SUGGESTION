import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Fade,
  Zoom,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const AnimatedChip = styled(Chip)`
  animation: ${pulse} 2s infinite;
`;

const ATSAnalysis = ({ results }) => {
  const {
    atsScore,
    keywordMatches,
    formatScore,
    missingKeywords,
    formatIssues,
    suggestedKeywords,
  } = results;

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AnimatedChip
              icon={<CheckCircleIcon />}
              label={`ATS Score: ${atsScore}%`}
              color={atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'error'}
              sx={{ mr: 2 }}
            />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={atsScore}
                color={atsScore >= 80 ? 'success' : atsScore >= 60 ? 'warning' : 'error'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                Keyword Matches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {keywordMatches.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    color="success"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Missing Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {missingKeywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    color="error"
                    size="small"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Paper>
          </Zoom>

          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                Format Analysis
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Format Score: {formatScore}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={formatScore}
                  color={formatScore >= 80 ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <List>
                {formatIssues.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={issue}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Zoom>

          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon color="primary" sx={{ mr: 1 }} />
                Suggested Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedKeywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Paper>
          </Zoom>
        </Box>
      </Box>
    </Fade>
  );
};

export default ATSAnalysis; 