import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Clock, Sparkles, CheckCircle2, ArrowRight, AlertCircle,
  Building2, ShieldCheck, ExternalLink, Globe, Star, TrendingUp } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

// ═════════════════════════════════════════════════════════════════════════════
// LAYER 1 — Smart Skill Extraction from Internship Title / Domain / Eligibility
// ═════════════════════════════════════════════════════════════════════════════
// Problem it solves:
//   Unstop internships often have sparse `required_skills` (e.g. just "Fresher").
//   "Website & AI Solutions Calling Sales Executive" → skills list is nearly empty.
//   This function mines the title, domain, description, and eligibility string to
//   build a rich, meaningful requirement profile before any matching happens.

const TITLE_KEYWORD_SKILLS = {
  // Web / Frontend
  'react':           ['React', 'JavaScript', 'Frontend', 'HTML', 'CSS'],
  'reactjs':         ['React', 'JavaScript', 'Frontend'],
  'angular':         ['Angular', 'TypeScript', 'Frontend', 'JavaScript'],
  'vue':             ['Vue.js', 'JavaScript', 'Frontend'],
  'html':            ['HTML', 'CSS', 'Frontend', 'Web Development'],
  'css':             ['CSS', 'HTML', 'Frontend', 'Web Development'],
  'frontend':        ['Frontend', 'HTML', 'CSS', 'JavaScript', 'React'],
  'website':         ['Web Development', 'HTML', 'CSS', 'JavaScript'],
  'web':             ['Web Development', 'HTML', 'CSS', 'JavaScript'],
  // Backend & Runtimes
  'backend':         ['Backend', 'API', 'Database', 'Server'],
  'node':            ['Node.js', 'JavaScript', 'Backend', 'Express'],
  'nodejs':          ['Node.js', 'JavaScript', 'Backend'],
  'python':          ['Python', 'Programming', 'Scripting'],
  'java':            ['Java', 'Spring', 'Backend', 'OOP'],
  'spring':          ['Java', 'Spring Boot', 'Backend'],
  'django':          ['Python', 'Django', 'Backend'],
  'flask':           ['Python', 'Flask', 'Backend'],
  'php':             ['PHP', 'Laravel', 'Web Development'],
  'laravel':         ['PHP', 'Laravel', 'Web Development'],
  'golang':          ['Go', 'Backend', 'Microservices'],
  'rust':            ['Rust', 'Systems Programming'],
  'kotlin':          ['Kotlin', 'Android', 'Mobile'],
  'swift':           ['Swift', 'iOS', 'Mobile'],
  'typescript':      ['TypeScript', 'JavaScript', 'Frontend'],
  // Full stack
  'fullstack':       ['Full Stack', 'Frontend', 'Backend', 'JavaScript'],
  'full stack':      ['Full Stack', 'Frontend', 'Backend', 'JavaScript'],
  // Database
  'sql':             ['SQL', 'Database', 'MySQL'],
  'database':        ['SQL', 'Database', 'MySQL'],
  'mysql':           ['MySQL', 'SQL', 'Database'],
  'mongodb':         ['MongoDB', 'NoSQL', 'Database'],
  'postgresql':      ['PostgreSQL', 'SQL', 'Database'],
  'redis':           ['Redis', 'Caching', 'Database'],
  // AI / ML / Data
  'machine':         ['Machine Learning', 'Python', 'Data Science'],
  'machine learning':['Machine Learning', 'Python', 'Data Science', 'AI'],
  'deep learning':   ['Deep Learning', 'Python', 'TensorFlow', 'PyTorch'],
  'ai':              ['Artificial Intelligence', 'Python', 'Machine Learning'],
  'nlp':             ['NLP', 'Python', 'Machine Learning'],
  'data science':    ['Data Science', 'Python', 'Statistics', 'Machine Learning'],
  'data analyst':    ['Data Analysis', 'Excel', 'Python', 'SQL'],
  'data analysis':   ['Data Analysis', 'Excel', 'Python', 'SQL'],
  'analytics':       ['Data Analytics', 'Excel', 'Python', 'SQL'],
  'excel':           ['Excel', 'Data Analysis', 'MS Office'],
  'power bi':        ['Power BI', 'Data Analytics', 'Business Intelligence'],
  'tableau':         ['Tableau', 'Data Analytics', 'Visualization'],
  'tensorflow':      ['TensorFlow', 'Python', 'Machine Learning'],
  'pytorch':         ['PyTorch', 'Python', 'Deep Learning'],
  'statistics':      ['Statistics', 'Python', 'Data Analysis'],
  // Cloud / DevOps
  'aws':             ['AWS', 'Cloud', 'DevOps'],
  'azure':           ['Azure', 'Cloud', 'DevOps'],
  'cloud':           ['Cloud Computing', 'AWS', 'Azure', 'DevOps'],
  'docker':          ['Docker', 'DevOps', 'Containerization'],
  'kubernetes':      ['Kubernetes', 'DevOps', 'Docker'],
  'devops':          ['DevOps', 'CI/CD', 'Docker', 'Linux'],
  'linux':           ['Linux', 'DevOps', 'Shell Scripting'],
  'git':             ['Git', 'Version Control', 'DevOps'],
  // Mobile
  'ios':             ['iOS', 'Swift', 'Xcode', 'Mobile'],
  'android':         ['Android', 'Kotlin', 'Java', 'Mobile'],
  'flutter':         ['Flutter', 'Dart', 'Mobile'],
  'react native':    ['React Native', 'JavaScript', 'Mobile'],
  'mobile':          ['Mobile Development', 'iOS', 'Android'],
  // Design
  'ui':              ['UI Design', 'Figma', 'CSS', 'Design'],
  'ux':              ['UX Design', 'Figma', 'Prototyping', 'Design'],
  'design':          ['UI/UX Design', 'Figma', 'Adobe', 'Design'],
  'graphic':         ['Graphic Design', 'Adobe', 'Photoshop', 'Illustrator'],
  'figma':           ['Figma', 'UI Design', 'Prototyping'],
  'photoshop':       ['Photoshop', 'Adobe', 'Graphic Design'],
  'illustrator':     ['Illustrator', 'Adobe', 'Graphic Design'],
  // Marketing / Sales / Business
  'marketing':       ['Marketing', 'Digital Marketing', 'Communication', 'SEO'],
  'digital marketing':['Digital Marketing', 'SEO', 'Social Media', 'Marketing'],
  'seo':             ['SEO', 'Digital Marketing', 'Content Writing'],
  'social media':    ['Social Media Marketing', 'Communication', 'Marketing'],
  'social':          ['Social Media', 'Communication', 'Marketing'],
  'sales':           ['Sales', 'Communication', 'Negotiation', 'CRM'],
  'calling':         ['Communication', 'Sales', 'Customer Service', 'Telecalling'],
  'telemarketing':   ['Telemarketing', 'Communication', 'Sales', 'CRM'],
  'business development': ['Business Development', 'Sales', 'Communication'],
  'business':        ['Business Development', 'Communication', 'MS Office'],
  'solutions':       ['Problem Solving', 'Communication', 'Client Management'],
  'executive':       ['Communication', 'MS Office', 'Business Development'],
  'content':         ['Content Writing', 'Communication', 'English', 'SEO'],
  'writing':         ['Writing', 'Communication', 'English', 'Content'],
  'copywriting':     ['Copywriting', 'Content Writing', 'Marketing'],
  // HR / Ops / PM
  'hr':              ['HR', 'Human Resources', 'Communication', 'Recruitment'],
  'recruitment':     ['Recruitment', 'HR', 'Communication'],
  'operations':      ['Operations Management', 'MS Office', 'Communication'],
  'management':      ['Management', 'Leadership', 'Communication', 'MS Office'],
  'project management': ['Project Management', 'Agile', 'Communication', 'Leadership'],
  'agile':           ['Agile', 'Scrum', 'Project Management'],
  // Finance
  'finance':         ['Finance', 'Accounting', 'Excel', 'Financial Analysis'],
  'accounting':      ['Accounting', 'Tally', 'Finance', 'Excel'],
  'fintech':         ['FinTech', 'Finance', 'Technology', 'Programming'],
  // Campus / Outreach
  'campus':          ['Communication', 'Campus Relations', 'Outreach', 'Marketing'],
  'ambassador':      ['Communication', 'Marketing', 'Social Media', 'Outreach'],
  'outreach':        ['Communication', 'Marketing', 'Social Media'],
  // Security / Embedded / Blockchain
  'cybersecurity':   ['Cybersecurity', 'Network Security', 'Ethical Hacking'],
  'networking':      ['Networking', 'CCNA', 'Network Security'],
  'blockchain':      ['Blockchain', 'Web3', 'Solidity', 'Smart Contracts'],
  'iot':             ['IoT', 'Embedded Systems', 'Python', 'Arduino'],
  'embedded':        ['Embedded Systems', 'C', 'C++', 'Microcontrollers'],
  'hardware':        ['Hardware', 'Electronics', 'Embedded Systems'],
  'game':            ['Game Development', 'Unity', 'C#', 'OpenGL'],
  'unity':           ['Unity', 'Game Development', 'C#'],
  'research':        ['Research', 'Documentation', 'Analytical Skills'],
  'software':        ['Software Development', 'Programming', 'Problem Solving'],
};

