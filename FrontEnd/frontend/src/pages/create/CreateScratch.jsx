import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Plus, Trash, ChevronLeft, ChevronRight, Check, Loader2, ArrowLeft } from 'lucide-react';
import { agentAPI } from '../../services/agentApi';

const CreateScratch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [compilingState, setCompilingState] = useState(false);

  // Form State
  const [personal, setPersonal] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    linkedIn: '',
    gitHub: '',
    summary: ''
  });

  const [experience, setExperience] = useState([
    {
      company: '',
      jobTitle: '',
      duration: '',
      location: '',
      responsibility: ''
    }
  ]);

  const [education, setEducation] = useState([
    {
      university: '',
      degree: '',
      graduationYear: '',
      location: ''
    }
  ]);

  // Step 4: Achievements (optional)
  const [achievements, setAchievements] = useState([
    {
      title: '',
      issuer: '',
      year: '',
      description: ''
    }
  ]);

  // Step 5: Core Skills (restructured categorized)
  const [skillsCategories, setSkillsCategories] = useState([
    { category: 'Languages', items: 'Java, Python, JavaScript' },
    { category: 'Frameworks', items: 'React, Spring Boot, Node.js' },
    { category: 'Tools', items: 'Git, Docker, AWS' }
  ]);

  // AI Bullet states
  const [improvingIdx, setImprovingIdx] = useState(null);
  const [improvedSuggestion, setImprovedSuggestion] = useState('');

  // Handlers for experience
  const addExperience = () => {
    setExperience([...experience, { company: '', jobTitle: '', duration: '', location: '', responsibility: '' }]);
  };

  const removeExperience = (index) => {
    const updated = [...experience];
    updated.splice(index, 1);
    setExperience(updated);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  // Handlers for education
  const addEducation = () => {
    setEducation([...education, { university: '', degree: '', graduationYear: '', location: '' }]);
  };

  const removeEducation = (index) => {
    const updated = [...education];
    updated.splice(index, 1);
    setEducation(updated);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  // Handlers for achievements
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', issuer: '', year: '', description: '' }]);
  };

  const removeAchievement = (index) => {
    const updated = [...achievements];
    updated.splice(index, 1);
    setAchievements(updated);
  };

  const updateAchievement = (index, field, value) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
  };

  // Handlers for skills categories
  const addSkillsCategory = () => {
    setSkillsCategories([...skillsCategories, { category: '', items: '' }]);
  };

  const removeSkillsCategory = (index) => {
    const updated = [...skillsCategories];
    updated.splice(index, 1);
    setSkillsCategories(updated);
  };

  const updateSkillsCategory = (index, field, value) => {
    const updated = [...skillsCategories];
    updated[index][field] = value;
    setSkillsCategories(updated);
  };

  // AI Bullet improver call
  const handleImproveBullet = async (index) => {
    const bullet = experience[index].responsibility;
    if (!bullet || bullet.trim().length < 5) return;

    setImprovingIdx(index);
    setImprovedSuggestion('');

    try {
      const res = await agentAPI.improveBullet(bullet, personal.summary ? 'Professional' : '');
      if (res && res.improved) {
        setImprovedSuggestion(res.improved);
      } else {
        setImprovedSuggestion('Failed to improve. Try adding more detail.');
      }
    } catch (err) {
      console.error(err);
      setImprovedSuggestion('Error contacting AI service.');
    } finally {
      setImprovingIdx(null);
    }
  };

  const acceptSuggestion = (index) => {
    updateExperience(index, 'responsibility', improvedSuggestion);
    setImprovedSuggestion('');
  };

  // Final submit
  const handleFinish = async () => {
    setCompilingState(true);
    await new Promise(resolve => setTimeout(resolve, 2200));

    try {
      // Map skills state into array matching schema in EditResume
      const skillsArray = skillsCategories.map(cat => ({
        title: cat.category.trim(),
        category: cat.category.trim(),
        level: 'Expert',
        items: cat.items.split(',').map(s => s.trim()).filter(Boolean)
      })).filter(cat => cat.title && cat.items.length > 0);

      // Separate achievements with issuer into certifications, others into achievements
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
          achievementsArray.push({
            title: ach.title.trim(),
            year: ach.year.trim()
          });
        }
      });

      const formattedResume = {
        data: {
          personalInformation: {
            fullName: personal.fullName,
            email: personal.email,
            phoneNumber: personal.phoneNumber,
            location: personal.location,
            linkedIn: personal.linkedIn,
            gitHub: personal.gitHub
          },
          summary: personal.summary,
          skills: skillsArray,
          experience: experience.map(exp => ({
            company: exp.company,
            jobTitle: exp.jobTitle,
            location: exp.location,
            duration: exp.duration,
            responsibility: exp.responsibility
          })),
          education: education.map(edu => ({
            university: edu.university,
            degree: edu.degree,
            location: edu.location,
            graduationYear: edu.graduationYear
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

  const getProgressPercentage = () => {
    return (step / 5) * 100;
  };

  // Glassmorphic design tokens
  const cardClass = "glass-panel-tier-1 rounded-3xl p-8 md:p-10 flex flex-col justify-between min-h-[560px]";
  const inputClass = "w-full px-4 py-3 glass-input-field text-sm text-slate-800 placeholder-slate-400 placeholder:text-slate-400/80";
  const labelClass = "text-xs font-semibold text-slate-700 tracking-wide mb-2 block";
  const groupSpacingClass = "flex flex-col gap-8 md:gap-9";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fdfb] via-[#eefbf7] to-[#d5f5ec] pt-28 pb-16 px-6 relative overflow-hidden flex flex-col items-center">
      <Helmet>
        <title>Start From Scratch | ATS Resify</title>
      </Helmet>
      
      {/* Decorative Blob */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-[720px] w-full relative z-10">
        
        {/* Header link */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium border-none bg-transparent cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {compilingState ? (
          /* Compile Transition */
          <div className="glass-panel-tier-1 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[450px]">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-6 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-slate-850 font-sans tracking-tight">Compiling your resume...</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              AI Writer active. Assembling sections and structuring for optimal ATS parsing.
            </p>
            
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-6 border border-slate-200/20">
              <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] rounded-full animate-pulse-travel" />
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className={cardClass}>
            <div>
              {/* Top Step Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#0D9488] tracking-widest uppercase mb-2">
                  <span>Step {step} of 5</span>
                  <span>{Math.round(getProgressPercentage())}% Complete</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#14B8A6] to-[#0D9488] rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Step Title & Subtext */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 font-sans">
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Work Experience"}
                  {step === 3 && "Education Details"}
                  {step === 4 && "Achievements"}
                  {step === 5 && "Core Skills"}
                </h2>
                {step === 4 && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Awards, certifications, publications, or notable recognitions (optional).
                  </p>
                )}
                {step === 5 && (
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Group your technical expertise, tools, and methodologies into distinct categories.
                  </p>
                )}
              </div>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className={groupSpacingClass}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col">
                      <label className={labelClass}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={personal.fullName}
                        onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. john.doe@example.com"
                        value={personal.email}
                        onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col">
                      <label className={labelClass}>Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. (555) 123-4567"
                        value={personal.phoneNumber}
                        onChange={(e) => setPersonal({ ...personal, phoneNumber: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. San Francisco, CA"
                        value={personal.location}
                        onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col">
                      <label className={labelClass}>LinkedIn Profile URL</label>
                      <input 
                        type="text" 
                        placeholder="e.g. linkedin.com/in/johndoe"
                        value={personal.linkedIn}
                        onChange={(e) => setPersonal({ ...personal, linkedIn: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>GitHub Profile URL</label>
                      <input 
                        type="text" 
                        placeholder="e.g. github.com/johndoe"
                        value={personal.gitHub}
                        onChange={(e) => setPersonal({ ...personal, gitHub: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={labelClass}>Professional Summary</label>
                    <textarea 
                      placeholder="Briefly summarize your key skills, experience level, and what value you bring to automated hiring pipelines..."
                      rows={4}
                      value={personal.summary}
                      onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Work Experience */}
              {step === 2 && (
                <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pr-2">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="p-6 border border-slate-200/80 rounded-2xl bg-slate-50/40 flex flex-col gap-6 relative">
                      {experience.length > 1 && (
                        <button 
                          onClick={() => removeExperience(idx)}
                          className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>Company Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Acme Corp"
                            value={exp.company}
                            onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Job Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Senior Software Engineer"
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(idx, 'jobTitle', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>Duration (e.g., Jun 2022 - Present)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Jun 2022 - Present"
                            value={exp.duration}
                            onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Location</label>
                          <input 
                            type="text" 
                            placeholder="e.g. San Francisco, CA"
                            value={exp.location}
                            onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-semibold text-slate-700 tracking-wide m-0">Responsibilities & Metrics</label>
                          <button
                            onClick={() => handleImproveBullet(idx)}
                            disabled={improvingIdx === idx || !exp.responsibility.trim()}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#0D9488] hover:text-teal-500 bg-teal-50 hover:bg-teal-100/60 border border-teal-100 rounded-lg px-2.5 py-1.5 cursor-pointer disabled:opacity-40 transition-colors"
                          >
                            {improvingIdx === idx ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" /> Improve with AI
                              </>
                            )}
                          </button>
                        </div>
                        <textarea 
                          placeholder="What did you build or lead? Focus on key results and quantify where possible..."
                          rows={3}
                          value={exp.responsibility}
                          onChange={(e) => updateExperience(idx, 'responsibility', e.target.value)}
                          className={`${inputClass} resize-none`}
                        />

                        {improvedSuggestion && experience[idx].responsibility.trim() && (
                          <div className="mt-4 p-4 bg-teal-50/50 border border-teal-200/50 rounded-xl flex flex-col gap-2.5">
                            <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">AI Suggestion:</span>
                            <p className="text-xs text-slate-700 leading-relaxed m-0 font-medium">"{improvedSuggestion}"</p>
                            <div className="flex gap-2.5 mt-1">
                              <button 
                                onClick={() => acceptSuggestion(idx)}
                                className="flex items-center gap-1 text-[10px] font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors border-none"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept & Replace
                              </button>
                              <button 
                                onClick={() => setImprovedSuggestion('')}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-650 bg-transparent border-none cursor-pointer"
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
                    onClick={addExperience}
                    className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                  >
                    <Plus className="w-4 h-4" /> Add Experience Row
                  </button>
                </div>
              )}

              {/* STEP 3: Education Details */}
              {step === 3 && (
                <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pr-2">
                  {education.map((edu, idx) => (
                    <div key={idx} className="p-6 border border-slate-200/80 rounded-2xl bg-slate-50/40 flex flex-col gap-6 relative">
                      {education.length > 1 && (
                        <button 
                          onClick={() => removeEducation(idx)}
                          className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>University / Institution</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Stanford University"
                            value={edu.university}
                            onChange={(e) => updateEducation(idx, 'university', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Degree / Field of Study</label>
                          <input 
                            type="text" 
                            placeholder="e.g. B.S. Computer Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>Graduation Year / Duration</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 2018 - 2022"
                            value={edu.graduationYear}
                            onChange={(e) => updateEducation(idx, 'graduationYear', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Location</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Stanford, CA"
                            value={edu.location}
                            onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addEducation}
                    className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                  >
                    <Plus className="w-4 h-4" /> Add Education Row
                  </button>
                </div>
              )}

              {/* STEP 4: Achievements (Optional repeatable rows) */}
              {step === 4 && (
                <div className="flex flex-col gap-8 max-h-[480px] overflow-y-auto pr-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="p-6 border border-slate-200/80 rounded-2xl bg-slate-50/40 flex flex-col gap-6 relative">
                      {achievements.length > 1 && (
                        <button 
                          onClick={() => removeAchievement(idx)}
                          className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>Achievement Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. AWS Solutions Architect"
                            value={ach.title}
                            onChange={(e) => updateAchievement(idx, 'title', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Issuer / Organization (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Amazon Web Services"
                            value={ach.issuer}
                            onChange={(e) => updateAchievement(idx, 'issuer', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="flex flex-col">
                          <label className={labelClass}>Date / Year</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Mar 2024"
                            value={ach.year}
                            onChange={(e) => updateAchievement(idx, 'year', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className={labelClass}>Short Description (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Scored 940/1000 on final exam"
                            value={ach.description}
                            onChange={(e) => updateAchievement(idx, 'description', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addAchievement}
                    className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                  >
                    <Plus className="w-4 h-4" /> Add Achievement Row
                  </button>
                </div>
              )}

              {/* STEP 5: Core Skills (Categorized rows) */}
              {step === 5 && (
                <div className="flex flex-col gap-6 max-h-[480px] overflow-y-auto pr-2">
                  {skillsCategories.map((skill, idx) => (
                    <div key={idx} className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50/40 flex items-start gap-4 relative">
                      {skillsCategories.length > 1 && (
                        <button 
                          onClick={() => removeSkillsCategory(idx)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-4 w-full pr-6 pt-2">
                        <div className="md:col-span-4 flex flex-col">
                          <label className={labelClass}>Skill Category</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Databases"
                            value={skill.category}
                            onChange={(e) => updateSkillsCategory(idx, 'category', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-8 flex flex-col">
                          <label className={labelClass}>Skills (Comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. PostgreSQL, Redis, MongoDB"
                            value={skill.items}
                            onChange={(e) => updateSkillsCategory(idx, 'items', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addSkillsCategory}
                    className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-[#0D9488] hover:border-[#14B8A6]/40 hover:bg-[#14B8A6]/5 transition-all text-sm font-semibold cursor-pointer bg-transparent"
                  >
                    <Plus className="w-4 h-4" /> Add Skill Category
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
              
              {/* Back Link */}
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

              {/* Continue / Assemble Button */}
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
                  className="flex items-center gap-1.5 px-7 py-3 text-xs font-bold text-white bg-slate-900 rounded-full cursor-pointer hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition-all border-none"
                >
                  Assemble & Compile <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateScratch;
