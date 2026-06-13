import React, { useState, useEffect, useRef, useCallback } from 'react';
import agentAPI from '../services/agentApi';
import './AgentChat.css';

// Agent mode configuration
const AGENT_MODES = [
  { key: 'GENERAL', label: 'Chat', icon: '💬', desc: 'General resume help' },
  { key: 'BULLET_IMPROVER', label: 'Bullets', icon: '✨', desc: 'Improve bullet points' },
  { key: 'JOB_MATCHER', label: 'Match', icon: '🎯', desc: 'Job description matching' },
  { key: 'CONTENT_GENERATOR', label: 'Generate', icon: '📝', desc: 'Generate content' },
];

const QUICK_ACTIONS = {
  GENERAL: [
    { text: 'How can I improve my resume?', label: 'General Tips', icon: '💡' },
    { text: 'What are common resume mistakes?', label: 'Common Mistakes', icon: '⚠️' },
    { text: 'Help me write a professional summary', label: 'Write Summary', icon: '📋' },
  ],
  BULLET_IMPROVER: [
    { text: 'Improve my experience bullet points using STAR method', label: 'STAR Method', icon: '⭐' },
    { text: 'Make my bullet points more impactful with metrics', label: 'Add Metrics', icon: '📊' },
    { text: 'Suggest strong action verbs for my experience section', label: 'Action Verbs', icon: '🔥' },
  ],
  JOB_MATCHER: [
    { text: 'Analyze how well my resume matches the job description', label: 'Match Analysis', icon: '🔍' },
    { text: 'What keywords am I missing for this job?', label: 'Keyword Gaps', icon: '🏷️' },
    { text: 'Tailor my experience section for this role', label: 'Tailor Resume', icon: '✂️' },
  ],
  CONTENT_GENERATOR: [
    { text: 'Generate a professional summary for my target role', label: 'Pro Summary', icon: '📝' },
    { text: 'Create strong bullet points for my latest experience', label: 'Experience Bullets', icon: '💼' },
    { text: 'Help me describe my projects effectively', label: 'Project Descriptions', icon: '🚀' },
  ],
};

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Simple markdown-like formatting for messages
const formatMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
};

