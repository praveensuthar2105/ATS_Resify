import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Container, Box, Button, Stack, Typography, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, CheckCircleOutlined, InfoCircleOutlined, StarOutlined, GoogleOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (token && name && email) {
      setUser({ name, email });
    }
  }, []);

  const handleLogin = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
    handleMenuClose();
    navigate('/');
    window.location.reload();
  };

  const links = [
    { to: '/', label: 'Home', icon: <HomeOutlined /> },
    { to: '/generate', label: 'Create Resume', icon: <FileTextOutlined /> },
    { to: '/ats-checker', label: 'ATS Checker', icon: <CheckCircleOutlined /> },
    { to: '/features', label: 'Features', icon: <StarOutlined /> },
    { to: '/about', label: 'About', icon: <InfoCircleOutlined /> },
  ];

  // Add Admin Panel link if user is admin (check dynamically)
  const currentRole = localStorage.getItem('userRole');
  if (currentRole === 'ADMIN') {
    links.push({ to: '/admin', label: 'Admin Panel', icon: <UserOutlined /> });
  }

  return (
    <AppBar 
      position="fixed" 
      elevation={0} 
      sx={{ 
        bgcolor: 'white', 
        color: '#1F2937',
        borderBottom: '1px solid #E5E7EB',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 70, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Button 
            component={RouterLink} 
            to="/" 
            sx={{ 
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Resume.AI
            </Typography>
          </Button>

          {/* Navigation Links */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {links.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ 
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  color: location.pathname === link.to ? '#667eea' : '#6B7280',
                  fontWeight: location.pathname === link.to ? 600 : 500,
                  borderBottom: location.pathname === link.to ? '2px solid #667eea' : '2px solid transparent',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: '#F9FAFB',
                    color: '#667eea',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Button>
            ))}
            
            {/* Login/User Menu */}
            {user ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    ml: 2,
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: '#667eea',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 500, color: '#1F2937' }}>
                    {user.name.split(' ')[0]}
                  </Typography>
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{ mt: 1 }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutOutlined style={{ marginRight: 8 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                onClick={handleLogin}
                variant="outlined"
                startIcon={<GoogleOutlined />}
                sx={{
                  ml: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Login with Google
              </Button>
            )}
            
            {/* CTA Button */}
            <Button
              component={RouterLink}
              to="/generate"
              variant="contained"
              sx={{
                ml: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
