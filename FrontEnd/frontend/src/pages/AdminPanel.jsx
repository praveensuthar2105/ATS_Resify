import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getAuthHeaders } from '../utils/auth';
import { API_BASE_URL } from '../services/api';

const COLORS = ['#39ff14', '#000000', '#333333', '#888888', '#f8f8f8'];

const AdminPanel = () => {
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Users State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // System Health State
  const [health, setHealth] = useState(null);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(20);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [feedbackRowsPerPage, setFeedbackRowsPerPage] = useState(20);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  // Contacts State
  const [contacts, setContacts] = useState([]);
  const [contactPage, setContactPage] = useState(0);
  const [contactRowsPerPage, setContactRowsPerPage] = useState(20);
  const [totalContacts, setTotalContacts] = useState(0);
  const [unreadContacts, setUnreadContacts] = useState(0);

  // Resumes State
  const [resumes, setResumes] = useState([]);
  const [resumePage, setResumePage] = useState(0);
  const [resumeRowsPerPage, setResumeRowsPerPage] = useState(20);
  const [totalResumes, setTotalResumes] = useState(0);

  // Chart Toggle
  const [chartMetric, setChartMetric] = useState('signups'); // 'signups', 'resumes', 'ats'

  useEffect(() => {
    verifyAdmin();
  }, []);

  useEffect(() => {
    if (currentUserRole === 'ADMIN') {
      if (tabValue === 0) fetchUsers();
      else if (tabValue === 1) fetchAnalytics();
      else if (tabValue === 2) fetchHealth();
      else if (tabValue === 3) fetchAuditLogs();
      else if (tabValue === 4) fetchFeedbacks();
      else if (tabValue === 5) fetchContacts();
      else if (tabValue === 6) fetchResumes();
    }
  }, [currentUserRole, tabValue, page, rowsPerPage, orderBy, order, auditPage, auditRowsPerPage, feedbackPage, feedbackRowsPerPage, contactPage, contactRowsPerPage, resumePage, resumeRowsPerPage]);

  const verifyAdmin = async () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'ADMIN') {
      setError('ACCESS DENIED. ADMIN ROLE REQUIRED.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Authentication failed');
      const userData = await response.json();

      if (userData.role !== 'ADMIN') {
        localStorage.setItem('userRole', userData.role);
        setError('ACCESS DENIED. ADMIN PRIVILEGES HAVE BEEN REVOKED.');
        setLoading(false);
        return;
      }

      setCurrentUserRole('ADMIN');
      setLoading(false);
    } catch (err) {
      setError('FAILED TO VERIFY ADMIN STATUS');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const sortParam = `${orderBy},${order}`;
      const url = `${API_BASE_URL}/admin/users?page=${page}&size=${rowsPerPage}&sort=${sortParam}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.content || []);
      setTotalUsers(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system-health`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/audit-log?page=${auditPage}&size=${auditRowsPerPage}&sort=timestamp,desc`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data.content || []);
      setTotalAuditLogs(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/feedback?page=${feedbackPage}&size=${feedbackRowsPerPage}&sort=createdAt,desc`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedbacks(data.content || []);
      setTotalFeedbacks(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/contacts?page=${contactPage}&size=${contactRowsPerPage}&sort=createdAt,desc`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data.content || []);
      setTotalContacts(data.totalElements || 0);
      setUnreadContacts(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/resumes?page=${resumePage}&size=${resumeRowsPerPage}&sort=createdAt,desc`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data.content || []);
      setTotalResumes(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/contacts/${id}/read`, { method: 'PUT', headers: getAuthHeaders() });
      fetchContacts();
    } catch (err) { setError(err.message); }
  };

  const deleteFeedback = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/feedback/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setSuccess('FEEDBACK DELETED SUCCESSFULLY');
      fetchFeedbacks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const deleteContact = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/contacts/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setSuccess('CONTACT MESSAGE DELETED SUCCESSFULLY');
      fetchContacts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const exportUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/export`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to export users');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err.message);
    }
  };

  const grantAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/grant-admin/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to grant admin role');
      setSuccess(`ADMIN STATUS GRANTED TO ${userName}`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const revokeAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/revoke-admin/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to revoke admin role');
      setSuccess(`ADMIN STATUS REVOKED FROM ${userName}`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete-user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setSuccess(`USER ${userToDelete.name.toUpperCase()} PURGED SUCCESSFULLY`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setDeleteDialogOpen(false);
    }
  };

  const MetricCard = ({ title, value, icon, colorClass = "bg-[#39ff14] text-black" }) => (
    <div className={`border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between ${colorClass}`}>
      <div>
        <div className="text-4xl font-black">{value}</div>
        <div className="text-sm font-bold uppercase tracking-wide opacity-80">{title}</div>
      </div>
      <div>
        <span className="material-symbols-outlined text-5xl opacity-50">{icon}</span>
      </div>
    </div>
  );

  const StatusIndicator = ({ label, status, details }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b-2 border-black gap-4 hover:bg-[#f8f8f8]">
      <div className="flex items-center gap-3">
        {(status === 'UP' || status === true) ? (
          <span className="material-symbols-outlined text-[#39ff14] bg-black p-1">check_circle</span>
        ) : (
          <span className="material-symbols-outlined text-white bg-red-600 p-1">error</span>
        )}
        <div>
          <div className="font-bold uppercase text-sm">{label}</div>
          <div className="text-xs font-mono lowercase text-gray-500 max-w-lg truncate">
            {details ? JSON.stringify(details).slice(0, 100) : 'no details available'}
          </div>
        </div>
      </div>
      <div className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black ${status === 'UP' || status === true ? 'bg-[#39ff14] text-black' : 'bg-red-600 text-white'}`}>
        {(status === 'UP' || status === true) ? 'OPERATIONAL' : 'SYSTEM FAULT'}
      </div>
    </div>
  );

  const Pagination = ({ total, page, setPage, rowsPerPage, setRowsPerPage }) => {
    const totalPages = Math.ceil(total / rowsPerPage);
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 border-t-2 border-black gap-4 border-2 shadow-[4px_4px_0px_0px_#000]">
        <div className="text-sm font-bold uppercase">
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, total)} of {total}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            className="border-2 border-black bg-white px-2 py-1 text-sm font-bold uppercase focus:outline-none focus:border-[#39ff14]"
          >
            <option value={10}>10 ROWS</option>
            <option value={20}>20 ROWS</option>
            <option value={50}>50 ROWS</option>
          </select>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border-2 border-black bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#39ff14] hover:text-black transition-colors font-bold text-sm"
            >
              PREV
            </button>
            <div className="px-3 py-1 border-2 border-black bg-white font-bold text-sm">
              {page + 1} / {totalPages || 1}
            </div>
            <button
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border-2 border-black bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#39ff14] hover:text-black transition-colors font-bold text-sm"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SortHeader = ({ label, property }) => {
    const isActive = orderBy === property;
    return (
      <th
        className="p-3 text-left font-bold border-b-2 border-black cursor-pointer hover:bg-[#39ff14] transition-colors whitespace-nowrap"
        onClick={() => handleRequestSort(property)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive && (
            <span className="material-symbols-outlined text-[16px]">
              {order === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (currentUserRole !== 'ADMIN' && !loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono selection:bg-[#39ff14] selection:text-black">
        <div className="border-2 border-red-500 bg-red-100 text-red-700 p-8 shadow-[8px_8px_0px_0px_#000000] max-w-md w-full font-bold uppercase text-center">
          <span className="material-symbols-outlined text-4xl mb-4">gpp_bad</span>
          <p>ACCESS DENIED. ADMIN PRIVILEGES REQUIRED.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { title: 'USERS', icon: 'group' },
    { title: 'ANALYTICS', icon: 'timeline' },
    { title: 'SYSTEM HEALTH', icon: 'dns' },
    { title: 'AUDIT LOG', icon: 'history' },
    { title: 'RESUMES', icon: 'description' },
    { title: 'FEEDBACK', icon: 'star' },
    { title: 'MESSAGES', icon: 'mail', badge: unreadContacts }
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-mono selection:bg-[#39ff14] selection:text-black pb-20">
      <div className="max-w-[1400px] mx-auto px-4 pt-12">
        <div className="mb-8 border-b border-black pb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-[#39ff14] flex items-center justify-center shadow-[2px_2px_0px_0px_#39ff14]">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            ADMIN <span className="text-[#39ff14]" style={{ textShadow: "1.5px 1.5px 0px #000" }}>CONSOLE</span>
          </h1>
        </div>

        {success && (
          <div className="mb-6 p-4 border-2 border-black bg-[#39ff14] text-black font-bold uppercase text-sm shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
            <button onClick={() => setSuccess(null)} className="hover:text-white"><span className="material-symbols-outlined text-lg">close</span></button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-red-600 text-white font-bold uppercase text-sm shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="hover:text-black"><span className="material-symbols-outlined text-lg">close</span></button>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex overflow-x-auto border border-black bg-white mb-8 shadow-[2px_2px_0px_0px_#000000] hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setTabValue(idx)}
              className={`whitespace-nowrap flex-1 min-w-[160px] px-6 py-4 flex items-center justify-center gap-3 font-black uppercase text-sm border-r border-black last:border-r-0 transition-colors ${tabValue === idx ? 'bg-[#39ff14] text-black shadow-[inset_0px_-2px_0px_0px_#000]' : 'bg-[#f8f8f8] hover:bg-black hover:text-[#39ff14]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.title}
              {tab.badge > 0 && (
                <span className="bg-red-600 text-white px-2 py-0.5 text-xs ml-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] animate-pulse">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="w-full flex flex-col items-center justify-center p-12 overflow-hidden">
              <div className="w-16 h-16 border-4 border-black border-t-[#39ff14] rounded-full animate-spin"></div>
              <div className="mt-4 font-bold uppercase animate-pulse">PROCESSING_REQUEST...</div>
            </div>
          )}

          {!loading && (
            <>
              {/* USERS TAB */}
              {tabValue === 0 && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
                        <input
                          type="text"
                          placeholder="SEARCH USERS..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border-2 border-black bg-white focus:outline-none focus:border-[#39ff14] font-bold text-sm uppercase w-full sm:w-64"
                        />
                      </div>
                      <button onClick={fetchUsers} className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#39ff14]">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        <span className="hidden sm:inline">REFRESH</span>
                      </button>
                    </div>
                    <button onClick={exportUsers} className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#000000]">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      EXPORT CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <SortHeader label="USER" property="name" />
                          <SortHeader label="EMAIL" property="email" />
                          <th className="p-3 text-left font-bold border-b border-black">ROLE</th>
                          <SortHeader label="JOINED" property="createdAt" />
                          <th className="p-3 text-center font-bold border-b border-black">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b border-gray-300 hover:bg-[#f8f8f8] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {user.picture ? (
                                  <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-black" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full border border-black bg-[#39ff14] text-black flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
                                )}
                                <span className="font-bold uppercase">{user.name}</span>
                              </div>
                            </td>
                            <td className="p-3 lowercase">{user.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs font-bold border-2 border-black uppercase ${user.role === 'ADMIN' ? 'bg-[#39ff14] text-black' : 'bg-[#e5e7eb] text-black'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <div className="flex justify-center gap-2">
                                {user.role === 'ADMIN' ? (
                                  <button onClick={() => revokeAdminRole(user.id, user.name)} className="px-2 py-1 text-xs border border-black bg-black text-white hover:bg-red-500 font-bold uppercase">REVOKE</button>
                                ) : (
                                  <button onClick={() => grantAdminRole(user.id, user.name)} className="px-2 py-1 text-xs border border-black bg-white hover:bg-[#39ff14] hover:text-black font-bold uppercase">GRANT ADMIN</button>
                                )}
                                <button onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }} className="px-1 py-1 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-600 transition-colors">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalUsers} page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
                </div>
              )}

              {/* ANALYTICS TAB */}
              {tabValue === 1 && analytics && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard title="Total Resumes" value={analytics.totalResumes} icon="description" colorClass="bg-[#39ff14] text-black" />
                    <MetricCard title="PDF Compiled" value={analytics.totalPdf} icon="picture_as_pdf" colorClass="bg-black text-[#39ff14]" />
                    <MetricCard title="ATS Checks" value={analytics.totalAts} icon="check_circle" colorClass="bg-white text-black" />
                    <MetricCard title="Total Users" value={totalUsers} icon="group" colorClass="bg-gray-200 text-black" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 lg:col-span-2 border-2 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#000000]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-2 border-black pb-4 gap-4">
                        <h3 className="font-bold text-lg uppercase flex items-center gap-2">
                          <span className="w-3 h-3 bg-[#39ff14] border-2 border-black inline-block"></span>
                          USAGE ANALYTICS (30 DAYS)
                        </h3>
                        <div className="flex border-2 border-black">
                          {['signups', 'resumes', 'ats'].map(m => (
                            <button
                              key={m}
                              onClick={() => setChartMetric(m)}
                              className={`px-3 py-1 text-xs font-bold uppercase border-r-2 border-black last:border-r-0 transition-colors ${chartMetric === m ? 'bg-black text-[#39ff14]' : 'bg-white hover:bg-[#39ff14]'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={
                            chartMetric === 'signups' ? analytics.dailySignups :
                              chartMetric === 'resumes' ? analytics.dailyResumes :
                                analytics.dailyAts
                          }>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontFamily: 'monospace', fontSize: 10 }} tickFormatter={(val) => val.split('T')[0]} />
                            <YAxis tick={{ fontFamily: 'monospace', fontSize: 12 }} />
                            <RechartsTooltip contentStyle={{ borderRadius: 0, border: '1px solid black', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                            <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} activeDot={{ r: 6, fill: '#39ff14', stroke: '#000', strokeWidth: 2 }} dot={{ r: 3, fill: '#000' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="border-2 border-black p-6 bg-white shadow-[8px_8px_0px_0px_#000000] flex flex-col">
                      <h3 className="font-bold text-lg uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
                        <span className="w-3 h-3 bg-black border-2 border-[#39ff14] inline-block"></span>
                        TEMPLATE DISTRIBUTION
                      </h3>
                      <div className="h-[250px] flex-grow flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.templateUsage}
                              cx="50%" cy="50%" outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                              stroke="#000000"
                              strokeWidth={2}
                            >
                              {analytics.templateUsage.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: 0, border: '2px solid black', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM HEALTH TAB */}
              {tabValue === 2 && health && (
                <div className="border border-black bg-white shadow-[2px_2px_0px_0px_#000000]">
                  <div className="p-6 border-b-2 border-black bg-[#f0f0f0]">
                    <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-2xl">speed</span>
                      DIAGNOSTICS & TELEMETRY
                    </h2>
                  </div>
                  <div>
                    <StatusIndicator label="LATEX COMPILATION SERVICE" status={health.latex?.ready ? 'UP' : 'DOWN'} details={health.latex} />
                    <StatusIndicator label="CORE DATABASE (MYSQL)" status={health.database?.status} details={health.database} />
                    <StatusIndicator label="IN-MEMORY CACHE (REDIS)" status={health.redis?.status} details={health.redis} />
                    <StatusIndicator label="ASYNC TASK QUEUE" status="UP" details={health.queue} />
                  </div>
                </div>
              )}

              {/* AUDIT LOG TAB */}
              {tabValue === 3 && (
                <div>
                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">TIMESTAMP</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">ORIGIN (ADMIN)</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">EVENT_TYPE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">TARGET_ENTITY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-300 font-mono hover:bg-[#f8f8f8]">
                            <td className="p-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-3 lowercase font-bold">{log.adminEmail}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 border-2 border-black bg-white uppercase text-xs font-bold ${log.action.includes('DELETE') ? 'text-red-600' : log.action.includes('GRANT') ? 'text-[#39ff14] bg-black' : ''}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-3 lowercase">{log.targetUserEmail}</td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center uppercase font-bold text-gray-400">NO AUDIT RECORDS FOUND</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalAuditLogs} page={auditPage} setPage={setAuditPage} rowsPerPage={auditRowsPerPage} setRowsPerPage={setAuditRowsPerPage} />
                </div>
              )}

              {/* RESUMES TAB */}
              {tabValue === 4 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase">GENERATED RESUMES [{totalResumes}]</h2>
                    <button onClick={fetchResumes} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">USER</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">TEMPLATE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">DATE_CREATED</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumes.map((resume) => (
                          <tr key={resume.id} className="border-b border-gray-300 hover:bg-[#f8f8f8]">
                            <td className="p-3">
                              <div className="font-bold uppercase">{resume.userName}</div>
                              <div className="text-xs lowercase text-gray-500">{resume.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 border border-black bg-white text-xs font-bold uppercase">{resume.templateType}</span>
                            </td>
                            <td className="p-3 font-mono text-xs">{new Date(resume.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                        {resumes.length === 0 && (
                          <tr><td colSpan={3} className="p-8 text-center uppercase font-bold text-gray-400">NO RESUMES FOUND</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalResumes} page={resumePage} setPage={setResumePage} rowsPerPage={resumeRowsPerPage} setRowsPerPage={setResumeRowsPerPage} />
                </div>
              )}

              {/* FEEDBACK TAB */}
              {tabValue === 5 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase">USER FEEDBACK [{totalFeedbacks}]</h2>
                    <button onClick={fetchFeedbacks} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">USER</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">RATING</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">DIRECT_MESSAGE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">DATE_LOGGED</th>
                          <th className="p-3 text-center font-bold border-b border-black uppercase">X</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.map((fb) => (
                          <tr key={fb.id} className="border-b border-gray-300 hover:bg-[#f8f8f8]">
                            <td className="p-3">
                              <div className="font-bold uppercase">{fb.name}</div>
                              <div className="text-xs lowercase text-gray-500">{fb.email}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex text-[#39ff14] bg-black px-2 py-1 w-fit border border-black">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <span key={s} className={`material-symbols-outlined text-sm ${s <= fb.rating ? '' : 'opacity-30'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 max-w-xs break-words lowercase">{fb.message || '<NULL_PACKET>'}</td>
                            <td className="p-3 font-mono text-xs">{new Date(fb.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-center">
                              <button onClick={() => deleteFeedback(fb.id)} className="text-red-600 hover:bg-red-100 p-1 border border-transparent hover:border-red-600">
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {feedbacks.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center uppercase font-bold text-gray-400">NO FEEDBACK LOGS</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalFeedbacks} page={feedbackPage} setPage={setFeedbackPage} rowsPerPage={feedbackRowsPerPage} setRowsPerPage={setFeedbackRowsPerPage} />
                </div>
              )}

              {/* MESSAGES TAB */}
              {tabValue === 6 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase flex items-center gap-4">
                      INBOUND COMMS [{totalContacts}]
                      {unreadContacts > 0 && <span className="bg-[#39ff14] text-black px-2 border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000]">{unreadContacts} NEW</span>}
                    </h2>
                    <button onClick={fetchContacts} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {contacts.map((msg) => (
                      <div key={msg.id} className={`border-2 border-black p-6 ${msg.read ? 'bg-white shadow-[4px_4px_0px_0px_#000000]' : 'bg-[#f0f0f0] shadow-[8px_8px_0px_0px_#39ff14] border-l-8 border-l-[#39ff14]'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-lg uppercase">{msg.name}</span>
                              <span className="text-xs border-2 border-black px-1 lowercase bg-white">{msg.email}</span>
                            </div>
                            <div className="font-bold border-b border-black pb-1 uppercase">{msg.subject}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                            {!msg.read && (
                              <button onClick={() => markAsRead(msg.id)} className="px-2 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-[#39ff14] hover:text-black border-2 border-black transition-colors">
                                MARK READ
                              </button>
                            )}
                            <button onClick={() => deleteContact(msg.id)} className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase hover:bg-black border-2 border-black transition-colors flex items-center">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="font-mono text-sm leading-relaxed p-4 bg-white border-2 border-gray-300">
                          {msg.message}
                        </div>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <div className="border-2 border-black bg-white p-12 text-center shadow-[4px_4px_0px_0px_#000] font-bold text-gray-400 uppercase">
                        INBOX EMPTY
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <Pagination total={totalContacts} page={contactPage} setPage={setContactPage} rowsPerPage={contactRowsPerPage} setRowsPerPage={setContactRowsPerPage} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CUSTOM OVERLAY DIALOG (DELETE) */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black p-8 shadow-[12px_12px_0px_0px_#39ff14] max-w-sm w-full">
            <h3 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-3xl">warning</span>
              PURGE USER
            </h3>
            <p className="mb-4 font-bold lowercase text-sm">
              are you sure you want to permanently delete <strong className="uppercase bg-[#39ff14] px-1">{userToDelete?.name}</strong>?
            </p>
            <div className="bg-red-100 border-2 border-red-600 text-red-700 p-2 text-xs font-bold uppercase mb-6 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm">dangerous</span>
              DATA CANNOT BE RECOVERED.
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 border-2 border-black font-bold uppercase py-2 hover:bg-gray-100 transition-colors"
              >
                ABORT
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 border-2 border-black bg-red-600 text-white font-bold uppercase py-2 shadow-[4px_4px_0px_0px_#000] active:shadow-none hover:bg-black transition-all"
              >
                EXECUTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