const DOMAIN_SKILLS = {
  'engineering':    ['Software Engineering', 'Programming', 'Problem Solving'],
  'frontend':       ['HTML', 'CSS', 'JavaScript', 'React', 'UI Design'],
  'backend':        ['Java', 'Python', 'Node.js', 'API', 'Database'],
  'data science':   ['Python', 'Machine Learning', 'Statistics', 'SQL'],
  'ai / ml':        ['Python', 'Machine Learning', 'Deep Learning', 'AI'],
  'ai/ml':          ['Python', 'Machine Learning', 'TensorFlow'],
  'marketing':      ['Digital Marketing', 'SEO', 'Social Media', 'Content Writing'],
  'design':         ['UI/UX Design', 'Figma', 'Photoshop', 'Adobe'],
  'finance':        ['Finance', 'Excel', 'Accounting', 'Financial Analysis'],
  'sales':          ['Sales', 'Communication', 'CRM', 'Negotiation'],
  'hr':             ['HR', 'Recruitment', 'Communication', 'MS Office'],
  'management':     ['Management', 'Leadership', 'Communication', 'Excel'],
  'business':       ['Business Development', 'Communication', 'Excel'],
  'mobile':         ['Android', 'iOS', 'Flutter', 'React Native'],
  'devops':         ['Docker', 'AWS', 'CI/CD', 'Linux', 'Kubernetes'],
  'cybersecurity':  ['Cybersecurity', 'Networking', 'Ethical Hacking'],
  'blockchain':     ['Blockchain', 'Solidity', 'Web3'],
  'iot':            ['IoT', 'Embedded Systems', 'Python', 'Arduino'],
  'full stack':     ['JavaScript', 'React', 'Node.js', 'Database', 'API'],
  'fullstack':      ['JavaScript', 'React', 'Node.js', 'Database', 'API'],
  'web development':['HTML', 'CSS', 'JavaScript', 'React', 'Web'],
};

