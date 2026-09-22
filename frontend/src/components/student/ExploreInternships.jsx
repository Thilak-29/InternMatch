import React, { useState, useEffect, useRef } from 'react';
import {
  Search, MapPin, DollarSign, Clock, Sparkles, CheckCircle2, ArrowRight, AlertCircle,
  Building2, ShieldCheck, ExternalLink, Globe, Star, TrendingUp, SlidersHorizontal,
  X, Calendar, Briefcase, Eye, ChevronRight, Filter, Award, Check
} from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';

// ═════════════════════════════════════════════════════════════════════════════
// LAYER 1 — Smart Skill Extraction from Internship Title / Domain / Eligibility
// ═════════════════════════════════════════════════════════════════════════════

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

const ELIGIBILITY_MARKERS = new Set([
  'undergraduate', 'postgraduate', 'engineering students', 'management',
  'arts', 'commerce', 'sciences & others', 'mba', 'btech', 'mtech',
  'diploma', 'phd', 'any graduate', 'all students', 'fresher', 'experienced',
  'sciences', 'science', 'bsc', 'msc', 'bca', 'mca', 'bba', 'mba',
]);

function formatWorkMode(mode, location) {
  const m = String(mode || '').trim();
  const l = String(location || '').trim().toLowerCase();

  if (l.includes('remote') || l.includes('online') || l.includes('home') || m.toLowerCase().includes('remote') || m.toLowerCase().includes('online')) {
    return 'Remote';
  }
  if (l.includes('hybrid') || m.toLowerCase().includes('hybrid')) {
    return 'Hybrid';
  }
  if (l.includes('site') || l.includes('office') || m.toLowerCase().includes('site') || m.toLowerCase().includes('office')) {
    return 'On-Site';
  }
  if (m && !['jobs', 'internships', 'competitions', 'type'].includes(m.toLowerCase())) {
    return m;
  }
  return 'Hybrid';
}

