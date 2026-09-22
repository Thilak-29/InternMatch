import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Award, ExternalLink, Cpu, ShieldCheck, RefreshCw, AlertCircle, UserCheck } from 'lucide-react';
import API_CONFIG from '../../config/apiConfig';
import './CareerAdvisor.css';

export default function CareerAdvisor({ currentUser, onNavigate }) {
  const studentId = currentUser?.userId || currentUser?.user_id || currentUser?.id || currentUser?.ID;
  const token = currentUser?.token || '';
  const baseUrl = API_CONFIG.STUDENT_SERVICE_URL;
  const aiApiUrl = API_CONFIG.AI_SERVICE_URL;

  const [existingSkills, setExistingSkills] = useState([]);
  const [profileDegree, setProfileDegree] = useState('');
  const [profileBranch, setProfileBranch] = useState('');
  const [profileBio, setProfileBio] = useState('');

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recommendedCertifications, setRecommendedCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiSucceeded, setAiSucceeded] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfileAndRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [studentId]);

  const fetchStudentProfileAndRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setAiSucceeded(false);
    let skillsString = '';
    let certsString = '';
    let deg = '';
    let br = '';
    let bi = '';
    let parsedSkills = [];

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/${studentId}/profile`, {
        headers: { 'Authorization': token }
      });

      if (res.ok) {
        const prof = await res.json();
        skillsString = prof.skills || prof.SKILLS || '';
        certsString = prof.certifications || prof.CERTIFICATIONS || '';
        deg = prof.degree || prof.DEGREE || '';
        br = prof.branch || prof.department || prof.BRANCH || '';
        bi = prof.bio || prof.BIO || '';

        parsedSkills = typeof skillsString === 'string'
          ? skillsString.split(',').map(s => s.trim()).filter(Boolean)
          : (Array.isArray(skillsString) ? skillsString : []);

        setExistingSkills(parsedSkills);
        setProfileDegree(deg);
        setProfileBranch(br);
        setProfileBio(bi);
      }
    } catch (e) {
      console.warn("Failed to fetch student profile for Career Advisor:", e);
    }

    try {
      const aiRes = await fetch(`${aiApiUrl}/api/v1/ai/career-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: parsedSkills.join(', '),
          certifications: certsString,
          degree: deg,
          branch: br,
          bio: bi
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        let gotCourses = false;
        let gotCerts = false;

        if (Array.isArray(aiData.courses) && aiData.courses.length > 0) {
          setRecommendedCourses(aiData.courses.slice(0, 3));
          gotCourses = true;
        } else {
          setRecommendedCourses([]);
        }

        if (Array.isArray(aiData.certifications) && aiData.certifications.length > 0) {
          setRecommendedCertifications(aiData.certifications.slice(0, 3));
          gotCerts = true;
        } else {
          setRecommendedCertifications([]);
        }

        setAiSucceeded(gotCourses || gotCerts);
      } else {
        const defaultRecs = generateFallbackRecommendations(parsedSkills.length > 0 ? parsedSkills : ['SQL']);
        setRecommendedCourses(defaultRecs.courses);
        setRecommendedCertifications(defaultRecs.certs);
      }
    } catch (e) {
      console.warn("AI Career Advisor call failed, using domain-aware fallbacks:", e);
      const defaultRecs = generateFallbackRecommendations(parsedSkills.length > 0 ? parsedSkills : ['SQL']);
      setRecommendedCourses(defaultRecs.courses);
      setRecommendedCertifications(defaultRecs.certs);
    } finally {
      setIsLoading(false);
    }
  };


  const generateFallbackRecommendations = (skillsArr) => {
    // Build a combined context string from skills + degree + branch + bio
    const sLower = skillsArr.map(s => String(s).toLowerCase()).join(' ');
    const context = [sLower, profileDegree, profileBranch, profileBio].join(' ').toLowerCase();

    // ── Domain detection helpers ──────────────────────────────────────────
    const has = (...words) => words.some(w => context.includes(w));

    const isPython    = has('python', 'flask', 'django', 'fastapi', 'pandas', 'numpy', 'scikit');
    const isML        = has('machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'ai', 'artificial intelligence', 'data science', 'neural network', 'keras', 'ml');
    const isData      = has('data analysis', 'data analyst', 'power bi', 'tableau', 'excel', 'statistics', 'analytics', 'matplotlib', 'seaborn', 'r language', 'spss');
    const isAndroid   = has('android', 'kotlin', 'jetpack', 'firebase', 'mobile development', 'flutter', 'dart', 'ios', 'swift', 'react native');
    const isCyber     = has('cybersecurity', 'cyber security', 'ethical hacking', 'penetration testing', 'kali', 'network security', 'oscp', 'ctf', 'siem', 'firewall', 'infosec');
    const isDevOps    = has('devops', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux', 'bash', 'shell scripting', 'git', 'github actions');
    const isJava      = has('java', 'spring boot', 'spring', 'hibernate', 'jvm', 'maven', 'gradle', 'j2ee', 'jakarta');
    const isWeb       = has('react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'nodejs', 'next.js', 'tailwind', 'frontend', 'web development');
    const isSQL       = has('sql', 'mysql', 'postgresql', 'oracle db', 'database', 'mongodb', 'nosql', 'redis', 'cassandra');
    const isCloud     = has('aws', 'azure', 'gcp', 'cloud computing', 'serverless', 'lambda', 'ec2', 's3');
    const isECE       = has('embedded', 'iot', 'arduino', 'raspberry pi', 'vhdl', 'verilog', 'fpga', 'circuit', 'electronics', 'ece', 'electrical');
    const isMech      = has('solidworks', 'autocad', 'ansys', 'catia', 'mechanical', 'cad', 'cam', 'manufacturing', 'thermodynamics');
    const isFinance   = has('finance', 'accounting', 'fintech', 'stock', 'trading', 'investment', 'blockchain', 'crypto', 'economics', 'mba');

    // ── Pick highest-confidence domain ───────────────────────────────────
    if (isML || (isPython && isData)) {
      return {
        courses: [
          { id: 1, title: "Machine Learning Specialization by Andrew Ng", provider: "DeepLearning.AI & Coursera", duration: "3 Months", level: "Intermediate", reason: "Foundational ML framework covering supervised, unsupervised & reinforcement learning aligned with your AI skill set", badge: "Most Popular", skills: ["ML", "Python", "Scikit-learn"], url: "https://www.coursera.org/specializations/machine-learning-introduction" },
          { id: 2, title: "Deep Learning Specialization (PyTorch & TensorFlow)", provider: "DeepLearning.AI", duration: "5 Months", level: "Advanced", reason: "Builds neural networks, CNNs, and RNNs — critical for NLP & Computer Vision roles matching your profile", badge: "High Demand", skills: ["TensorFlow", "PyTorch", "CNNs"], url: "https://www.coursera.org/specializations/deep-learning" },
          { id: 3, title: "MLOps Specialization – Deploying ML Models at Scale", provider: "DeepLearning.AI & Duke", duration: "4 Months", level: "Advanced", reason: "Teaches model versioning, A/B testing, and serving pipelines — moves your ML skills into production readiness", badge: "Industry Ready", skills: ["MLflow", "Docker", "CI/CD"], url: "https://www.coursera.org/specializations/mlops-machine-learning-duke" }
        ],
        certs: [
          { id: 1, name: "TensorFlow Developer Certificate", issuer: "Google", description: "Official Google credential validating deep learning model building with TensorFlow and Keras.", skills: ["TensorFlow", "Keras", "DL"], url: "https://www.tensorflow.org/certificate", color: "#F59E0B" },
          { id: 2, name: "AWS Certified Machine Learning – Specialty", issuer: "Amazon Web Services", description: "Industry benchmark for designing, building, training, and deploying ML models on AWS.", skills: ["AWS SageMaker", "ML Ops", "Data Engineering"], url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", color: "#F59E0B" },
          { id: 3, name: "Professional Data Engineer – Google Cloud", issuer: "Google Cloud", description: "Validates ability to design and build data processing systems and ML pipelines on GCP.", skills: ["GCP", "BigQuery", "ML Pipelines"], url: "https://cloud.google.com/certification/data-engineer", color: "#10B981" }
        ]
      };
    }

    if (isAndroid) {
      return {
        courses: [
          { id: 1, title: "Android Development with Kotlin – Complete Bootcamp", provider: "Google & Udacity", duration: "6 Weeks", level: "Intermediate", reason: "Covers Jetpack Compose, MVVM architecture, and Coroutines aligned with modern Android development", badge: "Google Backed", skills: ["Kotlin", "Jetpack Compose", "MVVM"], url: "https://developer.android.com/courses" },
          { id: 2, title: "Flutter & Dart – Build Cross-Platform Mobile Apps", provider: "Google & Udemy", duration: "8 Weeks", level: "Intermediate", reason: "Expands your mobile development skillset to iOS + Android simultaneously using a single codebase", badge: "High Growth", skills: ["Flutter", "Dart", "Firebase"], url: "https://www.udemy.com/course/flutter-bootcamp-with-dart/" },
          { id: 3, title: "Firebase & Firestore for Mobile Backends", provider: "Google Firebase & Coursera", duration: "4 Weeks", level: "Intermediate", reason: "Teaches real-time databases, auth, push notifications — completing the full mobile app stack", badge: "In Demand", skills: ["Firebase", "Firestore", "Authentication"], url: "https://firebase.google.com/learn" }
        ],
        certs: [
          { id: 1, name: "Associate Android Developer Certification", issuer: "Google", description: "Official Google credential certifying competency in Android app development with Kotlin.", skills: ["Kotlin", "Android SDK", "Jetpack"], url: "https://developers.google.com/certification/associate-android-developer", color: "#10B981" },
          { id: 2, name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", description: "Validates mobile backend skills including API Gateway, Lambda, and DynamoDB for mobile apps.", skills: ["AWS Lambda", "API Gateway", "DynamoDB"], url: "https://aws.amazon.com/certification/certified-developer-associate/", color: "#F59E0B" },
          { id: 3, name: "Meta Android Developer Professional Certificate", issuer: "Meta & Coursera", description: "Industry-recognized credential for Android development with modern Jetpack libraries.", skills: ["Android", "Kotlin", "UI/UX"], url: "https://www.coursera.org/professional-certificates/meta-android-developer", color: "#2563EB" }
        ]
      };
    }

    if (isCyber) {
      return {
        courses: [
          { id: 1, title: "Google Cybersecurity Professional Certificate", provider: "Google & Coursera", duration: "6 Months", level: "Beginner–Intermediate", reason: "Structured path covering network security, threat analysis, SIEM tools, and Python for security automation", badge: "Google Backed", skills: ["SIEM", "Network Security", "Python"], url: "https://www.coursera.org/professional-certificates/google-cybersecurity" },
          { id: 2, title: "Practical Ethical Hacking – TCM Security", provider: "TCM Security", duration: "25 Hours", level: "Intermediate", reason: "Hands-on penetration testing covering Active Directory attacks, OSINT, and post-exploitation", badge: "Top Rated", skills: ["Kali Linux", "Metasploit", "AD Attacks"], url: "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course" },
          { id: 3, title: "TryHackMe SOC Level 1 Learning Path", provider: "TryHackMe", duration: "Ongoing", level: "Intermediate", reason: "Builds Blue Team skills in threat detection, log analysis, and incident response for SOC analyst roles", badge: "Hands-On", skills: ["SOC", "Wireshark", "Splunk"], url: "https://tryhackme.com/path/outline/soclevel1" }
        ],
        certs: [
          { id: 1, name: "CompTIA Security+", issuer: "CompTIA", description: "Industry-standard entry-level cybersecurity certification covering threat management, cryptography, and network security.", skills: ["Network Security", "Cryptography", "Threats"], url: "https://www.comptia.org/certifications/security", color: "#DC2626" },
          { id: 2, name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", description: "Globally recognized credential validating ethical hacking, penetration testing, and offensive security techniques.", skills: ["Ethical Hacking", "Pen Testing", "OSCP"], url: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/", color: "#7C3AED" },
          { id: 3, name: "CompTIA CySA+ (Cybersecurity Analyst)", issuer: "CompTIA", description: "Validates Blue Team skills — threat detection, log analysis, SIEM, and incident response.", skills: ["SIEM", "Threat Analysis", "IR"], url: "https://www.comptia.org/certifications/cybersecurity-analyst", color: "#DC2626" }
        ]
      };
    }

    if (isData && !isML) {
      return {
        courses: [
          { id: 1, title: "IBM Data Analyst Professional Certificate", provider: "IBM & Coursera", duration: "4 Months", level: "Beginner–Intermediate", reason: "Covers Excel, SQL, Python, Pandas, and Power BI — the complete Data Analyst toolkit matching your analytical profile", badge: "IBM Certified", skills: ["Excel", "SQL", "Power BI", "Python"], url: "https://www.coursera.org/professional-certificates/ibm-data-analyst" },
          { id: 2, title: "Microsoft Power BI Data Analyst Associate (PL-300)", provider: "Microsoft Learn", duration: "4 Weeks", level: "Intermediate", reason: "Builds production-grade dashboards, DAX calculations, and data modelling skills for Business Intelligence roles", badge: "Microsoft", skills: ["Power BI", "DAX", "Data Modelling"], url: "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/" },
          { id: 3, title: "Tableau Analyst Training – Visual Analytics Mastery", provider: "Tableau & Coursera", duration: "5 Weeks", level: "Intermediate", reason: "Extends your analytics skills to professional data storytelling and executive-level dashboards", badge: "High Demand", skills: ["Tableau", "Data Viz", "Analytics"], url: "https://www.tableau.com/learn/training" }
        ],
        certs: [
          { id: 1, name: "IBM Data Analyst Professional Certificate", issuer: "IBM & Coursera", description: "End-to-end credential covering data wrangling, visualization, and Python-based analytics.", skills: ["Python", "SQL", "Power BI"], url: "https://www.coursera.org/professional-certificates/ibm-data-analyst", color: "#2563EB" },
          { id: 2, name: "Microsoft Power BI Data Analyst (PL-300)", issuer: "Microsoft", description: "Official Microsoft certification for Power BI dashboards, DAX, and data modelling.", skills: ["Power BI", "DAX", "Data Modelling"], url: "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/", color: "#059669" },
          { id: 3, name: "Google Data Analytics Professional Certificate", issuer: "Google", description: "Industry-recognized credential in data cleaning, analysis, and visualization.", skills: ["R", "Tableau", "SQL"], url: "https://www.coursera.org/professional-certificates/google-data-analytics", color: "#F59E0B" }
        ]
      };
    }

    if (isDevOps || isCloud) {
      return {
        courses: [
          { id: 1, title: "DevOps Engineering on AWS – Complete Bootcamp", provider: "AWS Training & Coursera", duration: "6 Weeks", level: "Advanced", reason: "Covers CI/CD pipelines, Infrastructure as Code with Terraform, and container orchestration with Kubernetes", badge: "AWS Backed", skills: ["AWS", "Terraform", "CI/CD"], url: "https://www.coursera.org/learn/aws-devops" },
          { id: 2, title: "Kubernetes & Docker – Container Orchestration Mastery", provider: "CNCF & Linux Foundation", duration: "8 Weeks", level: "Advanced", reason: "Builds production-grade Kubernetes skills for SRE, Platform Engineering, and Cloud-Native roles", badge: "CNCF Official", skills: ["Kubernetes", "Docker", "Helm"], url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/" },
          { id: 3, title: "HashiCorp Terraform Associate – Infrastructure as Code", provider: "HashiCorp & Udemy", duration: "4 Weeks", level: "Intermediate", reason: "Teaches declarative cloud provisioning — a critical skill for DevOps and Cloud Engineering positions", badge: "In Demand", skills: ["Terraform", "IaC", "Cloud"], url: "https://www.udemy.com/course/terraform-beginner-to-advanced/" }
        ],
        certs: [
          { id: 1, name: "AWS Certified DevOps Engineer – Professional", issuer: "Amazon Web Services", description: "Top-tier AWS certification validating CI/CD, monitoring, and high-availability cloud systems.", skills: ["AWS", "CI/CD", "CloudFormation"], url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/", color: "#F59E0B" },
          { id: 2, name: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation", description: "The industry benchmark for Kubernetes cluster management and cloud-native infrastructure.", skills: ["Kubernetes", "etcd", "Networking"], url: "https://training.cncf.io/certification/cka/", color: "#2563EB" },
          { id: 3, name: "HashiCorp Certified: Terraform Associate", issuer: "HashiCorp", description: "Validates Infrastructure-as-Code expertise across multi-cloud provider deployments.", skills: ["Terraform", "IaC", "Cloud"], url: "https://www.hashicorp.com/certification/terraform-associate", color: "#7C3AED" }
        ]
      };
    }

    if (isECE) {
      return {
        courses: [
          { id: 1, title: "Embedded Systems Specialization (ARM Cortex-M)", provider: "University of Colorado & Coursera", duration: "3 Months", level: "Intermediate", reason: "Covers bare-metal programming, RTOS, and memory-mapped I/O for IoT and embedded engineering roles", badge: "Industry Aligned", skills: ["C", "ARM", "RTOS"], url: "https://www.coursera.org/specializations/embedded-systems-software-development" },
          { id: 2, title: "IoT Programming with Raspberry Pi & Arduino", provider: "IBM & edX", duration: "6 Weeks", level: "Beginner–Intermediate", reason: "Bridges hardware prototyping to cloud-connected IoT systems relevant to your electronics background", badge: "Hands-On", skills: ["Raspberry Pi", "Arduino", "MQTT"], url: "https://www.edx.org/learn/iot" },
          { id: 3, title: "VLSI Design & FPGA Programming (Xilinx)", provider: "Xilinx & Udemy", duration: "8 Weeks", level: "Advanced", reason: "Extends circuit design skills to digital system implementation using FPGA and HDL languages", badge: "Specialized", skills: ["VHDL", "Verilog", "FPGA"], url: "https://www.udemy.com/course/vlsi-design/" }
        ],
        certs: [
          { id: 1, name: "AWS Certified IoT Specialty", issuer: "Amazon Web Services", description: "Validates ability to design and deploy IoT solutions using AWS IoT Core, Greengrass, and Analytics.", skills: ["AWS IoT", "Greengrass", "MQTT"], url: "https://aws.amazon.com/certification/", color: "#F59E0B" },
          { id: 2, name: "Certified LabVIEW Developer (CLD)", issuer: "National Instruments", description: "Industry credential for embedded test and measurement system design with NI LabVIEW.", skills: ["LabVIEW", "DAQ", "Instrumentation"], url: "https://www.ni.com/en/shop/services/products/clad-exam.html", color: "#F59E0B" },
          { id: 3, name: "PCB Design Professional (Altium Designer)", issuer: "Altium", description: "Validates professional PCB schematic and layout design skills for electronics engineering roles.", skills: ["Altium", "PCB", "Circuit Design"], url: "https://www.altium.com/altium-designer/education", color: "#DC2626" }
        ]
      };
    }

    if (isMech) {
      return {
        courses: [
          { id: 1, title: "Mechanical Design with SolidWorks – Professional Level", provider: "SolidWorks & Udemy", duration: "6 Weeks", level: "Intermediate", reason: "Covers parametric 3D modelling, assemblies, and drawings — core skills for mechanical design roles", badge: "Industry Standard", skills: ["SolidWorks", "3D Modelling", "GD&T"], url: "https://www.udemy.com/course/solidworks-for-engineers/" },
          { id: 2, title: "FEA Structural Analysis with ANSYS Workbench", provider: "Ansys & Coursera", duration: "8 Weeks", level: "Advanced", reason: "Teaches finite element analysis for stress, vibration, and thermal problems in engineering design", badge: "Simulation Expert", skills: ["ANSYS", "FEA", "Structural Analysis"], url: "https://www.coursera.org/learn/ansys" },
          { id: 3, title: "Additive Manufacturing & 3D Printing Technologies", provider: "MIT xPRO", duration: "4 Weeks", level: "Intermediate", reason: "Covers DFM, topology optimization, and material selection for next-generation product design", badge: "Emerging Tech", skills: ["3D Printing", "DFM", "Materials"], url: "https://xpro.mit.edu/courses/course-v1:xPRO+AM/" }
        ],
        certs: [
          { id: 1, name: "CSWA – Certified SolidWorks Associate", issuer: "SolidWorks (Dassault Systèmes)", description: "Entry-level industry certification for 3D parametric CAD design and engineering drawings.", skills: ["SolidWorks", "CAD", "GD&T"], url: "https://www.solidworks.com/sw/support/mcadtrainingworkshops.htm", color: "#DC2626" },
          { id: 2, name: "CSWP – Certified SolidWorks Professional", issuer: "SolidWorks (Dassault Systèmes)", description: "Advanced certification covering complex assemblies, simulations, and multi-body design.", skills: ["SolidWorks", "Assemblies", "Simulation"], url: "https://www.solidworks.com/sw/support/mcadtrainingworkshops.htm", color: "#DC2626" },
          { id: 3, name: "Six Sigma Green Belt (SSGB)", issuer: "ASQ / IASSC", description: "Validates process improvement and quality management skills for manufacturing engineering roles.", skills: ["Six Sigma", "Lean", "Quality Control"], url: "https://asq.org/cert/six-sigma-green-belt", color: "#059669" }
        ]
      };
    }

    if (isFinance) {
      return {
        courses: [
          { id: 1, title: "FinTech: Foundations & Applications of Financial Technology", provider: "Wharton School & Coursera", duration: "4 Weeks", level: "Beginner–Intermediate", reason: "Covers blockchain, digital payments, algorithmic trading, and RegTech aligned with your finance background", badge: "Wharton Backed", skills: ["FinTech", "Blockchain", "Digital Payments"], url: "https://www.coursera.org/learn/wharton-fintech" },
          { id: 2, title: "Financial Analysis & Valuation for Startups", provider: "NYU Stern & Coursera", duration: "5 Weeks", level: "Intermediate", reason: "Builds DCF, LBO, and comparable company analysis skills critical for investment and equity research roles", badge: "High Value", skills: ["DCF", "Valuation", "Financial Modelling"], url: "https://www.coursera.org/learn/financial-analysis" },
          { id: 3, title: "Python for Finance & Algorithmic Trading", provider: "Quantra & Udemy", duration: "6 Weeks", level: "Intermediate", reason: "Bridges your finance domain with programming — unlocks QuantDev, Algorithmic Trading, and Data Science in Finance roles", badge: "Unique Crossover", skills: ["Python", "Pandas", "Algorithmic Trading"], url: "https://www.udemy.com/course/python-for-finance-and-trading-algorithms/" }
        ],
        certs: [
          { id: 1, name: "CFA Level I – Chartered Financial Analyst", issuer: "CFA Institute", description: "World's most respected finance credential covering ethics, quantitative methods, and portfolio management.", skills: ["Portfolio Management", "Equity Analysis", "Risk"], url: "https://www.cfainstitute.org/programs/cfa", color: "#2563EB" },
          { id: 2, name: "Certified Financial Risk Manager (FRM)", issuer: "GARP", description: "Global standard for financial risk management covering market risk, credit risk, and Basel regulations.", skills: ["Risk Management", "Derivatives", "Basel"], url: "https://www.garp.org/frm", color: "#7C3AED" },
          { id: 3, name: "Bloomberg Market Concepts (BMC)", issuer: "Bloomberg", description: "Essential finance industry credential covering Economics, Currencies, Fixed Income, and Equities.", skills: ["Bloomberg Terminal", "Fixed Income", "Equities"], url: "https://www.bloomberg.com/professional/product/bloomberg-market-concepts/", color: "#059669" }
        ]
      };
    }

    if (isJava && !isWeb) {
      return {
        courses: [
          { id: 1, title: "Spring Boot 3 & Microservices Architecture", provider: "Amigoscode & Udemy", duration: "8 Weeks", level: "Advanced", reason: "Covers Spring Security, Spring Data JPA, and RESTful API design — the production Java backend stack", badge: "Top Rated", skills: ["Spring Boot", "REST APIs", "JPA"], url: "https://www.udemy.com/course/spring-boot-microservices-and-spring-cloud-begin-to-expert/" },
          { id: 2, title: "Java Multithreading & Concurrency Masterclass", provider: "Udemy", duration: "6 Weeks", level: "Advanced", reason: "Deep-dives into thread pools, CompletableFuture, and lock-free algorithms — critical for senior Java engineering roles", badge: "Performance Focus", skills: ["Java Concurrency", "Threads", "JVM"], url: "https://www.udemy.com/course/java-multithreading-concurrency-performance-optimization/" },
          { id: 3, title: "Designing Data-Intensive Applications (System Design)", provider: "Martin Kleppmann / O'Reilly", duration: "Self-Paced", level: "Advanced", reason: "Prepares you for system design interviews and building scalable, fault-tolerant distributed Java systems", badge: "Must Read", skills: ["System Design", "Distributed Systems", "Kafka"], url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" }
        ],
        certs: [
          { id: 1, name: "Oracle Certified Professional: Java SE 17 Developer", issuer: "Oracle Corporation", description: "Official top-tier Java credential validating mastery of OOP, generics, streams, and concurrency.", skills: ["Java SE 17", "Streams", "Concurrency"], url: "https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJAV17", color: "#DC2626" },
          { id: 2, name: "Spring Professional Certification", issuer: "VMware (Pivotal)", description: "Official Spring Framework credential covering Spring Boot, Security, Testing, and Microservices.", skills: ["Spring Boot", "Spring Security", "Testing"], url: "https://www.vmware.com/learning/certification/spring-professional.html", color: "#059669" },
          { id: 3, name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", description: "Validates ability to design scalable, cost-effective Java backend systems on AWS cloud.", skills: ["AWS", "Cloud Architecture", "High Availability"], url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", color: "#F59E0B" }
        ]
      };
    }

    if (isWeb || isPython) {
      return {
        courses: [
          { id: 1, title: "Full-Stack Web Development with React & Node.js", provider: "Meta Professional & Coursera", duration: "6 Months", level: "Intermediate", reason: "End-to-end professional path covering React hooks, REST APIs, authentication, and deployment", badge: "Meta Backed", skills: ["React", "Node.js", "REST APIs"], url: "https://www.coursera.org/professional-certificates/meta-full-stack-engineer" },
          { id: 2, title: "Next.js – The Full-Stack Framework for Production", provider: "Vercel & Udemy", duration: "6 Weeks", level: "Intermediate", reason: "Covers server-side rendering, App Router, and API routes — the industry standard for modern web apps", badge: "High Growth", skills: ["Next.js", "TypeScript", "SSR"], url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/" },
          { id: 3, title: "FastAPI & Python Backend Engineering", provider: "TestDriven.io", duration: "4 Weeks", level: "Intermediate", reason: "Bridges your Python skills to production-grade API development with async, JWT auth, and Dockerization", badge: "In Demand", skills: ["FastAPI", "Python", "Docker"], url: "https://testdriven.io/courses/tdd-fastapi/" }
        ],
        certs: [
          { id: 1, name: "Meta Front-End Developer Professional Certificate", issuer: "Meta & Coursera", description: "Verified credential validating React, JavaScript, and responsive UX design skills.", skills: ["React", "JavaScript", "UX/UI"], url: "https://www.coursera.org/professional-certificates/meta-front-end-developer", color: "#2563EB" },
          { id: 2, name: "Meta Back-End Developer Professional Certificate", issuer: "Meta & Coursera", description: "Validates Django, REST APIs, databases, and deployment — the complete backend developer toolkit.", skills: ["Django", "REST APIs", "Databases"], url: "https://www.coursera.org/professional-certificates/meta-back-end-developer", color: "#2563EB" },
          { id: 3, name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", description: "Industry standard certification for deploying and scaling web applications on AWS infrastructure.", skills: ["AWS Lambda", "EC2", "S3"], url: "https://aws.amazon.com/certification/certified-developer-associate/", color: "#F59E0B" }
        ]
      };
    }

    if (isSQL) {
      return {
        courses: [
          { id: 1, title: "Oracle Database SQL Certified Associate Mastery", provider: "Oracle University & Coursera", duration: "4 Weeks", level: "Intermediate", reason: "Validates your SQL query optimization, DDL/DML, and database schema design skills", badge: "Recommended for SQL", skills: ["SQL", "Oracle DB", "Database Design"], url: "https://www.coursera.org/learn/oracle-sql-basics" },
          { id: 2, title: "Advanced PostgreSQL Tuning & High-Performance Indexing", provider: "PostgreSQL Guild & edX", duration: "5 Weeks", level: "Advanced", reason: "Complements your SQL background for Enterprise Backend & Data Engineer roles", badge: "High Demand", skills: ["PostgreSQL", "Query Tuning", "Indexing"], url: "https://www.edx.org/learn/postgresql" },
          { id: 3, title: "Cloud Database Engineering & AWS RDS Architecture", provider: "AWS Training & Udemy", duration: "6 Weeks", level: "Intermediate", reason: "Bridges SQL relational databases to cloud database infrastructure", badge: "Top Rated", skills: ["AWS RDS", "Cloud Databases", "SQL"], url: "https://aws.amazon.com/training/course-descriptions/database-offering/" }
        ],
        certs: [
          { id: 1, name: "Oracle Database SQL Certified Associate (1Z0-071)", issuer: "Oracle University", description: "Official Oracle credential verifying SQL fundamental & advanced query expertise.", skills: ["SQL", "Database Management"], url: "https://education.oracle.com/oracle-database-sql/pexam_1Z0-071", color: "#DC2626" },
          { id: 2, name: "AWS Certified Database – Specialty", issuer: "Amazon Web Services (AWS)", description: "Industry benchmark for designing, deploying, and managing relational cloud SQL databases.", skills: ["AWS", "Database Security", "Cloud SQL"], url: "https://aws.amazon.com/certification/certified-database-specialty/", color: "#F59E0B" },
          { id: 3, name: "Meta Database Engineer Professional Certificate", issuer: "Meta & Coursera", description: "Verified credential covering SQL, Database Administration, and Data Modeling.", skills: ["SQL", "Data Modeling", "DBA"], url: "https://www.coursera.org/professional-certificates/meta-database-engineer", color: "#2563EB" }
        ]
      };
    }

    // ── Default / General CSE / IT path ───────────────────────────────────
    return {
      courses: [
        { id: 1, title: "CS50x – Harvard's Introduction to Computer Science", provider: "Harvard University & edX", duration: "12 Weeks", level: "Beginner–Intermediate", reason: "Gold-standard foundational CS course covering algorithms, data structures, and multiple programming languages", badge: "Harvard", skills: ["C", "Python", "Algorithms"], url: "https://cs50.harvard.edu/x/" },
        { id: 2, title: "Cloud Native Microservices with Docker & AWS", provider: "AWS Academy & Coursera", duration: "6 Weeks", level: "Advanced", reason: "Bridges general CS skills to Enterprise Cloud Deployment & Microservices — a top employer requirement", badge: "High Impact", skills: ["Docker", "AWS", "Microservices"], url: "https://www.coursera.org/specializations/aws-cloud-solutions-architect" },
        { id: 3, title: "System Design & Distributed Systems for Engineers", provider: "Educative.io", duration: "8 Weeks", level: "Advanced", reason: "Prepares you for FAANG-level system design interviews and senior engineering roles", badge: "Interview Ready", skills: ["System Design", "Scalability", "CAP Theorem"], url: "https://www.educative.io/courses/grokking-the-system-design-interview" }
      ],
      certs: [
        { id: 1, name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", description: "The most recognized cloud certification — validates designing scalable, resilient AWS systems.", skills: ["AWS", "Cloud Architecture", "High Availability"], url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", color: "#F59E0B" },
        { id: 2, name: "Oracle Certified Professional: Java SE 17 Developer", issuer: "Oracle Corporation", description: "Official credential verifying high-level mastery of core Java, JVM, and enterprise APIs.", skills: ["Java SE 17", "JVM", "OOP"], url: "https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJAV17", color: "#DC2626" },
        { id: 3, name: "Google IT Automation with Python Professional Certificate", issuer: "Google", description: "Practical credential covering Python scripting, Git, Linux, and IT automation workflows.", skills: ["Python", "Git", "Linux"], url: "https://www.coursera.org/professional-certificates/google-it-automation", color: "#10B981" }
      ]
    };
  };

  if (!studentId) {
    return (
      <div className="career-advisor-page">
        <div className="ca-empty-skills" style={{ padding: '36px' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
          <h4>Session Authentication Error</h4>
          <p>Unable to identify authenticated student ID. Please sign in again.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="career-advisor-page">
        <div className="ca-loading-container">
          <Sparkles size={24} style={{ margin: '0 auto 12px auto', color: '#2563EB' }} />
          <div>Career Advisor</div>
          <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#94A3B8' }}>
            Loading personalized courses and certifications based on your profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="career-advisor-page">
      {/* Header Banner */}
      <div className="ca-header-card">
        <div>
          <h2 className="ca-header-title">
            <Sparkles size={24} color="#60A5FA" /> Career Advisor
            {aiSucceeded && (
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px',
                borderRadius: '12px', background: 'rgba(16,185,129,0.15)',
                color: '#10B981', border: '1px solid rgba(16,185,129,0.3)',
                marginLeft: '10px', letterSpacing: '0.04em'
              }}>
                ✦ AI Personalized
              </span>
            )}
          </h2>
          <p className="ca-header-subtitle">
            {existingSkills.length > 0
              ? `Analyzed your ${existingSkills.length} skill${existingSkills.length !== 1 ? 's' : ''} — showing what to learn next for maximum career impact.`
              : 'Personalized courses and professional certifications based on your skills and career profile.'
            }
            {profileDegree && profileBranch ? ` (${profileDegree} • ${profileBranch})` : ''}
          </p>
        </div>

        <button
          onClick={fetchStudentProfileAndRecommendations}
          className="btn-secondary"
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            color: '#0F172A',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Refresh Recommendations
        </button>
      </div>

      {/* Your Skills Section */}
      <div className="ca-skills-card">
        <div className="ca-skills-title">
          <Cpu size={16} color="#2563EB" /> Your Skills
        </div>

        {existingSkills.length > 0 ? (
          <div className="ca-skills-pills">
            {existingSkills.map((skill, index) => (
              <span key={index} className="ca-skill-pill">
                ✓ {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="ca-empty-skills">
            <h4>Complete your profile</h4>
            <p>Add your skills or upload your resume to receive personalized career recommendations.</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('profile')}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={16} /> Complete Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Section 1: Top 3 Tailored AI-Recommended Courses */}
      <div>
        <h3 className="ca-section-title">
          <BookOpen size={20} color="#2563EB" /> Top 3 Tailored AI-Recommended Courses
        </h3>

        <div className="ca-card-grid">
          {recommendedCourses.slice(0, 3).map((course, idx) => (
            <div key={course.id || idx} className="ca-course-card">
              <div>
                <div className="ca-card-header-top">
                  <span className="ca-card-badge">{course.badge || 'Tailored'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {course.relevanceScore && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                        ⚡ {course.relevanceScore}% Match
                      </span>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      ⏱️ {course.duration || '4 Weeks'}
                    </span>
                  </div>
                </div>

                <h4 className="ca-card-title" style={{ marginTop: '10px' }}>
                  🎓 {course.title}
                </h4>

                <div className="ca-card-provider">
                  Provider: {course.provider}
                </div>

                <p className="ca-card-reason">
                  💡 <strong>AI Analysis:</strong> {course.reason || course.description}
                </p>

                {/* Skill tags if present */}
                {Array.isArray(course.skills) && course.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {course.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.68rem', padding: '2px 6px', background: '#F1F5F9', color: '#334155', borderRadius: '4px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ca-card-footer">
                <a
                  href={course.url || 'https://www.coursera.org/'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    background: '#F8FAFC'
                  }}
                >
                  View Course <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Top 3 Recognized Professional Certifications */}
      <div>
        <h3 className="ca-section-title">
          <Award size={20} color="#D97706" /> Top 3 Recognized Professional Certifications
        </h3>

        <div className="ca-card-grid">
          {recommendedCertifications.slice(0, 3).map((cert, idx) => (
            <div key={cert.id || idx} className="ca-cert-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color={cert.color || '#2563EB'} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: cert.color || '#2563EB' }}>
                      {cert.issuer}
                    </span>
                  </div>
                  {cert.relevanceScore && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                      ⚡ {cert.relevanceScore}% Relevance
                    </span>
                  )}
                </div>

                <h4 className="ca-card-title">
                  🏆 {cert.name}
                </h4>

                <p className="ca-card-reason">
                  {cert.description || 'Industry-recognized professional credential.'}
                </p>

                {/* Skill tags if present */}
                {Array.isArray(cert.skills) && cert.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {cert.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.68rem', padding: '2px 6px', background: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ca-card-footer">
                <a
                  href={cert.url || 'https://aws.amazon.com/certification/'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    background: '#F8FAFC'
                  }}
                >
                  View Certification <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