// These are eligibility LEVELS, not skills — shown separately on the card.
// We do NOT add these to the skills matching pool.
const ELIGIBILITY_MARKERS = new Set([
  'undergraduate', 'postgraduate', 'engineering students', 'management',
  'arts', 'commerce', 'sciences & others', 'mba', 'btech', 'mtech',
  'diploma', 'phd', 'any graduate', 'all students', 'fresher', 'experienced',
  'sciences', 'science', 'bsc', 'msc', 'bca', 'mca', 'bba', 'mba',
]);

/**
 * LAYER 1 — deriveSkillsFromInternship
 * Returns an array of unique skill strings inferred from title + domain +
 * description + explicit required_skills (eligibility tags are excluded).
 */
function deriveSkillsFromInternship(job) {
  const skillSet = new Set();

  // ── 1. Title parsing (strongest signal) ──────────────────────────────────
  const titleLower = (job.title || job.TITLE || '').toLowerCase();

  // Multi-word phrases first (e.g. "machine learning", "full stack")
  for (const [kw, skills] of Object.entries(TITLE_KEYWORD_SKILLS)) {
    if (kw.includes(' ') && titleLower.includes(kw)) {
      skills.forEach(s => skillSet.add(s));
    }
  }
  // Single token pass
  titleLower.split(/[\s&,\/\-+|()]+/).forEach(token => {
    if (token.length < 2) return;
    const mapped = TITLE_KEYWORD_SKILLS[token];
    if (mapped) mapped.forEach(s => skillSet.add(s));
  });

  // ── 2. Domain mapping ────────────────────────────────────────────────────
  const domainLower = (job.domain || job.DOMAIN || '').toLowerCase().trim();
  const domainSkills = DOMAIN_SKILLS[domainLower];
  if (domainSkills) domainSkills.forEach(s => skillSet.add(s));

  // ── 3. Explicit required_skills (pass-through, filter eligibility noise) ─
  const explicitRaw = job.required_skills || job.REQUIRED_SKILLS || job.skills || '';
  const explicitList = Array.isArray(explicitRaw)
    ? explicitRaw
    : String(explicitRaw).split(/[,;]+/);

  explicitList.forEach(s => {
    const trimmed = s.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    // Skip pure eligibility markers
    if (ELIGIBILITY_MARKERS.has(lower)) return;
    if (lower === 'general' || lower === 'na' || lower === 'none') return;
    skillSet.add(trimmed);
  });

  // ── 4. Description mining (light pass, first 500 chars only) ────────────
  const descLower = (job.description || job.DESCRIPTION || '').toLowerCase().slice(0, 500);
  for (const [kw, skills] of Object.entries(TITLE_KEYWORD_SKILLS)) {
    if (descLower.includes(kw)) {
      skills.slice(0, 2).forEach(s => skillSet.add(s)); // top-2 to avoid noise
    }
  }

  return Array.from(skillSet).filter(Boolean);
}

// ═════════════════════════════════════════════════════════════════════════════
// LAYER 2 — Local Fallback Match Scorer (zero API calls)
// ═════════════════════════════════════════════════════════════════════════════
// Returns a score immediately so the page can render sorted results without
// waiting for the AI service. Also used as fallback if AI-service is down.

