import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { SafetyOutlined, UserOutlined, SearchOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { getAuthHeaders } from '../utils/auth';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, regularUsers: 0 });

  useEffect(() => {
    // Check if user is admin and verify continuously
    const verifyAdmin = async () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (!token || role !== 'ADMIN') {
        setError('Access denied. Admin role required.');
        setLoading(false);
        return;
      }

      // Verify admin status with backend
      try {
        const response = await fetch('http://localhost:8081/api/user/me', {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await response.json();
        
        if (userData.role !== 'ADMIN') {
          localStorage.setItem('userRole', userData.role);
          setError('Access denied. Admin privileges have been revoked.');
          setLoading(false);
          return;
        }

        setCurrentUserRole('ADMIN');
        fetchUsers();
      } catch (err) {
        setError('Failed to verify admin status');
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8081/api/admin/users', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      
      // Calculate stats
      const totalUsers = data.length;
      const admins = data.filter(u => u.role === 'ADMIN').length;
      const regularUsers = totalUsers - admins;
      setStats({ totalUsers, admins, regularUsers });
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const grantAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`http://localhost:8081/api/admin/grant-admin/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to grant admin role');
      }

      setSuccess(`Admin role granted to ${userName}`);
      fetchUsers(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const revokeAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`http://localhost:8081/api/admin/revoke-admin/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke admin role');
      }

      setSuccess(`Admin role revoked from ${userName}`);
      fetchUsers(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:8081/api/admin/delete-user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess(`User ${userToDelete.name} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (currentUserRole !== 'ADMIN') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          Access denied. You need admin privileges to access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          <SafetyOutlined style={{ marginRight: 12 }} />
          Admin Panel
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage user roles and permissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Users
                  </Typography>
                </Box>
                <TeamOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.admins}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Administrators
                  </Typography>
                </Box>
                <SafetyOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight={700}>
                    {stats.regularUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Regular Users
                  </Typography>
                </Box>
                <UserOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Refresh */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        <Button
          variant="outlined"
          startIcon={<ReloadOutlined />}
          onClick={fetchUsers}
          sx={{ minWidth: 120 }}
        >
          Refresh
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={user.picture}
                      alt={user.name}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Typography fontWeight={500}>{user.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={user.role === 'ADMIN' ? <SafetyOutlined /> : <UserOutlined />}
                    label={user.role}
                    color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    {user.role === 'ADMIN' ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => revokeAdminRole(user.id, user.name)}
                      >
                        Revoke Admin
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => grantAdminRole(user.id, user.name)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        Grant Admin
                      </Button>
                    )}
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => openDeleteDialog(user)}
                      title="Delete User"
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">
            {searchQuery ? 'No users found matching your search' : 'No users found'}
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All user data will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
