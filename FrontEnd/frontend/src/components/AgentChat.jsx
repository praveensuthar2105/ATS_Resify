import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Bot, Check, ChevronDown, Lightbulb, Plus, Send, Settings, Sparkles, Star, Target, User, X } from 'lucide-react';
import agentAPI from '../services/agentApi';
import './AgentChat.css';

const QUICK_ACTIONS = [
  { text: 'How can I improve my resume?', label: 'General Tips', icon: Lightbulb },
  { text: 'Improve my experience bullet points using STAR method', label: 'STAR Method', icon: Star },
  { text: 'Analyze how well my resume matches the job description', label: 'Match Analysis', icon: Target },
  { text: 'Generate a professional summary for my target role', label: 'Pro Summary', icon: Sparkles }
];

const DEFAULT_PREFERENCES = {
  tone: '',
  verbosity: '',
  targetRole: '',
  targetIndustry: '',
  experienceLevel: '',
  preferredTemplate: '',
  targetCompanies: '',
  customNotes: '',
  preferActionVerbs: true,
  preferMetrics: true,
  atsOptimized: true,
};

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: '', label: 'Agent Default' },
  { value: 'entry', label: 'Entry Level / New Grad' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior (5-10 years)' },
  { value: 'staff_principal', label: 'Staff / Principal (10+ years)' },
];

