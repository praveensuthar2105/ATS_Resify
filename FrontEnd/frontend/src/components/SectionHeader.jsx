import React from 'react';
import { Typography, Box } from '@mui/material';

const SectionHeader = ({ icon = null, title, subtitle }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && <Box sx={{ fontSize: 18, color: 'primary.main' }}>{icon}</Box>}
        <Typography variant="h6" component="h3" sx={{ m: 0, color: '#111827' }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ mt: 0.5, color: '#6B7280' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionHeader;