function computeLocalMatchScore(studentSkillsStr, job) {
  const derived = deriveSkillsFromInternship(job);

  if (!studentSkillsStr || !studentSkillsStr.trim()) {
    return { score: 0, matchedSkills: [], missingSkills: derived.slice(0, 5), level: 'LOW', hasRequirements: derived.length > 0 };
  }
  if (derived.length === 0) {
    return { score: 15, matchedSkills: [], missingSkills: [], level: 'LOW', hasRequirements: false };
  }

  // Normalize student skills to searchable tokens
  const studentTokens = studentSkillsStr
    .split(/[,;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 1);

  const matched = [];
  const missing = [];

  for (const reqSkill of derived) {
    const reqLower = reqSkill.toLowerCase();
    const reqParts = reqLower.split(/[\s.\/\-]+/).filter(t => t.length > 1);

    const isMatch = studentTokens.some(sk =>
      sk.includes(reqLower) ||
      reqLower.includes(sk) ||
      // token-level partial overlap (handles "React" matching "React.js", etc.)
      reqParts.some(part => part.length > 2 && studentTokens.some(st => st.includes(part) || part.includes(st)))
    );

    if (isMatch) matched.push(reqSkill);
    else missing.push(reqSkill);
  }

  const rawScore = Math.round((matched.length / derived.length) * 100);
  const score = Math.min(98, matched.length > 0 ? Math.max(rawScore, 10) : 8);
  const level = score >= 85 ? 'EXCELLENT' : score >= 70 ? 'STRONG' : score >= 50 ? 'GOOD' : 'LOW';

  return {
    score,
    matchedSkills: matched.slice(0, 6),
    missingSkills: missing.slice(0, 5),
    level,
    hasRequirements: derived.length > 0,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function ExploreInternships({ currentUser }) {
  const rawId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const studentId = (rawId && rawId !== 'undefined' && parseInt(rawId, 10) > 0) ? parseInt(rawId, 10) : 1;
  const rawToken = currentUser?.token || '';
  const token = (rawToken && !rawToken.startsWith('Bearer ')) ? `Bearer ${rawToken}` : rawToken;
  const companyApiUrl = API_CONFIG.COMPANY_SERVICE_URL;
  const studentApiUrl = API_CONFIG.STUDENT_SERVICE_URL;

  const [internships, setInternships] = useState([]);
  const [studentSkillsStr, setStudentSkillsStr] = useState('');   // for re-scoring on filter
  const [appliedIds, setAppliedIds] = useState(() => {
    const cached = localStorage.getItem(`student_applied_set_${studentId}`);
    if (cached) { try { return new Set(JSON.parse(cached)); } catch (e) {} }
    return new Set();
  });
  const [appliedUnstopIds, setAppliedUnstopIds] = useState(() => {
    const cached = localStorage.getItem(`student_applied_unstop_set_${studentId}`);
    if (cached) { try { return new Set(JSON.parse(cached)); } catch (e) {} }
    return new Set();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [unstopNotice, setUnstopNotice] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  // LAYER 3: Default sort = Best Match First
  const [sortBy, setSortBy] = useState('MATCH_HIGHEST');

  const [confirmModalJob, setConfirmModalJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);   // synchronous guard — useState updates are async
  const [statusMsg, setStatusMsg] = useState('');

  // ── Deadline badge helper ─────────────────────────────────────────────────
  const getDeadlineBadge = (deadlineStr, status) => {
    if (status && status.toUpperCase() === 'CLOSED') {
      return { text: '🔴 Closed', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5', isExpired: true };
    }
    if (!deadlineStr || deadlineStr.trim() === '') {
      return { text: '⏳ Open Applications', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', isExpired: false };
    }
    const deadlineDate = new Date(deadlineStr);
    if (isNaN(deadlineDate.getTime())) {
      return { text: `⏳ Closes ${deadlineStr}`, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', isExpired: false };
    }
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)  return { text: '🔴 Deadline Expired', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5', isExpired: true };
    if (diffDays === 0) return { text: '🚨 Expiring Today!', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5', isExpired: false };
    if (diffDays === 1) return { text: '⏳ 1 Day Left', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', isExpired: false };
    if (diffDays <= 7)  return { text: `⏳ ${diffDays} Days Left`, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', isExpired: false };
    const fmt = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { text: `⏳ Closes ${fmt}`, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', isExpired: false };
  };

  useEffect(() => { fetchInternships(); }, [studentId]);

  // ── Main fetch + scoring pipeline ─────────────────────────────────────────
  const fetchInternships = async () => {
    setIsLoading(true);
    let combinedList = [];
    let unstopErrMsg = '';

    // 1. Internal internships from company-service
    try {
      const res = await fetch(`${companyApiUrl}/api/v1/company/internships`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          combinedList = [
            ...combinedList,
            ...data.map(item => ({ ...item, source: 'INTERNAL', uniqueKey: `INTERNAL_${item.id || item.ID}` }))
          ];
        }
      }
    } catch (e) { console.error('Explore internal fetch error:', e); }

    // 2. Unstop internships from student-service
    try {
      const unstopRes = await fetch(`${studentApiUrl}/api/v1/student/internships/unstop`, {
        headers: token ? { 'Authorization': token } : {}
      });
      if (unstopRes.ok) {
        const unstopData = await unstopRes.json();
        if (unstopData && unstopData.success && Array.isArray(unstopData.internships) && unstopData.internships.length > 0) {
          const mappedUnstop = unstopData.internships.map(u => {
            // Parse eligibility string into an array of display tags
            const eligibilityTags = u.eligibility
              ? u.eligibility.split(/[,;]+/).map(e => e.trim()).filter(e => e && e.length > 1)
              : [];
            return {
              id:                   `unstop_${u.externalId}`,
              external_id:          u.externalId,
              title:                u.title,
              company_name:         u.companyName,
              location:             u.location || 'Remote / India',
              work_mode:            u.workMode || 'Remote',
              stipend:              u.stipend || 'Disclosed on Unstop',
              duration:             u.duration || 'Flexible',
              application_deadline: u.applicationDeadline || '',
              // Only real tech/business skills, NOT eligibility noise
              required_skills:      Array.isArray(u.requiredSkills)
                ? u.requiredSkills.filter(s => !ELIGIBILITY_MARKERS.has(s.toLowerCase())).join(', ')
                : (u.requiredSkills || ''),
              domain:               u.domain || 'Engineering',
              description:          u.description || '',
              eligibility:          u.eligibility || '',
              eligibility_tags:     eligibilityTags,          // display-only
              application_url:      u.applicationUrl || `https://unstop.com/o/${u.externalId}`,
              source:               'UNSTOP',
              uniqueKey:            `UNSTOP_${u.externalId}`,
            };
          });
          combinedList = [...combinedList, ...mappedUnstop];
        } else if (unstopData && unstopData.message) {
          unstopErrMsg = unstopData.message;
        }
      }
    } catch (e) {
      console.error('Unstop fetch error:', e);
      unstopErrMsg = 'External internships temporarily unavailable.';
    }

    setUnstopNotice(unstopErrMsg);

    // 3. Fetch student's existing applications (for "already applied" state)
    if (studentId) {
      try {
        const appRes = await fetch(`${studentApiUrl}/api/v1/student/${studentId}/applications`, {
          headers: token ? { 'Authorization': token } : {}
        });
        if (appRes.ok) {
          const apps = await appRes.json();
          if (Array.isArray(apps)) {
            const freshAppliedIds = new Set();
            const freshAppliedUnstopIds = new Set();
            apps.forEach(a => {
              const src = (a.source || a.SOURCE || '').toUpperCase();
              if (src === 'UNSTOP') {
                const extId = a.external_id || a.EXTERNAL_ID;
                if (extId) freshAppliedUnstopIds.add(String(extId));
              } else {
                const jId = a.internship_id ?? a.INTERNSHIP_ID ?? a.job_id ?? a.JOB_ID;
                if (jId !== undefined && jId !== null) {
                  const parsed = parseInt(jId, 10);
                  if (!isNaN(parsed) && parsed > 0) freshAppliedIds.add(parsed);
                }
              }
            });
            setAppliedIds(freshAppliedIds);
            setAppliedUnstopIds(freshAppliedUnstopIds);
            localStorage.setItem(`student_applied_set_${studentId}`, JSON.stringify(Array.from(freshAppliedIds)));
            localStorage.setItem(`student_applied_unstop_set_${studentId}`, JSON.stringify(Array.from(freshAppliedUnstopIds)));
          }
        }
      } catch (e) {}
    }

    // 4. Deduplicate by uniqueKey
    const seen = new Set();
    const deduplicated = combinedList.filter(item => {
      const key = item.uniqueKey || `${item.source}_${item.id || item.ID}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 5. Fetch student profile for skill data
    let skillsStr = '';
    let resumeStr = '';
    let hasProfileData = false;
    if (studentId) {
      try {
        const profRes = await fetch(`${studentApiUrl}/api/v1/student/${studentId}/profile`, {
          headers: token ? { 'Authorization': token } : {}
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          skillsStr  = profData.skills || profData.SKILLS || '';
          resumeStr  = profData.resume_file_name || profData.resume_text || '';
          hasProfileData = !!(skillsStr.trim() || resumeStr.trim());
        }
      } catch (e) {}
    }

    setStudentSkillsStr(skillsStr);

    // ── LAYER 2: Immediately compute LOCAL scores → render right away ────────
    // This gives users instant, sorted results without waiting for the AI service.
    const localScored = deduplicated.map(item => {
      const ls = computeLocalMatchScore(skillsStr, item);
      return {
        ...item,
        hasResumeData:    hasProfileData,
        aiMatchScore:     ls.score,
        aiMatchLevel:     ls.level,
        matchedSkills:    ls.matchedSkills,
        missingSkills:    ls.missingSkills,
        aiHasRequirements: ls.hasRequirements,
        isLocalScore:     true,   // will be replaced by AI scores
      };
    });

    // Sort immediately by local score (Best Match First)
    localScored.sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0));
    setInternships(localScored);
    setIsLoading(false); // Page is now visible with sorted results

    // ── AI-service refinement: send ENRICHED skills for better accuracy ──────
    // We pass the derived skills (from Layer 1) to the AI service so it can do
    // its semantic/embedding-based comparison rather than just keyword matching.
    if (hasProfileData && deduplicated.length > 0) {
      try {
        const aiMatchRes = await fetch(`${API_CONFIG.AI_SERVICE_URL}/api/v1/ai/match-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_skills: skillsStr,
            resume_text:    resumeStr,
            internships: deduplicated.map(job => ({
              id:              job.uniqueKey || `INTERNAL_${job.id || job.ID}`,
              title:           job.title || job.TITLE || '',
              // ← KEY FIX: send DERIVED skills, not the raw (sparse) required_skills
              required_skills: deriveSkillsFromInternship(job).join(', '),
              description:     job.description || job.DESCRIPTION || '',
            }))
          })
        });

        if (aiMatchRes.ok) {
          const aiData = await aiMatchRes.json();
          if (aiData && aiData.scores) {
            // Merge AI scores into the list (AI overrides local scores)
            setInternships(prev => prev.map(item => {
              const key = item.uniqueKey || `INTERNAL_${item.id || item.ID}`;
              const ai  = aiData.scores[key];
              if (!ai) return item;
              return {
                ...item,
                aiMatchScore:     ai.match_percentage ?? item.aiMatchScore,
                aiMatchLevel:     ai.match_level     ?? item.aiMatchLevel,
                matchedSkills:    Array.isArray(ai.matched_skills) ? ai.matched_skills : item.matchedSkills,
                missingSkills:    Array.isArray(ai.missing_skills) ? ai.missing_skills : item.missingSkills,
                aiHasRequirements: ai.has_requirements !== false,
                isLocalScore:     false,
              };
            }));
          }
        }
      } catch (e) {
        console.warn('AI batch match notice (using local scores):', e);
        // Local scores remain — that's fine
      }
    }
  };

  // ── Application handlers ───────────────────────────────────────────────────
  const handleApplyClick = async (job) => {
    if (job.source === 'UNSTOP') {
      const extId  = String(job.external_id || job.id);
      const appUrl = job.application_url || `https://unstop.com/o/${extId}`;
      try {
        await fetch(`${studentApiUrl}/api/v1/student/${studentId}/applications/unstop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify({
            external_id:     extId,
            company_name:    job.company_name || 'Unstop Partner',
            role_title:      job.title || 'Unstop Internship',
            title:           job.title || 'Unstop Internship',
            location:        job.location || 'Remote / India',
            stipend:         job.stipend || 'Disclosed on Unstop',
            work_mode:       job.work_mode || 'Remote',
            duration:        job.duration || 'Flexible',
            application_url: appUrl,
          })
        });
        const updated = new Set(appliedUnstopIds);
        updated.add(extId);
        setAppliedUnstopIds(updated);
        localStorage.setItem(`student_applied_unstop_set_${studentId}`, JSON.stringify(Array.from(updated)));
        window.dispatchEvent(new CustomEvent('application_submitted', { detail: { studentId, externalId: extId } }));
      } catch (e) { console.warn('Unstop tracking notice:', e); }
      window.open(appUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // ── Guard 3: don't open modal if student has already applied ────────────
    const jid = job.id || job.ID;
    if (job.source !== 'UNSTOP' && appliedIds.has(jid)) return;
    setConfirmModalJob(job);
  };

  const handleApply = async () => {
    if (!confirmModalJob) return;
    // ── Guard 1: synchronous ref check — state updates are async and stale ───
    if (isSubmittingRef.current) return;
    const jobId = confirmModalJob.id || confirmModalJob.ID || 1;
    // ── Guard 2: prevent re-applying to an internship already in state ───────
    if (appliedIds.has(jobId)) {
      setStatusMsg('ℹ️ You have already applied for this internship.');
      setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); }, 1500);
      return;
    }
    isSubmittingRef.current = true;   // set synchronously BEFORE any await
    setIsSubmitting(true);
    setStatusMsg('Submitting application to database...');
    try {
      const res = await fetch(`${studentApiUrl}/api/v1/student/${studentId}/applications/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({
          company_id:   confirmModalJob.company_id || confirmModalJob.COMPANY_ID || 1,
          company_name: confirmModalJob.company_name || 'Company',
          role_title:   confirmModalJob.title || 'Internship Role',
          title:        confirmModalJob.title || 'Internship Role',
          location:     confirmModalJob.location || 'Coimbatore',
          stipend:      confirmModalJob.stipend || 10000,
          work_mode:    confirmModalJob.work_mode || 'Hybrid',
          duration:     confirmModalJob.duration || '3 Months',
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.applicationId > 0 || data.id > 0)) {
        const updated = new Set(appliedIds);
        updated.add(jobId);
        setAppliedIds(updated);
        localStorage.setItem(`student_applied_set_${studentId}`, JSON.stringify(Array.from(updated)));
        setStatusMsg('✓ Application submitted successfully!');
        window.dispatchEvent(new CustomEvent('application_submitted', { detail: { studentId, jobId } }));
        setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); }, 1200);
      } else if (data.message && data.message.toLowerCase().includes('already')) {
        // Backend caught a duplicate — update local state so button shows "Applied"
        const updated = new Set(appliedIds);
        updated.add(jobId);
        setAppliedIds(updated);
        localStorage.setItem(`student_applied_set_${studentId}`, JSON.stringify(Array.from(updated)));
        setStatusMsg('ℹ️ You have already applied for this internship.');
        setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); }, 1500);
      } else {
        setStatusMsg(`❌ Application submission failed: ${data.message || data.error || 'Server error'}`);
      }
    } catch (e) {
      setStatusMsg(`❌ Connection error: ${e.message}`);
    } finally {
      isSubmittingRef.current = false;   // always reset synchronously
      setIsSubmitting(false);
    }
  };

  // ── LAYER 3: Filter + Sort (Best Match First is the default) ──────────────
  const filteredInternships = internships.filter(job => {
    const cName = (job.company_name || job.COMPANY_NAME || '').toLowerCase();
    if (!cName || cName === 'deleted company' || cName === 'null') return false;
    const titleMatch  = (job.title || job.TITLE || '').toLowerCase().includes(searchQuery.toLowerCase());
    const compMatch   = cName.includes(searchQuery.toLowerCase());
    const skillMatch  = (job.required_skills || job.REQUIRED_SKILLS || job.skills || '').toLowerCase().includes(searchQuery.toLowerCase());
    const domainMatch = selectedDomain === 'ALL' || (job.domain || job.DOMAIN || '').toUpperCase() === selectedDomain.toUpperCase();
    const sourceMatch = selectedSource === 'ALL' || job.source === selectedSource;
    return (titleMatch || compMatch || skillMatch) && domainMatch && sourceMatch;
  }).sort((a, b) => {
    if (sortBy === 'MATCH_HIGHEST') {
      return (b.aiMatchScore ?? -1) - (a.aiMatchScore ?? -1);
    }
    if (sortBy === 'NEWEST') {
      return ((b.id || b.ID || 0) > (a.id || a.ID || 0) ? 1 : -1);
    }
    return 0;
  });

  // LAYER 3: Top recommendations (score ≥ 60%, profile filled)
  const recommendations = filteredInternships
    .filter(j => j.hasResumeData && j.aiMatchScore >= 60)
    .slice(0, 3);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <Sparkles size={32} color="#2563EB" />
          <p style={{ fontWeight: 700 }}>Analysing internships and calculating your AI match scores...</p>
          <p style={{ fontSize: '0.8rem' }}>Internships are being ranked by best match for your profile.</p>
        </div>
      </div>
    );
  }

  const internalCount = internships.filter(i => i.source === 'INTERNAL').length;
  const unstopCount   = internships.filter(i => i.source === 'UNSTOP').length;

  // ── Shared card renderer ───────────────────────────────────────────────────
  const renderCard = (job, idx) => {
    const isUnstop  = job.source === 'UNSTOP';
    const jobId     = job.id || job.ID;
    const extId     = String(job.external_id || job.id);
    const isApplied = isUnstop ? appliedUnstopIds.has(extId) : appliedIds.has(jobId);
    const deadlineStr = job.application_deadline || job.APPLICATION_DEADLINE || job.deadline || '';
    const dlBadge   = getDeadlineBadge(deadlineStr, job.status || job.STATUS);
    const score     = job.aiMatchScore;
    const level     = job.aiMatchLevel;

    // Score colour theming
    const scoreBg      = !job.hasResumeData ? '#FEF3C7'
      : score >= 85 ? '#ECFDF5' : score >= 70 ? '#EFF6FF' : score >= 50 ? '#FEF3C7' : '#FEE2E2';
    const scoreBorder  = !job.hasResumeData ? '#FCD34D'
      : score >= 85 ? '#6EE7B7' : score >= 70 ? '#93C5FD' : score >= 50 ? '#FCD34D' : '#FCA5A5';
    const scoreColor   = !job.hasResumeData ? '#D97706'
      : score >= 85 ? '#047857' : score >= 70 ? '#1D4ED8' : score >= 50 ? '#B45309' : '#B91C1C';
    const levelLabel   = level === 'EXCELLENT' ? '🔥 Strong Match'
      : level === 'STRONG' ? '⚡ Good Match' : level === 'GOOD' ? '🔶 Partial Match' : '🔹 Low Match';

    return (
      <div
        key={job.uniqueKey || jobId || idx}
        className="glass-card"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px',
          borderTop: `3px solid ${isUnstop ? '#7C3AED' : '#2563EB'}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
      >
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                {isUnstop ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11} /> UNSTOP
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={11} /> InternMatch Corporate
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.3', marginBottom: '4px' }}>
                {job.title || job.TITLE || 'Unknown Role'}
              </h3>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span>{job.company_name || job.COMPANY_NAME || 'Company'}</span>
                <span style={{ fontSize: '0.72rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '12px' }}>
                  {job.domain || job.DOMAIN || 'Engineering'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: '#F3F4F6', color: '#4B5563' }}>
                {job.work_mode || job.WORK_MODE || 'Hybrid'}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: dlBadge.bg, color: dlBadge.color, border: `1px solid ${dlBadge.border}` }}>
                {dlBadge.text}
              </span>
            </div>
          </div>

          {/* Eligibility tags (separate from skills — display-only) */}
          {isUnstop && job.eligibility_tags && job.eligibility_tags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: '2px' }}>📋 Eligible:</span>
              {job.eligibility_tags.slice(0, 5).map((tag, i) => (
                <span key={i} style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Required skills chips */}
          {(() => {
            const rawSkills = job.required_skills || job.REQUIRED_SKILLS || job.skills || '';
            const skillList = String(rawSkills).split(',').map(s => s.trim()).filter(s => s && !ELIGIBILITY_MARKERS.has(s.toLowerCase()) && s !== 'General');
            if (skillList.length === 0) return null;
            return (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                {skillList.slice(0, 6).map((s, i) => (
                  <span key={i} style={{ fontSize: '0.73rem', padding: '2px 8px', borderRadius: '4px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                    {s}
                  </span>
                ))}
              </div>
            );
          })()}

          {/* ── AI Match Score Panel ───────────────────────────────────────── */}
          <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', background: scoreBg, border: `1px solid ${scoreBorder}` }}>
            {!job.hasResumeData ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#D97706' }}>
                <Sparkles size={15} color="#D97706" />
                <span>AI Match requires profile skills — <strong>add your skills in Profile</strong></span>
              </div>
            ) : !job.aiHasRequirements ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#6B7280' }}>
                <Sparkles size={15} color="#6B7280" />
                <span>AI Match: Could not extract requirements from this listing</span>
              </div>
            ) : (
              <div>
                {/* Score header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Sparkles size={16} color={scoreColor} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: scoreColor }}>
                      AI Match: {score}%
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: '10px', background: 'rgba(255,255,255,0.8)', color: scoreColor }}>
                      {levelLabel}
                    </span>
                    {job.isLocalScore && (
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF', fontStyle: 'italic' }}>local</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.6)', overflow: 'hidden' }}>
                    <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                {/* Matched skills (green ✓) */}
                {job.matchedSkills && job.matchedSkills.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    {job.matchedSkills.map((sk, i) => (
                      <span key={i} style={{ padding: '2px 7px', borderRadius: '4px', background: '#D1FAE5', color: '#065F46', fontWeight: 700, border: '1px solid #A7F3D0', fontSize: '0.72rem' }}>
                        {sk} ✓
                      </span>
                    ))}
                  </div>
                )}

                {/* Missing skills (red ✗) */}
                {job.missingSkills && job.missingSkills.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {job.missingSkills.slice(0, 4).map((sk, i) => (
                      <span key={i} style={{ padding: '2px 7px', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B', fontWeight: 600, border: '1px solid #FCA5A5', fontSize: '0.72rem' }}>
                        {sk} ✗
                      </span>
                    ))}
                    {job.missingSkills.length > 4 && (
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 600 }}>
                        +{job.missingSkills.length - 4} more to learn
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location / Mode / Duration / Stipend grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} color="#EF4444" />
              <span>Location:</span>
              <strong style={{ color: 'var(--text-main)', marginLeft: 'auto' }}>{job.location || 'Remote'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} color="#3B82F6" />
              <span>Mode:</span>
              <strong style={{ color: 'var(--text-main)', marginLeft: 'auto' }}>{job.work_mode || 'Remote'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="#F59E0B" />
              <span>Duration:</span>
              <strong style={{ color: 'var(--text-main)', marginLeft: 'auto' }}>{job.duration || '3 Months'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <DollarSign size={13} color="#10B981" />
              <span>Stipend:</span>
              <strong style={{ color: '#059669', marginLeft: 'auto' }}>
                {String(job.stipend || 'Disclosed on Unstop').startsWith('₹') ? job.stipend : `₹${job.stipend || 'Disclosed on Unstop'}`}
              </strong>
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div style={{ marginTop: '8px' }}>
          {isApplied ? (
            isUnstop ? (
              <button
                onClick={() => window.open(job.application_url || `https://unstop.com/o/${extId}`, '_blank', 'noopener,noreferrer')}
                style={{ width: '100%', padding: '10px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                Applied Externally (Reopen) <ExternalLink size={15} />
              </button>
            ) : (
              <button disabled style={{ width: '100%', padding: '10px', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'default' }}>
                <CheckCircle2 size={16} /> Applied Successfully
              </button>
            )
          ) : dlBadge.isExpired ? (
            <button disabled style={{ width: '100%', padding: '10px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'not-allowed' }}>
              🔴 Applications Closed
            </button>
          ) : isUnstop ? (
            <button
              onClick={() => handleApplyClick(job)}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
            >
              Apply on Unstop <ExternalLink size={15} />
            </button>
          ) : (
            <button onClick={() => handleApplyClick(job)} className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              Apply Now <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>

      {/* Header + Filter Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Explore Verified Internships
              <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                {filteredInternships.length} Available
              </span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Ranked by your AI skill match — InternMatch corporate + live Unstop listings
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.85rem', padding: '8px 12px', width: '200px' }}
            >
              <option value="MATCH_HIGHEST">⚡ Best Match First</option>
              <option value="NEWEST">🕒 Newest First</option>
              <option value="ALL">📋 Default Order</option>
            </select>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                placeholder="Search title, company, or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Source Tabs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {[
            { key: 'ALL',      label: `All Opportunities (${internships.length})`,  active: '#2563EB' },
            { key: 'INTERNAL', label: `🏢 InternMatch Corporate (${internalCount})`, active: '#059669' },
            { key: 'UNSTOP',   label: `🌐 Unstop Listings (${unstopCount})`,         active: '#7C3AED' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedSource(tab.key)}
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: selectedSource === tab.key ? tab.active : 'transparent', color: selectedSource === tab.key ? '#FFF' : 'var(--text-muted)', transition: 'all 0.2s ease' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Domain Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'Engineering', 'Frontend', 'Backend', 'Data Science', 'AI / ML', 'Marketing', 'Design'].map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: selectedDomain === domain ? '#2563EB' : 'var(--border-color)', background: selectedDomain === domain ? '#EFF6FF' : 'var(--bg-main)', color: selectedDomain === domain ? '#1D4ED8' : 'var(--text-main)', transition: 'all 0.2s ease' }}
            >
              {domain}
            </button>
          ))}
        </div>

        {unstopNotice && (
          <div style={{ padding: '8px 14px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} />
            <span>{unstopNotice} Showing corporate postings.</span>
          </div>
        )}
      </div>

      {/* ── LAYER 3: Recommended for You section ─────────────────────────── */}
      {recommendations.length > 0 && searchQuery === '' && selectedSource === 'ALL' && selectedDomain === 'ALL' && (
        <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid #2563EB', background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(124,58,237,0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Star size={20} color="#2563EB" fill="#2563EB" />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🎯 Recommended for You
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Top internships ranked by your skill match — update your profile for better recommendations
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {recommendations.map((job, idx) => renderCard(job, idx))}
          </div>
        </div>
      )}

      {/* Profile tip if no skills */}
      {!studentSkillsStr.trim() && (
        <div style={{ padding: '14px 20px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#92400E' }}>
          <TrendingUp size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Add your skills to your profile</strong> to see personalized AI match scores and get the "Recommended for You" section.
            Go to <strong>Student Profile → Edit Profile → Skills</strong>.
          </span>
        </div>
      )}

      {/* ── All internship cards grid ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredInternships.length > 0 ? (
          filteredInternships.map((job, idx) => renderCard(job, idx))
        ) : (
          <div className="glass-card" style={{ padding: '36px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching internship opportunities found. Try clearing search filters or changing source tabs.
          </div>
        )}
      </div>

      {/* Internal apply confirm modal */}
      {confirmModalJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ background: '#FFF', maxWidth: '480px', width: '100%', padding: '28px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Confirm Internship Application
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              You are applying for <strong style={{ color: '#2563EB' }}>{confirmModalJob.title}</strong> at <strong>{confirmModalJob.company_name}</strong>.
            </p>
            <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>📍 Location: <strong>{confirmModalJob.location || 'Coimbatore'}</strong></div>
              <div>💰 Stipend: <strong style={{ color: '#059669' }}>₹{confirmModalJob.stipend}/month</strong></div>
              <div>🕒 Duration: <strong>{confirmModalJob.duration}</strong></div>
              {confirmModalJob.aiMatchScore != null && (
                <div>⚡ Your AI Match: <strong style={{ color: '#2563EB' }}>{confirmModalJob.aiMatchScore}%</strong></div>
              )}
            </div>
            {statusMsg && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', background: statusMsg.includes('❌') ? '#FEE2E2' : '#DCFCE7', color: statusMsg.includes('❌') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                {statusMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button disabled={isSubmitting} onClick={() => setConfirmModalJob(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button disabled={isSubmitting} onClick={handleApply} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
