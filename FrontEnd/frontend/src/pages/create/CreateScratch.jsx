import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, Plus, Trash2, ChevronLeft, ChevronRight, Check,
  Loader2, ArrowLeft, User, Briefcase, GraduationCap, Award, Wrench
} from 'lucide-react';
import { agentAPI } from '../../services/agentApi';

/* ─── Step metadata ─── */
const STEPS = [
  { num: 1, label: 'Personal',   icon: User,          desc: 'Your contact details and professional summary' },
  { num: 2, label: 'Experience', icon: Briefcase,     desc: "Where you've worked and what you achieved" },
  { num: 3, label: 'Education',  icon: GraduationCap, desc: 'Degrees, universities, and graduation dates' },
  { num: 4, label: 'Achievements', icon: Award,       desc: 'Awards, certifications, and notable recognitions (optional)' },
  { num: 5, label: 'Skills',     icon: Wrench,        desc: 'Group your technical expertise into distinct categories' },
];

const CreateScratch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [compilingState, setCompilingState] = useState(false);

  /* ─── Form state ─── */
  const [personal, setPersonal] = useState({
    fullName: '', email: '', phoneNumber: '',
    location: '', linkedIn: '', gitHub: '', summary: ''
  });

  const [experience, setExperience] = useState([
    { company: '', jobTitle: '', duration: '', location: '', responsibility: '' }
  ]);

  const [education, setEducation] = useState([
    { university: '', degree: '', graduationYear: '', location: '' }
  ]);

  const [achievements, setAchievements] = useState([
    { title: '', issuer: '', year: '', description: '' }
  ]);

  const [skillsCategories, setSkillsCategories] = useState([
    { category: 'Languages', items: 'Java, Python, JavaScript' },
    { category: 'Frameworks', items: 'React, Spring Boot, Node.js' },
    { category: 'Tools', items: 'Git, Docker, AWS' }
  ]);

  /* ─── AI bullet states ─── */
  const [improvingIdx, setImprovingIdx] = useState(null);
  const [improvedSuggestion, setImprovedSuggestion] = useState('');

  /* ─── CRUD helpers ─── */
  const addTo = (setter, template) => setter(prev => [...prev, { ...template }]);
  const removeFrom = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));
  const updateIn = (setter, index, field, value) =>
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));

  /* ─── AI bullet improver ─── */
  const handleImproveBullet = async (index) => {
    const bullet = experience[index].responsibility;
    if (!bullet || bullet.trim().length < 5) return;
    setImprovingIdx(index);
    setImprovedSuggestion('');
    try {
      const res = await agentAPI.improveBullet(bullet, personal.summary ? 'Professional' : '');
      setImprovedSuggestion(res?.improved || 'Failed to improve. Try adding more detail.');
    } catch (err) {
      console.error(err);
      setImprovedSuggestion('Error contacting AI service.');
    } finally {
      setImprovingIdx(null);
    }
  };

  const acceptSuggestion = (index) => {
    updateIn(setExperience, index, 'responsibility', improvedSuggestion);
    setImprovedSuggestion('');
  };

  /* ─── Final submit ─── */
  const handleFinish = async () => {
    setCompilingState(true);
    await new Promise(resolve => setTimeout(resolve, 2200));
    try {
      const skillsArray = skillsCategories
        .map(cat => ({
          title: cat.category.trim(), category: cat.category.trim(),
          level: 'Expert',
          items: cat.items.split(',').map(s => s.trim()).filter(Boolean)
        }))
        .filter(cat => cat.title && cat.items.length > 0);

      const certificationsArray = [];
      const achievementsArray = [];
      achievements.forEach(ach => {
        if (!ach.title.trim()) return;
        if (ach.issuer.trim()) {
          certificationsArray.push({
            title: ach.title.trim(),
            issuingOrganization: ach.issuer.trim(),
            year: ach.year.trim()
          });
        } else {
          achievementsArray.push({ title: ach.title.trim(), year: ach.year.trim() });
        }
      });

      const formattedResume = {
        data: {
          personalInformation: {
            fullName: personal.fullName, email: personal.email,
            phoneNumber: personal.phoneNumber, location: personal.location,
            linkedIn: personal.linkedIn, gitHub: personal.gitHub
          },
          summary: personal.summary,
          skills: skillsArray,
          experience: experience.map(exp => ({
            company: exp.company, jobTitle: exp.jobTitle,
            location: exp.location, duration: exp.duration,
            responsibility: exp.responsibility
          })),
          education: education.map(edu => ({
            university: edu.university, degree: edu.degree,
            location: edu.location, graduationYear: edu.graduationYear
          })),
          certifications: certificationsArray,
          achievements: achievementsArray
        },
        selectedTemplate: 'ats'
      };

      localStorage.setItem('generatedResume', JSON.stringify(formattedResume));
      navigate('/edit-resume', { state: { triggerFeedback: true } });
    } catch (e) {
      console.error(e);
      setCompilingState(false);
    }
  };

  /* ─── Shared classnames ─── */
  const inputBase =
    'w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 text-[14px] text-slate-800 ' +
    'placeholder:text-slate-400 outline-none transition-all duration-200 ' +
    'focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/10 focus:bg-white';
  const labelBase = 'block text-[13px] font-semibold text-[#3D5751] mb-1.5';

  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fdfb] via-[#eefbf7] to-[#d5f5ec] pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center">
      <Helmet><title>Start From Scratch | ATS Resify</title></Helmet>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-200/15 blur-[100px] pointer-events-none" />

      <div className="max-w-[780px] w-full relative z-10">

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium border-none bg-transparent cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {compilingState ? (
          /* ─── Compile Transition ─── */
          <div className="glass-panel-tier-1 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-6 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Compiling your resume...</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              AI Writer active. Assembling sections and structuring for optimal ATS parsing.
            </p>
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-6 border border-slate-200/20">
              <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] rounded-full animate-pulse-travel" />
            </div>
          </div>
        ) : (
          <>
            {/* ─── Step Indicator ─── */}
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <button
                      onClick={() => setStep(s.num)}
                      className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group transition-all"
                      style={{ minWidth: 64 }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-[#0D9488] text-white shadow-lg shadow-teal-600/20 scale-110'
                            : isDone
                              ? 'bg-[#14B8A6]/15 text-[#0D9488]'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-wide transition-colors ${
                          isActive ? 'text-[#0D9488]' : isDone ? 'text-[#0D9488]/60' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>

                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mx-1 mt-[-12px] rounded-full overflow-hidden bg-slate-200/60">
                        <div
                          className="h-full bg-[#14B8A6] transition-all duration-500"
                          style={{ width: step > s.num ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ─── Form Card ─── */}
            <div className="glass-panel-tier-1 rounded-3xl p-8 md:p-10 flex flex-col justify-between min-h-[560px]">
              <div>
                {/* Step Header */}
                <div className="mb-7">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{currentStep.label}</h2>
                    <span className="text-[10px] font-bold text-[#0D9488] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full tracking-widest uppercase">
                      {step} / {STEPS.length}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{currentStep.desc}</p>
                </div>

                {/* ═════════ STEP 1: Personal ═════════ */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>Full Name</label>
                        <input
                          type="text" placeholder="e.g. John Doe"
                          value={personal.fullName}
                          onChange={e => setPersonal({ ...personal, fullName: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={labelBase}>Email Address</label>
                        <input
                          type="email" placeholder="e.g. john.doe@example.com"
                          value={personal.email}
                          onChange={e => setPersonal({ ...personal, email: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>Phone Number</label>
                        <input
                          type="text" placeholder="e.g. (555) 123-4567"
                          value={personal.phoneNumber}
                          onChange={e => setPersonal({ ...personal, phoneNumber: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={labelBase}>Location</label>
                        <input
                          type="text" placeholder="e.g. San Francisco, CA"
                          value={personal.location}
                          onChange={e => setPersonal({ ...personal, location: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>LinkedIn URL</label>
                        <input
                          type="text" placeholder="e.g. linkedin.com/in/johndoe"
                          value={personal.linkedIn}
                          onChange={e => setPersonal({ ...personal, linkedIn: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={labelBase}>GitHub URL</label>
                        <input
                          type="text" placeholder="e.g. github.com/johndoe"
                          value={personal.gitHub}
                          onChange={e => setPersonal({ ...personal, gitHub: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelBase}>Professional Summary</label>
                      <textarea
                        placeholder="Briefly summarize your key skills, experience level, and what value you bring..."
                        rows={4}
                        value={personal.summary}
                        onChange={e => setPersonal({ ...personal, summary: e.target.value })}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                )}

                {/* ═════════ STEP 2: Experience ═════════ */}
                {step === 2 && (
                  <div className="flex flex-col gap-5 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/60 to-slate-50/40"
                      >
                        {/* Card number badge + delete */}
                        <div className="flex items-center justify-between mb-5">
                          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            Position
                          </span>
                          {experience.length > 1 && (
                            <button
                              onClick={() => removeFrom(setExperience, idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                          <div>
                            <label className={labelBase}>Company</label>
                            <input
                              type="text" placeholder="e.g. Acme Corp"
                              value={exp.company}
                              onChange={e => updateIn(setExperience, idx, 'company', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Job Title</label>
                            <input
                              type="text" placeholder="e.g. Senior Software Engineer"
                              value={exp.jobTitle}
                              onChange={e => updateIn(setExperience, idx, 'jobTitle', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                          <div>
                            <label className={labelBase}>Duration</label>
                            <input
                              type="text" placeholder="e.g. Jun 2022 – Present"
                              value={exp.duration}
                              onChange={e => updateIn(setExperience, idx, 'duration', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Location</label>
                            <input
                              type="text" placeholder="e.g. San Francisco, CA"
                              value={exp.location}
                              onChange={e => updateIn(setExperience, idx, 'location', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>

                        {/* Responsibilities + AI button */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[13px] font-semibold text-[#3D5751]">Responsibilities & Metrics</label>
                            <button
                              onClick={() => handleImproveBullet(idx)}
                              disabled={improvingIdx === idx || !exp.responsibility.trim()}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-[#0D9488] hover:text-teal-600 bg-[#14B8A6]/8 hover:bg-[#14B8A6]/15 border border-[#14B8A6]/15 rounded-lg px-2.5 py-1.5 cursor-pointer disabled:opacity-40 transition-all"
                            >
                              {improvingIdx === idx ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing...</>
                              ) : (
                                <><Sparkles className="w-3.5 h-3.5" /> Improve with AI</>
                              )}
                            </button>
                          </div>
                          <textarea
                            placeholder="What did you build or lead? Focus on key results and quantify where possible..."
                            rows={3}
                            value={exp.responsibility}
                            onChange={e => updateIn(setExperience, idx, 'responsibility', e.target.value)}
                            className={`${inputBase} resize-none`}
                          />

                          {/* AI Suggestion */}
                          {improvedSuggestion && experience[idx]?.responsibility.trim() && (
                            <div className="mt-3 p-4 bg-[#14B8A6]/5 border border-[#14B8A6]/15 rounded-xl">
                              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider block mb-1.5">AI Suggestion</span>
                              <p className="text-[13px] text-slate-700 leading-relaxed m-0">"{improvedSuggestion}"</p>
                              <div className="flex gap-2.5 mt-3">
                                <button
                                  onClick={() => acceptSuggestion(idx)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900 px-3.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors border-none"
                                >
                                  <Check className="w-3.5 h-3.5" /> Accept
                                </button>
                                <button
                                  onClick={() => setImprovedSuggestion('')}
                                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTo(setExperience, { company: '', jobTitle: '', duration: '', location: '', responsibility: '' })}
                      className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                    >
                      <Plus className="w-4 h-4" /> Add Another Position
                    </button>
                  </div>
                )}

                {/* ═════════ STEP 3: Education ═════════ */}
                {step === 3 && (
                  <div className="flex flex-col gap-5 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/60 to-slate-50/40"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            Education
                          </span>
                          {education.length > 1 && (
                            <button
                              onClick={() => removeFrom(setEducation, idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                          <div>
                            <label className={labelBase}>University / Institution</label>
                            <input
                              type="text" placeholder="e.g. Stanford University"
                              value={edu.university}
                              onChange={e => updateIn(setEducation, idx, 'university', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Degree / Field of Study</label>
                            <input
                              type="text" placeholder="e.g. B.S. Computer Science"
                              value={edu.degree}
                              onChange={e => updateIn(setEducation, idx, 'degree', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className={labelBase}>Graduation Year / Duration</label>
                            <input
                              type="text" placeholder="e.g. 2018 – 2022"
                              value={edu.graduationYear}
                              onChange={e => updateIn(setEducation, idx, 'graduationYear', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Location</label>
                            <input
                              type="text" placeholder="e.g. Stanford, CA"
                              value={edu.location}
                              onChange={e => updateIn(setEducation, idx, 'location', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTo(setEducation, { university: '', degree: '', graduationYear: '', location: '' })}
                      className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                    >
                      <Plus className="w-4 h-4" /> Add Another Education
                    </button>
                  </div>
                )}

                {/* ═════════ STEP 4: Achievements ═════════ */}
                {step === 4 && (
                  <div className="flex flex-col gap-5 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {achievements.map((ach, idx) => (
                      <div
                        key={idx}
                        className="relative p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/60 to-slate-50/40"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            Achievement
                          </span>
                          {achievements.length > 1 && (
                            <button
                              onClick={() => removeFrom(setAchievements, idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                          <div>
                            <label className={labelBase}>Title</label>
                            <input
                              type="text" placeholder="e.g. AWS Solutions Architect"
                              value={ach.title}
                              onChange={e => updateIn(setAchievements, idx, 'title', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Issuer / Organization <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text" placeholder="e.g. Amazon Web Services"
                              value={ach.issuer}
                              onChange={e => updateIn(setAchievements, idx, 'issuer', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className={labelBase}>Date / Year</label>
                            <input
                              type="text" placeholder="e.g. Mar 2024"
                              value={ach.year}
                              onChange={e => updateIn(setAchievements, idx, 'year', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className={labelBase}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text" placeholder="e.g. Scored 940/1000 on final exam"
                              value={ach.description}
                              onChange={e => updateIn(setAchievements, idx, 'description', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTo(setAchievements, { title: '', issuer: '', year: '', description: '' })}
                      className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                    >
                      <Plus className="w-4 h-4" /> Add Achievement
                    </button>
                  </div>
                )}

                {/* ═════════ STEP 5: Skills ═════════ */}
                {step === 5 && (
                  <div className="flex flex-col gap-5 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {skillsCategories.map((skill, idx) => (
                      <div
                        key={idx}
                        className="relative p-5 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/60 to-slate-50/40"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            Category
                          </span>
                          {skillsCategories.length > 1 && (
                            <button
                              onClick={() => removeFrom(setSkillsCategories, idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-4">
                            <label className={labelBase}>Category Name</label>
                            <input
                              type="text" placeholder="e.g. Databases"
                              value={skill.category}
                              onChange={e => updateIn(setSkillsCategories, idx, 'category', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                          <div className="md:col-span-8">
                            <label className={labelBase}>Skills <span className="text-slate-400 font-normal">(comma separated)</span></label>
                            <input
                              type="text" placeholder="e.g. PostgreSQL, Redis, MongoDB"
                              value={skill.items}
                              onChange={e => updateIn(setSkillsCategories, idx, 'items', e.target.value)}
                              className={inputBase}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addTo(setSkillsCategories, { category: '', items: '' })}
                      className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                    >
                      <Plus className="w-4 h-4" /> Add Skill Category
                    </button>
                  </div>
                )}
              </div>

              {/* ─── Bottom Actions ─── */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 border-none bg-transparent cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-1.5 px-7 py-3 text-xs font-bold text-white bg-slate-900 rounded-full cursor-pointer hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all border-none"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-7 py-3 text-xs font-bold text-white bg-[#0D9488] rounded-full cursor-pointer hover:bg-[#0D9488]/90 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(13,148,136,0.25)] transition-all border-none"
                  >
                    Assemble & Compile <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateScratch;
