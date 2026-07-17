import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getAuthHeaders } from '../utils/auth';
import { API_BASE_URL } from '../services/api';

const COLORS = ['#39ff14', '#000000', '#333333', '#888888', '#f8f8f8'];

const PRESET_SQL_QUERIES = [
  { label: "📋 Recent Users (Top 25)", query: "SELECT id, name, email, role, provider, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 25;" },
  { label: "📄 Recent Resumes (Top 25)", query: "SELECT id, user_id, candidate_name, template_type, created_at FROM resumes ORDER BY created_at DESC LIMIT 25;" },
  { label: "🔍 Recent ATS Checks (Top 25)", query: "SELECT id, user_id, ats_score, job_description_provided, file_name, created_at FROM ats_checks ORDER BY created_at DESC LIMIT 25;" },
  { label: "🤖 View All AI System Prompts", query: "SELECT id, prompt_key, prompt_name, model_name, temperature, updated_at FROM ai_prompts;" },
  { label: "🎛️ View All Feature Flags", query: "SELECT id, flag_key, flag_name, enabled_global, enabled_pro_only, updated_at FROM feature_flags;" },
  { label: "⚙️ View All Tier Quotas & Limits", query: "SELECT id, tier_name, max_resumes_per_month, max_ats_checks_per_day, ai_model_allowed FROM tier_configs;" },
  { label: "🛡️ Recent Security & Threat Alerts (Top 50)", query: "SELECT id, alert_type, ip_address, severity, details, created_at FROM security_alerts ORDER BY created_at DESC LIMIT 50;" },
  { label: "📊 User Distribution by Role Summary", query: "SELECT role, COUNT(*) as total_users FROM users GROUP BY role;" },
  { label: "📈 Resume Creation by Template Summary", query: "SELECT template_type, COUNT(*) as total_resumes FROM resumes GROUP BY template_type;" },
  { label: "💬 Recent Contact & Feedback Messages", query: "SELECT id, name, email, subject, is_read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 25;" }
];

