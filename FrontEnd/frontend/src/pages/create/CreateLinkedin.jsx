import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { resumeAPI } from '../../services/api';

const CreateLinkedin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressState, setProgressState] = useState(''); // 'reading', 'extracting', 'structuring', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedSummary, setParsedSummary] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setSelectedFile(file);
      setErrorMessage('');
      setParsedSummary(null);
      setProgressState('');
    } else {
      setErrorMessage('Unsupported file type. Please upload your LinkedIn exported PDF file.');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMessage('');
    
    // Simulate steps in parser diagnostic
    setProgressState('reading');
    await new Promise(r => setTimeout(r, 1200));
    
    setProgressState('extracting');
    await new Promise(r => setTimeout(r, 1500));

    setProgressState('structuring');

    try {
      const result = await resumeAPI.importFromPdf(selectedFile, 'linkedin');

      if (result.success && result.data) {
        const resumeWithTemplate = {
          data: result.data,
          selectedTemplate: 'ats'
        };
        localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
        
        // Build parsing summary stats
        const expCount = Array.isArray(result.data.experience) ? result.data.experience.length : 0;
        const eduCount = Array.isArray(result.data.education) ? result.data.education.length : 0;
        const skillsCount = Array.isArray(result.data.skills) ? result.data.skills.length : 0;

        setParsedSummary({
          experience: expCount,
          education: eduCount,
          skills: skillsCount
        });
        setProgressState('success');
      } else {
        setProgressState('error');
        setErrorMessage(result.error || 'Failed to extract structured data from LinkedIn profile PDF.');
      }
    } catch (error) {
      console.error(error);
      setProgressState('error');
      setErrorMessage(error.response?.data?.error || error.message || 'Error occurred during LinkedIn PDF parsing.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fdfb] via-[#eefbf7] to-[#d5f5ec] pt-28 pb-16 px-6 relative overflow-hidden flex flex-col items-center justify-start">
      <Helmet>
        <title>Import from LinkedIn | ATS Resify</title>
      </Helmet>

      {/* Decorative Blur Blob */}
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-[640px] w-full relative z-10">
        
        {/* Header link */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium border-none bg-transparent cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Central Card with High Contrast */}
        <div className="glass-panel-tier-1 rounded-3xl p-8 text-center">
          
          <h2 className="text-3xl font-bold text-slate-800 font-sans tracking-tight">Import from LinkedIn</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Upload your exported LinkedIn profile PDF — we'll extract your work history, skills, and education.
          </p>

          {/* Guide Note */}
          {progressState !== 'success' && !selectedFile && (
            <div className="mt-4 p-4 rounded-xl bg-teal-50/40 border border-teal-100/60 text-left">
              <h4 className="text-xs font-bold text-[#0D9488] mb-1 font-sans">How to get your profile PDF:</h4>
              <p className="text-[11px] text-slate-500 leading-normal m-0">
                1. Go to your LinkedIn profile. <br />
                2. Click the <strong>"More"</strong> button in your header cards. <br />
                3. Select <strong>"Save to PDF"</strong> and upload the exported file here.
              </p>
            </div>
          )}

          {/* Drag & Drop Zone */}
          {progressState !== 'success' && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`mt-6 border-2 rounded-2xl p-10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] group ${
                dragActive 
                  ? 'border-[#14B8A6] bg-[#14B8A6]/8 scale-[1.02]' 
                  : selectedFile 
                    ? 'border-[#14B8A6]/60 bg-teal-50/20' 
                    : 'border-dashed border-[rgba(20,120,100,0.25)] bg-[rgba(20,180,140,0.03)] hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/5'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />

              {/* Gradient chip upload icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e6f8f3] to-[#d5f5ec] border border-[#14B8A6]/20 shadow-[0_4px_12px_rgba(20,100,80,0.08)] text-[#0D9488] flex items-center justify-center mb-4 transition-transform duration-200 ${dragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Upload className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0D9488]" /> {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 font-mono">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700 m-0">Drag & drop your LinkedIn PDF here</p>
                  <p className="text-xs text-slate-455 mt-1.5 m-0 font-medium">or click to browse · PDF format only, up to 5MB</p>
                </div>
              )}
            </div>
          )}

          {/* Supports Section with file-type tags */}
          {progressState !== 'success' && !selectedFile && (
            <div className="flex items-center justify-center gap-2.5 mt-6 text-xs text-slate-450 font-medium font-sans">
              <span className="flex items-center gap-1 bg-[#14B8A6]/5 border border-[#14B8A6]/10 px-2 py-1 rounded-md">
                <FileText className="w-3 h-3 text-[#0D9488]" /> LinkedIn Profile PDF
              </span>
              <span>Only PDF exports are supported</span>
            </div>
          )}

          {/* Loading / Diagnostic Progress Bar */}
          {loading && (
            <div className="mt-8 p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col gap-3.5 text-left font-mono">
              <div className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Parser Diagnostic
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${progressState === 'reading' || progressState === 'extracting' || progressState === 'structuring' ? 'bg-[#14B8A6]' : 'bg-slate-200'}`} />
                    1. Reading LinkedIn PDF...
                  </span>
                  {progressState !== 'reading' && <span className="text-[#0D9488] font-bold">Done</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${progressState === 'extracting' || progressState === 'structuring' ? 'bg-[#14B8A6]' : 'bg-slate-200'}`} />
                    2. Parsing profiles & sections...
                  </span>
                  {progressState === 'structuring' && <span className="text-[#0D9488] font-bold">Done</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${progressState === 'structuring' ? 'bg-[#14B8A6] animate-pulse' : 'bg-slate-200'}`} />
                    3. Aligning with ATS standards...
                  </span>
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative mt-1">
                <div className="absolute top-0 bottom-0 w-24 bg-[#14B8A6] rounded-full animate-pulse-travel" />
              </div>
            </div>
          )}

          {/* Success Panel */}
          {progressState === 'success' && parsedSummary && (
            <div className="mt-8 p-6 rounded-2xl border border-emerald-105 bg-emerald-50/20 text-center flex flex-col items-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850">LinkedIn profile parsed successfully!</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Imported <strong>{parsedSummary.experience}</strong> experience items · <strong>{parsedSummary.education}</strong> education items · <strong>{parsedSummary.skills}</strong> skills categories.
              </p>
              
              <button 
                onClick={() => navigate('/edit-resume', { state: { triggerFeedback: true } })}
                className="mt-6 flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all border-none cursor-pointer"
              >
                Review & Edit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Panel */}
          {progressState === 'error' && (
            <div className="mt-8 p-5 rounded-2xl border border-red-100 bg-red-50/20 flex flex-col items-center text-center animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-650 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">LinkedIn parsing failed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {errorMessage}
              </p>
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setProgressState('')}
                  className="text-xs font-bold text-[#0D9488] hover:text-teal-650 bg-transparent border-none cursor-pointer font-sans"
                >
                  Try again
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-650 bg-transparent border-none cursor-pointer font-sans"
                >
                  Choose another flow
                </button>
              </div>
            </div>
          )}

          {/* CTA Trigger */}
          {selectedFile && !loading && progressState !== 'success' && progressState !== 'error' && (
            <button 
              onClick={handleUpload}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all border-none cursor-pointer shadow-sm animate-fade-in"
            >
              Parse my profile <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default CreateLinkedin;