const AgentChat = ({ resumeContext, formData, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [agentType, setAgentType] = useState('GENERAL');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showPulse, setShowPulse] = useState(true);

  // Draggable button state
  const [btnPos, setBtnPos] = useState({ right: 28, bottom: 28 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0, moved: false });

  // Resizable panel state
  const [panelSize, setPanelSize] = useState({ width: 420, height: 580 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0, edge: '' });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const panelRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // ==================== User Preferences State ====================
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefError, setPrefError] = useState(null);

  // Load preferences on open/settings
  useEffect(() => {
    if (isOpen || showSettings) {
      if (!userId || userId === 'anonymous') return;
      setPrefLoading(true);
      agentAPI.getPreferences(userId)
        .then(setPreferences)
        .catch(e => setPrefError('Failed to load preferences'))
        .finally(() => setPrefLoading(false));
    }
  }, [isOpen, showSettings, userId]);

  // Save preferences
  const handleSavePreferences = async (updates) => {
    if (!userId || userId === 'anonymous') return;
    setPrefSaving(true);
    setPrefError(null);
    try {
      const updated = await agentAPI.updatePreferences(userId, updates);
      setPreferences(updated);
      setShowSettings(false);
    } catch (e) {
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

  // ==================== Drag logic for toggle button ====================
  const handleDragStart = useCallback((e) => {
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: btnPos.right,
      startBottom: btnPos.bottom,
      moved: false,
    };
    setIsDragging(true);
    e.preventDefault();
  }, [btnPos]);

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = dragRef.current.startX - clientX;
      const dy = dragRef.current.startY - clientY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }

      const newRight = Math.max(8, Math.min(window.innerWidth - 64, dragRef.current.startRight + dx));
      const newBottom = Math.max(8, Math.min(window.innerHeight - 64, dragRef.current.startBottom + dy));
      setBtnPos({ right: newRight, bottom: newBottom });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      // If barely moved, treat as a click → toggle panel
      if (!dragRef.current.moved) {
        setIsOpen(prev => !prev);
      }
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
  }, [isDragging]);

  // ==================== Resize logic for chat panel ====================
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
    setIsResizing(true);
  }, [panelSize]);

  useEffect(() => {
    if (!isResizing) return;

    const handleResizeMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = resizeRef.current.startX - clientX;
      const dy = resizeRef.current.startY - clientY;
      const { edge, startW, startH } = resizeRef.current;

      let newW = startW, newH = startH;
      if (edge.includes('left'))  newW = Math.max(320, Math.min(800, startW + dx));
      if (edge.includes('top'))   newH = Math.max(350, Math.min(900, startH + dy));

      setPanelSize({ width: newW, height: newH });
    };

    const handleResizeEnd = () => setIsResizing(false);

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
  }, [isResizing]);

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
        agentType,
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
  }, [inputValue, isLoading, sessionId, agentType, userId, buildResumeContext]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Switch agent mode
  const switchMode = useCallback((mode) => {
    setAgentType(mode);
    // Clear conversation when switching modes
    setMessages([]);
    setSessionId(null);
  }, []);

  // Handle quick action
  const handleQuickAction = useCallback((action) => {
    sendMessage(action.text);
  }, [sendMessage]);

  // New conversation
  const newConversation = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  // Render welcome screen when no messages
  const renderWelcome = () => {
    const currentMode = AGENT_MODES.find(m => m.key === agentType);
    const actions = QUICK_ACTIONS[agentType] || [];

    return (
      <div className="agent-welcome">
        <div className="agent-welcome-icon">{currentMode?.icon || '🤖'}</div>
        <h4>Resume AI Agent</h4>
        <p>
          {agentType === 'GENERAL' && 'I can help you improve your resume, write better content, and prepare for your job search.'}
          {agentType === 'BULLET_IMPROVER' && 'Paste your bullet points and I\'ll make them more impactful using proven techniques.'}
          {agentType === 'JOB_MATCHER' && 'Share a job description and I\'ll analyze how well your resume matches.'}
          {agentType === 'CONTENT_GENERATOR' && 'Tell me about your role and I\'ll generate professional resume content.'}
        </p>
        <div className="agent-quick-actions">
          {actions.map((action, i) => (
            <button
              key={i}
              className="agent-quick-btn"
              onClick={() => handleQuickAction(action)}
            >
              <span className="qb-icon" style={{
                background: i === 0 ? 'rgba(99,102,241,0.1)' :
                             i === 1 ? 'rgba(168,85,247,0.1)' :
                                       'rgba(34,197,94,0.1)'
              }}>
                {action.icon}
              </span>
              <span className="qb-text">
                <strong>{action.label}</strong>
                <span>{action.text}</span>
              </span>
            </button>
          ))}
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
          {isUser ? '👤' : '🤖'}
        </div>
        <div>
          <div
            className="msg-content"
            style={msg.isError ? { borderColor: '#fca5a5', background: '#fef2f2' } : {}}
            dangerouslySetInnerHTML={{ __html: formatMessage(safeContent) }}
          />
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

  // Settings panel UI
  const renderSettingsPanel = () => {
    if (prefLoading) return <div className="agent-settings-panel">Loading preferences...</div>;
    if (prefError) return <div className="agent-settings-panel">{prefError}</div>;
    if (!preferences) return null;
    return (
      <div className="agent-settings-panel">
        <h3>User Preferences</h3>
        <form onSubmit={e => { e.preventDefault(); handleSavePreferences(Object.fromEntries(new FormData(e.target))); }}>
          <label>Writing Tone:
            <select name="tone" defaultValue={preferences.tone || ''}>
              <option value="">(default)</option>
              <option value="professional">Professional</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
              <option value="technical">Technical</option>
            </select>
          </label>
          <label>Verbosity:
            <select name="verbosity" defaultValue={preferences.verbosity || ''}>
              <option value="">(default)</option>
              <option value="concise">Concise</option>
              <option value="moderate">Moderate</option>
              <option value="detailed">Detailed</option>
            </select>
          </label>
          <label>Target Role:
            <input name="targetRole" defaultValue={preferences.targetRole || ''} placeholder="e.g. Software Engineer" />
          </label>
          <label>Target Industry:
            <input name="targetIndustry" defaultValue={preferences.targetIndustry || ''} placeholder="e.g. Tech, Finance" />
          </label>
          <label>Experience Level:
            <select name="experienceLevel" defaultValue={preferences.experienceLevel || ''}>
              <option value="">(default)</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="executive">Executive</option>
            </select>
          </label>
          <label>Preferred Template:
            <select name="preferredTemplate" defaultValue={preferences.preferredTemplate || ''}>
              <option value="">(default)</option>
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="creative">Creative</option>
              <option value="ats">ATS</option>
            </select>
          </label>
          <label>Max Pages:
            <select name="maxPages" defaultValue={preferences.maxPages || 1}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </label>
          <label>
            <input type="checkbox" name="preferActionVerbs" defaultChecked={preferences.preferActionVerbs} /> Prefer action verbs
          </label>
          <label>
            <input type="checkbox" name="preferMetrics" defaultChecked={preferences.preferMetrics} /> Prefer metrics
          </label>
          <label>
            <input type="checkbox" name="atsOptimized" defaultChecked={preferences.atsOptimized} /> ATS optimized
          </label>
          <label>Target Companies:
            <input name="targetCompanies" defaultValue={preferences.targetCompanies || ''} placeholder="e.g. Google, Meta" />
          </label>
          <label>Custom Notes:
            <textarea name="customNotes" defaultValue={preferences.customNotes || ''} placeholder="Any extra info for the agent..." />
          </label>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={prefSaving}>Save</button>
            <button type="button" onClick={() => setShowSettings(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button — draggable */}
      <button
        ref={toggleBtnRef}
        className={`agent-toggle-btn ${isOpen ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        title={isOpen ? 'Close AI Agent' : 'Open AI Agent (drag to move)'}
        style={{ right: btnPos.right, bottom: btnPos.bottom }}
      >
        {showPulse && !isOpen && <span className="agent-toggle-pulse" />}
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Chat Panel — resizable */}
      {isOpen && (
        <div
          className={`agent-chat-panel ${isResizing ? 'resizing' : ''}`}
          ref={panelRef}
          style={{
            right: btnPos.right,
            bottom: btnPos.bottom + 68,
            width: panelSize.width,
            height: panelSize.height,
          }}
        >
          {/* Resize handles */}
          <div className="agent-resize-handle top"    onMouseDown={(e) => handleResizeStart('top', e)} onTouchStart={(e) => handleResizeStart('top', e)} />
          <div className="agent-resize-handle left"   onMouseDown={(e) => handleResizeStart('left', e)} onTouchStart={(e) => handleResizeStart('left', e)} />
          <div className="agent-resize-handle corner" onMouseDown={(e) => handleResizeStart('top-left', e)} onTouchStart={(e) => handleResizeStart('top-left', e)} />
          {/* Header */}
          <div className="agent-chat-header">
            <div className="agent-header-left">
              <div className="agent-avatar">🤖</div>
              <div className="agent-header-info">
                <h3>Resume AI Agent</h3>
                <span><span className="agent-status-dot" /> Online</span>
              </div>
            </div>
            <div className="agent-header-actions">
              <button
                className="agent-header-btn"
                onClick={newConversation}
                title="New conversation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                className="agent-header-btn"
                onClick={() => setShowSettings(true)}
                title="User Preferences / Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 11 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button
                className="agent-header-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="agent-mode-tabs">
            {AGENT_MODES.map(mode => (
              <button
                key={mode.key}
                className={`agent-mode-tab ${agentType === mode.key ? 'active' : ''}`}
                onClick={() => switchMode(mode.key)}
                title={mode.desc}
              >
                <span className="tab-icon">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
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
                    <span className="agent-typing-text">
                      {agentType === 'BULLET_IMPROVER' ? 'Improving your content...' :
                       agentType === 'JOB_MATCHER' ? 'Analyzing match...' :
                       agentType === 'CONTENT_GENERATOR' ? 'Generating content...' :
                       'Thinking...'}
                    </span>
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
                placeholder={
                  agentType === 'BULLET_IMPROVER' ? 'Paste a bullet point to improve...' :
                  agentType === 'JOB_MATCHER' ? 'Paste a job description to match...' :
                  agentType === 'CONTENT_GENERATOR' ? 'Describe what content you need...' :
                  'Ask me anything about your resume...'
                }
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
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
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
