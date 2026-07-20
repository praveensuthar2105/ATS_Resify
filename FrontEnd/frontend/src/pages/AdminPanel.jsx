import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getAuthHeaders } from '../utils/auth';
import { API_BASE_URL } from '../services/api';

// ─── Theme Colors aligned with Aurora Glassmorphic Design System ──────────────
const CHART_COLORS = ['#14B8A6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'];

const ACCENT = {
  teal:    { text: 'text-teal-700',    soft: 'text-teal-500',    bg: 'bg-teal-50',    border: 'border-teal-100',    ring: 'from-teal-400 to-emerald-500', iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500' },
  emerald: { text: 'text-emerald-700', soft: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'from-emerald-400 to-teal-500',    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  indigo:  { text: 'text-indigo-700',  soft: 'text-indigo-500',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  ring: 'from-indigo-400 to-violet-500',  iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-500' },
  amber:   { text: 'text-amber-700',   soft: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100',   ring: 'from-amber-400 to-orange-500',   iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  rose:    { text: 'text-rose-700',    soft: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-100',    ring: 'from-rose-400 to-pink-500',      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500' },
  violet:  { text: 'text-violet-700',  soft: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-100',  ring: 'from-violet-400 to-indigo-500',  iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-500' },
  slate:   { text: 'text-slate-700',   soft: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-100',   ring: 'from-slate-400 to-slate-500',    iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600' },
};

const PRESET_SQL_QUERIES = [
  { label: "Recent Users (Top 25)", query: "SELECT id, name, email, role, provider, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 25;" },
  { label: "Recent Resumes (Top 25)", query: "SELECT id, user_id, candidate_name, template_type, created_at FROM resumes ORDER BY created_at DESC LIMIT 25;" },
  { label: "Recent ATS Checks (Top 25)", query: "SELECT id, user_id, ats_score, job_description_provided, file_name, created_at FROM ats_checks ORDER BY created_at DESC LIMIT 25;" },
  { label: "AI System Prompts", query: "SELECT id, prompt_key, prompt_name, model_name, temperature, updated_at FROM ai_prompts;" },
  { label: "Feature Flags", query: "SELECT id, flag_key, flag_name, enabled_global, enabled_pro_only, updated_at FROM feature_flags;" },
  { label: "Tier Quotas & Limits", query: "SELECT id, tier_name, max_resumes_per_month, max_ats_checks_per_day, ai_model_allowed FROM tier_configs;" },
  { label: "Security & Threat Alerts (Top 50)", query: "SELECT id, alert_type, ip_address, severity, details, created_at FROM security_alerts ORDER BY created_at DESC LIMIT 50;" },
  { label: "User Distribution by Role", query: "SELECT role, COUNT(*) as total_users FROM users GROUP BY role;" },
  { label: "Resume Creation by Template", query: "SELECT template_type, COUNT(*) as total_resumes FROM resumes GROUP BY template_type;" },
  { label: "Contact & Feedback Messages", query: "SELECT id, name, email, subject, is_read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 25;" }
];

// ─── Shared Style Helpers (Aurora glass system) ───────────────────────────────
const glassCard = "bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.07)]";
const frostPanel = "bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] border border-white/80 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.05)]";
const tealBtn = "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm shadow-[0_4px_16px_rgba(20,184,166,0.3)] hover:shadow-[0_8px_24px_rgba(20,184,166,0.4)] hover:-translate-y-0.5 transition-all duration-200";
const ghostBtn = "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-slate-200/80 text-slate-700 font-semibold text-sm hover:bg-white hover:border-teal-300 hover:text-teal-700 transition-all duration-200";
const dangerBtn = "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-200";
const tableBase = "w-full text-sm border-collapse";
const thBase = "px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 border-b border-slate-100";
const tdBase = "px-4 py-3 text-sm text-slate-700 border-b border-slate-50 group-hover:bg-teal-50/30 transition-colors";
const inputBase = "w-full px-3 py-2 rounded-lg bg-white/70 border border-slate-200 text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all duration-200";
const sectionTitle = "font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2";

const AdminPanel = () => {
  const tabsContainerRef = useRef(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(20);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [feedbackRowsPerPage, setFeedbackRowsPerPage] = useState(20);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [contactPage, setContactPage] = useState(0);
  const [contactRowsPerPage, setContactRowsPerPage] = useState(20);
  const [totalContacts, setTotalContacts] = useState(0);
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [resumePage, setResumePage] = useState(0);
  const [resumeRowsPerPage, setResumeRowsPerPage] = useState(20);
  const [totalResumes, setTotalResumes] = useState(0);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);
  const [atsChecks, setAtsChecks] = useState([]);
  const [atsCheckPage, setAtsCheckPage] = useState(0);
  const [atsCheckRowsPerPage, setAtsCheckRowsPerPage] = useState(20);
  const [totalAtsChecks, setTotalAtsChecks] = useState(0);
  const [selectedAtsCheck, setSelectedAtsCheck] = useState(null);
  const [atsDrawerOpen, setAtsDrawerOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState('signups');
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileDrawerOpen, setUserProfileDrawerOpen] = useState(false);
  const [engagementStats, setEngagementStats] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [showRawTelemetry, setShowRawTelemetry] = useState(false);
  const [autoRefreshHealth, setAutoRefreshHealth] = useState(false);
  const [aiPrompts, setAiPrompts] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [tierConfigs, setTierConfigs] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [sqlQueryInput, setSqlQueryInput] = useState(PRESET_SQL_QUERIES[0].query);
  const [sqlResults, setSqlResults] = useState(null);
  const [sqlError, setSqlError] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => { verifyAdmin(); }, []);

  useEffect(() => {
    if (currentUserRole === 'ADMIN' && tabValue === 3 && autoRefreshHealth) {
      const timer = setInterval(() => { fetchHealth(); }, 10000);
      return () => clearInterval(timer);
    }
  }, [currentUserRole, tabValue, autoRefreshHealth]);

  useEffect(() => {
    if (currentUserRole === 'ADMIN') {
      if (tabValue === 0) fetchDashboardData();
      else if (tabValue === 1) fetchUsers();
      else if (tabValue === 2) fetchAnalytics();
      else if (tabValue === 3) fetchHealth();
      else if (tabValue === 4) fetchAuditLogs();
      else if (tabValue === 5) fetchResumes();
      else if (tabValue === 6) fetchAtsChecks();
      else if (tabValue === 7) { fetchFeedbacks(); fetchFeedbackSummary(); }
      else if (tabValue === 8) fetchContacts();
      else if (tabValue === 9) fetchEngagementStats();
      else if (tabValue === 10) fetchAiPrompts();
      else if (tabValue === 11) fetchSecurityAlerts();
      else if (tabValue === 12) { fetchFeatureFlags(); fetchTierConfigs(); }
      else if (tabValue === 13) fetchLiveLogs();
    }
  }, [currentUserRole, tabValue, page, rowsPerPage, orderBy, order, auditPage, auditRowsPerPage, feedbackPage, feedbackRowsPerPage, contactPage, contactRowsPerPage, resumePage, resumeRowsPerPage, atsCheckPage, atsCheckRowsPerPage]);

  const fetchLiveStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/live-stats`, { headers: getAuthHeaders() });
      if (response.ok) { const data = await response.json(); setLiveStats(data); }
    } catch (err) { console.error('Live stats error', err); }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [statsRes, healthRes, liveRes, usersRes, contactsRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/system-health`, { headers }),
        fetch(`${API_BASE_URL}/admin/live-stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users?page=0&size=1`, { headers }),
        fetch(`${API_BASE_URL}/admin/contacts?page=0&size=5&sort=createdAt,desc`, { headers }),
        fetch(`${API_BASE_URL}/admin/security/alerts`, { headers }),
      ]);
      if (statsRes.ok) setAnalytics(await statsRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
      if (liveRes.ok) setLiveStats(await liveRes.json());
      if (usersRes.ok) {
        const d = await usersRes.json();
        setTotalUsers(d.totalElements || 0);
      }
      if (contactsRes.ok) {
        const d = await contactsRes.json();
        setUnreadContacts(d.unreadCount || 0);
        setContacts(d.content || []);
      }
      if (alertsRes.ok) {
        const d = await alertsRes.json();
        setSecurityAlerts(Array.isArray(d) ? d : (d.content || d.alerts || []));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (currentUserRole === 'ADMIN') fetchLiveStats(); }, [currentUserRole]);

  const verifyAdmin = async () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'ADMIN') { setError('ACCESS DENIED. ADMIN ROLE REQUIRED.'); setLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Authentication failed');
      const userData = await response.json();
      if (userData.role !== 'ADMIN') { localStorage.setItem('userRole', userData.role); setError('ACCESS DENIED. ADMIN PRIVILEGES HAVE BEEN REVOKED.'); setLoading(false); return; }
      setCurrentUserRole('ADMIN');
      setLoading(false);
    } catch { setError('FAILED TO VERIFY ADMIN STATUS'); setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const sortParam = `${orderBy},${order}`;
      let url = `${API_BASE_URL}/admin/users?page=${page}&size=${rowsPerPage}&sort=${sortParam}`;
      if (searchQuery && searchQuery.trim() !== '') url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.content || []);
      setTotalUsers(data.totalElements || 0);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system-health`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchResumeDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resumes/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch resume details');
      const data = await response.json();
      setSelectedResume(data);
      setResumeDrawerOpen(true);
    } catch (err) { setError(err.message); }
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchAtsCheckDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ats-checks/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch ATS details');
      const data = await response.json();
      setSelectedAtsCheck(data);
      setAtsDrawerOpen(true);
    } catch (err) { setError(err.message); }
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
      setSuccess('Feedback deleted successfully');
      fetchFeedbacks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const deleteContact = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/contacts/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setSuccess('Contact message deleted successfully');
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
      if (response.ok) { const data = await response.json(); setFeedbackSummary(data); }
    } catch (err) { console.error(err); }
  };

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

  const fetchAiPrompts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai-prompts`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setAiPrompts(data || []);
    } catch (err) { console.error('fetchAiPrompts error:', err); setError(`Failed to fetch AI Prompts: ${err.message}`); }
  };

  const updateAiPrompt = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai-prompts/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('AI Prompt updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchAiPrompts();
    } catch (err) { setError(`Failed to update AI Prompt: ${err.message}`); }
  };

  const fetchFeatureFlags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feature-flags`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setFeatureFlags(data || []);
    } catch (err) { setError(`Failed to fetch Feature Flags: ${err.message}`); }
  };

  const updateFeatureFlag = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feature-flags/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('Feature flag updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchFeatureFlags();
    } catch (err) { setError(`Failed to update Feature Flag: ${err.message}`); }
  };

  const fetchTierConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tier-configs`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setTierConfigs(data || []);
    } catch (err) { setError(`Failed to fetch Tier Configs: ${err.message}`); }
  };

  const updateTierConfig = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tier-configs/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      await parseResponseOrError(res);
      setSuccess('Tier config updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchTierConfigs();
    } catch (err) { setError(`Failed to update Tier Config: ${err.message}`); }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/security/alerts`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setSecurityAlerts(data || []);
    } catch (err) { setError(`Failed to fetch Security Alerts: ${err.message}`); }
  };

  const fetchLiveLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/logs`, { headers: getAuthHeaders() });
      const data = await parseResponseOrError(res);
      setLiveLogs(data || []);
    } catch (err) { setError(`Failed to fetch Live Logs: ${err.message}`); }
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
    } catch (err) { setSqlError(err.message); }
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
      a.href = url; a.download = 'users.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { setError(err.message); }
  };

  const exportResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/resumes`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to export resumes');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'resumes_export.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { setError(err.message); }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export/analytics`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to export analytics');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'analytics_summary.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { setError(err.message); }
  };

  const grantAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/grant-admin/${userId}`, { method: 'PUT', headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to grant admin role');
      setSuccess(`Admin status granted to ${userName}`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const revokeAdminRole = async (userId, userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/revoke-admin/${userId}`, { method: 'PUT', headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to revoke admin role');
      setSuccess(`Admin status revoked from ${userName}`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete-user/${userToDelete.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to delete user');
      setSuccess(`User "${userToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); setDeleteDialogOpen(false); }
  };

  // ─── Reusable Sub-components ────────────────────────────────────────────────

  const MetricCard = ({ title, value, sub, icon, accent = 'teal', onClick }) => {
    const a = ACCENT[accent] || ACCENT.teal;
    return (
      <div
        onClick={onClick}
        className={`${frostPanel} p-5 flex items-start justify-between gap-3 group hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(20,184,166,0.12)] hover:border-teal-200/60 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{title}</div>
          <div className={`text-3xl font-bold font-['Space_Grotesk',_sans-serif] ${a.text} leading-none tabular-nums`}>
            {value ?? '—'}
          </div>
          {sub != null && sub !== '' && (
            <div className="text-xs text-slate-500 mt-2 font-medium truncate">{sub}</div>
          )}
        </div>
        <div className={`w-11 h-11 shrink-0 rounded-2xl ${a.iconBg} flex items-center justify-center shadow-md shadow-teal-500/15 group-hover:scale-105 transition-transform`}>
          <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status, label }) => {
    const isUp = status === 'UP' || status === true;
    const isUnknown = status === 'UNKNOWN' || status == null;
    if (isUnknown) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          {label || 'Unknown'}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isUp ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        {label || (isUp ? 'Operational' : 'Down')}
      </span>
    );
  };

  const ServiceStatusPill = ({ name, status, latency }) => {
    const isUp = status === 'UP' || status === true;
    const isUnknown = status === 'UNKNOWN' || status == null;
    return (
      <div className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
        isUnknown ? 'bg-slate-50 border-slate-200' : isUp ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isUnknown ? 'bg-slate-400' : isUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-slate-700 truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {latency != null && latency !== '' && (
            <span className="text-[10px] font-mono text-slate-400">{latency}</span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wide ${isUnknown ? 'text-slate-500' : isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUnknown ? 'N/A' : isUp ? 'UP' : 'DOWN'}
          </span>
        </div>
      </div>
    );
  };

  const Pagination = ({ total, page, setPage, rowsPerPage, setRowsPerPage }) => {
    const totalPages = Math.ceil(total / rowsPerPage);
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2 gap-3">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-700">{page * rowsPerPage + 1}</span>–<span className="font-semibold text-slate-700">{Math.min((page + 1) * rowsPerPage, total)}</span> of <span className="font-semibold text-slate-700">{total}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            className="px-3 py-1.5 rounded-lg bg-white/70 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/70 border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-600">{page + 1} / {totalPages || 1}</span>
            <button
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/70 border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
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
        className={`${thBase} cursor-pointer hover:text-teal-600 hover:bg-teal-50/50 transition-colors whitespace-nowrap`}
        onClick={() => handleRequestSort(property)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive && (
            <span className="material-symbols-outlined text-[14px] text-teal-500">
              {order === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // ─── DRAWER COMPONENTS ────────────────────────────────────────────────────────

  const ResumeDrawer = () => {
    if (!selectedResume || !resumeDrawerOpen) return null;
    let resumeData = null;
    if (selectedResume.resumeJson) {
      try { resumeData = JSON.parse(selectedResume.resumeJson); } catch (e) { console.error("Failed to parse resume JSON", e); }
    }
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[580px] bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-[-20px_0_60px_rgba(15,23,42,0.1)] z-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-5 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            Resume Details
          </h2>
          <button onClick={() => setResumeDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`${glassCard} p-4`}>
              <div className="text-xs font-semibold text-slate-500 mb-1">Generated By</div>
              <div className="font-semibold text-slate-800">{selectedResume.userName}</div>
              <div className="text-xs text-slate-500">{selectedResume.email}</div>
            </div>
            <div className={`${glassCard} p-4`}>
              <div className="text-xs font-semibold text-slate-500 mb-1">Metadata</div>
              <div className="text-sm font-semibold text-slate-700 mb-1">
                Template: <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 text-xs font-semibold">{selectedResume.templateType}</span>
              </div>
              <div className="text-xs text-slate-500">{new Date(selectedResume.createdAt).toLocaleString()}</div>
            </div>
          </div>
          {!resumeData ? (
            <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-3 opacity-40">data_alert</span>
              <p className="font-semibold text-sm">No Resume Content Stored</p>
              <p className="text-xs mt-1 text-center">This resume was generated before content persistence was enabled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { title: 'Personal Info', icon: 'person', content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-xs text-slate-500 font-medium block">Name</span>{resumeData?.personalInformation?.fullName || resumeData?.name || '—'}</div>
                    <div><span className="text-xs text-slate-500 font-medium block">Email</span>{resumeData?.personalInformation?.email || resumeData?.email || '—'}</div>
                    <div><span className="text-xs text-slate-500 font-medium block">Phone</span>{resumeData?.personalInformation?.phoneNumber || resumeData?.phone || '—'}</div>
                    <div><span className="text-xs text-slate-500 font-medium block">Location</span>{resumeData?.personalInformation?.location || resumeData?.address || '—'}</div>
                  </div>
                )},
              ].map(sec => (
                <div key={sec.title} className={glassCard}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                    <span className="material-symbols-outlined text-teal-500 text-sm">{sec.icon}</span>
                    <span className="font-semibold text-sm text-slate-700">{sec.title}</span>
                  </div>
                  <div className="p-4">{sec.content}</div>
                </div>
              ))}
              {resumeData.summary && (
                <div className={glassCard}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                    <span className="material-symbols-outlined text-teal-500 text-sm">notes</span>
                    <span className="font-semibold text-sm text-slate-700">Summary</span>
                  </div>
                  <p className="p-4 text-sm text-slate-600 leading-relaxed">{resumeData.summary}</p>
                </div>
              )}
              {resumeData.skills && (
                <div className={glassCard}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                    <span className="material-symbols-outlined text-teal-500 text-sm">psychology</span>
                    <span className="font-semibold text-sm text-slate-700">Skills</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {Array.isArray(resumeData.skills)
                      ? resumeData.skills.map((skill, i) => <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</span>)
                      : typeof resumeData.skills === 'object' && resumeData.skills !== null
                        ? Object.entries(resumeData.skills).flatMap(([cat, skills]) => Array.isArray(skills) ? skills.map((s, i) => <span key={`${cat}-${i}`} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">{typeof s === 'string' ? s : JSON.stringify(s)}</span>) : [])
                        : <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium">{String(resumeData.skills)}</span>
                    }
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
    let scoreBreakdown = null, suggestions = null;
    try {
      if (selectedAtsCheck.scoreBreakdown) scoreBreakdown = JSON.parse(selectedAtsCheck.scoreBreakdown);
      if (selectedAtsCheck.suggestions) suggestions = JSON.parse(selectedAtsCheck.suggestions);
    } catch (e) { console.error("Failed to parse ATS JSON", e); }

    const score = selectedAtsCheck.atsScore || 0;
    const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
    const scoreRing = score >= 80 ? 'border-emerald-400' : score >= 60 ? 'border-amber-400' : 'border-rose-400';

    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[580px] bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-[-20px_0_60px_rgba(15,23,42,0.1)] z-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-5 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
            ATS Analysis Report
          </h2>
          <button onClick={() => setAtsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className={glassCard + " p-4"}>
              <div className="text-xs font-semibold text-slate-500 mb-1">Candidate</div>
              <div className="font-semibold text-slate-800 text-sm">{selectedAtsCheck.userName}</div>
              <div className="text-xs text-slate-500">{selectedAtsCheck.email}</div>
            </div>
            <div className={glassCard + " p-4"}>
              <div className="text-xs font-semibold text-slate-500 mb-1">Job Target</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedAtsCheck.jobDescriptionProvided ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                {selectedAtsCheck.jobDescriptionProvided ? '✓ Provided' : 'Generic Scan'}
              </span>
              <div className="text-xs text-slate-500 mt-1">{new Date(selectedAtsCheck.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className={`${glassCard} p-6 flex flex-col items-center`}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Overall ATS Score</div>
            <div className={`w-28 h-28 rounded-full border-4 ${scoreRing} flex items-center justify-center bg-white shadow-lg`}>
              <span className={`text-4xl font-black font-['Space_Grotesk',_sans-serif] ${scoreColor}`}>{score}</span>
            </div>
            <div className="text-slate-400 text-sm mt-1">/100</div>
          </div>

          {scoreBreakdown && (
            <div className={glassCard}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-teal-500 text-sm">analytics</span>
                <span className="font-semibold text-sm text-slate-700">Score Breakdown</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {Object.entries(scoreBreakdown).map(([key, val]) => {
                  const s = typeof val === 'object' && val !== null ? val.score || 0 : val;
                  return (
                    <div key={key} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50">
                      <span className="text-xs font-medium text-slate-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`text-sm font-bold ${s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className={glassCard}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-amber-500 text-sm">lightbulb</span>
                <span className="font-semibold text-sm text-slate-700">Improvement Suggestions</span>
              </div>
              <div className="p-4 space-y-3">
                {suggestions.map((sugg, i) => {
                  const text = typeof sugg === 'object' && sugg !== null ? sugg.suggestion || sugg.text : sugg;
                  const section = typeof sugg === 'object' && sugg !== null ? sugg.section : null;
                  const priority = typeof sugg === 'object' && sugg !== null ? sugg.priority : null;
                  return (
                    <div key={i} className={`p-3 rounded-xl border-l-4 ${priority === 'high' ? 'border-rose-400 bg-rose-50' : priority === 'medium' ? 'border-amber-400 bg-amber-50' : 'border-teal-400 bg-teal-50'}`}>
                      {section && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 uppercase ${priority === 'high' ? 'bg-rose-500 text-white' : priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-teal-500 text-white'}`}>{section}</span>}
                      <p className="text-xs text-slate-700 mt-1">{typeof text === 'string' ? text : JSON.stringify(text)}</p>
                    </div>
                  );
                })}
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
      <div className="fixed inset-y-0 right-0 w-full md:w-[580px] bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-[-20px_0_60px_rgba(15,23,42,0.1)] z-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-5 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
            User Profile
          </h2>
          <button onClick={() => setUserProfileDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className={`${glassCard} p-5`}>
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 font-['Space_Grotesk',_sans-serif]">{userProfile.name}</h3>
                <p className="text-sm text-slate-500">{userProfile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Provider', val: userProfile.provider },
                { label: 'Joined', val: new Date(userProfile.createdAt).toLocaleDateString() },
                { label: 'Resumes', val: <span className="text-2xl font-bold text-teal-600">{userProfile.resumeCount}</span> },
                { label: 'ATS Checks', val: <span className="text-2xl font-bold text-indigo-600">{userProfile.atsCount}</span> },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50">
                  <div className="text-xs font-medium text-slate-500 mb-1">{item.label}</div>
                  <div className="font-semibold text-slate-800 text-sm">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-500 text-sm">timeline</span>
              Activity Timeline
            </h3>
            {(!userProfile.resumes.length && !userProfile.atsChecks.length) ? (
              <div className="text-center p-8 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">No activity recorded</div>
            ) : (
              <div className="space-y-3">
                {[...userProfile.resumes.map(r => ({ ...r, type: 'RESUME' })), ...userProfile.atsChecks.map(a => ({ ...a, type: 'ATS' }))]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((item, i) => (
                    <div key={i} className={`${glassCard} p-3 flex items-center gap-3`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.type === 'RESUME' ? 'bg-teal-100' : 'bg-indigo-100'}`}>
                        <span className={`material-symbols-outlined text-sm ${item.type === 'RESUME' ? 'text-teal-600' : 'text-indigo-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.type === 'RESUME' ? 'description' : 'fact_check'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700">{item.type === 'RESUME' ? 'Resume Generated' : 'ATS Check'}</div>
                        <div className="text-xs text-slate-500">{item.type === 'RESUME' ? `Template: ${item.templateType}` : `Score: ${item.atsScore}/100`}</div>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── ACCESS DENIED ───────────────────────────────────────────────────────────
  if (currentUserRole !== 'ADMIN' && !loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className={`${glassCard} p-10 max-w-sm w-full text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_bad</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-['Space_Grotesk',_sans-serif]">Access Denied</h2>
          <p className="text-sm text-slate-500">Admin privileges required to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { title: 'Dashboard', icon: 'dashboard' },
    { title: 'Users', icon: 'group' },
    { title: 'Analytics', icon: 'timeline' },
    { title: 'System Health', icon: 'dns' },
    { title: 'Audit Log', icon: 'history' },
    { title: 'Resumes', icon: 'description' },
    { title: 'ATS Checks', icon: 'fact_check' },
    { title: 'Feedback', icon: 'star' },
    { title: 'Messages', icon: 'mail', badge: unreadContacts },
    { title: 'Engagement', icon: 'monitoring' },
    { title: 'AI Ops Studio', icon: 'auto_awesome' },
    { title: 'Security', icon: 'shield_lock' },
    { title: 'Flags & Quotas', icon: 'tune' },
    { title: 'SQL & Logs', icon: 'terminal' }
  ];

  const healthServices = health ? [
    { name: 'Identity', status: health.identity?.status || 'UP', latency: null },
    { name: 'LaTeX Engine', status: (health.latex?.status === 'UP' || health.latex?.ready) ? 'UP' : (health.latex?.status || 'DOWN'), latency: health.latex?.latencyMs != null ? `${health.latex.latencyMs}ms` : null },
    { name: 'Database', status: health.database?.status || 'UNKNOWN', latency: health.database?.latencyMs != null ? `${health.database.latencyMs}ms` : null },
    { name: 'Redis', status: health.redis?.status || 'UNKNOWN', latency: health.redis?.latencyMs != null ? `${health.redis.latencyMs}ms` : null },
    { name: 'Task Queue', status: health.queue?.status || 'UP', latency: null },
    { name: 'Host Runtime', status: 'UP', latency: health.totalCheckDurationMs != null ? `${health.totalCheckDurationMs}ms` : null },
  ] : [];

  const servicesUp = healthServices.filter(s => s.status === 'UP' || s.status === true).length;
  const servicesDown = healthServices.filter(s => s.status !== 'UP' && s.status !== true && s.status !== 'UNKNOWN' && s.status != null).length;
  const overallHealth = !health ? 'unknown' : servicesDown > 0 ? 'degraded' : 'healthy';

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: 'linear-gradient(160deg, #f0fdfa 0%, #F8FAFC 42%, #eef2ff 100%)',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Ambient mesh — matches site aurora theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-12%] right-[0%] w-[780px] h-[780px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.35) 0%, transparent 70%)', filter: 'blur(110px)' }} />
        <div className="absolute top-[35%] left-[-10%] w-[620px] h-[620px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, transparent 70%)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[-8%] right-[18%] w-[560px] h-[560px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-8">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">
                  <span className={`w-1.5 h-1.5 rounded-full ${overallHealth === 'healthy' ? 'bg-emerald-500 animate-pulse' : overallHealth === 'degraded' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                  {overallHealth === 'healthy' ? 'All systems nominal' : overallHealth === 'degraded' ? 'Attention required' : 'Status pending'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk',_sans-serif] text-slate-800 leading-none">
                Admin <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Console</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Platform overview, users, telemetry & operations</p>
            </div>
          </div>

          {/* Compact live strip in header */}
          <div className={`${frostPanel} px-4 py-3 flex flex-wrap items-center gap-4 lg:gap-5`}>
            {[
              { icon: 'group', label: 'Online', val: liveStats?.onlineUsers ?? '—', color: 'text-teal-600' },
              { icon: 'description', label: 'Resumes today', val: liveStats?.resumesToday ?? '—', color: 'text-indigo-600' },
              { icon: 'fact_check', label: 'ATS today', val: liveStats?.atsChecksToday ?? '—', color: 'text-emerald-600' },
              { icon: 'mail', label: 'Unread', val: unreadContacts ?? 0, color: unreadContacts > 0 ? 'text-rose-600' : 'text-slate-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 min-w-[72px]">
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-slate-100 flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[16px] ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold leading-none mb-0.5">{item.label}</div>
                  <div className={`text-sm font-bold tabular-nums ${item.color}`}>{item.val}</div>
                </div>
              </div>
            ))}
            <button onClick={() => { fetchLiveStats(); if (tabValue === 0) fetchDashboardData(); }} className={ghostBtn + " !py-1.5 !px-3 !text-xs ml-auto"}>
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* ── ALERTS ─────────────────────────────────────────────────────────── */}
        {success && (
          <div className="mb-4 flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-medium">{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* ── TABS NAVIGATION ────────────────────────────────────────────────── */}
        <div
          ref={tabsContainerRef}
          className={`${frostPanel} flex overflow-x-auto mb-8 p-1.5 gap-1 sticky top-2 z-20`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#14B8A6 transparent' }}
        >
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setTabValue(idx)}
              className={`relative whitespace-nowrap shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                tabValue === idx
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-[0_4px_16px_rgba(20,184,166,0.3)]'
                  : 'text-slate-500 hover:bg-white/90 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: tabValue === idx ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              <span>{tab.title}</span>
              {tab.badge > 0 && (
                <span className={`ml-0.5 text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ${
                  tabValue === idx ? 'bg-white/25 text-white' : 'bg-rose-500 text-white animate-pulse'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT AREA ───────────────────────────────────────────────────── */}
        <div className="min-h-[400px]">
          {loading && !(tabValue === 0 && (analytics || health || liveStats)) && (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-10 h-10 rounded-full border-3 border-teal-200 border-t-teal-500 animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-sm font-medium text-slate-500 animate-pulse">Loading data…</p>
            </div>
          )}

          {(!loading || (tabValue === 0 && (analytics || health || liveStats))) && (
            <>
              {loading && tabValue === 0 && (
                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 w-fit">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-200 border-t-teal-600 animate-spin" />
                  Refreshing dashboard…
                </div>
              )}
              {/* ══ DASHBOARD TAB ══════════════════════════════════════════════ */}
              {tabValue === 0 && (
                <div className="space-y-6">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <MetricCard
                      title="Total Users"
                      value={totalUsers}
                      sub="Registered accounts"
                      icon="group"
                      accent="teal"
                      onClick={() => setTabValue(1)}
                    />
                    <MetricCard
                      title="Total Resumes"
                      value={analytics?.totalResumes ?? '—'}
                      sub={`${liveStats?.resumesToday ?? 0} generated today`}
                      icon="description"
                      accent="indigo"
                      onClick={() => setTabValue(5)}
                    />
                    <MetricCard
                      title="ATS Checks"
                      value={analytics?.totalAts ?? '—'}
                      sub={`${liveStats?.atsChecksToday ?? 0} scanned today`}
                      icon="fact_check"
                      accent="emerald"
                      onClick={() => setTabValue(6)}
                    />
                    <MetricCard
                      title="PDF Compilations"
                      value={analytics?.totalPdf ?? '—'}
                      sub="Lifetime-time total"
                      icon="picture_as_pdf"
                      accent="rose"
                      onClick={() => setTabValue(2)}
                    />
                  </div>

                  {/* Status + activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* System status panel */}
                    <div className={`${frostPanel} p-5 lg:col-span-1`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionTitle + " text-base"}>
                          <span className="material-symbols-outlined text-teal-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                          System Status
                        </h3>
                        <button onClick={() => setTabValue(3)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                          Details
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </button>
                      </div>

                      <div className={`mb-4 p-3.5 rounded-2xl border flex items-center gap-3 ${
                        overallHealth === 'healthy'
                          ? 'bg-emerald-50/80 border-emerald-100'
                          : overallHealth === 'degraded'
                            ? 'bg-rose-50/80 border-rose-100'
                            : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          overallHealth === 'healthy' ? 'bg-emerald-500' : overallHealth === 'degraded' ? 'bg-rose-500' : 'bg-slate-400'
                        }`}>
                          <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {overallHealth === 'healthy' ? 'check_circle' : overallHealth === 'degraded' ? 'error' : 'hourglass_empty'}
                          </span>
                        </div>
                        <div>
                          <div className={`text-sm font-bold font-['Space_Grotesk',_sans-serif] ${
                            overallHealth === 'healthy' ? 'text-emerald-700' : overallHealth === 'degraded' ? 'text-rose-700' : 'text-slate-600'
                          }`}>
                            {overallHealth === 'healthy' ? 'All Systems Operational' : overallHealth === 'degraded' ? 'Degraded Performance' : 'Checking Services…'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {servicesUp}/{healthServices.length || 6} services healthy
                            {health?.totalCheckDurationMs != null && ` · probe ${health.totalCheckDurationMs}ms`}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {healthServices.length > 0 ? healthServices.map(svc => (
                          <ServiceStatusPill key={svc.name} name={svc.name} status={svc.status} latency={svc.latency} />
                        )) : (
                          <div className="text-xs text-slate-400 text-center py-6">No health data yet</div>
                        )}
                      </div>

                      {health?.system?.memory && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                            <span>JVM Heap</span>
                            <span className="tabular-nums text-slate-700 font-semibold">
                              {health.system.memory.usedMb} / {health.system.memory.maxMb} MB
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (health.system.memory.usagePercent || 0) > 85
                                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, health.system.memory.usagePercent || 0)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                            <span>{health.system.osName || 'Host OS'}</span>
                            <span>{health.system.processors || '—'} cores · {health.system.activeThreads || '—'} threads</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Usage chart */}
                    <div className={`${frostPanel} p-5 lg:col-span-2`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                        <h3 className={sectionTitle + " text-base"}>
                          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 inline-block" />
                          Activity — Last 30 Days
                        </h3>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white/80">
                          {['signups', 'resumes', 'ats'].map(m => (
                            <button
                              key={m}
                              onClick={() => setChartMetric(m)}
                              className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${chartMetric === m ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-[260px]">
                        {analytics ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <LineChart data={chartMetric === 'signups' ? analytics.dailySignups : chartMetric === 'resumes' ? analytics.dailyResumes : analytics.dailyAts}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="date" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => String(val).split('T')[0].slice(5)} />
                              <YAxis allowDecimals={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#94a3b8' }} width={32} />
                              <RechartsTooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'DM Sans', boxShadow: '0 8px 24px rgba(15,23,42,0.08)', background: 'rgba(255,255,255,0.96)' }}
                              />
                              <Line type="monotone" dataKey="count" stroke="#14B8A6" strokeWidth={2.5} activeDot={{ r: 6, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-slate-400">No analytics data</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: templates, inbox, security, quick links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {/* Template distribution */}
                    <div className={`${frostPanel} p-5`}>
                      <h3 className={sectionTitle + " text-sm mb-4"}>
                        <span className="material-symbols-outlined text-indigo-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>donut_large</span>
                        Templates
                      </h3>
                      <div className="h-[160px]">
                        {analytics?.templateUsage?.length ? (
                          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                              <Pie data={analytics.templateUsage} cx="50%" cy="50%" innerRadius={40} outerRadius={64} dataKey="value" stroke="none" paddingAngle={2}>
                                {analytics.templateUsage.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'DM Sans', background: 'rgba(255,255,255,0.96)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">No template data</div>
                        )}
                      </div>
                      <div className="mt-1 space-y-1.5 max-h-24 overflow-y-auto">
                        {(analytics?.templateUsage || []).map((t, i) => (
                          <div key={t.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-slate-600 truncate font-medium">{t.name}</span>
                            </div>
                            <span className="font-bold text-slate-800 tabular-nums">{t.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent messages */}
                    <div className={`${frostPanel} p-5 flex flex-col`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionTitle + " text-sm"}>
                          <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
                          Inbox
                        </h3>
                        {unreadContacts > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">{unreadContacts} unread</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        {(contacts || []).slice(0, 4).map(c => (
                          <button
                            key={c.id}
                            onClick={() => setTabValue(8)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-colors hover:border-teal-200 hover:bg-teal-50/40 ${
                              c.isRead ? 'bg-white/50 border-slate-100' : 'bg-amber-50/50 border-amber-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-slate-800 truncate">{c.name || c.email}</span>
                              {!c.isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{c.subject || 'No subject'}</div>
                          </button>
                        ))}
                        {(!contacts || contacts.length === 0) && (
                          <div className="text-xs text-slate-400 text-center py-8">No recent messages</div>
                        )}
                      </div>
                      <button onClick={() => setTabValue(8)} className={ghostBtn + " !text-xs mt-3 w-full justify-center"}>
                        Open messages
                      </button>
                    </div>

                    {/* Security snapshot */}
                    <div className={`${frostPanel} p-5 flex flex-col`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionTitle + " text-sm"}>
                          <span className="material-symbols-outlined text-rose-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                          Security
                        </h3>
                        <button onClick={() => setTabValue(11)} className="text-xs font-semibold text-teal-600 hover:text-teal-700">View all</button>
                      </div>
                      <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Open alerts</div>
                        <div className="text-2xl font-bold font-['Space_Grotesk',_sans-serif] text-slate-800 tabular-nums">
                          {Array.isArray(securityAlerts) ? securityAlerts.length : 0}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
                        {(Array.isArray(securityAlerts) ? securityAlerts : []).slice(0, 4).map((a, i) => (
                          <div key={a.id || i} className="p-2.5 rounded-xl border border-slate-100 bg-white/60">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                String(a.severity).toUpperCase() === 'HIGH' || String(a.severity).toUpperCase() === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {a.severity || a.alertType || 'Alert'}
                              </span>
                              <span className="text-[10px] text-slate-400">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 truncate">{a.details || a.alertType || a.ipAddress || 'Security event'}</div>
                          </div>
                        ))}
                        {(!securityAlerts || securityAlerts.length === 0) && (
                          <div className="text-xs text-emerald-600/80 text-center py-6 font-medium flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-emerald-500">verified_user</span>
                            No active alerts
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className={`${frostPanel} p-5`}>
                      <h3 className={sectionTitle + " text-sm mb-4"}>
                        <span className="material-symbols-outlined text-teal-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Users', icon: 'group', tab: 1, color: 'text-teal-600 bg-teal-50 border-teal-100' },
                          { label: 'Analytics', icon: 'timeline', tab: 2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                          { label: 'Health', icon: 'dns', tab: 3, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                          { label: 'Resumes', icon: 'description', tab: 5, color: 'text-violet-600 bg-violet-50 border-violet-100' },
                          { label: 'ATS', icon: 'fact_check', tab: 6, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                          { label: 'AI Ops', icon: 'auto_awesome', tab: 10, color: 'text-rose-600 bg-rose-50 border-rose-100' },
                          { label: 'Flags', icon: 'tune', tab: 12, color: 'text-slate-600 bg-slate-50 border-slate-200' },
                          { label: 'SQL', icon: 'terminal', tab: 13, color: 'text-slate-700 bg-slate-100 border-slate-200' },
                        ].map(a => (
                          <button
                            key={a.label}
                            onClick={() => setTabValue(a.tab)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md ${a.color}`}
                          >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ USERS TAB ══════════════════════════════════════════════════ */}
              {tabValue === 1 && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between gap-3 mb-5">
                    <div className="flex gap-2">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                          type="text"
                          placeholder="Search users…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); fetchUsers(); } }}
                          className={inputBase + " pl-9 w-64"}
                        />
                      </div>
                      <button onClick={() => { setPage(0); fetchUsers(); }} className={tealBtn}>
                        <span className="material-symbols-outlined text-[16px]">search</span>
                        <span className="hidden sm:inline">Search</span>
                      </button>
                    </div>
                    <button onClick={exportUsers} className={ghostBtn}>
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Export CSV
                    </button>
                  </div>

                  <div className={`${glassCard} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>
                            <SortHeader label="User" property="name" />
                            <SortHeader label="Email" property="email" />
                            <th className={thBase}>Role</th>
                            <SortHeader label="Joined" property="createdAt" />
                            <th className={thBase}>Last Active</th>
                            <th className={thBase + " text-center"}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id} onClick={() => fetchUserProfile(user.id)} className="group cursor-pointer hover:bg-teal-50/40 transition-colors">
                              <td className={tdBase}>
                                <div className="flex items-center gap-3">
                                  {user.picture ? (
                                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="font-semibold text-slate-800">{user.name}</span>
                                </div>
                              </td>
                              <td className={tdBase + " text-slate-500"}>{user.email}</td>
                              <td className={tdBase}>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className={tdBase + " text-slate-500 text-xs"}>{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td className={tdBase + " text-slate-400 text-xs"}>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                  View profile
                                </div>
                              </td>
                              <td className={tdBase} onClick={e => e.stopPropagation()}>
                                <div className="flex justify-center gap-2">
                                  {user.role === 'ADMIN' ? (
                                    <button onClick={(e) => { e.stopPropagation(); revokeAdminRole(user.id, user.name); }}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white transition-all">
                                      Revoke
                                    </button>
                                  ) : (
                                    <button onClick={(e) => { e.stopPropagation(); grantAdminRole(user.id, user.name); }}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-500 hover:text-white transition-all">
                                      Grant Admin
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setDeleteDialogOpen(true); }}
                                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No users found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-4 border-t border-slate-100">
                      <Pagination total={totalUsers} page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ ANALYTICS TAB ══════════════════════════════════════════════ */}
              {tabValue === 2 && analytics && (
                <div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <MetricCard title="Total Resumes" value={analytics.totalResumes} icon="description" accent="teal" sub="All time" />
                    <MetricCard title="PDF Compiled" value={analytics.totalPdf} icon="picture_as_pdf" accent="rose" sub="Compilations" />
                    <MetricCard title="ATS Checks" value={analytics.totalAts} icon="fact_check" accent="indigo" sub="All time" />
                    <MetricCard title="Total Users" value={totalUsers} icon="group" accent="amber" sub="Registered" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`${frostPanel} col-span-1 lg:col-span-2 p-6`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                        <h3 className={sectionTitle}>
                          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 inline-block" />
                          Usage Analytics — Last 30 Days
                        </h3>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white/90">
                          {['signups', 'resumes', 'ats'].map(m => (
                            <button
                              key={m}
                              onClick={() => setChartMetric(m)}
                              className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${chartMetric === m ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <LineChart data={chartMetric === 'signups' ? analytics.dailySignups : chartMetric === 'resumes' ? analytics.dailyResumes : analytics.dailyAts}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => String(val).split('T')[0]} />
                            <YAxis allowDecimals={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#94a3b8' }} />
                            <RechartsTooltip
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'DM Sans', boxShadow: '0 8px 24px rgba(15,23,42,0.08)', background: 'rgba(255,255,255,0.96)' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#14B8A6" strokeWidth={2.5} activeDot={{ r: 6, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }} dot={{ r: 3, fill: '#14B8A6' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className={`${frostPanel} p-6 flex flex-col`}>
                      <h3 className={sectionTitle + " mb-5"}>
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 inline-block" />
                        Template Distribution
                      </h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <PieChart>
                            <Pie data={analytics.templateUsage} cx="50%" cy="50%" innerRadius={42} outerRadius={78} dataKey="value" stroke="none" paddingAngle={2}>
                              {analytics.templateUsage.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'DM Sans', background: 'rgba(255,255,255,0.96)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
                        {(analytics.templateUsage || []).map((t, i) => (
                          <div key={t.name} className="flex items-center justify-between text-xs px-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-slate-600 truncate font-medium">{t.name}</span>
                            </div>
                            <span className="font-bold text-slate-800 tabular-nums">{t.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SYSTEM HEALTH TAB ══════════════════════════════════════════ */}
              {tabValue === 3 && health && (
                <div className="space-y-6">
                  <div className={`${frostPanel} p-6`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                          <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
                          System Telemetry & Diagnostics
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Last sync: {health.system?.timestamp ? new Date(health.system.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                          {' · '}
                          <span className={servicesDown > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                            {servicesUp}/{healthServices.length} healthy
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAutoRefreshHealth(!autoRefreshHealth)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${autoRefreshHealth ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${autoRefreshHealth ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
                          {autoRefreshHealth ? 'Live Poll (10s)' : 'Auto Poll: Off'}
                        </button>
                        <button onClick={fetchHealth} className={tealBtn + " !py-2 !text-xs"}>
                          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>sync</span>
                          Sync
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'JVM Heap Memory', value: health.system?.memory ? `${health.system.memory.usedMb} MB` : 'N/A', sub: `/ ${health.system?.memory?.maxMb || 'N/A'} MB`, progress: health.system?.memory?.usagePercent, icon: 'memory', accent: 'teal' },
                        { label: 'CPU Cores', value: `${health.system?.processors || '—'}`, sub: `${health.system?.activeThreads || '—'} active threads`, icon: 'developer_board', accent: 'indigo' },
                        { label: 'DB User Pool', value: `${health.database?.userCount ?? 0} users`, sub: health.database?.dialect || 'MySQL', icon: 'database', accent: 'emerald' },
                        { label: 'Diagnostic Latency', value: `${health.totalCheckDurationMs ?? 0} ms`, sub: health.system?.osName || 'Host', icon: 'speed', accent: 'amber' },
                      ].map(card => {
                        const a = ACCENT[card.accent] || ACCENT.teal;
                        return (
                          <div key={card.label} className={`p-4 rounded-2xl ${a.bg} border ${a.border}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                              <span className={`material-symbols-outlined text-sm ${a.soft}`}>{card.icon}</span>
                            </div>
                            <div className={`text-xl font-bold ${a.text} font-['Space_Grotesk',_sans-serif] tabular-nums`}>{card.value}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                            {card.progress !== undefined && card.progress !== null && (
                              <div className="mt-2 h-1.5 rounded-full bg-white/80 overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${a.ring} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, card.progress)}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {healthServices.map(svc => (
                        <ServiceStatusPill key={svc.name} name={svc.name} status={svc.status} latency={svc.latency} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: 'Identity & Auth Engine', icon: 'security', status: health.identity?.status || 'UP', rows: [
                        { k: 'Node ID', v: 'identity-service' },
                        { k: 'JWT Engine', v: health.identity?.jwtEngine || 'Active (HS256)' },
                        { k: 'Java Runtime', v: health.system?.javaVersion || 'JDK 21' },
                      ], footer: 'Microservice Port: 8081' },
                      { title: 'LaTeX Compilation Engine', icon: 'picture_as_pdf', status: (health.latex?.status === 'UP' || health.latex?.ready) ? 'UP' : 'DOWN', rows: [
                        { k: 'Endpoint', v: 'Render Cloud' },
                        { k: 'Compiler', v: health.latex?.compiler || health.latex?.mode || 'pdflatex / tectonic' },
                        { k: 'Health Latency', v: `${health.latex?.latencyMs ?? 'N/A'} ms` },
                      ], footer: 'Microservice Port: 8082' },
                      { title: 'Core Database (MySQL)', icon: 'storage', status: health.database?.status || 'UNKNOWN', rows: [
                        { k: 'User Pool', v: `${health.database?.userCount ?? 0} records` },
                        { k: 'Query Ping', v: `${health.database?.latencyMs ?? 'N/A'} ms` },
                        { k: 'Host', v: 'Aiven MySQL Cloud' },
                      ], footer: 'JDBC Pool / SSL Enabled' },
                      { title: 'Redis Cache', icon: 'memory', status: health.redis?.status || 'UNKNOWN', rows: [
                        { k: 'Ping', v: health.redis?.status === 'UP' ? 'PONG ✓' : 'Failed' },
                        { k: 'Roundtrip', v: `${health.redis?.latencyMs ?? 'N/A'} ms` },
                        { k: 'Driver', v: 'Lettuce Async Pool' },
                      ], footer: 'Redis Cluster / Cache Store' },
                      { title: 'Async Task Queue', icon: 'queue', status: health.queue?.status || 'UP', rows: [
                        { k: 'Active Tasks', v: `${health.queue?.usage ?? 0}` },
                        { k: 'Workers', v: 'Ready & Waiting' },
                        { k: 'Timeout', v: '60 seconds' },
                      ], footer: 'Concurrent Compilation Queue' },
                      { title: 'Host OS & Runtime', icon: 'dns', status: 'UP', rows: [
                        { k: 'OS', v: health.system?.osName || 'Linux' },
                        { k: 'Threads', v: `${health.system?.activeThreads || '18'} active` },
                        { k: 'Processors', v: `${health.system?.processors || '4'} cores` },
                      ], footer: 'Container Encapsulated' },
                    ].map(svc => {
                      const isUp = svc.status === 'UP' || svc.status === true;
                      const isUnknown = svc.status === 'UNKNOWN' || svc.status == null;
                      const edge = isUnknown ? 'border-l-slate-300' : isUp ? 'border-l-emerald-500' : 'border-l-rose-500';
                      return (
                        <div key={svc.title} className={`${frostPanel} overflow-hidden border-l-4 ${edge}`}>
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-teal-500 text-sm shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{svc.icon}</span>
                              <span className="font-semibold text-sm text-slate-700 truncate">{svc.title}</span>
                            </div>
                            <StatusBadge status={svc.status} />
                          </div>
                          <div className="p-4 space-y-2">
                            {svc.rows.map(row => (
                              <div key={row.k} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0">
                                <span className="text-slate-400 font-medium">{row.k}</span>
                                <span className="font-semibold text-slate-700 text-right max-w-[60%] truncate tabular-nums">{row.v}</span>
                              </div>
                            ))}
                          </div>
                          <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">{svc.footer}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`${frostPanel} overflow-hidden`}>
                    <button
                      onClick={() => setShowRawTelemetry(!showRawTelemetry)}
                      className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                        <span className="material-symbols-outlined text-slate-400 text-sm">code</span>
                        Raw JSON Telemetry Dump
                      </div>
                      <span className="material-symbols-outlined text-slate-400">{showRawTelemetry ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {showRawTelemetry && (
                      <div className="relative bg-slate-900 rounded-b-2xl overflow-x-auto">
                        <button
                          onClick={() => { navigator.clipboard.writeText(JSON.stringify(health, null, 2)); }}
                          className={tealBtn + " !text-xs absolute top-3 right-3"}
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          Copy JSON
                        </button>
                        <pre className="p-5 text-xs text-teal-300 font-mono leading-relaxed max-h-96 overflow-y-auto pr-28">{JSON.stringify(health, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ AUDIT LOG TAB ══════════════════════════════════════════════ */}
              {tabValue === 4 && (
                <div className={glassCard + " overflow-hidden"}>
                  <div className="overflow-x-auto">
                    <table className={tableBase}>
                      <thead>
                        <tr>
                          {['Timestamp', 'Admin', 'Event Type', 'Target Entity'].map(h => <th key={h} className={thBase}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="group hover:bg-teal-50/30 transition-colors">
                            <td className={tdBase + " text-xs font-mono text-slate-400"}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td className={tdBase + " font-medium text-slate-700"}>{log.adminEmail}</td>
                            <td className={tdBase}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700' : log.action.includes('GRANT') ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className={tdBase + " text-slate-500"}>{log.targetUserEmail}</td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm">No audit records found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-4 border-t border-slate-100">
                    <Pagination total={totalAuditLogs} page={auditPage} setPage={setAuditPage} rowsPerPage={auditRowsPerPage} setRowsPerPage={setAuditRowsPerPage} />
                  </div>
                </div>
              )}

              {/* ══ RESUMES TAB ════════════════════════════════════════════════ */}
              {tabValue === 5 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      Generated Resumes <span className="text-sm font-medium text-slate-500">({totalResumes})</span>
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={exportResumes} className={ghostBtn}><span className="material-symbols-outlined text-[16px]">download</span>Export</button>
                      <button onClick={fetchResumes} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync</button>
                    </div>
                  </div>
                  <div className={glassCard + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>{['User', 'Template', 'Candidate', 'Preview', 'Date Created', 'Action'].map(h => <th key={h} className={thBase}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {resumes.map((resume) => (
                            <tr key={resume.id} className="group hover:bg-teal-50/30 transition-colors">
                              <td className={tdBase}>
                                <div className="font-semibold text-slate-800 text-sm">{resume.userName}</div>
                                <div className="text-xs text-slate-400">{resume.email}</div>
                              </td>
                              <td className={tdBase}><span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">{resume.templateType}</span></td>
                              <td className={tdBase + " text-sm text-slate-600"}>{resume.candidateName || '—'}</td>
                              <td className={tdBase}>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${resume.resumeJson ? 'text-teal-600' : 'text-slate-400'}`}>
                                  <span className="material-symbols-outlined text-[13px]">{resume.resumeJson ? 'check_circle' : 'cancel'}</span>
                                  {resume.resumeJson ? 'Stored' : 'No data'}
                                </span>
                              </td>
                              <td className={tdBase + " text-xs text-slate-400"}>{new Date(resume.createdAt).toLocaleString()}</td>
                              <td className={tdBase}>
                                <button onClick={() => fetchResumeDetails(resume.id)} className={tealBtn + " !py-1.5 !text-xs"}>
                                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>View
                                </button>
                              </td>
                            </tr>
                          ))}
                          {resumes.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No resumes found</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-4 border-t border-slate-100">
                      <Pagination total={totalResumes} page={resumePage} setPage={setResumePage} rowsPerPage={resumeRowsPerPage} setRowsPerPage={setResumeRowsPerPage} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ ATS CHECKS TAB ═════════════════════════════════════════════ */}
              {tabValue === 6 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                      ATS Analyses <span className="text-sm font-medium text-slate-500">({totalAtsChecks})</span>
                    </h2>
                    <button onClick={fetchAtsChecks} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync</button>
                  </div>
                  <div className={glassCard + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>{['Candidate', 'Score', 'Job Target', 'Snippet', 'Date Logged', 'Action'].map(h => <th key={h} className={thBase}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {atsChecks.map((check) => (
                            <tr key={check.id} className="group hover:bg-teal-50/30 transition-colors">
                              <td className={tdBase}>
                                <div className="font-semibold text-slate-800 text-sm">{check.userName}</div>
                                <div className="text-xs text-slate-400">{check.email}</div>
                              </td>
                              <td className={tdBase}>
                                <div className={`text-xl font-bold font-['Space_Grotesk',_sans-serif] ${check.atsScore >= 80 ? 'text-emerald-600' : check.atsScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {check.atsScore || '—'}<span className="text-xs text-slate-400">/100</span>
                                </div>
                              </td>
                              <td className={tdBase}>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${check.jobDescriptionProvided ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {check.jobDescriptionProvided ? '✓ Provided' : 'Generic'}
                                </span>
                              </td>
                              <td className={tdBase + " max-w-[200px]"}>
                                <p className="text-xs text-slate-400 truncate">{check.resumeSnippet || '—'}</p>
                              </td>
                              <td className={tdBase + " text-xs text-slate-400"}>{new Date(check.createdAt).toLocaleString()}</td>
                              <td className={tdBase}>
                                <button onClick={() => fetchAtsCheckDetails(check.id)} className={tealBtn + " !py-1.5 !text-xs"}>
                                  <span className="material-symbols-outlined text-[14px]">analytics</span>Report
                                </button>
                              </td>
                            </tr>
                          ))}
                          {atsChecks.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No ATS checks found</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-4 border-t border-slate-100">
                      <Pagination total={totalAtsChecks} page={atsCheckPage} setPage={setAtsCheckPage} rowsPerPage={atsCheckRowsPerPage} setRowsPerPage={setAtsCheckRowsPerPage} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ FEEDBACK TAB ═══════════════════════════════════════════════ */}
              {tabValue === 7 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      User Feedback <span className="text-sm font-medium text-slate-500">({totalFeedbacks})</span>
                    </h2>
                    <button onClick={() => { fetchFeedbacks(); fetchFeedbackSummary(); }} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync</button>
                  </div>

                  {feedbackSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div className={`${glassCard} p-6 flex flex-col items-center text-center`}>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Average Rating</div>
                        <div className="text-6xl font-black font-['Space_Grotesk',_sans-serif] bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                          {feedbackSummary.averageRating.toFixed(1)}
                        </div>
                        <div className="flex gap-1 mt-3">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`material-symbols-outlined text-xl ${s <= Math.round(feedbackSummary.averageRating) ? 'text-amber-400' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">{((feedbackSummary.withMessageCount / feedbackSummary.totalFeedback) * 100 || 0).toFixed(0)}% include messages</p>
                      </div>
                      <div className={`${glassCard} p-6`}>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Rating Distribution</div>
                        <div className="space-y-3">
                          {[5,4,3,2,1].map(star => {
                            const count = feedbackSummary.ratingDistribution[star] || 0;
                            const pct = (count / (feedbackSummary.totalFeedback || 1)) * 100;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-600 w-6 text-right">{star}</span>
                                <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={glassCard + " overflow-hidden"}>
                    <div className="overflow-x-auto">
                      <table className={tableBase}>
                        <thead>
                          <tr>{['User', 'Rating', 'Message', 'Date', ''].map((h,i) => <th key={i} className={thBase}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {feedbacks.map((fb) => (
                            <tr key={fb.id} className="group hover:bg-teal-50/30 transition-colors">
                              <td className={tdBase}>
                                <div className="font-semibold text-slate-800 text-sm">{fb.name}</div>
                                <div className="text-xs text-slate-400">{fb.email}</div>
                              </td>
                              <td className={tdBase}>
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => <span key={s} className={`material-symbols-outlined text-sm ${s <= fb.rating ? 'text-amber-400' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                                </div>
                              </td>
                              <td className={tdBase + " max-w-xs text-sm text-slate-500"}>{fb.message || <span className="text-slate-300 italic">No message</span>}</td>
                              <td className={tdBase + " text-xs text-slate-400"}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                              <td className={tdBase}>
                                <button onClick={() => deleteFeedback(fb.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {feedbacks.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No feedback logs</td></tr>}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-4 border-t border-slate-100">
                      <Pagination total={totalFeedbacks} page={feedbackPage} setPage={setFeedbackPage} rowsPerPage={feedbackRowsPerPage} setRowsPerPage={setFeedbackRowsPerPage} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MESSAGES TAB ═══════════════════════════════════════════════ */}
              {tabValue === 8 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-3">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                      Inbound Messages <span className="text-sm font-medium text-slate-500">({totalContacts})</span>
                      {unreadContacts > 0 && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">{unreadContacts} new</span>}
                    </h2>
                    <button onClick={fetchContacts} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync</button>
                  </div>
                  <div className="space-y-4">
                    {contacts.map((msg) => (
                      <div key={msg.id} className={`${glassCard} p-5 ${!msg.read ? 'border-l-4 border-l-teal-400 shadow-[0_8px_32px_rgba(20,184,166,0.12)]' : ''}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${!msg.read ? 'bg-gradient-to-br from-teal-500 to-emerald-500' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                              {msg.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{msg.name}</span>
                                {!msg.read && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
                              </div>
                              <div className="text-xs text-slate-400">{msg.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                            {!msg.read && (
                              <button onClick={() => markAsRead(msg.id)} className={ghostBtn + " !py-1.5 !text-xs"}>
                                <span className="material-symbols-outlined text-[14px]">mark_email_read</span>Mark Read
                              </button>
                            )}
                            <button onClick={() => deleteContact(msg.id)} className={dangerBtn + " !py-1.5 !text-xs"}>
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-slate-700 mb-2">{msg.subject}</div>
                        <div className="text-sm text-slate-600 leading-relaxed p-4 rounded-xl bg-slate-50/80 border border-slate-100">{msg.message}</div>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <div className={glassCard + " p-12 text-center text-slate-400"}>
                        <span className="material-symbols-outlined text-4xl opacity-30 block mb-2">inbox</span>
                        Inbox is empty
                      </div>
                    )}
                  </div>
                  <div className="mt-4"><Pagination total={totalContacts} page={contactPage} setPage={setContactPage} rowsPerPage={contactRowsPerPage} setRowsPerPage={setContactRowsPerPage} /></div>
                </div>
              )}

              {/* ══ ENGAGEMENT TAB ═════════════════════════════════════════════ */}
              {tabValue === 9 && engagementStats && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                      User Engagement & Retention
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={exportAnalytics} className={ghostBtn}><span className="material-symbols-outlined text-[16px]">download</span>Export</button>
                      <button onClick={fetchEngagementStats} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className={glassCard + " p-6"}>
                      <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        Retention Cohorts
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="p-4 rounded-2xl bg-slate-50/80">
                          <div className="text-xs font-medium text-slate-500 mb-1">DAU / MAU Ratio</div>
                          <div className="text-3xl font-bold text-teal-600 font-['Space_Grotesk',_sans-serif]">{engagementStats.dauMauRatio.toFixed(1)}%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50/80">
                          <div className="text-xs font-medium text-slate-500 mb-1">Power Users (&gt;5 Resumes)</div>
                          <div className="text-3xl font-bold text-indigo-600 font-['Space_Grotesk',_sans-serif]">{engagementStats.powerUsers}</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                          <span>30-Day Retention</span>
                          <span>{engagementStats.retentionRate}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${engagementStats.retentionRate}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className={glassCard + " p-6"}>
                      <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>api</span>
                        Feature Usage (Last 30 Days)
                      </h3>
                      <div className="space-y-5">
                        {[
                          { label: 'Resume Builder', val: engagementStats.featureUsage.resumeBuilder, color: 'from-teal-400 to-emerald-500' },
                          { label: 'ATS Scanner', val: engagementStats.featureUsage.atsScanner, color: 'from-indigo-400 to-violet-500' },
                        ].map(f => (
                          <div key={f.label}>
                            <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                              <span>{f.label}</span>
                              <span className="font-semibold">{f.val} users</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${f.color} rounded-full`} style={{ width: `${(f.val / 100) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ AI OPS STUDIO TAB ══════════════════════════════════════════ */}
              {tabValue === 10 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-violet-500" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      AI Operations & Prompt Studio
                    </h2>
                    <button onClick={fetchAiPrompts} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync Prompts</button>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    {aiPrompts.map((p) => (
                      <div key={p.id} className={glassCard + " p-6"}>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 text-xs font-semibold font-mono mr-2">{p.promptKey}</span>
                            <span className="font-bold text-slate-800">{p.promptName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <label className="text-xs font-medium text-slate-500">Model:</label>
                              <input
                                type="text"
                                defaultValue={p.modelName}
                                onBlur={(e) => updateAiPrompt(p.id, { modelName: e.target.value })}
                                className={inputBase + " !w-36 !py-1.5"}
                              />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <label className="text-xs font-medium text-slate-500">Temp:</label>
                              <input
                                type="number" step="0.1"
                                defaultValue={p.temperature}
                                onBlur={(e) => updateAiPrompt(p.id, { temperature: parseFloat(e.target.value) })}
                                className={inputBase + " !w-20 !py-1.5"}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Prompt (Live Engine Instructions)</label>
                          <textarea
                            defaultValue={p.systemPrompt}
                            onBlur={(e) => updateAiPrompt(p.id, { systemPrompt: e.target.value })}
                            rows={4}
                            className={inputBase + " resize-y font-mono !text-xs !bg-slate-50/80"}
                          />
                        </div>
                        <div className="text-right text-xs text-slate-400 mt-2">Last updated: {new Date(p.updatedAt).toLocaleString()}</div>
                      </div>
                    ))}
                    {aiPrompts.length === 0 && <div className={glassCard + " p-12 text-center text-slate-400"}>No AI prompts found</div>}
                  </div>
                </div>
              )}

              {/* ══ SECURITY & THREATS TAB ═════════════════════════════════════ */}
              {tabValue === 11 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                      Security Defense & Compliance
                    </h2>
                    <div className="flex gap-2">
                      <a href={`${API_BASE_URL}/admin/export/audit-logs`} className={ghostBtn}>
                        <span className="material-symbols-outlined text-[16px]">download</span>Export Audit Logs
                      </a>
                      <button onClick={fetchSecurityAlerts} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Refresh Alerts</button>
                    </div>
                  </div>

                  <div className={glassCard + " overflow-hidden"}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-400 text-sm">sensors</span>
                        Live Threat Audit & Rate-Limit Alerts
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        {securityAlerts.length} alerts
                      </span>
                    </div>
                    {securityAlerts.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-4xl opacity-30 block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        No security alerts. System appears secure.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {securityAlerts.map((a) => (
                          <div key={a.id} className="px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${a.severity === 'CRITICAL' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                                {a.severity}
                              </span>
                              <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{a.ipAddress}</code>
                              <span className="font-semibold text-sm text-slate-700">{a.alertType}</span>
                              <span className="text-xs text-slate-400 max-w-sm truncate">{a.details}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ FLAGS & QUOTAS TAB ═════════════════════════════════════════ */}
              {tabValue === 12 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                      Feature Flags & Dynamic Tiers
                    </h2>
                    <button onClick={() => { fetchFeatureFlags(); fetchTierConfigs(); }} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Sync Configs</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={glassCard + " p-6"}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>toggle_on</span>
                          Live Feature Toggles
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold">CANARY CONTROL</span>
                      </div>
                      <div className="space-y-3">
                        {featureFlags.map((f) => (
                          <div key={f.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm text-slate-800">{f.flagName}</div>
                                <div className="text-xs font-mono text-slate-400">{f.flagKey}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateFeatureFlag(f.id, { enabledGlobal: !f.enabledGlobal })}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${f.enabledGlobal ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                                >
                                  Global: {f.enabledGlobal ? 'ON' : 'OFF'}
                                </button>
                                <button
                                  onClick={() => updateFeatureFlag(f.id, { enabledProOnly: !f.enabledProOnly })}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${f.enabledProOnly ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                                >
                                  Pro: {f.enabledProOnly ? 'YES' : 'NO'}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">{f.description}</p>
                          </div>
                        ))}
                        {featureFlags.length === 0 && <div className="text-center text-slate-400 text-sm py-6">No feature flags</div>}
                      </div>
                    </div>
                    <div className={glassCard + " p-6"}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
                          Tier Quota Controller
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">LIMITS ENGINE</span>
                      </div>
                      <div className="space-y-4">
                        {tierConfigs.map((t) => (
                          <div key={t.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold">{t.tierName} Tier</span>
                              <span className="text-xs text-slate-400">Updated: {new Date(t.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Max Resumes/Mo</label>
                                <input type="number" defaultValue={t.maxResumesPerMonth}
                                  onBlur={(e) => updateTierConfig(t.id, { maxResumesPerMonth: parseInt(e.target.value) })}
                                  className={inputBase + " !py-1.5 !text-xs"} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Max ATS/Day</label>
                                <input type="number" defaultValue={t.maxAtsChecksPerDay}
                                  onBlur={(e) => updateTierConfig(t.id, { maxAtsChecksPerDay: parseInt(e.target.value) })}
                                  className={inputBase + " !py-1.5 !text-xs"} />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Allowed AI Model</label>
                              <input type="text" defaultValue={t.aiModelAllowed}
                                onBlur={(e) => updateTierConfig(t.id, { aiModelAllowed: e.target.value })}
                                className={inputBase + " !py-1.5 !text-xs font-mono"} />
                            </div>
                          </div>
                        ))}
                        {tierConfigs.length === 0 && <div className="text-center text-slate-400 text-sm py-6">No tier configs</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SQL & LOGS TAB ═════════════════════════════════════════════ */}
              {tabValue === 13 && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif] flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                      SQL Sandbox & Live Logs Studio
                    </h2>
                    <button onClick={fetchLiveLogs} className={tealBtn}><span className="material-symbols-outlined text-[16px]">refresh</span>Tail Logs</button>
                  </div>

                  <div className={glassCard + " p-6 mb-6"}>
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500 text-sm">dataset</span>
                      Read-Only SQL Query Studio
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold">PRESET SAFE QUERIES</span>
                    </h3>
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex flex-col md:flex-row gap-3">
                        <select
                          value={sqlQueryInput}
                          onChange={(e) => setSqlQueryInput(e.target.value)}
                          className={inputBase + " flex-1"}
                        >
                          {PRESET_SQL_QUERIES.map((item, idx) => (
                            <option key={idx} value={item.query}>{item.label}</option>
                          ))}
                        </select>
                        <button onClick={runSqlQuery} className={tealBtn + " !px-6 shrink-0"}>
                          <span className="material-symbols-outlined">play_arrow</span>Execute Query
                        </button>
                      </div>
                      <div className="px-4 py-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto flex items-center gap-2">
                        <span className="text-slate-500 shrink-0">[SQL]</span>
                        <code className="whitespace-nowrap">{sqlQueryInput}</code>
                      </div>
                    </div>

                    {sqlError && (
                      <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                        <span className="font-bold">SQL Error:</span> {sqlError}
                      </div>
                    )}

                    {sqlResults && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white max-h-64 overflow-y-auto">
                        {sqlResults.length === 0 ? (
                          <div className="p-6 text-sm text-center text-slate-400">Query executed. 0 rows returned.</div>
                        ) : (
                          <table className={tableBase}>
                            <thead>
                              <tr>{Object.keys(sqlResults[0]).map((key) => <th key={key} className={thBase}>{key}</th>)}</tr>
                            </thead>
                            <tbody>
                              {sqlResults.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-teal-50/30 transition-colors">
                                  {Object.keys(row).map((key) => (
                                    <td key={key} className={tdBase + " whitespace-nowrap font-mono text-xs"}>{row[key] !== null ? row[key].toString() : <span className="text-slate-300 italic">null</span>}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-center px-5 py-3 bg-slate-900 border-b border-slate-700">
                      <span className="text-xs font-mono text-teal-400 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        Live Tail: Microservices Log Buffer
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Buffer: {liveLogs.length} events</span>
                    </div>
                    <div className="bg-slate-950 p-4 max-h-80 overflow-y-auto space-y-1.5">
                      {liveLogs.map((log, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-2 text-xs font-mono py-1 px-2 rounded-lg hover:bg-slate-900/50 border-l-2 border-teal-800 pl-3 transition-colors">
                          <span className="text-slate-500 whitespace-nowrap">[{log.timestamp}]</span>
                          <span className="bg-slate-800 text-teal-400 px-1.5 rounded font-bold uppercase text-[10px]">{log.service}</span>
                          <span className={`font-bold ${log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-teal-400'}`}>[{log.level}]</span>
                          <span className="text-slate-300">{log.message}</span>
                        </div>
                      ))}
                      {liveLogs.length === 0 && (
                        <div className="text-xs text-slate-500 text-center py-8 font-mono">No logs in buffer. Click "Tail Logs" to refresh.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── DELETE CONFIRMATION DIALOG ──────────────────────────────────────── */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${glassCard} p-8 max-w-sm w-full`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 font-['Space_Grotesk',_sans-serif]">Delete User</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to permanently delete <strong className="text-slate-800">{userToDelete?.name}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">dangerous</span>
              All user data will be permanently removed.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteDialogOpen(false)} className={ghostBtn + " flex-1 justify-center !py-2.5"}>Cancel</button>
              <button onClick={handleDeleteUser} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWERS ─────────────────────────────────────────────────────────── */}
      <ResumeDrawer />
      {resumeDrawerOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setResumeDrawerOpen(false)} />}
      <AtsDrawer />
      {atsDrawerOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setAtsDrawerOpen(false)} />}
      <UserProfileDrawer />
      {userProfileDrawerOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setUserProfileDrawerOpen(false)} />}
    </div>
  );
};

export default AdminPanel;