const TEMPLATE_OPTIONS = [
  { value: '', label: 'Agent Default' },
  { value: 'modern', label: 'Modern' },
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'minimalist', label: 'Minimalist' },
];

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Safe markdown-like formatting to prevent XSS
const renderSafeMessage = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = line.split(regex);
    const renderedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={partIdx}>{part.slice(1, -1)}</em>;
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={partIdx}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
    return (
      <React.Fragment key={lineIdx}>
        {renderedLine}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const SettingsSelect = ({ name, defaultValue, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || '');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === selectedValue) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="settings-select-wrap" ref={containerRef}>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        className={`settings-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={14} className="settings-select-chevron" />
      </button>

      {isOpen && (
        <ul className="settings-select-options">
          {options.map(option => {
            const isSelected = option.value === selectedValue;
            return (
              <li
                key={option.value || 'default'}
                className={`settings-select-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={12} className="settings-select-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const AgentChat = ({ resumeContext, formData, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showPulse, setShowPulse] = useState(true);

  // Resizable panel state — use ref for instant reads in mousemove
  const [panelSize, setPanelSize] = useState({ width: 380, height: 520 });
  const [panelPos, setPanelPos] = useState({ right: 24, bottom: 24 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const isResizingRef = useRef(false);
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0, edge: '' });
  const dragPanelRef = useRef({ startX: 0, startY: 0, startRight: 24, startBottom: 24 });
  const resizeRafRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  // ==================== User Preferences State ====================
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefError, setPrefError] = useState(null);

  // Load preferences helper
  const loadUserPreferences = useCallback(async (uid) => {
    if (!uid || uid === 'anonymous') {
      setPrefLoading(false);
      setPrefError('Sign in to save preferences');
      return;
    }
    setPrefLoading(true);
    setPrefError(null);
    try {
      const userPreferences = await agentAPI.getPreferences(uid);
      setPreferences({ ...DEFAULT_PREFERENCES, ...(userPreferences || {}) });
    } catch {
      setPrefError('Could not sync preferences. You can still adjust them here.');
    } finally {
      setPrefLoading(false);
    }
  }, []);

  // Load preferences only when the settings panel is requested.
  useEffect(() => {
    if (showSettings && !preferences && !prefLoading && !prefError) {
      loadUserPreferences(userId);
    }
  }, [showSettings, preferences, prefLoading, prefError, userId, loadUserPreferences]);

  // Save preferences
  const handleSavePreferences = async (updates) => {
    if (!userId || userId === 'anonymous') return;
    setPrefSaving(true);
    setPrefError(null);
    try {
      const updated = await agentAPI.updatePreferences(userId, updates);
      setPreferences(updated);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setPrefError('Failed to save preferences');
    } finally {
      setPrefSaving(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Hide pulse after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  // ==================== Resize logic for chat panel ====================
  const clampPanelPosition = useCallback((right, bottom, width = panelSize.width, height = panelSize.height) => {
    const margin = 24;
    const maxRight = Math.max(margin, window.innerWidth - width - margin);
    const maxBottom = Math.max(margin, window.innerHeight - height - margin);
    return {
      right: Math.max(margin, Math.min(maxRight, right)),
      bottom: Math.max(margin, Math.min(maxBottom, bottom)),
    };
  }, [panelSize.height, panelSize.width]);

  const handlePanelDragStart = useCallback((e) => {
    if (e.target.closest('button')) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragPanelRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: panelPos.right,
      startBottom: panelPos.bottom,
    };
    setIsDraggingPanel(true);
    e.preventDefault();
  }, [panelPos]);

  useEffect(() => {
    if (!isDraggingPanel) return;

    const handleDragMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = dragPanelRef.current.startX - clientX;
      const dy = dragPanelRef.current.startY - clientY;
      setPanelPos(clampPanelPosition(
        dragPanelRef.current.startRight + dx,
        dragPanelRef.current.startBottom + dy
      ));
    };

    const handleDragEnd = () => {
      setIsDraggingPanel(false);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [clampPanelPosition, isDraggingPanel]);

  const handleResizeStart = useCallback((edge, e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startW: panelSize.width,
      startH: panelSize.height,
      edge,
    };
    isResizingRef.current = true;
    setIsResizing(true);
  }, [panelSize]);

  useEffect(() => {
    const handleResizeMove = (e) => {
      if (!isResizingRef.current) return;
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = resizeRef.current.startX - clientX;
        const dy = resizeRef.current.startY - clientY;
        const { edge, startW, startH } = resizeRef.current;

        let newW = startW, newH = startH;
        const maxPanelHeight = Math.max(360, window.innerHeight - 48);
        const maxPanelWidth = Math.max(320, window.innerWidth - 48);
        if (edge.includes('left')) newW = Math.max(320, Math.min(maxPanelWidth, startW + dx));
        if (edge.includes('top')) newH = Math.max(360, Math.min(maxPanelHeight, startH + dy));

        setPanelSize({ width: newW, height: newH });
        setPanelPos(prev => clampPanelPosition(prev.right, prev.bottom, newW, newH));
      });
    };

    const handleResizeEnd = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      if (resizeRafRef.current) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchmove', handleResizeMove, { passive: false });
    window.addEventListener('touchend', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, []);

  // Auto-resize textarea
  const handleTextareaChange = useCallback((e) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }, []);

  // Build context string from resume data
  const buildResumeContext = useCallback(() => {
    if (resumeContext) return resumeContext;
    if (!formData) return '';

    const parts = [];
    if (formData.fullName) parts.push(`Name: ${formData.fullName}`);
    if (formData.summary) parts.push(`Summary: ${formData.summary}`);
    if (formData.skills?.length) {
      const skillStr = formData.skills.map(s =>
        typeof s === 'string' ? s : s.title || s.items?.join(', ')
      ).filter(Boolean).join(', ');
      if (skillStr) parts.push(`Skills: ${skillStr}`);
    }
    if (formData.experience?.length) {
      const expStr = formData.experience.map(e =>
        `${e.position || e.jobTitle || ''} at ${e.company || ''}`
      ).filter(e => e.trim() !== 'at').join('; ');
      if (expStr) parts.push(`Experience: ${expStr}`);
    }
    if (formData.education?.length) {
      const eduStr = formData.education.map(e =>
        `${e.degree || ''} from ${e.institution || ''}`
      ).filter(e => e.trim() !== 'from').join('; ');
      if (eduStr) parts.push(`Education: ${eduStr}`);
    }
    return parts.join('\n');
  }, [resumeContext, formData]);

  // Send message to agent
  const sendMessage = useCallback(async (customMessage) => {
    const message = customMessage || inputValue.trim();
    if (!message || isLoading) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const response = await agentAPI.chat({
        message,
        userId: userId || 'anonymous',
        sessionId,
        agentType: 'GENERAL',
        context: buildResumeContext(),
      });

      // Update session ID
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Add assistant message
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message || response.response || 'I received your request.',
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
        data: response.data,
        cached: response.cached,
        agentType: response.agentType,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Agent chat error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.response?.data?.message ||
          'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, sessionId, userId, buildResumeContext]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Handle quick action
  const handleQuickAction = useCallback((action) => {
    sendMessage(action.text);
  }, [sendMessage]);

  // New conversation
  const newConversation = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  const openSettings = useCallback(() => {
    setPreferences(prev => prev || DEFAULT_PREFERENCES);
    setPrefError(null);
    setShowSettings(true);
  }, []);

  // Render welcome screen when no messages
  const renderWelcome = () => {
    return (
      <div className="agent-welcome">
        <div className="agent-welcome-icon" aria-hidden="true"><Sparkles size={28} /></div>
        <p>I can help you improve your resume, write impactful bullet points, analyze job matches, and generate content!</p>
        <div className="agent-quick-actions">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
            <button
              key={i}
              className="agent-quick-btn"
              onClick={() => handleQuickAction(action)}
            >
              <span className="qb-icon">
                <Icon size={17} />
              </span>
              <span className="qb-text">
                <strong>{action.label}</strong>
                <span>{action.text}</span>
              </span>
            </button>
          )})}
        </div>
      </div>
    );
  };

  // Render score card for job match results
  const renderScoreCard = (data) => {
    if (!data?.overallScore && !data?.score) return null;
    const rawScore = data.overallScore || data.score;

    // score can be a number OR an object like {before: 3, after: 8}
    const isBeforeAfter = rawScore && typeof rawScore === 'object' && rawScore.before != null && rawScore.after != null;
    const displayScore = isBeforeAfter ? Number(rawScore.after) : (typeof rawScore === 'number' ? rawScore : 0);
    // For percentage-based scores (0-100) vs rating scores (0-10)
    const isRating = displayScore <= 10;
    const barWidth = isRating ? displayScore * 10 : displayScore;

    return (
      <div className="agent-score-card">
        <div className="agent-score-header">
          <div>
            <span style={{ fontSize: '12px', color: 'var(--agent-text-light)' }}>
              {isBeforeAfter ? 'Improvement Score' : 'Match Score'}
            </span>
            <div className="agent-score-value">
              {isBeforeAfter
                ? <>{rawScore.before} → <strong>{rawScore.after}</strong>{isRating ? '/10' : '%'}</>
                : <>{displayScore}{isRating ? '/10' : '%'}</>}
            </div>
          </div>
          <span style={{ fontSize: '28px' }}>
            {barWidth >= 80 ? '🎉' : barWidth >= 60 ? '👍' : barWidth >= 40 ? '💪' : '📈'}
          </span>
        </div>
        <div className="agent-score-bar">
          <div
            className="agent-score-bar-fill"
            style={{ width: `${Math.min(barWidth, 100)}%` }}
          />
        </div>
        {data.categoryScores && (
          <div className="agent-score-categories">
            {Object.entries(data.categoryScores).map(([key, val]) => {
              const safeVal = typeof val === 'number' ? `${val}%`
                : typeof val === 'string' ? val
                  : val && typeof val === 'object'
                    ? (val.before != null && val.after != null ? `${val.before} → ${val.after}`
                      : val.score != null ? `${val.score}%`
                        : JSON.stringify(val))
                    : String(val ?? '');
              return (
                <div key={key} className="agent-score-cat">
                  <span className="cat-label">{key}</span>
                  <span className="cat-value">{safeVal}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render keyword badges
  const renderKeywords = (data) => {
    const matched = data?.matchedKeywords || data?.strengths || [];
    const missing = data?.missingKeywords || data?.gaps || data?.missingSkills || [];

    if (!matched.length && !missing.length) return null;

    return (
      <div className="agent-keywords">
        {matched.slice(0, 8).map((kw, i) => (
          <span key={`m-${i}`} className="agent-keyword matched">✓ {typeof kw === 'string' ? kw : kw?.keyword || kw?.name || JSON.stringify(kw)}</span>
        ))}
        {missing.slice(0, 8).map((kw, i) => (
          <span key={`x-${i}`} className="agent-keyword missing">✗ {typeof kw === 'string' ? kw : kw?.keyword || kw?.name || JSON.stringify(kw)}</span>
        ))}
      </div>
    );
  };

  // Render suggestions chips
  const renderSuggestions = (suggestions) => {
    if (!suggestions?.length) return null;
    return (
      <div className="agent-suggestions">
        {suggestions.slice(0, 4).map((s, i) => {
          const label = typeof s === 'string' ? s : (s?.label || s?.text || JSON.stringify(s));
          return (
            <button
              key={i}
              className="agent-suggestion-chip"
              onClick={() => sendMessage(label)}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  // Render a single message
  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    // Ensure content is always a string — backend may send an object
    const safeContent = typeof msg.content === 'string' ? msg.content
      : msg.content && typeof msg.content === 'object' ? JSON.stringify(msg.content)
        : String(msg.content ?? '');

    return (
      <div key={msg.id} className={`agent-message ${msg.role}`}>
        <div className="msg-avatar">
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>
        <div>
          <div
            className="msg-content"
            style={msg.isError ? { borderColor: '#fca5a5', background: '#fef2f2' } : {}}
          >
            {renderSafeMessage(safeContent)}
          </div>
          {/* Rich data rendering for assistant messages */}
          {!isUser && msg.data && renderScoreCard(msg.data)}
          {!isUser && msg.data && renderKeywords(msg.data)}
          {!isUser && renderSuggestions(msg.suggestions)}
          <div className="msg-time">
            {formatTime(msg.timestamp)}
            {msg.cached && (
              <span className="msg-cached-badge">
                ⚡ cached
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsPanel = () => {
    const settingsBackButton = (
      <button
        type="button"
        className="settings-back-btn"
        onClick={() => setShowSettings(false)}
        title="Back to chat"
      >
        <ArrowLeft size={16} />
        <span>Back to chat</span>
      </button>
    );

    if (!preferences) return (
      null
    );

    return (
      <div className="agent-settings-panel">
        {settingsBackButton}
        <div className="settings-header">
          <h3>
            <span className="settings-icon">🛠️</span>
            Agent Preferences
          </h3>
          <p>
            Customize how the AI assists you.
            {prefLoading && <span className="settings-sync"> Syncing...</span>}
          </p>
          {prefError && <div className="settings-inline-error">{prefError}</div>}
        </div>

        <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSavePreferences(Object.fromEntries(new FormData(e.target))); }}>
          <div className="settings-grid">
            {/* Tone & Verbosity */}
            <div className="settings-group">
              <label>
                <span className="label-text">Speaking Tone</span>
                <select className="settings-input" name="tone" defaultValue={preferences.tone || ''}>
                  <option value="">(Agent Default)</option>
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                </select>
              </label>
            </div>

            <div className="settings-group">
              <label>
                <span className="label-text">Response Length</span>
                <select className="settings-input" name="verbosity" defaultValue={preferences.verbosity || ''}>
                  <option value="">(Agent Default)</option>
                  <option value="concise">Concise</option>
                  <option value="moderate">Moderate</option>
                  <option value="detailed">Detailed</option>
                </select>
              </label>
            </div>

            {/* Target Role & Industry */}
            <div className="settings-group">
              <label>
                <span className="label-text">Target Role</span>
                <input className="settings-input" name="targetRole" defaultValue={preferences.targetRole || ''} placeholder="e.g. Frontend Engineer" />
              </label>
            </div>

            <div className="settings-group">
              <label>
                <span className="label-text">Target Industry</span>
                <input className="settings-input" name="targetIndustry" defaultValue={preferences.targetIndustry || ''} placeholder="e.g. Fintech, Healthcare" />
              </label>
            </div>

            {/* Experience & Template */}
            <div className="settings-group">
              <label>
                <span className="label-text">Experience Level</span>
                <SettingsSelect
                  name="experienceLevel"
                  defaultValue={preferences.experienceLevel}
                  options={EXPERIENCE_LEVEL_OPTIONS}
                />
              </label>
            </div>

            <div className="settings-group">
              <label>
                <span className="label-text">Preferred Template</span>
                <SettingsSelect
                  name="preferredTemplate"
                  defaultValue={preferences.preferredTemplate}
                  options={TEMPLATE_OPTIONS}
                />
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="settings-group full-width">
            <label>
              <span className="label-text">Target Companies</span>
              <input className="settings-input" name="targetCompanies" defaultValue={preferences.targetCompanies || ''} placeholder="e.g. Google, Meta, Stripe" />
            </label>
          </div>

          <div className="settings-group full-width">
            <label>
              <span className="label-text">Custom Instructions</span>
              <textarea className="settings-input settings-textarea" name="customNotes" defaultValue={preferences.customNotes || ''} placeholder="Any specific rules the AI should always follow..." rows={2} />
            </label>
          </div>

          {/* Toggles */}
          <div className="settings-toggles">
            <label className="settings-toggle">
              <input type="checkbox" name="preferActionVerbs" defaultChecked={preferences.preferActionVerbs} />
              <span className="settings-checkbox" aria-hidden="true">
                <Check size={12} />
              </span>
              <span className="toggle-copy">
                <span className="toggle-text">Prefer Action Verbs</span>
              </span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" name="preferMetrics" defaultChecked={preferences.preferMetrics} />
              <span className="settings-checkbox" aria-hidden="true">
                <Check size={12} />
              </span>
              <span className="toggle-copy">
                <span className="toggle-text">Prefer Metrics</span>
              </span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" name="atsOptimized" defaultChecked={preferences.atsOptimized} />
              <span className="settings-checkbox" aria-hidden="true">
                <Check size={12} />
              </span>
              <span className="toggle-copy">
                <span className="toggle-text">Strict ATS Mode</span>
                <span className="toggle-helper">Prioritizes exact keyword matches over natural phrasing</span>
              </span>
            </label>
          </div>

          {/* Divider */}
          <div className="settings-divider" />

          {/* Footer Actions */}
          <div className="settings-actions">
            <button type="button" className="settings-btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
            <button type="submit" className="settings-btn-primary" disabled={prefSaving}>
              {prefSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button — draggable */}
      {!isOpen && (
        <button
          className="agent-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open AI Agent"
        >
          {showPulse && <span className="agent-toggle-pulse" />}
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Panel — resizable */}
      {isOpen && (
        <div
          className={`agent-chat-panel ${isResizing ? 'resizing' : ''} ${isDraggingPanel ? 'dragging' : ''}`}
          ref={panelRef}
          style={{
            right: panelPos.right,
            bottom: panelPos.bottom,
            width: panelSize.width,
            height: panelSize.height,
          }}
        >
          {/* Resize handles */}
          <div className="agent-resize-handle top" onMouseDown={(e) => handleResizeStart('top', e)} onTouchStart={(e) => handleResizeStart('top', e)} />
          <div className="agent-resize-handle left" onMouseDown={(e) => handleResizeStart('left', e)} onTouchStart={(e) => handleResizeStart('left', e)} />
          <div className="agent-resize-handle corner" onMouseDown={(e) => handleResizeStart('top-left', e)} onTouchStart={(e) => handleResizeStart('top-left', e)} />
          {/* Header */}
          <div
            className="agent-chat-header"
            onMouseDown={handlePanelDragStart}
            onTouchStart={handlePanelDragStart}
          >
            <div className="agent-header-left">
              <div className="agent-avatar"><Sparkles size={16} /></div>
              <div className="agent-header-info">
                <h3>Resume AI Agent</h3>
                <span><span className="agent-status-dot" /> Online</span>
              </div>
            </div>
            <div className="agent-header-actions">
              <button
                className="agent-header-btn"
                onClick={newConversation}
                title="New chat"
                aria-label="New chat"
              >
                <Plus size={16} />
              </button>
              <button
                className="agent-header-btn"
                onClick={openSettings}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                className="agent-header-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>



          {/* Messages */}
          <div className="agent-messages">
            {messages.length === 0 ? (
              renderWelcome()
            ) : (
              <>
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="agent-typing">
                    <div className="agent-typing-dots">
                      <span /><span /><span />
                    </div>
                    <span className="agent-typing-text">Thinking...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="agent-input-area">
            <div className="agent-input-wrapper">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to rewrite a bullet point, generate a cover letter, or explain your ATS score..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="agent-send-btn"
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                title="Send message"
              >
                {isLoading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                    </path>
                  </svg>
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && renderSettingsPanel()}
        </div>
      )}
    </>
  );
};

export default AgentChat;
