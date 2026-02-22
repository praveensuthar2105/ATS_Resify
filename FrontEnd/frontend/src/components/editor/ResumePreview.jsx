import React from 'react';
import { useResume } from '../../context/ResumeContext';

const ResumePreview = () => {
  const {
    compiling,
    pdfUrl,
    zoom,
    setZoom,
    compileError,
    useOnlineCompiler,
    handleManualCompile,
    downloadTex,
  } = useResume();

  return (
    <div className="preview-panel">
      <div className="preview-card">
        <div className="preview-header">
          <div className="preview-title">
            <span className={`live-dot ${compiling ? 'compiling' : pdfUrl ? 'ready' : ''}`}></span>
            {compiling ? 'Compiling...' : 'PDF Preview'}
          </div>
          <div className="preview-actions">
            {useOnlineCompiler && <span className="online-indicator" title="Using online compiler">🌐</span>}
            <button
              className="compile-btn"
              onClick={handleManualCompile}
              disabled={compiling}
              title="Compile LaTeX to PDF"
            >
              {compiling ? '⏳' : '▶'}
            </button>
            <div className="zoom-controls">
              <button onClick={() => setZoom(Math.max(50, zoom - 10))}>−</button>
              <span>{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button>
            </div>
          </div>
        </div>
        <div className="preview-content pdf-preview-content">
          {compiling ? (
            <div className="pdf-loading">
              <div className="loading-spinner"></div>
              <p>Compiling LaTeX to PDF...</p>
            </div>
          ) : compileError ? (
            <div className="pdf-error">
              <div className="error-icon">⚠️</div>
              <h3>Compilation Error</h3>
              <p className="error-message">{compileError}</p>
              <div className="error-actions">
                <button onClick={handleManualCompile}>🔄 Retry</button>
                <button onClick={downloadTex}>📤 Download .TEX</button>
              </div>
              <p className="error-hint">
                💡 Download .TEX and use <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer">Overleaf</a> to compile
              </p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="pdf-iframe"
              title="PDF Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center'
              }}
            />
          ) : (
            <div className="pdf-placeholder">
              <div className="placeholder-icon">📄</div>
              <h3>No PDF Preview</h3>
              <p>Make changes to generate PDF preview</p>
              <button className="compile-now-btn" onClick={handleManualCompile}>
                ▶ Compile Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
