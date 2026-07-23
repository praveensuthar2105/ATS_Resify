/**
 * Canonical resume LaTeX templates supported by the backend compile pipeline.
 * Keys match LatexController / LatexServiceImpl (`templateType`) and
 * classpath files: latex_templates/{id}_template.tex
 *
 * Source of truth: Backend/resume-service LatexServiceImpl.getAvailableTemplates()
 * Allowed values validated by LatexController: ats, minimal
 */
export const DEFAULT_TEMPLATE_ID = 'ats';

export const RESUME_TEMPLATES = [
  {
    id: 'ats',
    name: 'ATS',
    displayName: 'ATS Optimized',
    description: 'Simple format that passes automated screening',
    thumbnail: '/templates/ats.png',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    displayName: 'Minimal Typographic',
    description: 'Elegant sans-serif design focused on pure typography',
    thumbnail: '/templates/minimal.png',
  },
];

export const TEMPLATE_MAP = Object.fromEntries(
  RESUME_TEMPLATES.map((t) => [t.id, t])
);

/** Normalize any stored / legacy value to a supported template id. */
export function normalizeTemplateId(value) {
  if (!value || typeof value !== 'string') return DEFAULT_TEMPLATE_ID;
  const key = value.trim().toLowerCase();
  // Legacy aliases from older UI / agent prefs
  const aliases = {
    modern: DEFAULT_TEMPLATE_ID,
    professional: DEFAULT_TEMPLATE_ID,
    creative: 'minimal',
    minimalist: 'minimal',
    minimalistic: 'minimal',
  };
  if (TEMPLATE_MAP[key]) return key;
  if (aliases[key]) return aliases[key];
  return DEFAULT_TEMPLATE_ID;
}

export function getTemplateMeta(id) {
  return TEMPLATE_MAP[normalizeTemplateId(id)] || TEMPLATE_MAP[DEFAULT_TEMPLATE_ID];
}

/** Options for dropdowns (Agent settings, generate page, etc.) */
export function getTemplateSelectOptions({ includeAgentDefault = false } = {}) {
  const options = RESUME_TEMPLATES.map((t) => ({
    value: t.id,
    label: t.displayName,
  }));
  if (includeAgentDefault) {
    return [{ value: '', label: 'Match editor selection' }, ...options];
  }
  return options;
}
