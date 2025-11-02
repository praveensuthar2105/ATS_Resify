import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box, TextField, Stack, Alert, LinearProgress, Typography } from '@mui/material';

// Prefer env-configured API base; fallback to local backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Lightweight LaTeX editor with optional Monaco loader. Falls back to textarea if Monaco isn't installed.
export default function LatexEditor({ open, onClose, resumeData, templateType = 'professional' }) {
  const [loading, setLoading] = useState(false);
  const [latexCode, setLatexCode] = useState('');
  const [monacoAvailable, setMonacoAvailable] = useState(false);
  const [Editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [autoCompile, setAutoCompile] = useState(false);
  const autoTimer = useRef(null);
  const [compileStatus, setCompileStatus] = useState('');
  const [compileProgress, setCompileProgress] = useState(0);
  const compileTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Try to dynamically import monaco editor
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@monaco-editor/react');
        if (!cancelled) {
          setEditor(() => mod.Editor);
          setMonacoAvailable(true);
        }
      } catch (err) {
        // Monaco not installed - we'll fall back to textarea
        console.warn('monaco not available, falling back to textarea', err);
        setMonacoAvailable(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // Fetch LaTeX from backend using resumeData
    (async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/latex/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ resumeData, templateType })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data.latexCode) setLatexCode(data.latexCode);
        else setLatexCode(`% Failed to load LaTeX from server${data?.message ? `: ${data.message}` : ''}`);
      } catch (e) {
        console.error(e);
        setLatexCode('% Error contacting server');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, resumeData, templateType]);

  const handleSaveToFile = () => {
    const blob = new Blob([latexCode], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resumeData?.personalInformation?.fullName || 'resume').replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePreviewHtml = async () => {
    setCompileError('');
    setCompiling(true);
    setHtmlPreview('');
    try {
      // Load from CDN to avoid bundling issues; @vite-ignore keeps Vite from pre-bundling
      // eslint-disable-next-line no-undef
      const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/latex.js@0.12.6/dist/latex.esm.js');

      const latexjs = mod?.default || mod;
      const { HtmlGenerator, parse } = latexjs;
      const generator = new HtmlGenerator({ hyphenate: false });
      parse(latexCode, { generator });
      const doc = generator.htmlDocument();
      const html = doc.documentElement.outerHTML;
      setHtmlPreview(html);
    } catch (e) {
      setCompileError(e?.message || 'Failed to render HTML preview');
    } finally {
      setCompiling(false);
    }
  };

  const renderEditor = () => {
    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    if (monacoAvailable && Editor) {
      // Editor from @monaco-editor/react
      const MonacoEditor = Editor;
      return (
        <MonacoEditor
          height="60vh"
          defaultLanguage="plaintext"
          defaultValue={latexCode}
          onChange={(value) => setLatexCode(value)}
          theme="vs-light"
          onMount={(editor) => { editorRef.current = editor; }}
        />
      );
    }

    // Fallback textarea
    return (
      <TextField
        multiline
        fullWidth
        minRows={20}
        value={latexCode}
        onChange={(e) => setLatexCode(e.target.value)}
        variant="outlined"
      />
    );
  };

  const handleCompileToPdf = async () => {
    setCompileError('');
    setCompiling(true);
    setPdfUrl('');
    setCompileStatus('Starting compilation...');
    setCompileProgress(0);
    
    // Simulate progress for better UX
    let progressVal = 0;
    compileTimerRef.current = setInterval(() => {
      progressVal += 2;
      if (progressVal <= 90) {
        setCompileProgress(progressVal);
        if (progressVal < 20) setCompileStatus('Initializing compiler...');
        else if (progressVal < 40) setCompileStatus('Processing LaTeX source...');
        else if (progressVal < 60) setCompileStatus('Downloading packages (first time)...');
        else if (progressVal < 80) setCompileStatus('Generating PDF...');
        else setCompileStatus('Finalizing...');
      }
    }, 300);

    try {
      const resp = await fetch(`${API_BASE_URL}/latex/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ latexCode })
      });
      if (!resp.ok) {
        let msg = 'Server returned error';
        try { const j = await resp.json(); msg = j?.message || msg; } catch {}
        throw new Error(msg);
      }
      const blob = await resp.blob();
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setCompileProgress(100);
      setCompileStatus('PDF ready!');
    } catch (e) {
      setCompileError(e?.message || 'Failed to compile LaTeX');
    } finally {
      if (compileTimerRef.current) {
        clearInterval(compileTimerRef.current);
        compileTimerRef.current = null;
      }
      setCompiling(false);
      setTimeout(() => {
        setCompileStatus('');
        setCompileProgress(0);
      }, 2000);
    }
  };

  useEffect(() => {
    if (!autoCompile) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      handleCompileToPdf();
    }, 1000);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [latexCode, autoCompile]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>LaTeX Editor ({templateType})</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {compileError ? <Alert severity="warning">{compileError}</Alert> : null}
          {compiling && compileStatus ? (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  {compileStatus}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={compileProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {compileProgress < 60 ? 'First compile may take 30-60s to download packages...' : 'Almost done...'}
              </Typography>
            </Box>
          ) : null}
          {renderEditor()}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={autoCompile} onChange={(e) => setAutoCompile(e.target.checked)} />
              Auto compile
            </label>
          </Box>
          {htmlPreview ? (
            <Box sx={{ height: 400, border: '1px solid #e5e7eb' }}>
              <iframe title="HTML Preview" srcDoc={htmlPreview} style={{ width: '100%', height: '100%', border: 'none' }} />
            </Box>
          ) : null}
          {pdfUrl ? (
            <Box sx={{ height: 400, border: '1px solid #e5e7eb' }}>
              <iframe title="PDF Preview" src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePreviewHtml} disabled={compiling}>Preview (HTML)</Button>
        <Button onClick={handleCompileToPdf} disabled={compiling}>
          {compiling ? 'Compiling…' : 'Compile to PDF'}
        </Button>
        <Button onClick={() => { if (pdfBlob) { const a = document.createElement('a'); const url = URL.createObjectURL(pdfBlob); a.href = url; a.download = `${(resumeData?.personalInformation?.fullName || 'resume').replace(/\s+/g, '_')}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0); }}} disabled={!pdfBlob}>
          Download PDF
        </Button>
        <Button onClick={handleSaveToFile}>Download .tex</Button>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
