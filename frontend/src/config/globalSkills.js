/**
 * INTERNMATCH AI — Global Skills Library
 * Comprehensive list of 300+ globally recognized tech skills.
 * Used for autocomplete suggestions across: Profile, Signup, Post Internship.
 * Sorted alphabetically within each category, then merged into one sorted master list.
 */

export const GLOBAL_SKILLS = [
  // ── Frontend & UI ─────────────────────────────────────────────────
  "Angular", "Astro", "Blazor", "Bootstrap", "CSS", "CSS Grid", "CSS Animations",
  "Chakra UI", "D3.js", "Emotion (CSS-in-JS)", "Figma", "Framer Motion",
  "HTML", "HTML5", "JavaScript", "jQuery", "Less (CSS)", "Material UI",
  "Next.js", "Nuxt.js", "Pug", "React", "React Native", "Redux",
  "Remix", "SASS / SCSS", "Storybook", "Styled Components", "Svelte",
  "Tailwind CSS", "Three.js", "TypeScript", "UI/UX Design", "Vite",
  "Vue.js", "Web Components", "WebGL", "Webpack", "Zustand",

  // ── Backend & APIs ─────────────────────────────────────────────────
  "ASP.NET Core", "C#", "Django", "Express.js", "FastAPI", "Flask",
  "Go (Golang)", "GraphQL", "Haskell", "Java", "Jakarta EE",
  "Laravel", "Microservices", "NestJS", "Node.js", "PHP", "REST APIs",
  "Ruby on Rails", "Rust", "Spring Boot", "Spring Framework",
  "Spring Security", "Strapi", "gRPC",

  // ── AI / Machine Learning / Data Science ────────────────────────────
  "Artificial Intelligence", "AutoML", "Computer Vision", "CUDA",
  "Data Science", "Deep Learning", "Feature Engineering",
  "Generative AI", "Hugging Face Transformers", "Keras",
  "LangChain", "Large Language Models (LLM)", "Machine Learning",
  "Model Fine-Tuning", "MLflow", "Natural Language Processing (NLP)",
  "Neural Networks", "NumPy", "OpenAI API", "Pandas", "PyTorch",
  "Reinforcement Learning", "Scikit-learn", "Stable Diffusion",
  "TensorFlow", "Time Series Analysis", "Transfer Learning",
  "Vector Databases", "XGBoost",

  // ── Prompt Engineering & AI Development ────────────────────────────
  "AI Developer", "AI Engineering", "Chain-of-Thought Prompting",
  "Few-Shot Learning", "Gemini API", "LLM Application Development",
  "Prompt Engineering", "RAG (Retrieval-Augmented Generation)",
  "System Prompt Design", "Zero-Shot Prompting",

  // ── Data Analytics & BI ────────────────────────────────────────────
  "Apache Spark", "Business Intelligence", "Data Analysis",
  "Data Engineering", "Data Modeling", "Data Pipelines",
  "Data Visualization", "Data Warehousing", "dbt (Data Build Tool)",
  "ETL Pipelines", "Excel (Advanced)", "Google Analytics",
  "Jupyter Notebooks", "Looker", "Matplotlib", "Microsoft Fabric",
  "Power BI", "R (Programming)", "Seaborn", "SPSS", "Snowflake",
  "Tableau", "Apache Kafka", "Apache Airflow",

  // ── Databases ──────────────────────────────────────────────────────
  "Cassandra", "CockroachDB", "DynamoDB", "Elasticsearch",
  "Firebase", "Firestore", "MariaDB", "MongoDB", "MySQL",
  "Neo4j (Graph DB)", "NoSQL", "Oracle Database", "PostgreSQL",
  "Prisma ORM", "Redis", "SQLite", "SQL", "Supabase",
  "TimescaleDB", "Qdrant", "Pinecone",

  // ── Cloud & Infrastructure ──────────────────────────────────────────
  "AWS (Amazon Web Services)", "AWS Lambda", "AWS EC2", "AWS S3",
  "AWS RDS", "AWS SageMaker", "Azure", "Azure DevOps",
  "Cloudflare Workers", "Cloud Computing", "Google Cloud Platform (GCP)",
  "GCP BigQuery", "Heroku", "Infrastructure as Code (IaC)",
  "Oracle Cloud", "Serverless Architecture", "Vercel",

  // ── DevOps & Platform Engineering ──────────────────────────────────
  "Ansible", "ArgoCD", "Bash / Shell Scripting", "CI/CD Pipelines",
  "Docker", "Git", "GitHub Actions", "GitLab CI/CD", "Grafana",
  "Helm (Kubernetes)", "Jenkins", "Kubernetes", "Linux", "Nginx",
  "Prometheus", "Pulumi", "SRE (Site Reliability Engineering)",
  "Terraform", "Vagrant",

  // ── Mobile Development ─────────────────────────────────────────────
  "Android Development", "Dart", "Expo (React Native)", "Flutter",
  "iOS Development", "Jetpack Compose", "Kotlin", "Mobile Development",
  "React Native", "Swift", "SwiftUI", "Xamarin",

  // ── Cybersecurity ──────────────────────────────────────────────────
  "Application Security", "Bug Bounty", "Cloud Security",
  "Cryptography", "CTF (Capture The Flag)", "Cybersecurity",
  "Digital Forensics", "Ethical Hacking", "Incident Response",
  "Kali Linux", "Malware Analysis", "Metasploit", "Network Security",
  "OSINT (Open Source Intelligence)", "Penetration Testing",
  "SIEM (Splunk / QRadar)", "SOC Analyst", "Vulnerability Assessment",
  "Web Application Security (OWASP)",

  // ── Systems & Low-Level ────────────────────────────────────────────
  "ARM Architecture", "Assembly Language", "C", "C++",
  "Compiler Design", "Embedded C", "Embedded Systems",
  "FPGA Programming", "IoT Development", "Memory Management",
  "RTOS (Real-Time OS)", "Verilog", "VHDL",

  // ── Blockchain & Web3 ──────────────────────────────────────────────
  "Blockchain Development", "DeFi (Decentralized Finance)",
  "Ethereum", "NFT Development", "Smart Contracts",
  "Solidity", "Web3.js", "Hardhat",

  // ── Product & Design ───────────────────────────────────────────────
  "Adobe XD", "Canva", "Graphic Design", "Information Architecture",
  "Interaction Design", "Product Design", "Product Management",
  "Prototyping", "UX Research", "UX Writing", "Wireframing",

  // ── Testing & QA ───────────────────────────────────────────────────
  "Cypress", "End-to-End Testing", "Integration Testing",
  "Jest", "JUnit", "Load Testing (k6)", "Playwright",
  "Postman (API Testing)", "PyTest", "Selenium", "Test-Driven Development (TDD)",
  "Unit Testing",

  // ── Mechanical / ECE ───────────────────────────────────────────────
  "3D Printing", "ANSYS", "AutoCAD", "CAD/CAM", "CATIA",
  "Circuit Design", "FEA Analysis", "PCB Design (Altium)",
  "SolidWorks", "VLSI Design",

  // ── Data Structures & Algorithms ──────────────────────────────────
  "Algorithms", "Competitive Programming", "Data Structures",
  "Dynamic Programming", "Graph Theory", "LeetCode",
  "Problem Solving", "System Design",

  // ── Soft Skills & Professional ────────────────────────────────────
  "Agile / Scrum", "Communication", "Critical Thinking",
  "Cross-functional Collaboration", "Documentation",
  "Leadership", "Open Source Contribution",
  "Project Management", "Public Speaking", "Remote Collaboration",
  "Technical Writing",

  // ── Tools & Platforms ─────────────────────────────────────────────
  "Confluence", "Cursor AI", "GitHub Copilot",
  "Google Colab", "Jira", "Linux Terminal", "Notion",
  "Obsidian", "Slack Integration", "VS Code Extensions"
].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export default GLOBAL_SKILLS;