const AdminPanel = () => {
  const tabsContainerRef = useRef(null);
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
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);

  // ATS Checks State
  const [atsChecks, setAtsChecks] = useState([]);
  const [atsCheckPage, setAtsCheckPage] = useState(0);
  const [atsCheckRowsPerPage, setAtsCheckRowsPerPage] = useState(20);
  const [totalAtsChecks, setTotalAtsChecks] = useState(0);
  const [selectedAtsCheck, setSelectedAtsCheck] = useState(null);
  const [atsDrawerOpen, setAtsDrawerOpen] = useState(false);

  // Chart Toggle
  const [chartMetric, setChartMetric] = useState('signups'); // 'signups', 'resumes', 'ats'

  // New Phase 2 States
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileDrawerOpen, setUserProfileDrawerOpen] = useState(false);
  const [engagementStats, setEngagementStats] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [showRawTelemetry, setShowRawTelemetry] = useState(false);
  const [autoRefreshHealth, setAutoRefreshHealth] = useState(false);

  // Phase 3 Command Center States (ponytail mode)
  const [aiPrompts, setAiPrompts] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [tierConfigs, setTierConfigs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [sqlQueryInput, setSqlQueryInput] = useState(PRESET_SQL_QUERIES[0].query);
  const [sqlResults, setSqlResults] = useState(null);
  const [sqlError, setSqlError] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    verifyAdmin();
  }, []);

  useEffect(() => {
    if (currentUserRole === 'ADMIN' && tabValue === 2 && autoRefreshHealth) {
      const timer = setInterval(() => {
        fetchHealth();
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [currentUserRole, tabValue, autoRefreshHealth]);

  useEffect(() => {
    if (currentUserRole === 'ADMIN') {
      if (tabValue === 0) fetchUsers();
      else if (tabValue === 1) fetchAnalytics();
      else if (tabValue === 2) fetchHealth();
      else if (tabValue === 3) fetchAuditLogs();
      else if (tabValue === 4) fetchResumes();
      else if (tabValue === 5) fetchAtsChecks();
      else if (tabValue === 6) { fetchFeedbacks(); fetchFeedbackSummary(); }
      else if (tabValue === 7) fetchContacts();
      else if (tabValue === 8) fetchEngagementStats();
      else if (tabValue === 9) fetchAiPrompts();
      else if (tabValue === 10) fetchSecurityAlerts();
      else if (tabValue === 11) { fetchFeatureFlags(); fetchTierConfigs(); }
      else if (tabValue === 12) fetchLiveLogs();
    }
  }, [currentUserRole, tabValue, page, rowsPerPage, orderBy, order, auditPage, auditRowsPerPage, feedbackPage, feedbackRowsPerPage, contactPage, contactRowsPerPage, resumePage, resumeRowsPerPage, atsCheckPage, atsCheckRowsPerPage]);

  const fetchLiveStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/live-stats`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setLiveStats(data);
      }
    } catch (err) { console.error('Live stats error', err); }
  };

  useEffect(() => {
    if (currentUserRole === 'ADMIN') fetchLiveStats();
  }, [currentUserRole]);

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
    } catch {
      setError('FAILED TO VERIFY ADMIN STATUS');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const sortParam = `${orderBy},${order}`;
      let url = `${API_BASE_URL}/admin/users?page=${page}&size=${rowsPerPage}&sort=${sortParam}`;
      if (searchQuery && searchQuery.trim() !== '') {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
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

  const fetchResumeDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resumes/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch resume details');
      const data = await response.json();
      setSelectedResume(data);
      setResumeDrawerOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAtsChecks = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/admin/ats-checks?page=${atsCheckPage}&size=${atsCheckRowsPerPage}&sort=createdAt,desc`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch ATS checks');
      const data = await response.json();
      setAtsChecks(data.content || []);
      setTotalAtsChecks(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtsCheckDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ats-checks/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch ATS details');
      const data = await response.json();
      setSelectedAtsCheck(data);
      setAtsDrawerOpen(true);
    } catch (err) {
      setError(err.message);
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

  const fetchUserProfile = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/profile`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUserProfile(data);
      setUserProfileDrawerOpen(true);
    } catch (err) { setError(err.message); }
  };

  const fetchEngagementStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats/engagement`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch engagement stats');
      const data = await response.json();
      setEngagementStats(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchFeedbackSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/feedback/summary`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setFeedbackSummary(data);
      }
    } catch (err) { console.error(err); }
  };

  // Phase 3 Command Center Fetchers (ponytail mode)
  // Helper for safe response parsing
  const parseResponseOrError = async (res) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}: ${res.statusText}`);
      return data;
    } else {
      const text = await res.text();
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status} (${res.statusText}). Please check backend logs.`);
      return text;
    }
  };

  // Phase 3 Command Center Fetchers (ponytail mode with robust error resilience)
  const fetchAiPrompts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai-prompts`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setAiPrompts(data || []);
    } catch (err) {
      console.error('fetchAiPrompts error:', err);
      setError(`Failed to fetch AI Prompts: ${err.message}`);
    }
  };

  const updateAiPrompt = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai-prompts/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('AI PROMPT UPDATED SUCCESSFULLY');
      setTimeout(() => setSuccess(null), 3000);
      fetchAiPrompts();
    } catch (err) {
      console.error('updateAiPrompt error:', err);
      setError(`Failed to update AI Prompt: ${err.message}`);
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feature-flags`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setFeatureFlags(data || []);
    } catch (err) {
      console.error('fetchFeatureFlags error:', err);
      setError(`Failed to fetch Feature Flags: ${err.message}`);
    }
  };

  const updateFeatureFlag = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feature-flags/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('FEATURE FLAG UPDATED SUCCESSFULLY');
      setTimeout(() => setSuccess(null), 3000);
      fetchFeatureFlags();
    } catch (err) {
      console.error('updateFeatureFlag error:', err);
      setError(`Failed to update Feature Flag: ${err.message}`);
    }
  };

  const fetchTierConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tier-configs`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setTierConfigs(data || []);
    } catch (err) {
      console.error('fetchTierConfigs error:', err);
      setError(`Failed to fetch Tier Configs: ${err.message}`);
    }
  };

  const updateTierConfig = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tier-configs/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('TIER CONFIG UPDATED SUCCESSFULLY');
      setTimeout(() => setSuccess(null), 3000);
      fetchTierConfigs();
    } catch (err) {
      console.error('updateTierConfig error:', err);
      setError(`Failed to update Tier Config: ${err.message}`);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/security/alerts`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setSecurityAlerts(data || []);
    } catch (err) {
      console.error('fetchSecurityAlerts error:', err);
      setError(`Failed to fetch Security Alerts: ${err.message}`);
    }
  };

  const fetchLiveLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/logs`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setLiveLogs(data || []);
    } catch (err) {
      console.error('fetchLiveLogs error:', err);
      setError(`Failed to fetch Live Logs: ${err.message}`);
    }
  };

  const runSqlQuery = async () => {
    setSqlError(null);
    setSqlResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sql-query`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQueryInput })
      });
      const data = await parseResponseOrError(res);
      setSqlResults(data);
    } catch (err) {
      setSqlError(err.message);
    }
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

  const exportResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/resumes`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to export resumes');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resumes_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) { setError(err.message); }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/analytics`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to export analytics');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics_summary.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) { setError(err.message); }
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

  const ResumeDrawer = () => {
    if (!selectedResume || !resumeDrawerOpen) return null;
    let resumeData = null;
    if (selectedResume.resumeJson) {
      try {
        resumeData = JSON.parse(selectedResume.resumeJson);
      } catch (e) { console.error("Failed to parse resume JSON", e); }
    }

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] z-50 overflow-y-auto font-mono flex flex-col transform transition-transform">
        <div className="sticky top-0 bg-black text-[#39ff14] p-4 flex justify-between items-center border-b-4 border-[#39ff14] z-10">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <span className="material-symbols-outlined">description</span>
            RESUME DATA
          </h2>
          <button onClick={() => setResumeDrawerOpen(false)} className="hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-3 bg-[#f8f8f8]">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">Generated By</div>
              <div className="font-bold uppercase truncate">{selectedResume.userName}</div>
              <div className="text-xs lowercase">{selectedResume.email}</div>
            </div>
            <div className="border-2 border-black p-3 bg-[#f8f8f8]">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">Metadata</div>
              <div className="font-bold uppercase text-xs mb-1">Template: <span className="bg-black text-[#39ff14] px-1">{selectedResume.templateType}</span></div>
              <div className="text-xs">{new Date(selectedResume.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {!resumeData ? (
            <div className="border-2 border-dashed border-gray-400 p-8 text-center text-gray-500 font-bold uppercase bg-gray-50">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
              <p>NO RESUME CONTENT STORED IN DATABASE</p>
              <p className="text-xs mt-2 font-normal normal-case">This resume was generated before content persistence was enabled.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <div className="bg-[#39ff14] border-b-2 border-black p-2 font-bold uppercase border-t-0">Personal Info</div>
                <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-bold text-gray-500 text-xs">NAME:</span><br/>{resumeData?.personalInformation?.fullName || resumeData?.name || '—'}</div>
                  <div><span className="font-bold text-gray-500 text-xs">EMAIL:</span><br/><span className="lowercase">{resumeData?.personalInformation?.email || resumeData?.email || '—'}</span></div>
                  <div><span className="font-bold text-gray-500 text-xs">PHONE:</span><br/>{resumeData?.personalInformation?.phoneNumber || resumeData?.phone || '—'}</div>
                  <div className="col-span-1 md:col-span-2"><span className="font-bold text-gray-500 text-xs">ADDRESS:</span><br/>{resumeData?.personalInformation?.location || resumeData?.address || '—'}</div>
                  {(resumeData?.personalInformation?.linkedIn || resumeData?.linkedlnId) && <div className="col-span-1 md:col-span-2"><span className="font-bold text-gray-500 text-xs">LINKEDIN:</span><br/>{resumeData?.personalInformation?.linkedIn || resumeData?.linkedlnId}</div>}
                  {(resumeData?.personalInformation?.gitHub || resumeData?.githubId) && <div className="col-span-1 md:col-span-2"><span className="font-bold text-gray-500 text-xs">GITHUB:</span><br/>{resumeData?.personalInformation?.gitHub || resumeData?.githubId}</div>}
                </div>
              </div>

              {resumeData.summary && (
                <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  <div className="bg-[#39ff14] border-b-2 border-black p-2 font-bold uppercase border-t-0">Summary</div>
                  <div className="p-4 bg-white text-sm whitespace-pre-wrap">{resumeData.summary}</div>
                </div>
              )}

              {resumeData.skills && (
                <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  <div className="bg-[#39ff14] border-b-2 border-black p-2 font-bold uppercase border-t-0">Skills</div>
                  <div className="p-4 bg-white flex flex-wrap gap-2">
                    {Array.isArray(resumeData.skills) 
                      ? resumeData.skills.map((skill, i) => (
                          <span key={`arr-${i}`} className="border border-black px-2 py-1 text-xs font-bold uppercase bg-gray-100">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</span>
                        ))
                      : typeof resumeData.skills === 'object' && resumeData.skills !== null
                        ? Object.entries(resumeData.skills).flatMap(([category, skills]) => 
                            Array.isArray(skills) ? skills.map((skill, i) => (
                              <span key={`${category}-${i}`} className="border border-black px-2 py-1 text-xs font-bold uppercase bg-gray-100">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</span>
                            )) : []
                          )
                        : <span className="border border-black px-2 py-1 text-xs font-bold uppercase bg-gray-100">{String(resumeData.skills)}</span>
                    }
                  </div>
                </div>
              )}

              {(resumeData.experience || resumeData.experienceList) && (resumeData.experience || resumeData.experienceList).length > 0 && (
                <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  <div className="bg-[#39ff14] border-b-2 border-black p-2 font-bold uppercase border-t-0">Experience</div>
                  <div className="p-0 bg-white">
                    {(resumeData.experience || resumeData.experienceList).map((exp, i) => (
                      <div key={i} className="p-4 border-b-2 border-gray-200 last:border-b-0">
                        <div className="font-bold uppercase text-lg">{exp.jobTitle || exp.title}</div>
                        <div className="text-sm font-bold">{exp.company} <span className="text-gray-500 font-normal">| {exp.duration}</span></div>
                        {(exp.responsibility || exp.description) && <p className="text-sm mt-2 whitespace-pre-wrap">{exp.responsibility || exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(resumeData.education || resumeData.educationList) && (resumeData.education || resumeData.educationList).length > 0 && (
                <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  <div className="bg-[#39ff14] border-b-2 border-black p-2 font-bold uppercase border-t-0">Education</div>
                  <div className="p-0 bg-white">
                    {(resumeData.education || resumeData.educationList).map((edu, i) => (
                      <div key={i} className="p-4 border-b-2 border-gray-200 last:border-b-0">
                        <div className="font-bold uppercase">{edu.degree}</div>
                        <div className="text-sm">{edu.university || edu.college} <span className="text-gray-500 font-normal">| {edu.graduationYear || edu.year}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    );
  };

  const AtsDrawer = () => {
    if (!selectedAtsCheck || !atsDrawerOpen) return null;

    let scoreBreakdown = null;
    let suggestions = null;

    try {
      if (selectedAtsCheck.scoreBreakdown) scoreBreakdown = JSON.parse(selectedAtsCheck.scoreBreakdown);
      if (selectedAtsCheck.suggestions) suggestions = JSON.parse(selectedAtsCheck.suggestions);
    } catch (e) {
      console.error("Failed to parse ATS JSON fields", e);
    }

    const getScoreColor = (score) => {
      if (score >= 80) return "text-[#39ff14] border-[#39ff14]";
      if (score >= 60) return "text-yellow-400 border-yellow-400";
      return "text-red-500 border-red-500";
    };

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] z-50 overflow-y-auto font-mono flex flex-col transform transition-transform">
        <div className="sticky top-0 bg-black text-white p-4 flex justify-between items-center border-b-4 border-black z-10">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <span className="material-symbols-outlined">fact_check</span>
            ATS ANALYSIS RESULT
          </h2>
          <button onClick={() => setAtsDrawerOpen(false)} className="hover:text-[#39ff14] transition-colors">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="p-6 flex-1 bg-gray-50">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-3 bg-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">CANDIDATE</div>
              <div className="font-bold uppercase truncate">{selectedAtsCheck.userName}</div>
              <div className="text-xs lowercase">{selectedAtsCheck.email}</div>
            </div>
            <div className="border-2 border-black p-3 bg-white shadow-[4px_4px_0px_0px_#000]">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">METADATA</div>
              <div className="text-xs mb-1">Target Job Provided: <strong>{selectedAtsCheck.jobDescriptionProvided ? 'YES' : 'NO'}</strong></div>
              <div className="text-xs">{new Date(selectedAtsCheck.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center justify-center border-2 border-black bg-black text-white p-6 shadow-[6px_6px_0px_0px_#39ff14]">
            <div className="text-sm font-bold uppercase mb-2">OVERALL MATCH SCORE</div>
            <div className={`text-7xl font-black ${getScoreColor(selectedAtsCheck.atsScore || 0).split(' ')[0]}`}>
              {selectedAtsCheck.atsScore || 0}<span className="text-3xl text-gray-500">/100</span>
            </div>
          </div>

          {scoreBreakdown && (
            <div className="mb-6">
              <h3 className="font-bold uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-sm">analytics</span> SCORE BREAKDOWN</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(scoreBreakdown).map(([key, val]) => {
                  const score = typeof val === 'object' && val !== null ? val.score || 0 : val;
                  return (
                    <div key={key} className="border-2 border-black bg-white p-3 flex justify-between items-center shadow-[2px_2px_0px_0px_#000]">
                      <span className="text-xs font-bold uppercase text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`font-black ${getScoreColor(score).split(' ')[0]}`}>{score}/100</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-sm">lightbulb</span> TOP SUGGESTIONS</h3>
              <div className="space-y-3">
                {suggestions.map((sugg, i) => {
                  const text = typeof sugg === 'object' && sugg !== null ? sugg.suggestion || sugg.text : sugg;
                  const section = typeof sugg === 'object' && sugg !== null ? sugg.section : null;
                  const priority = typeof sugg === 'object' && sugg !== null ? sugg.priority : null;
                  return (
                    <div key={i} className="border-l-4 border-l-[#39ff14] border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
                      {section && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 mb-2 inline-block uppercase border border-black mr-2 ${priority === 'high' ? 'bg-red-500 text-white' : priority === 'medium' ? 'bg-yellow-400 text-black' : 'bg-black text-white'}`}>
                          {section}
                        </span>
                      )}
                      <p className="text-sm">{typeof text === 'string' ? text : JSON.stringify(text)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedAtsCheck.resumeText && (
            <div className="mb-6">
              <h3 className="font-bold uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-sm">format_align_left</span> EXTRACTED TEXT PREVIEW</h3>
              <div className="border-2 border-black bg-white p-4 h-64 overflow-y-auto text-xs whitespace-pre-wrap">
                {selectedAtsCheck.resumeText}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const UserProfileDrawer = () => {
    if (!userProfile || !userProfileDrawerOpen) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] z-50 overflow-y-auto font-mono flex flex-col transform transition-transform">
        <div className="sticky top-0 bg-black text-[#39ff14] p-4 flex justify-between items-center border-b-4 border-[#39ff14] z-10">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <span className="material-symbols-outlined">person</span>
            USER PROFILE & ACTIVITY
          </h2>
          <button onClick={() => setUserProfileDrawerOpen(false)} className="hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="p-6 flex-1 bg-gray-50 space-y-6">
          <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center gap-4 border-b-2 border-gray-200 pb-4 mb-4">
              <div className="w-16 h-16 bg-black text-[#39ff14] flex items-center justify-center text-2xl font-black uppercase border-2 border-black">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-xl uppercase">{userProfile.name}</h3>
                <p className="text-sm lowercase text-gray-600">{userProfile.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Provider</span>
                <div className="font-bold">{userProfile.provider}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Joined</span>
                <div className="font-bold text-sm">{new Date(userProfile.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Resumes</span>
                <div className="font-bold text-2xl">{userProfile.resumeCount}</div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">ATS Checks</span>
                <div className="font-bold text-2xl">{userProfile.atsCount}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2">Activity Timeline</h3>
            {(!userProfile.resumes.length && !userProfile.atsChecks.length) ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-400 font-bold uppercase text-gray-500">
                No activity recorded
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {[...userProfile.resumes.map(r => ({ ...r, type: 'RESUME' })), ...userProfile.atsChecks.map(a => ({ ...a, type: 'ATS' }))]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_0px_#000] z-10">
                        <span className="material-symbols-outlined text-sm">{item.type === 'RESUME' ? 'description' : 'fact_check'}</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black uppercase text-sm">{item.type === 'RESUME' ? 'Resume Generated' : 'ATS Check'}</span>
                          <span className="text-xs font-bold text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          {item.type === 'RESUME' 
                            ? `Template: ${item.templateType}` 
                            : `Score: ${item.atsScore}/100`}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
    { title: 'ATS CHECKS', icon: 'fact_check' },
    { title: 'FEEDBACK', icon: 'star' },
    { title: 'MESSAGES', icon: 'mail', badge: unreadContacts },
    { title: 'ENGAGEMENT', icon: 'monitoring' },
    { title: 'AI OPS STUDIO', icon: 'auto_awesome' },
    { title: 'SECURITY & THREATS', icon: 'shield_lock' },
    { title: 'FLAGS & QUOTAS', icon: 'tune' },
    { title: 'SQL & LOGS STUDIO', icon: 'terminal' }
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-mono selection:bg-[#39ff14] selection:text-black pb-20">
      <div className="max-w-[1400px] mx-auto px-4 pt-12">
        {liveStats && (
          <div className="mb-4 bg-black text-[#39ff14] border-2 border-[#39ff14] p-3 flex justify-between items-center shadow-[4px_4px_0px_0px_#39ff14] font-mono">
            <div className="flex gap-6">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">group</span> Est. Online: <strong className="text-white">{liveStats.onlineUsers}</strong></span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">description</span> Resumes Today: <strong className="text-white">{liveStats.resumesToday}</strong></span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">fact_check</span> ATS Today: <strong className="text-white">{liveStats.atsChecksToday}</strong></span>
            </div>
            <button onClick={fetchLiveStats} className="flex items-center gap-1 hover:text-white border border-[#39ff14] px-2 py-1 text-xs uppercase font-bold transition-colors">
              <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
            </button>
          </div>
        )}

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

        {/* TABS NAVIGATION WITH BRUTALIST HORIZONTAL SCROLLBAR */}
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto border-2 border-black bg-white mb-8 shadow-[4px_4px_0px_0px_#000000] pb-1"
          style={{
            scrollbarWidth: 'auto',
            scrollbarColor: '#39ff14 #000000'
          }}
        >
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setTabValue(idx)}
              className={`whitespace-nowrap shrink-0 min-w-[170px] px-6 py-4 flex items-center justify-center gap-2 font-black uppercase text-sm border-r-2 border-black last:border-r-0 transition-all select-none ${tabValue === idx ? 'bg-[#39ff14] text-black shadow-[inset_0px_-3px_0px_0px_#000]' : 'bg-[#f8f8f8] hover:bg-black hover:text-[#39ff14]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span>{tab.title}</span>
              {tab.badge > 0 && (
                <span className="bg-red-600 text-white px-2 py-0.5 text-xs ml-1 border border-black shadow-[1px_1px_0px_0px_#000] animate-pulse">{tab.badge}</span>
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setPage(0);
                              fetchUsers();
                            }
                          }}
                          className="pl-10 pr-4 py-2 border-2 border-black bg-white focus:outline-none focus:border-[#39ff14] font-bold text-sm uppercase w-full sm:w-64"
                        />
                      </div>
                      <button onClick={() => { setPage(0); fetchUsers(); }} className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#39ff14]">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        <span className="hidden sm:inline">SEARCH</span>
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
                          <th className="p-3 text-left font-bold border-b border-black">LAST ACTIVE</th>
                          <th className="p-3 text-center font-bold border-b border-black">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} onClick={() => fetchUserProfile(user.id)} className="border-b border-gray-300 hover:bg-[#f8f8f8] transition-colors cursor-pointer">
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
                            <td className="p-3 font-mono text-gray-500 text-xs">
                              <span className="material-symbols-outlined text-[14px] align-middle mr-1">history</span>
                              CLICK TO VIEW
                            </td>
                            <td className="p-3" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-center gap-2">
                                {user.role === 'ADMIN' ? (
                                  <button onClick={(e) => { e.stopPropagation(); revokeAdminRole(user.id, user.name); }} className="px-2 py-1 text-xs border border-black bg-black text-white hover:bg-red-500 font-bold uppercase">REVOKE</button>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); grantAdminRole(user.id, user.name); }} className="px-2 py-1 text-xs border border-black bg-white hover:bg-[#39ff14] hover:text-black font-bold uppercase">GRANT ADMIN</button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setDeleteDialogOpen(true); }} className="px-1 py-1 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-600 transition-colors">
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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

              {/* SYSTEM HEALTH TAB (ADVANCED TELEMETRY & DIAGNOSTICS) */}
              {tabValue === 2 && health && (
                <div className="space-y-6">
                  {/* Top Header & Controls */}
                  <div className="border border-black bg-white shadow-[4px_4px_0px_0px_#000000] p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-3xl text-[#39ff14] bg-black p-1">terminal</span>
                          <h2 className="text-2xl font-black tracking-wider uppercase">ADVANCED TELEMETRY & DIAGNOSTICS</h2>
                        </div>
                        <p className="text-xs font-mono text-gray-600 mt-1 uppercase">
                          REAL-TIME CLOUD CLUSTER TELEMETRY • LAST SYNC: {health.system?.timestamp ? new Date(health.system.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setAutoRefreshHealth(!autoRefreshHealth)}
                          className={`px-3 py-1.5 border-2 border-black font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                            autoRefreshHealth ? 'bg-[#39ff14] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-gray-700 hover:bg-black hover:text-white'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full border border-black ${autoRefreshHealth ? 'bg-black animate-ping' : 'bg-gray-400'}`}></span>
                          {autoRefreshHealth ? 'LIVE POLL (10s)' : 'AUTO-POLL: OFF'}
                        </button>
                        <button
                          onClick={fetchHealth}
                          className="px-4 py-1.5 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>sync</span>
                          SYNC TELEMETRY
                        </button>
                      </div>
                    </div>

                    {/* System Overview Hero Gauge Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {/* JVM Memory Gauge */}
                      <div className="border-2 border-black p-4 bg-[#fcfcfc] flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">JVM HEAP MEMORY</div>
                          <div className="text-2xl font-black font-mono mt-1">
                            {health.system?.memory ? `${health.system.memory.usedMb} MB` : 'N/A'}
                            <span className="text-xs text-gray-500 font-normal"> / {health.system?.memory ? `${health.system.memory.maxMb} MB` : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 border border-black h-3 relative">
                            <div
                              className="bg-[#39ff14] h-full border-r border-black transition-all duration-500"
                              style={{ width: `${health.system?.memory?.usagePercent || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono mt-1 font-bold">
                            <span>USAGE: {health.system?.memory?.usagePercent || 0}%</span>
                            <span>FREE: {health.system?.memory?.freeMb || 0} MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Processing Units */}
                      <div className="border-2 border-black p-4 bg-[#fcfcfc] flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">HOST CPU & THREADS</div>
                          <div className="text-2xl font-black font-mono mt-1">
                            {health.system?.processors || '4'} CORES
                          </div>
                        </div>
                        <div className="text-xs font-mono mt-2 bg-black text-[#39ff14] p-1.5 border border-black inline-block font-bold">
                          ACTIVE THREADS: {health.system?.activeThreads || '18'}
                        </div>
                      </div>

                      {/* Database Pool Count */}
                      <div className="border-2 border-black p-4 bg-[#fcfcfc] flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">DATABASE USER POOL</div>
                          <div className="text-2xl font-black font-mono mt-1 text-[#0066cc]">
                            {health.database?.userCount ?? '0'} USERS
                          </div>
                        </div>
                        <div className="text-[10px] font-mono mt-2 text-gray-600 truncate">
                          DIALECT: {health.database?.dialect || 'MySQL (Aiven Cloud)'}
                        </div>
                      </div>

                      {/* Diagnostic Latency */}
                      <div className="border-2 border-black p-4 bg-[#fcfcfc] flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">DIAGNOSTIC ROUNDTRIP</div>
                          <div className="text-2xl font-black font-mono mt-1 text-purple-700">
                            {health.totalCheckDurationMs ?? '0'} ms
                          </div>
                        </div>
                        <div className="text-[10px] font-mono mt-2 text-gray-600">
                          HOST: {health.system?.osName || 'Linux'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Microservice Health Architecture Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Identity Service Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">security</span>
                          IDENTITY & AUTH ENGINE
                        </div>
                        <span className="px-2 py-0.5 bg-[#39ff14] text-black text-[10px] font-black uppercase border border-black">
                          {health.identity?.status || 'UP'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Node ID:</span>
                          <span className="font-bold">identity-service</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">JWT Engine:</span>
                          <span className="font-bold text-[#008000]">{health.identity?.jwtEngine || 'Active (HS256)'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Java Runtime:</span>
                          <span className="font-bold">{health.system?.javaVersion || 'JDK 21'}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        MICROSERVICE PORT: 8081 / DOCKER CONTAINER
                      </div>
                    </div>

                    {/* LaTeX Engine Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">picture_as_pdf</span>
                          LATEX COMPILATION ENGINE
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                          (health.latex?.status === 'UP' || health.latex?.ready) ? 'bg-[#39ff14] text-black' : 'bg-red-600 text-white'
                        }`}>
                          {(health.latex?.status === 'UP' || health.latex?.ready) ? 'OPERATIONAL' : 'SYSTEM FAULT'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Endpoint:</span>
                          <span className="font-bold truncate max-w-[140px]" title="resify-resume-service.onrender.com">Render Cloud</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Compiler Exec:</span>
                          <span className="font-bold text-[#008000]">{health.latex?.compiler || health.latex?.mode || 'pdflatex / tectonic'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Health Check Latency:</span>
                          <span className="font-bold">{health.latex?.latencyMs ?? 'N/A'} ms</span>
                        </div>
                        {health.latex?.error && (
                          <div className="p-2 bg-red-100 border border-red-500 text-red-700 text-[10px] break-words">
                            ERR: {health.latex.error}
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        MICROSERVICE PORT: 8082 / CLOUD ENGINE
                      </div>
                    </div>

                    {/* MySQL Database Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">database</span>
                          CORE DATABASE (MYSQL)
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                          health.database?.status === 'UP' ? 'bg-[#39ff14] text-black' : 'bg-red-600 text-white'
                        }`}>
                          {health.database?.status || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">User Pool Size:</span>
                          <span className="font-bold text-[#008000]">{health.database?.userCount ?? '0'} records</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Query Ping Latency:</span>
                          <span className="font-bold">{health.database?.latencyMs ?? 'N/A'} ms</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Host Cluster:</span>
                          <span className="font-bold truncate max-w-[140px]" title="ats-resify-db-praveensuthar1863-fbe4.c.aivencloud.com">Aiven MySQL Cloud</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        JDBC POOL / SSL ENABLED
                      </div>
                    </div>

                    {/* Redis Cache Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">memory</span>
                          IN-MEMORY CACHE (REDIS)
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                          health.redis?.status === 'UP' ? 'bg-[#39ff14] text-black' : 'bg-red-600 text-white'
                        }`}>
                          {health.redis?.status || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Ping Verification:</span>
                          <span className="font-bold text-[#008000]">{health.redis?.status === 'UP' ? 'PONG (SUCCESS)' : 'FAILED'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Ping Roundtrip:</span>
                          <span className="font-bold">{health.redis?.latencyMs ?? 'N/A'} ms</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Client Driver:</span>
                          <span className="font-bold">Lettuce Async Pool</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        REDIS CLUSTER / CACHE STORE
                      </div>
                    </div>

                    {/* Async Queue Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">queue</span>
                          ASYNC TASK QUEUE
                        </div>
                        <span className="px-2 py-0.5 bg-[#39ff14] text-black text-[10px] font-black uppercase border border-black">
                          {health.queue?.status || 'UP'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Queue Usage:</span>
                          <span className="font-bold">{health.queue?.usage ?? '0'} active tasks</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Worker Threads:</span>
                          <span className="font-bold text-[#008000]">Ready & Waiting</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Execution Timeout:</span>
                          <span className="font-bold">60 seconds limit</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        CONCURRENT COMPILATION QUEUE
                      </div>
                    </div>

                    {/* Host OS Card */}
                    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-between">
                      <div className="p-4 bg-black text-white flex justify-between items-center border-b-2 border-black">
                        <div className="font-mono font-bold text-sm tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#39ff14] text-lg">dns</span>
                          HOST OS & RUNTIME
                        </div>
                        <span className="px-2 py-0.5 bg-[#39ff14] text-black text-[10px] font-black uppercase border border-black">
                          ONLINE
                        </span>
                      </div>
                      <div className="p-4 space-y-2 font-mono text-xs flex-grow bg-[#fafafa]">
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">OS System:</span>
                          <span className="font-bold truncate max-w-[150px]">{health.system?.osName || 'Linux'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Active Threads:</span>
                          <span className="font-bold text-[#008000]">{health.system?.activeThreads || '18'} threads</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-1">
                          <span className="text-gray-500">Processors:</span>
                          <span className="font-bold">{health.system?.processors || '4'} Logical Cores</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-100 border-t border-black text-[10px] font-mono text-center text-gray-600">
                        CONTAINER ENCAPSULATED
                      </div>
                    </div>
                  </div>

                  {/* Raw Telemetry Terminal Section */}
                  <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000]">
                    <div
                      onClick={() => setShowRawTelemetry(!showRawTelemetry)}
                      className="p-4 bg-black text-[#39ff14] flex justify-between items-center cursor-pointer select-none hover:bg-gray-900 transition-colors"
                    >
                      <div className="font-mono font-bold text-sm uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined">code</span>
                        RAW JSON TELEMETRY & DIAGNOSTIC DUMP
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">
                          {showRawTelemetry ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}
                        </span>
                        <span className="material-symbols-outlined">{showRawTelemetry ? 'expand_less' : 'expand_more'}</span>
                      </div>
                    </div>

                    {showRawTelemetry && (
                      <div className="p-4 bg-black border-t-2 border-[#39ff14] relative">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(health, null, 2));
                            alert('Telemetry copied to clipboard!');
                          }}
                          className="absolute top-4 right-4 px-3 py-1 bg-[#39ff14] text-black font-mono font-bold text-xs uppercase border border-black hover:bg-white transition-colors flex items-center gap-1 shadow-[2px_2px_0px_0px_#fff]"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span> COPY JSON
                        </button>
                        <pre className="font-mono text-xs text-[#39ff14] overflow-x-auto max-h-[450px] pr-24 leading-relaxed">
                          {JSON.stringify(health, null, 2)}
                        </pre>
                      </div>
                    )}
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
                    <div className="flex gap-4">
                      <button onClick={exportResumes} className="px-3 py-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#000]">
                        <span className="material-symbols-outlined text-[16px]">download</span> EXPORT
                      </button>
                      <button onClick={fetchResumes} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                        <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">USER</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">TEMPLATE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">CANDIDATE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">PREVIEW</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">DATE_CREATED</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">ACTION</th>
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
                            <td className="p-3">
                              <div className="font-bold uppercase text-xs">{resume.candidateName || '—'}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-[10px] font-mono text-gray-500 max-w-[150px] truncate">
                                {resume.resumeJson ? 'JSON STORED' : 'NO DATA'}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-xs">{new Date(resume.createdAt).toLocaleString()}</td>
                            <td className="p-3">
                              <button onClick={() => fetchResumeDetails(resume.id)} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:shadow-none translate-y-0 active:translate-y-[2px]">
                                VIEW
                              </button>
                            </td>
                          </tr>
                        ))}
                        {resumes.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center uppercase font-bold text-gray-400">NO RESUMES FOUND</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalResumes} page={resumePage} setPage={setResumePage} rowsPerPage={resumeRowsPerPage} setRowsPerPage={setResumeRowsPerPage} />
                </div>
              )}

              {/* ATS CHECKS TAB */}
              {tabValue === 5 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase">ATS ANALYSES [{totalAtsChecks}]</h2>
                    <button onClick={fetchAtsChecks} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-black shadow-[2px_2px_0px_0px_#000000] bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f0f0] border-b border-black">
                        <tr>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">CANDIDATE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">SCORE</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">TARGET_JOB</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">SNIPPET</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">DATE_LOGGED</th>
                          <th className="p-3 text-left font-bold border-b border-black uppercase">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atsChecks.map((check) => (
                          <tr key={check.id} className="border-b border-gray-300 hover:bg-[#f8f8f8]">
                            <td className="p-3">
                              <div className="font-bold uppercase">{check.userName}</div>
                              <div className="text-xs lowercase text-gray-500">{check.email}</div>
                            </td>
                            <td className="p-3">
                              <div className={`font-black text-lg ${check.atsScore >= 80 ? 'text-[#39ff14]' : check.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {check.atsScore || '—'}<span className="text-xs text-gray-400">/100</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {check.jobDescriptionProvided ? (
                                <span className="px-2 py-1 bg-black text-[#39ff14] font-bold text-[10px] uppercase">PROVIDED</span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 font-bold text-[10px] uppercase">NONE</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="text-[10px] font-mono text-gray-500 max-w-[200px] truncate">
                                {check.resumeSnippet || 'NO TEXT'}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-xs">{new Date(check.createdAt).toLocaleString()}</td>
                            <td className="p-3">
                              <button onClick={() => fetchAtsCheckDetails(check.id)} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:shadow-none translate-y-0 active:translate-y-[2px]">
                                REPORT
                              </button>
                            </td>
                          </tr>
                        ))}
                        {atsChecks.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center uppercase font-bold text-gray-400">NO ATS CHECKS FOUND</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination total={totalAtsChecks} page={atsCheckPage} setPage={setAtsCheckPage} rowsPerPage={atsCheckRowsPerPage} setRowsPerPage={setAtsCheckRowsPerPage} />
                </div>
              )}

              {/* FEEDBACK TAB */}
              {tabValue === 6 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase">USER FEEDBACK [{totalFeedbacks}]</h2>
                    <button onClick={() => { fetchFeedbacks(); fetchFeedbackSummary(); }} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                    </button>
                  </div>

                  {feedbackSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-center items-center text-center">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-2">AVERAGE RATING</div>
                        <div className="text-6xl font-black text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>
                          {feedbackSummary.averageRating.toFixed(1)}
                        </div>
                        <div className="flex text-[#39ff14] bg-black px-2 py-1 mt-4">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`material-symbols-outlined ${s <= Math.round(feedbackSummary.averageRating) ? '' : 'opacity-30'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        <div className="text-xs font-bold uppercase mt-4 text-gray-600">
                          {((feedbackSummary.withMessageCount / feedbackSummary.totalFeedback) * 100 || 0).toFixed(0)}% INCLUDE MESSAGES
                        </div>
                      </div>
                      
                      <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-4 text-center">RATING DISTRIBUTION</div>
                        <div className="space-y-3">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = feedbackSummary.ratingDistribution[star] || 0;
                            const total = feedbackSummary.totalFeedback || 1;
                            const percentage = (count / total) * 100;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="font-bold w-12 flex items-center justify-end">{star} <span className="material-symbols-outlined text-[14px]">star</span></span>
                                <div className="flex-1 h-4 bg-gray-200 border border-black">
                                  <div className="h-full bg-[#39ff14] border-r border-black" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span className="font-mono text-xs w-8 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
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
              {tabValue === 7 && (
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

              {/* ENGAGEMENT TAB */}
              {tabValue === 8 && engagementStats && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold uppercase">USER ENGAGEMENT & RETENTION</h2>
                    <div className="flex gap-4">
                      <button onClick={exportAnalytics} className="px-3 py-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#000]">
                        <span className="material-symbols-outlined text-[16px]">download</span> EXPORT
                      </button>
                      <button onClick={fetchEngagementStats} className="px-3 py-1 border-2 border-black bg-black text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors flex items-center gap-2 font-bold text-sm">
                        <span className="material-symbols-outlined text-[16px]">refresh</span> SYNC
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000]">
                      <h3 className="font-bold text-lg uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">favorite</span> RETENTION COHORTS
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold uppercase text-gray-500">DAU / MAU</div>
                          <div className="text-3xl font-black text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>
                            {engagementStats.dauMauRatio.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase text-gray-500">POWER USERS (&gt;5 Resumes)</div>
                          <div className="text-3xl font-black">{engagementStats.powerUsers}</div>
                        </div>
                        <div className="col-span-2 mt-2">
                          <div className="text-xs font-bold uppercase text-gray-500 mb-2">LAST 30 DAYS RETENTION</div>
                          <div className="w-full h-8 bg-gray-200 border-2 border-black relative">
                            <div className="absolute top-0 left-0 h-full bg-black flex items-center pl-2 text-[#39ff14] font-bold text-xs" style={{ width: `${engagementStats.retentionRate}%` }}>
                              {engagementStats.retentionRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_#000]">
                      <h3 className="font-bold text-lg uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">api</span> FEATURE USAGE
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span>RESUME BUILDER</span>
                            <span>{engagementStats.featureUsage.resumeBuilder} USERS</span>
                          </div>
                          <div className="w-full h-4 border border-black bg-gray-100">
                            <div className="h-full bg-[#39ff14] border-r border-black" style={{ width: `${(engagementStats.featureUsage.resumeBuilder / (engagementStats.dauMauRatio > 0 ? 100 : 1)) * 100}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span>ATS SCANNER</span>
                            <span>{engagementStats.featureUsage.atsScanner} USERS</span>
                          </div>
                          <div className="w-full h-4 border border-black bg-gray-100">
                            <div className="h-full bg-black border-r border-black" style={{ width: `${(engagementStats.featureUsage.atsScanner / (engagementStats.dauMauRatio > 0 ? 100 : 1)) * 100}%` }}></div>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mt-4 leading-tight">
                          FEATURE USAGE TRACKS UNIQUE USERS ENGAGING WITH SPECIFIC TOOLS IN THE LAST 30 DAYS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: AI OPS STUDIO */}
              {tabValue === 9 && (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-[#39ff14] bg-black p-1">auto_awesome</span>
                      AI OPERATIONS & PROMPT STUDIO
                    </h2>
                    <button onClick={fetchAiPrompts} className="px-4 py-2 border-2 border-black bg-[#39ff14] font-bold text-sm shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-[#39ff14] transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">refresh</span> SYNC PROMPTS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {aiPrompts.map((p) => (
                      <div key={p.id} className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-black pb-3">
                          <div>
                            <span className="bg-black text-[#39ff14] font-mono font-bold px-2 py-0.5 text-xs mr-2 uppercase">{p.promptKey}</span>
                            <strong className="text-lg font-black uppercase">{p.promptName}</strong>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs font-bold">
                              <span>MODEL:</span>
                              <input
                                type="text"
                                defaultValue={p.modelName}
                                onBlur={(e) => updateAiPrompt(p.id, { modelName: e.target.value })}
                                className="border border-black px-2 py-1 bg-gray-50 font-mono font-bold w-36"
                              />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold">
                              <span>TEMP:</span>
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={p.temperature}
                                onBlur={(e) => updateAiPrompt(p.id, { temperature: parseFloat(e.target.value) })}
                                className="border border-black px-2 py-1 bg-gray-50 font-mono font-bold w-20"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">SYSTEM PROMPT (LIVE ENGINE INSTRUCTIONS):</label>
                          <textarea
                            defaultValue={p.systemPrompt}
                            onBlur={(e) => updateAiPrompt(p.id, { systemPrompt: e.target.value })}
                            rows={4}
                            className="w-full border-2 border-black p-3 font-mono text-sm bg-[#f8f8f8] focus:bg-white focus:outline-none focus:border-[#39ff14]"
                          />
                        </div>
                        <div className="text-right text-xs font-bold text-gray-400">
                          LAST UPDATED: {new Date(p.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: SECURITY & THREATS */}
              {tabValue === 10 && (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-3xl bg-red-600 text-white p-1">shield_lock</span>
                      SECURITY DEFENSE & COMPLIANCE
                    </h2>
                    <div className="flex gap-4">
                      <a
                        href={`${API_BASE_URL}/admin/export/audit-logs`}
                        className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-2 font-bold text-sm shadow-[2px_2px_0px_0px_#000]"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span> EXPORT AUDIT LOGS (CSV)
                      </a>
                      <button onClick={fetchSecurityAlerts} className="px-4 py-2 border-2 border-black bg-[#39ff14] font-bold text-sm shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-[#39ff14] transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">refresh</span> REFRESH ALERTS
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden">
                    <div className="bg-black text-[#39ff14] p-3 font-black text-sm uppercase flex justify-between">
                      <span>LIVE THREAT AUDIT & RATE-LIMIT ALERTS</span>
                      <span>TOTAL ALERTS: {securityAlerts.length}</span>
                    </div>
                    {securityAlerts.length === 0 ? (
                      <div className="p-8 text-center font-bold text-gray-500 uppercase">NO SECURITY ALERTS REGISTERED IN THIS EPOCH. SYSTEM SECURE.</div>
                    ) : (
                      <div className="divide-y divide-black">
                        {securityAlerts.map((a) => (
                          <div key={a.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 text-xs font-black uppercase border border-black ${a.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-yellow-400 text-black'}`}>
                                {a.severity}
                              </span>
                              <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 border border-black text-xs">{a.ipAddress}</span>
                              <strong className="uppercase font-bold text-sm">{a.alertType}</strong>
                              <span className="text-gray-600 text-xs font-mono">- {a.details}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 font-mono whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 11: FLAGS & QUOTAS */}
              {tabValue === 11 && (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-3xl bg-black text-[#39ff14] p-1">tune</span>
                      FEATURE FLAGS & DYNAMIC TIERS
                    </h2>
                    <button onClick={() => { fetchFeatureFlags(); fetchTierConfigs(); }} className="px-4 py-2 border-2 border-black bg-[#39ff14] font-bold text-sm shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-[#39ff14] transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">refresh</span> SYNC CONFIGS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* FEATURE FLAGS */}
                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
                      <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2 flex items-center justify-between">
                        <span>LIVE FEATURE TOGGLES</span>
                        <span className="text-xs bg-black text-[#39ff14] px-2 py-0.5">CANARY CONTROL</span>
                      </h3>
                      <div className="space-y-4">
                        {featureFlags.map((f) => (
                          <div key={f.id} className="border border-black p-4 bg-[#f8f8f8] flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong className="uppercase text-sm font-black">{f.flagName}</strong>
                                <span className="block font-mono text-xs text-gray-500">{f.flagKey}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateFeatureFlag(f.id, { enabledGlobal: !f.enabledGlobal })}
                                  className={`px-3 py-1 font-bold text-xs uppercase border border-black transition-colors ${f.enabledGlobal ? 'bg-[#39ff14] text-black shadow-[inset_0px_-2px_0px_0px_#000]' : 'bg-gray-300 text-gray-600'}`}
                                >
                                  GLOBAL: {f.enabledGlobal ? 'ON' : 'OFF'}
                                </button>
                                <button
                                  onClick={() => updateFeatureFlag(f.id, { enabledProOnly: !f.enabledProOnly })}
                                  className={`px-3 py-1 font-bold text-xs uppercase border border-black transition-colors ${f.enabledProOnly ? 'bg-black text-[#39ff14]' : 'bg-gray-200 text-gray-600'}`}
                                >
                                  PRO ONLY: {f.enabledProOnly ? 'YES' : 'NO'}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 font-mono">{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TIER QUOTA CONTROLLER */}
                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]">
                      <h3 className="font-black text-lg uppercase mb-4 border-b-2 border-black pb-2 flex items-center justify-between">
                        <span>TIER QUOTA CONTROLLER</span>
                        <span className="text-xs bg-black text-[#39ff14] px-2 py-0.5">LIMITS ENGINE</span>
                      </h3>
                      <div className="space-y-4">
                        {tierConfigs.map((t) => (
                          <div key={t.id} className="border border-black p-4 bg-[#f8f8f8] space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                              <span className="font-black text-base uppercase bg-black text-white px-3 py-0.5">{t.tierName} TIER</span>
                              <span className="text-xs font-mono font-bold text-gray-500">UPDATED: {new Date(t.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                              <div>
                                <label className="block text-gray-600 uppercase mb-1">MAX RESUMES / MO:</label>
                                <input
                                  type="number"
                                  defaultValue={t.maxResumesPerMonth}
                                  onBlur={(e) => updateTierConfig(t.id, { maxResumesPerMonth: parseInt(e.target.value) })}
                                  className="border border-black p-1.5 w-full bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-600 uppercase mb-1">MAX ATS / DAY:</label>
                                <input
                                  type="number"
                                  defaultValue={t.maxAtsChecksPerDay}
                                  onBlur={(e) => updateTierConfig(t.id, { maxAtsChecksPerDay: parseInt(e.target.value) })}
                                  className="border border-black p-1.5 w-full bg-white font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">ALLOWED AI MODEL:</label>
                              <input
                                type="text"
                                defaultValue={t.aiModelAllowed}
                                onBlur={(e) => updateTierConfig(t.id, { aiModelAllowed: e.target.value })}
                                className="border border-black p-1.5 w-full bg-white font-mono text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: SQL & LOGS STUDIO */}
              {tabValue === 12 && (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-3xl bg-black text-[#39ff14] p-1">terminal</span>
                      SQL SANDBOX & LIVE LOGS STUDIO
                    </h2>
                    <button onClick={fetchLiveLogs} className="px-4 py-2 border-2 border-black bg-[#39ff14] font-bold text-sm shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-[#39ff14] transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">refresh</span> TAIL LOGS
                    </button>
                  </div>

                  {/* SQL QUERY SANDBOX */}
                  <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000] mb-8">
                    <h3 className="font-black text-sm uppercase bg-black text-[#39ff14] p-2 inline-block mb-3">READ-ONLY SQL QUERY STUDIO (PRESET SAFE QUERIES)</h3>
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex flex-col md:flex-row gap-3">
                        <select
                          value={sqlQueryInput}
                          onChange={(e) => setSqlQueryInput(e.target.value)}
                          className="w-full md:flex-1 min-w-0 max-w-full border-2 border-black p-3 font-mono text-sm font-bold bg-[#f8f8f8] focus:bg-white focus:outline-none focus:border-[#39ff14] cursor-pointer truncate"
                        >
                          {PRESET_SQL_QUERIES.map((item, idx) => (
                            <option key={idx} value={item.query} className="font-mono py-1">
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={runSqlQuery}
                          className="px-6 py-3 border-2 border-black bg-black text-[#39ff14] font-black uppercase hover:bg-[#39ff14] hover:text-black transition-colors flex items-center justify-center gap-2 shrink-0"
                        >
                          <span className="material-symbols-outlined">play_arrow</span> EXECUTE QUERY
                        </button>
                      </div>
                      <div className="bg-black text-[#39ff14] p-2 font-mono text-xs overflow-x-auto border border-gray-800 flex items-center gap-2">
                        <span className="text-gray-400 font-bold shrink-0">[ACTIVE QUERY]:</span>
                        <code className="whitespace-nowrap">{sqlQueryInput}</code>
                      </div>
                    </div>

                    {sqlError && (
                      <div className="border border-red-600 bg-red-100 text-red-700 p-3 text-xs font-bold font-mono uppercase mb-4">
                        [SQL ERROR]: {sqlError}
                      </div>
                    )}

                    {sqlResults && (
                      <div className="overflow-x-auto border border-black bg-gray-50 max-h-64 overflow-y-auto">
                        {sqlResults.length === 0 ? (
                          <div className="p-4 text-xs font-bold font-mono text-gray-500 uppercase">QUERY EXECUTED SUCCESSFULLY. 0 ROWS RETURNED.</div>
                        ) : (
                          <table className="w-full text-left font-mono text-xs border-collapse">
                            <thead>
                              <tr className="bg-black text-[#39ff14] border-b border-black">
                                {Object.keys(sqlResults[0]).map((key) => (
                                  <th key={key} className="p-2 border-r border-gray-700 uppercase">{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                              {sqlResults.map((row, idx) => (
                                <tr key={idx} className="hover:bg-[#39ff14]/20">
                                  {Object.keys(row).map((key) => (
                                    <td key={key} className="p-2 border-r border-gray-300 whitespace-nowrap">
                                      {row[key] !== null ? row[key].toString() : 'NULL'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LIVE TERMINAL LOGS STREAM */}
                  <div className="border-2 border-black bg-[#0d0d0d] shadow-[4px_4px_0px_0px_#000] p-4 font-mono text-xs text-[#39ff14]">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3 text-gray-400 font-bold">
                      <span>[LIVE TAIL]: MICROSERVICES LOG BUFFER</span>
                      <span>BUFFER SIZE: {liveLogs.length} EVENTS</span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {liveLogs.map((log, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 border-l-2 border-[#39ff14] pl-2 hover:bg-gray-900/50 py-1">
                          <span className="text-gray-500 whitespace-nowrap">[{log.timestamp}]</span>
                          <span className="bg-gray-800 text-white px-1.5 font-bold uppercase">{log.service}</span>
                          <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-400' : 'text-[#39ff14]'}`}>[{log.level}]</span>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))}
                    </div>
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
      
      {/* RESUME VIEWER DRAWER */}
      <ResumeDrawer />
      {resumeDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setResumeDrawerOpen(false)}></div>}
      {/* ATS VIEWER DRAWER */}
      <AtsDrawer />
      {atsDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setAtsDrawerOpen(false)}></div>}
      {/* USER PROFILE DRAWER */}
      <UserProfileDrawer />
      {userProfileDrawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setUserProfileDrawerOpen(false)}></div>}
    </div>
  );
};

export default AdminPanel;
