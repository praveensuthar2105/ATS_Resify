import React from 'react';
import { useResume } from '../../context/ResumeContext';

const LatexCodeEditor = () => {
  const {
    latexCode,
    handleLatexChange,
    compiling,
    handleManualCompile,
    downloadTex,
    autoCompile,
    setAutoCompile,
    useOnlineCompiler,
    monacoAvailable,
    MonacoEditor,
    editorRef
  } = useResume();

  return (
    <div className="latex-editor-panel">
      <div className="latex-toolbar">
        <label className="auto-compile-toggle">
          <input
            type="checkbox"
            checked={autoCompile}
            onChange={(e) => setAutoCompile(e.target.checked)}
          />
          Auto-Compile
        </label>
        {useOnlineCompiler && <span className="online-indicator">🌐 Online</span>}
        <button className="toolbar-btn" onClick={handleManualCompile} disabled={compiling}>
          {compiling ? '⏳' : '▶'} Compile
        </button>
        <button className="toolbar-btn" onClick={downloadTex}>
          📤 Export .TEX
        </button>
      </div>
      <div className="latex-editor-container">
        {monacoAvailable && MonacoEditor ? (
          <MonacoEditor
            height="600px"
            defaultLanguage="latex"
            value={latexCode}
            onChange={handleLatexChange}
            theme="vs-dark"
            onMount={(editor) => { editorRef.current = editor; }}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontSize: 14,
              lineHeight: 1.6,
              scrollBeyondLastLine: false,
              fontFamily: "'Fira Code', 'Consolas', monospace",
              padding: { top: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              automaticLayout: true,
            }}
          />
        ) : (
          <textarea
            className="latex-textarea"
            value={latexCode}
            onChange={(e) => handleLatexChange(e.target.value)}
            spellCheck={false}
            rows={30}
          />
        )}
      </div>
    </div>
  );
};

export default LatexCodeEditor;