function deriveSkillsFromInternship(job) {
  const isUnstop = (job.source || '').toUpperCase() === 'UNSTOP';
  const explicitRaw = job.required_skills || job.REQUIRED_SKILLS || job.skills || '';

  if (!isUnstop) {
    if (Array.isArray(explicitRaw)) {
      return explicitRaw.map(s => String(s).trim()).filter(Boolean);
    }
    return String(explicitRaw || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  }

  const skillSet = new Set();
  const titleLower = (job.title || job.TITLE || '').toLowerCase();

  for (const [kw, skills] of Object.entries(TITLE_KEYWORD_SKILLS)) {
    if (kw.includes(' ') && titleLower.includes(kw)) {
      skills.forEach(s => skillSet.add(s));
    }
  }

  titleLower.split(/[\s&,\/\-+|()]+/).forEach(token => {
    if (token.length < 2) return;
    const mapped = TITLE_KEYWORD_SKILLS[token];
    if (mapped) mapped.forEach(s => skillSet.add(s));
  });

  const domainLower = (job.domain || job.DOMAIN || '').toLowerCase().trim();
  const domainSkills = DOMAIN_SKILLS[domainLower];
  if (domainSkills) domainSkills.forEach(s => skillSet.add(s));

  const explicitList = Array.isArray(explicitRaw)
    ? explicitRaw
    : String(explicitRaw).split(/[,;]+/);

  explicitList.forEach(s => {
    const trimmed = String(s).trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (ELIGIBILITY_MARKERS.has(lower)) return;
    if (lower === 'general' || lower === 'na' || lower === 'none') return;
    skillSet.add(trimmed);
  });

  const descLower = (job.description || job.DESCRIPTION || '').toLowerCase().slice(0, 500);
  for (const [kw, skills] of Object.entries(TITLE_KEYWORD_SKILLS)) {
    if (descLower.includes(kw)) {
      skills.slice(0, 2).forEach(s => skillSet.add(s));
    }
  }

  return Array.from(skillSet).filter(Boolean);
}

// ═════════════════════════════════════════════════════════════════════════════
// LAYER 2 — Local Dynamic Match Scorer
// ═════════════════════════════════════════════════════════════════════════════

function getDeterministicHashScore(keyStr, min = 68, max = 95) {
  let hash = 0;
  for (let i = 0; i < keyStr.length; i++) {
    hash = (hash << 5) - hash + keyStr.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash);
  return min + (pos % (max - min + 1));
}

function computeLocalMatchScore(studentSkillsStr, job) {
  const derived = deriveSkillsFromInternship(job);
  const title = job.title || job.TITLE || '';
  const company = job.company_name || job.company || job.COMPANY_NAME || '';
  const jobKey = `${job.id || job.ID || ''}_${title}_${company}`;

  const baseScore = getDeterministicHashScore(jobKey, 68, 94);
  const baseLevel = baseScore >= 88 ? 'EXCELLENT' : baseScore >= 78 ? 'STRONG' : 'GOOD';

  if (!studentSkillsStr || !studentSkillsStr.trim()) {
    return {
      score: baseScore,
      matchedSkills: derived.slice(0, 2),
      missingSkills: derived.slice(2, 5),
      level: baseLevel,
      hasRequirements: derived.length > 0,
    };
  }

  const studentTokens = studentSkillsStr
    .split(/[,;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 1);

  if (studentTokens.length === 0 || derived.length === 0) {
    return {
      score: baseScore,
      matchedSkills: derived.slice(0, 2),
      missingSkills: derived.slice(2, 5),
      level: baseLevel,
      hasRequirements: derived.length > 0,
    };
  }

  const matched = [];
  const missing = [];

  for (const reqSkill of derived) {
    const reqLower = reqSkill.toLowerCase();
    const reqParts = reqLower.split(/[\s.\/\-]+/).filter(t => t.length > 1);

    const isMatch = studentTokens.some(sk =>
      sk.includes(reqLower) ||
      reqLower.includes(sk) ||
      reqParts.some(part => part.length > 2 && studentTokens.some(st => st.includes(part) || part.includes(st)))
    );

    if (isMatch) matched.push(reqSkill);
    else missing.push(reqSkill);
  }

  let finalScore = baseScore;
  if (matched.length > 0) {
    const matchRatio = matched.length / derived.length;
    finalScore = Math.round(65 + (matchRatio * 32));
  } else {
    const titleMatch = studentTokens.some(st => title.toLowerCase().includes(st));
    finalScore = titleMatch ? Math.min(85, baseScore + 4) : Math.max(64, baseScore - 6);
  }

  const score = Math.min(98, Math.max(62, finalScore));
  const level = score >= 88 ? 'EXCELLENT' : score >= 78 ? 'STRONG' : score >= 65 ? 'GOOD' : 'LOW';

  return {
    score,
    matchedSkills: matched.slice(0, 6),
    missingSkills: missing.slice(0, 5),
    level,
    hasRequirements: derived.length > 0,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function ExploreInternships({ currentUser }) {
  const rawId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const studentId = (rawId && rawId !== 'undefined' && parseInt(rawId, 10) > 0) ? parseInt(rawId, 10) : 1;
  const rawToken = currentUser?.token || '';
  const token = (rawToken && !rawToken.startsWith('Bearer ')) ? `Bearer ${rawToken}` : rawToken;
  const companyApiUrl = API_CONFIG.COMPANY_SERVICE_URL;
  const studentApiUrl = API_CONFIG.STUDENT_SERVICE_URL;

  const [internships, setInternships] = useState([]);
  const [studentSkillsStr, setStudentSkillsStr] = useState('');
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
  const [sortBy, setSortBy] = useState('MATCH_HIGHEST');

  // Pagination state (exactly 7 cards per page)
  const ITEMS_PER_PAGE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters, search, or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDomain, selectedSource, sortBy]);

  // UI state for modals & filter drawer
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedDetailJob, setSelectedDetailJob] = useState(null);
  const [confirmModalJob, setConfirmModalJob] = useState(null);
  const [unstopConfirmJob, setUnstopConfirmJob] = useState(null);
  const [unstopConfirmLoading, setUnstopConfirmLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [resumeMode, setResumeMode] = useState('existing');
  const [existingResumeName, setExistingResumeName] = useState(null);
  const [newResumeFile, setNewResumeFile] = useState(null);

  // Expanded skill cards state (for [+N more] toggle)
  const [expandedSkillsCardId, setExpandedSkillsCardId] = useState(null);

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
      return { text: `⏳ Open (${deadlineStr})`, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', isExpired: false };
    }
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: '⏳ Open Applications', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', isExpired: false };
    }
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

    // 1. Multi-source aggregated internships from student-service (Internal + Unstop + Adzuna)
    try {
      const aggRes = await fetch(`${studentApiUrl}/api/v1/student/internships/aggregated?page=1&perPage=100`, {
        headers: token ? { 'Authorization': token } : {}
      });
      if (aggRes.ok) {
        const aggData = await aggRes.json();
        if (aggData && aggData.success && Array.isArray(aggData.internships)) {
          const mappedAggregated = aggData.internships.map(u => {
            const eligibilityTags = u.eligibility
              ? u.eligibility.split(/[,;]+/).map(e => e.trim()).filter(e => e && e.length > 1)
              : [];
            const src = (u.source || 'EXTERNAL').toUpperCase();
            const extId = u.externalId || u.id;
            return {
              id:                   u.id,
              external_id:          extId,
              title:                u.title,
              company_name:         u.company,
              location:             u.location || 'Remote / India',
              work_mode:            'Remote / Onsite',
              stipend:              u.stipend || 'Competitive Stipend',
              duration:             u.duration || '3 - 6 Months',
              application_deadline: u.deadline || '',
              required_skills:      Array.isArray(u.skills)
                ? u.skills.filter(s => !ELIGIBILITY_MARKERS.has(s.toLowerCase())).join(', ')
                : (u.skills || ''),
              domain:               'Engineering',
              description:          u.description || '',
              eligibility:          u.eligibility || '',
              eligibility_tags:     eligibilityTags,
              application_url:      u.applicationUrl || (src === 'UNSTOP' ? `https://unstop.com/o/${extId}` : ''),
              source:               src,
              uniqueKey:            u.id || `${src}_${extId}`,
              has_test:             Boolean(u.hasTest ?? u.has_test ?? false),
            };
          });
          combinedList = mappedAggregated;
        }
      }
    } catch (e) {
      console.error('Explore aggregated fetch error:', e);
    }

    // 3. Fetch student's existing applications
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
                if (extId) {
                  freshAppliedUnstopIds.add(String(extId));
                  freshAppliedUnstopIds.add(`UNSTOP_${extId}`);
                }
              } else {
                const jId = a.internship_id ?? a.INTERNSHIP_ID ?? a.job_id ?? a.JOB_ID;
                if (jId !== undefined && jId !== null) {
                  const cleanStr = String(jId).replace(/^INTERNAL_/i, '');
                  const parsed = parseInt(cleanStr, 10);
                  if (!isNaN(parsed) && parsed > 0) {
                    freshAppliedIds.add(parsed);
                    freshAppliedIds.add(String(parsed));
                    freshAppliedIds.add(`INTERNAL_${parsed}`);
                  } else {
                    freshAppliedIds.add(jId);
                  }
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

    // 4. Deduplicate
    const seen = new Set();
    const deduplicated = combinedList.filter(item => {
      const key = item.uniqueKey || `${item.source}_${item.id || item.ID}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 5. Fetch profile skills
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

    // Compute local scores immediately
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
        isLocalScore:     true,
      };
    });

    localScored.sort((a, b) => {
      const aInt = (a.source || '').toUpperCase() === 'INTERNAL';
      const bInt = (b.source || '').toUpperCase() === 'INTERNAL';
      if (aInt && !bInt) return -1;
      if (!aInt && bInt) return 1;
      return (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0);
    });
    setInternships(localScored);
    setIsLoading(false);

    // Fetch AI scores asynchronously
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
              required_skills: deriveSkillsFromInternship(job).join(', '),
              description:     job.description || job.DESCRIPTION || '',
            }))
          })
        });

        if (aiMatchRes.ok) {
          const aiData = await aiMatchRes.json();
          if (aiData && aiData.scores) {
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
      }
    }
  };

  // ── Application Handlers ───────────────────────────────────────────────────
  const handleApplyClick = (job) => {
    if (job.source === 'UNSTOP') {
      const extId  = String(job.external_id || job.id);
      const appUrl = job.application_url || `https://unstop.com/o/${extId}`;
      if (appliedUnstopIds.has(extId)) {
        // Already confirmed & applied externally — open Unstop URL
        window.open(appUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      // 1. Open Unstop application page in new tab
      window.open(appUrl, '_blank', 'noopener,noreferrer');
      // 2. Open confirmation modal in InternMatch (do NOT record application yet)
      setUnstopConfirmJob(job);
      return;
    }

    const jid = job.id || job.ID;
    if (job.source !== 'UNSTOP' && appliedIds.has(jid)) return;

    setResumeMode('existing');
    setNewResumeFile(null);
    setStatusMsg('');
    setExistingResumeName(null);

    fetch(`${studentApiUrl}/api/v1/student/${studentId}/profile`, {
      headers: { 'Authorization': token }
    }).then(r => r.json()).then(d => {
      const name = d.resume_file_name || d.RESUME_FILE_NAME || null;
      setExistingResumeName(name);
      if (!name) setResumeMode('new');
    }).catch(() => setResumeMode('new'));

    setConfirmModalJob(job);
  };

  const handleConfirmUnstopApplied = async () => {
    if (!unstopConfirmJob) return;
    const job = unstopConfirmJob;
    const extId = String(job.external_id || job.id);
    const appUrl = job.application_url || `https://unstop.com/o/${extId}`;

    setUnstopConfirmLoading(true);
    try {
      const res = await fetch(`${studentApiUrl}/api/v1/student/${studentId}/applications/unstop`, {
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

      if (res.ok) {
        const updated = new Set(appliedUnstopIds);
        updated.add(extId);
        setAppliedUnstopIds(updated);
        localStorage.setItem(`student_applied_unstop_set_${studentId}`, JSON.stringify(Array.from(updated)));
        window.dispatchEvent(new CustomEvent('application_submitted', { detail: { studentId, externalId: extId } }));
        setStatusMsg('✓ Application recorded in My Applications as Applied Externally.');
      } else {
        setStatusMsg('❌ Failed to record external application.');
      }
    } catch (e) {
      console.warn('Unstop confirmation error:', e);
      setStatusMsg('❌ Connection error confirming application.');
    } finally {
      setUnstopConfirmLoading(false);
      setUnstopConfirmJob(null);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  const handleApply = async () => {
    if (!confirmModalJob) return;
    if (isSubmittingRef.current) return;
    const jobId = confirmModalJob.id || confirmModalJob.ID || 1;

    if (appliedIds.has(jobId)) {
      setStatusMsg('ℹ️ You have already applied for this internship.');
      setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); }, 1500);
      return;
    }
    if (resumeMode === 'new' && !newResumeFile) {
      setStatusMsg('❌ Please select a PDF resume to upload.');
      return;
    }
    if (resumeMode === 'existing' && !existingResumeName) {
      setStatusMsg('❌ No existing resume found. Please upload a new one.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      if (resumeMode === 'new' && newResumeFile) {
        setStatusMsg('📤 Uploading resume...');
        const fd = new FormData();
        fd.append('file', newResumeFile);
        await fetch(`${studentApiUrl}/api/v1/student/${studentId}/resume/upload`, {
          method: 'POST',
          headers: { 'Authorization': token },
          body: fd,
        });
      }

      setStatusMsg('Submitting application...');
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
          has_test:     Boolean(confirmModalJob.has_test ?? confirmModalJob.HAS_TEST ?? false),
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.applicationId > 0 || data.id > 0)) {
        const cleanId = String(jobId).replace(/^INTERNAL_/i, '');
        const numId = parseInt(cleanId, 10);
        const updated = new Set(appliedIds);
        if (!isNaN(numId)) {
          updated.add(numId);
          updated.add(String(numId));
          updated.add(`INTERNAL_${numId}`);
        } else {
          updated.add(jobId);
        }
        setAppliedIds(updated);
        localStorage.setItem(`student_applied_set_${studentId}`, JSON.stringify(Array.from(updated)));
        setStatusMsg('✅ Application submitted successfully!');
        window.dispatchEvent(new CustomEvent('application_submitted', { detail: { studentId, jobId } }));
        setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); setNewResumeFile(null); }, 1500);
      } else if (data.message && data.message.toLowerCase().includes('already')) {
        const cleanId = String(jobId).replace(/^INTERNAL_/i, '');
        const numId = parseInt(cleanId, 10);
        const updated = new Set(appliedIds);
        if (!isNaN(numId)) {
          updated.add(numId);
          updated.add(String(numId));
          updated.add(`INTERNAL_${numId}`);
        } else {
          updated.add(jobId);
        }
        setAppliedIds(updated);
        localStorage.setItem(`student_applied_set_${studentId}`, JSON.stringify(Array.from(updated)));
        setStatusMsg('ℹ️ You have already applied for this internship.');
        setTimeout(() => { setConfirmModalJob(null); setStatusMsg(''); }, 1500);
      } else {
        setStatusMsg(`❌ Failed: ${data.message || data.error || 'Server error'}`);
      }
    } catch (e) {
      setStatusMsg(`❌ Connection error: ${e.message}`);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ── Dynamic Filter & Active Filter Count Calculation ──────────────────────
  let activeFilterCount = 0;
  if (searchQuery.trim() !== '') activeFilterCount++;
  if (selectedSource !== 'ALL') activeFilterCount++;
  if (selectedDomain !== 'ALL') activeFilterCount++;
  if (sortBy !== 'MATCH_HIGHEST') activeFilterCount++;

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
    const aInt = (a.source || '').toUpperCase() === 'INTERNAL';
    const bInt = (b.source || '').toUpperCase() === 'INTERNAL';
    if (aInt && !bInt) return -1;
    if (!aInt && bInt) return 1;
    if (sortBy === 'MATCH_HIGHEST') {
      return (b.aiMatchScore ?? -1) - (a.aiMatchScore ?? -1);
    }
    if (sortBy === 'NEWEST') {
      return ((b.id || b.ID || 0) > (a.id || a.ID || 0) ? 1 : -1);
    }
    return 0;
  });

  // Pagination slicing (exactly 7 cards per page)
  const totalResults = filteredInternships.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInternships = filteredInternships.slice(startIndex, endIndex);

  // ── Render Loading Skeleton ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ height: '24px', width: '220px', background: '#E2E8F0', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ height: '14px', width: '340px', background: '#F1F5F9', borderRadius: '4px' }} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ height: '20px', width: '280px', background: '#F1F5F9', borderRadius: '4px' }} />
              <div style={{ height: '30px', width: '100px', background: '#EFF6FF', borderRadius: '8px' }} />
            </div>
            <div style={{ height: '16px', width: '450px', background: '#F8FAFC', borderRadius: '4px' }} />
            <div style={{ height: '36px', width: '140px', background: '#E2E8F0', borderRadius: '8px', alignSelf: 'flex-end' }} />
          </div>
        ))}
      </div>
    );
  }

  // ── RENDER LARGE HORIZONTAL INTERNSHIP CARD (REFERENCE DESIGN) ──────────────
  const renderCard = (job, idx) => {
    const isUnstop  = job.source === 'UNSTOP';
    const rawJobId  = job.id || job.ID;
    const cleanIdStr = String(rawJobId || '').replace(/^INTERNAL_/i, '');
    const numId     = parseInt(cleanIdStr, 10);
    const extId     = String(job.external_id || job.id || '');

    const isApplied = isUnstop
      ? (appliedUnstopIds.has(extId) || appliedUnstopIds.has(String(job.id)) || appliedUnstopIds.has(`UNSTOP_${extId}`))
      : (appliedIds.has(rawJobId) || (!isNaN(numId) && (appliedIds.has(numId) || appliedIds.has(String(numId)) || appliedIds.has(`INTERNAL_${numId}`))));
    const deadlineStr = job.application_deadline || job.APPLICATION_DEADLINE || job.deadline || '';
    const dlBadge   = getDeadlineBadge(deadlineStr, job.status || job.STATUS);
    const score     = job.aiMatchScore;
    const level     = job.aiMatchLevel;

    const levelLabel = level === 'EXCELLENT' ? '🔥 High Match'
      : level === 'STRONG' ? '⚡ Good Match'
      : level === 'GOOD' ? '🔶 Partial Match' : '🔹 Low Match';

    const rawSkills = job.required_skills || job.REQUIRED_SKILLS || job.skills || '';
    const derivedSkills = deriveSkillsFromInternship(job);
    const skillList = (rawSkills && String(rawSkills).trim())
      ? String(rawSkills).split(/[,;]+/).map(s => s.trim()).filter(s => s && !ELIGIBILITY_MARKERS.has(s.toLowerCase()) && s.toLowerCase() !== 'general')
      : derivedSkills;

    const MAX_SKILLS_SHOW = 5;
    const isExpanded = expandedSkillsCardId === (job.uniqueKey || jobId);
    const visibleSkills = isExpanded ? skillList : skillList.slice(0, MAX_SKILLS_SHOW);
    const hiddenCount = skillList.length - MAX_SKILLS_SHOW;

    return (
      <div
        key={job.uniqueKey || jobId || idx}
        className="explore-horizontal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          borderLeft: `4px solid ${isUnstop ? '#8B5CF6' : '#10B981'}`,
          padding: '24px 28px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'stretch',
          gap: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
        }}
      >
        {/* LEFT / CENTER CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', minWidth: 0 }}>
          
          {/* Top Source Badge */}
          <div>
            <div style={{ marginBottom: '8px' }}>
              {isUnstop ? (
                <span style={{ fontSize: '0.73rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  🌐 UNSTOP
                </span>
              ) : (job.source === 'ADZUNA' || job.source === 'EXTERNAL') ? (
                <span style={{ fontSize: '0.73rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  🔗 ADZUNA / EXTERNAL
                </span>
              ) : (
                <span style={{ fontSize: '0.73rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  🛡 InternMatch Corporate
                </span>
              )}
            </div>

            {/* Internship Title */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
              {job.title || job.TITLE || 'Internship Role'}
            </h3>

            {/* Company Name */}
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{job.company_name || job.COMPANY_NAME || 'Company Name'}</span>
              <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                {job.domain || job.DOMAIN || 'Engineering'}
              </span>
            </div>
          </div>

          {/* Metadata Compact Bordered Pills / Chips Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <span style={{ padding: '5px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              📍 {job.location || 'Remote'}
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              💰 Stipend: {String(job.stipend || 'Disclosed on Unstop').startsWith('₹') ? job.stipend : `₹${job.stipend || 'Disclosed on Unstop'}`}
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              📅 Duration: {job.duration || '3 Months'}
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🏢 Work Mode: {formatWorkMode(job.work_mode || job.WORK_MODE, job.location)}
            </span>
          </div>

          {/* Skills Tag Chips */}
          {visibleSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {visibleSkills.map((sk, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.76rem', fontWeight: 700, color: '#1D4ED8' }}>
                  {sk}
                </span>
              ))}

              {!isExpanded && hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedSkillsCardId(job.uniqueKey || jobId)}
                  style={{ padding: '4px 10px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '0.76rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  +{hiddenCount} more
                </button>
              )}

              {isExpanded && hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedSkillsCardId(null)}
                  style={{ padding: '4px 10px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '0.76rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT AREA: MATCH SCORE & ACTION BUTTONS */}
        <div className="explore-horizontal-card-right" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', width: '220px', flexShrink: 0 }}>
          
          {/* Match Score & Badge Box */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', textAlign: 'right', width: '100%' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', border: '1px solid #FCD34D' }}>
              {levelLabel}
            </span>

            {job.hasResumeData && score != null ? (
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                {score}% <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>Match Score</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
                Fill profile for AI Score
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
              {dlBadge.text}
            </div>
          </div>

          {/* Bottom Right Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button
              onClick={() => setSelectedDetailJob(job)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '8px', flex: 1, justifyContent: 'center' }}
            >
              <Eye size={14} /> View Details
            </button>

            {isApplied ? (
              isUnstop ? (
                <button
                  onClick={() => window.open(job.application_url || `https://unstop.com/o/${extId}`, '_blank', 'noopener,noreferrer')}
                  style={{ padding: '8px 14px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flex: 1, justifyContent: 'center' }}
                >
                  Applied Externally
                </button>
              ) : (
                <button disabled style={{ padding: '8px 14px', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'default', flex: 1, justifyContent: 'center' }}>
                  <Check size={14} /> Applied
                </button>
              )
            ) : dlBadge.isExpired ? (
              <button disabled style={{ padding: '8px 14px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'not-allowed', flex: 1, justifyContent: 'center' }}>
                Closed
              </button>
            ) : isUnstop ? (
              <button
                onClick={() => handleApplyClick(job)}
                style={{ padding: '8px 14px', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', flex: 1, justifyContent: 'center' }}
              >
                View on Unstop <ExternalLink size={13} />
              </button>
            ) : (
              <button
                onClick={() => handleApplyClick(job)}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '8px', flex: 1, justifyContent: 'center' }}
              >
                Apply Now <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER EXPLORE INTERNSHIPS PAGE ─────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1140px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. CARD-STYLE PAGE HEADER MATCHING MY APPLICATIONS REFERENCE       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '28px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Explore Internships
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', margin: 0 }}>
              Discover opportunities that match your skills & career goals
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setShowFilterDrawer(prev => !prev)}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                background: showFilterDrawer ? '#EFF6FF' : '#FFFFFF',
                borderColor: showFilterDrawer ? '#2563EB' : '#CBD5E1',
                color: showFilterDrawer ? '#2563EB' : '#1E293B'
              }}
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: '50%', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', padding: '8px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              Total Found: <span style={{ color: '#2563EB' }}>{filteredInternships.length}</span>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE / INTEGRATED FILTER DRAWER */}
        {showFilterDrawer && (
          <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Search Bar & Sort Dropdown */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                  placeholder="Search title, company name, or skills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ width: '220px' }}>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="MATCH_HIGHEST">⚡ Best Match First</option>
                  <option value="NEWEST">🕒 Newest First</option>
                  <option value="ALL">📋 Default Order</option>
                </select>
              </div>
            </div>

            {/* Source Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>SOURCE:</span>
              {[
                { key: 'ALL',      label: `All Sources (${internships.length})` },
                { key: 'INTERNAL', label: `🛡 InternMatch Corporate (${internships.filter(i => i.source === 'INTERNAL').length})` },
                { key: 'UNSTOP',   label: `🌐 Unstop Listings (${internships.filter(i => i.source === 'UNSTOP').length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedSource(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedSource === tab.key ? '#2563EB' : '#E2E8F0',
                    background: selectedSource === tab.key ? '#2563EB' : '#FFFFFF',
                    color: selectedSource === tab.key ? '#FFFFFF' : '#475569',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Domain Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>DOMAIN:</span>
              {['ALL', 'Engineering', 'Frontend', 'Backend', 'Data Science', 'AI / ML', 'Marketing', 'Design'].map(domain => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(domain)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedDomain === domain ? '#2563EB' : '#E2E8F0',
                    background: selectedDomain === domain ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDomain === domain ? '#1D4ED8' : '#64748B'
                  }}
                >
                  {domain}
                </button>
              ))}

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedSource('ALL'); setSelectedDomain('ALL'); setSortBy('MATCH_HIGHEST'); }}
                  style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      {unstopNotice && (
        <div style={{ padding: '12px 18px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} />
          <span>{unstopNotice} Showing corporate postings.</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. INTERNSHIP LIST (LARGE HORIZONTAL CARDS)                         */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {paginatedInternships.length > 0 ? (
          paginatedInternships.map((job, idx) => renderCard(job, idx))
        ) : (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: '#64748B', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Briefcase size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>No internships found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try changing your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* PAGINATION CONTROLS (EXACTLY 7 CARDS PER PAGE)                      */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {totalResults > ITEMS_PER_PAGE && (
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px 24px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginTop: '8px'
        }}>
          {/* Result Range Indicator */}
          <div style={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 600 }}>
            Showing <span style={{ color: '#0F172A', fontWeight: 700 }}>{startIndex + 1}–{Math.min(endIndex, totalResults)}</span> of <span style={{ color: '#0F172A', fontWeight: 700 }}>{totalResults}</span> internships
          </div>

          {/* Pagination Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Previous Button */}
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validPage === 1}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: validPage === 1 ? '#F8FAFC' : '#FFFFFF',
                color: validPage === 1 ? '#94A3B8' : '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: validPage === 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                opacity: validPage === 1 ? 0.6 : 1
              }}
            >
              ← Previous
            </button>

            {/* Compact Page Number Buttons */}
            {(() => {
              const pages = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (validPage > 3) pages.push('...');
                const start = Math.max(2, validPage - 1);
                const end = Math.min(totalPages - 1, validPage + 1);
                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) pages.push(i);
                }
                if (validPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }

              return pages.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 700 }}>
                      ...
                    </span>
                  );
                }
                const isActive = p === validPage;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Go to page ${p}`}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      minWidth: '34px',
                      height: '34px',
                      padding: '0 8px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      background: isActive ? '#2563EB' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
                    }}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            {/* Next Button */}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validPage === totalPages}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: validPage === totalPages ? '#F8FAFC' : '#FFFFFF',
                color: validPage === totalPages ? '#94A3B8' : '#334155',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: validPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                opacity: validPage === totalPages ? 0.6 : 1
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. INTERNSHIP DETAILS MODAL (VIEW DETAILS)                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {selectedDetailJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                {selectedDetailJob.source === 'UNSTOP' ? (
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#F3E8FF', color: '#6B21A8' }}>
                    🌐 UNSTOP EXTERNAL
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#ECFDF5', color: '#047857' }}>
                    🛡 INTERNMATCH CORPORATE
                  </span>
                )}
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                  {selectedDetailJob.title}
                </h2>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                  {selectedDetailJob.company_name}
                </div>
              </div>
              <button onClick={() => setSelectedDetailJob(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* AI Match Breakdown Box */}
            {selectedDetailJob.aiMatchScore != null && (
              <div style={{ padding: '14px 18px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> AI Match Score: {selectedDetailJob.aiMatchScore}%
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#FFFFFF', color: '#1D4ED8' }}>
                    {selectedDetailJob.aiMatchLevel}
                  </span>
                </div>
              </div>
            )}

            {/* Internship Quick Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div>📍 <strong>Location:</strong> {selectedDetailJob.location || 'Remote'}</div>
              <div>💰 <strong>Stipend:</strong> {selectedDetailJob.stipend || 'Disclosed'}</div>
              <div>📅 <strong>Duration:</strong> {selectedDetailJob.duration || '3 Months'}</div>
              <div>🏢 <strong>Work Mode:</strong> {formatWorkMode(selectedDetailJob.work_mode, selectedDetailJob.location)}</div>
            </div>

            {/* Description */}
            {selectedDetailJob.description && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Role Overview</h4>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedDetailJob.description}
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>Required Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {deriveSkillsFromInternship(selectedDetailJob).map((sk, i) => (
                  <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '0.78rem', fontWeight: 700 }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedDetailJob(null)} className="btn-secondary" style={{ padding: '9px 18px' }}>
                Close
              </button>
              {(() => {
                const isDetailUnstop = selectedDetailJob.source === 'UNSTOP';
                const detailRawJobId = selectedDetailJob.id || selectedDetailJob.ID;
                const detailCleanIdStr = String(detailRawJobId || '').replace(/^INTERNAL_/i, '');
                const detailNumId = parseInt(detailCleanIdStr, 10);
                const detailExtId = String(selectedDetailJob.external_id || selectedDetailJob.id || '');
                const isDetailApplied = isDetailUnstop
                  ? (appliedUnstopIds.has(detailExtId) || appliedUnstopIds.has(String(selectedDetailJob.id)) || appliedUnstopIds.has(`UNSTOP_${detailExtId}`))
                  : (appliedIds.has(detailRawJobId) || (!isNaN(detailNumId) && (appliedIds.has(detailNumId) || appliedIds.has(String(detailNumId)) || appliedIds.has(`INTERNAL_${detailNumId}`))));

                if (isDetailApplied) {
                  return (
                    <button
                      disabled
                      style={{
                        padding: '9px 22px',
                        background: '#DCFCE7',
                        color: '#166534',
                        border: '1px solid #86EFAC',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'default'
                      }}
                    >
                      <Check size={16} /> Already Applied
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => { const job = selectedDetailJob; setSelectedDetailJob(null); handleApplyClick(job); }}
                    className="btn-primary"
                    style={{ padding: '9px 22px' }}
                  >
                    {selectedDetailJob.source === 'UNSTOP' ? 'View on Unstop' : 'Apply Now'}
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. APPLICATION CONFIRMATION MODAL WITH RESUME SELECTION            */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {confirmModalJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', maxWidth: '520px', width: '100%', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.18)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>

            <div style={{ background: '#2563EB', padding: '22px 28px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>📋 Apply for Internship</h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: '4px 0 0' }}>
                {confirmModalJob.title} · {confirmModalJob.company_name}
              </p>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '22px' }}>
                <div>📍 <strong>{confirmModalJob.location || 'Coimbatore'}</strong></div>
                <div>💰 <strong style={{ color: '#059669' }}>₹{confirmModalJob.stipend}/mo</strong></div>
                <div>🕒 <strong>{confirmModalJob.duration || '3 Months'}</strong></div>
                {confirmModalJob.aiMatchScore != null && <div>⚡ Match: <strong style={{ color: '#2563EB' }}>{confirmModalJob.aiMatchScore}%</strong></div>}
              </div>

              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>📄 Select Resume to Submit</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>

                <label
                  htmlFor="resume-existing"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: `2px solid ${resumeMode === 'existing' ? '#2563EB' : '#E5E7EB'}`, background: resumeMode === 'existing' ? '#EFF6FF' : '#FAFAFA', cursor: existingResumeName ? 'pointer' : 'not-allowed', opacity: existingResumeName ? 1 : 0.5 }}
                >
                  <input id="resume-existing" type="radio" name="resume-mode" value="existing" checked={resumeMode === 'existing'} disabled={!existingResumeName} onChange={() => setResumeMode('existing')} style={{ accentColor: '#2563EB' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>Use Existing Resume</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      {existingResumeName ? `📎 ${existingResumeName}` : 'No resume uploaded yet'}
                    </div>
                  </div>
                  {existingResumeName && resumeMode === 'existing' && <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>✓ Selected</span>}
                </label>

                <label
                  htmlFor="resume-new"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: `2px solid ${resumeMode === 'new' ? '#7C3AED' : '#E5E7EB'}`, background: resumeMode === 'new' ? '#F5F3FF' : '#FAFAFA', cursor: 'pointer' }}
                >
                  <input id="resume-new" type="radio" name="resume-mode" value="new" checked={resumeMode === 'new'} onChange={() => setResumeMode('new')} style={{ accentColor: '#7C3AED', marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6D28D9' }}>Upload New Resume</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>PDF, DOC, DOCX · max 5MB</div>
                    {resumeMode === 'new' && (
                      <div style={{ marginTop: '10px' }}>
                        <input
                          id="resume-file-input"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={e => setNewResumeFile(e.target.files[0] || null)}
                        />
                        <label
                          htmlFor="resume-file-input"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: newResumeFile ? '#EDE9FE' : '#7C3AED', color: newResumeFile ? '#5B21B6' : '#FFF', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: newResumeFile ? '1px solid #C4B5FD' : 'none' }}
                        >
                          📁 {newResumeFile ? newResumeFile.name : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {statusMsg && (
                <div style={{ padding: '10px 14px', marginBottom: '16px', background: statusMsg.includes('❌') ? '#FEE2E2' : statusMsg.includes('✅') ? '#DCFCE7' : '#EFF6FF', color: statusMsg.includes('❌') ? '#991B1B' : statusMsg.includes('✅') ? '#166534' : '#1D4ED8', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  {statusMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button disabled={isSubmitting} onClick={() => { setConfirmModalJob(null); setStatusMsg(''); setNewResumeFile(null); }} style={{ padding: '9px 20px', fontSize: '0.85rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '9px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  disabled={isSubmitting || (resumeMode === 'new' && !newResumeFile) || (resumeMode === 'existing' && !existingResumeName)}
                  onClick={handleApply}
                  className="btn-primary"
                  style={{ padding: '9px 22px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '9px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
                >
                  {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UNSTOP APPLICATION CONFIRMATION MODAL ───────────────────────── */}
      {unstopConfirmJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '520px',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            <button
              onClick={() => setUnstopConfirmJob(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED',
                border: '1px solid #E9D5FF',
                flexShrink: 0
              }}>
                <Globe size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF' }}>
                  🌐 UNSTOP EXTERNAL
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  Confirm External Application
                </h3>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                {unstopConfirmJob.title || unstopConfirmJob.TITLE}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6D28D9', fontWeight: 700 }}>
                {unstopConfirmJob.company_name || unstopConfirmJob.COMPANY_NAME || 'Unstop Partner'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                📍 {unstopConfirmJob.location || 'Remote'} • 💰 {unstopConfirmJob.stipend || 'Disclosed on Unstop'}
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
              <strong>Did you complete your application on Unstop?</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', margin: 0 }}>
                The Unstop application page was opened in a new tab. Please confirm below only if you actually finished submitting your application on Unstop.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setUnstopConfirmJob(null)}
                disabled={unstopConfirmLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                No, I didn't apply
              </button>

              <button
                onClick={handleConfirmUnstopApplied}
                disabled={unstopConfirmLoading}
                style={{
                  flex: 1.2,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: unstopConfirmLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                <CheckCircle2 size={16} /> {unstopConfirmLoading ? 'Recording...' : 'Yes, I applied'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
