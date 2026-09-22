package com.internmatch.ai.service;

import java.util.*;

public class CareerCatalog {

    public static class Course {
        public String id;
        public String title;
        public String provider;
        public String duration;
        public String level;
        public List<String> skills;
        public String domain;
        public String badge;
        public String url;

        public Course(String id, String title, String provider, String duration, String level, List<String> skills, String domain, String badge, String url) {
            this.id = id;
            this.title = title;
            this.provider = provider;
            this.duration = duration;
            this.level = level;
            this.skills = skills;
            this.domain = domain;
            this.badge = badge;
            this.url = url;
        }
    }

    public static class Certification {
        public String id;
        public String name;
        public String issuer;
        public String description;
        public List<String> skills;
        public String domain;
        public String url;
        public String color;

        public Certification(String id, String name, String issuer, String description, List<String> skills, String domain, String url, String color) {
            this.id = id;
            this.name = name;
            this.issuer = issuer;
            this.description = description;
            this.skills = skills;
            this.domain = domain;
            this.url = url;
            this.color = color;
        }
    }

    public static final List<Course> ALL_COURSES = new ArrayList<>();
    public static final List<Certification> ALL_CERTIFICATIONS = new ArrayList<>();

    static {
        // ── 1. JAVA / BACKEND ──────────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_JAVA_SPRING", "Spring Boot 3 & Microservices Architecture", "Amigoscode & Udemy", "8 Weeks", "Advanced", List.of("Java", "Spring Boot", "REST APIs", "JPA", "Microservices"), "JAVA", "Top Rated", "https://www.udemy.com/course/spring-boot-microservices-and-spring-cloud-begin-to-expert/"));
        ALL_COURSES.add(new Course("CRS_JAVA_CONCURRENCY", "Java Multithreading & Concurrency Masterclass", "Udemy", "6 Weeks", "Advanced", List.of("Java", "Concurrency", "Threads", "JVM"), "JAVA", "Performance Focus", "https://www.udemy.com/course/java-multithreading-concurrency-performance-optimization/"));
        ALL_COURSES.add(new Course("CRS_SYS_DESIGN", "Designing Data-Intensive Applications (System Design)", "O'Reilly & Coursera", "Self-Paced", "Advanced", List.of("System Design", "Distributed Systems", "Kafka", "Java"), "JAVA", "Must Read", "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_ORACLE_OCP", "Oracle Certified Professional: Java SE 17 Developer", "Oracle Corporation", "Official top-tier Java credential validating mastery of OOP, generics, streams, and concurrency.", List.of("Java", "Streams", "Concurrency"), "JAVA", "https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJAV17", "#DC2626"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_SPRING_PRO", "Spring Professional Certification", "VMware (Pivotal)", "Official Spring Framework credential covering Spring Boot, Security, Testing, and Microservices.", List.of("Spring Boot", "Spring Security", "Microservices"), "JAVA", "https://www.vmware.com/learning/certification/spring-professional.html", "#059669"));

        // ── 2. PYTHON / MACHINE LEARNING / AI ─────────────────────────────────
        ALL_COURSES.add(new Course("CRS_ML_NG", "Machine Learning Specialization by Andrew Ng", "DeepLearning.AI & Coursera", "3 Months", "Intermediate", List.of("Machine Learning", "Python", "Scikit-learn", "Supervised Learning"), "ML", "Most Popular", "https://www.coursera.org/specializations/machine-learning-introduction"));
        ALL_COURSES.add(new Course("CRS_DEEP_LEARNING", "Deep Learning Specialization (PyTorch & TensorFlow)", "DeepLearning.AI", "5 Months", "Advanced", List.of("TensorFlow", "PyTorch", "Deep Learning", "CNNs", "Neural Networks"), "ML", "High Demand", "https://www.coursera.org/specializations/deep-learning"));
        ALL_COURSES.add(new Course("CRS_MLOPS", "MLOps Specialization – Deploying ML Models at Scale", "DeepLearning.AI & Duke", "4 Months", "Advanced", List.of("MLOps", "MLflow", "Docker", "Model Deployment"), "ML", "Industry Ready", "https://www.coursera.org/specializations/mlops-machine-learning-duke"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_TF_DEV", "TensorFlow Developer Certificate", "Google", "Official Google credential validating deep learning model building with TensorFlow and Keras.", List.of("TensorFlow", "Keras", "Deep Learning"), "ML", "https://www.tensorflow.org/certificate", "#F59E0B"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_AWS_ML", "AWS Certified Machine Learning – Specialty", "Amazon Web Services", "Industry benchmark for designing, building, training, and deploying ML models on AWS.", List.of("AWS SageMaker", "MLOps", "Machine Learning"), "ML", "https://aws.amazon.com/certification/certified-machine-learning-specialty/", "#F59E0B"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_GCP_DATA_ENG", "Professional Data Engineer – Google Cloud", "Google Cloud", "Validates ability to design and build data processing systems and ML pipelines on GCP.", List.of("GCP", "BigQuery", "ML Pipelines"), "ML", "https://cloud.google.com/certification/data-engineer", "#10B981"));

        // ── 3. WEB & FRONTEND DEVELOPMENT ────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_REACT_ADV", "React 18 & Next.js 14 – The Complete Guide", "Udemy & Vercel", "6 Weeks", "Intermediate", List.of("React", "Next.js", "TypeScript", "Frontend"), "WEB", "High Demand", "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"));
        ALL_COURSES.add(new Course("CRS_NODE_MICRO", "Node.js, Express & MongoDB Dev Bootcamp", "Udemy", "8 Weeks", "Intermediate", List.of("Node.js", "Express", "MongoDB", "REST APIs", "Backend"), "WEB", "Bestseller", "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/"));
        ALL_COURSES.add(new Course("CRS_TYPESCRIPT", "Understanding TypeScript – 2026 Edition", "Udemy", "4 Weeks", "Intermediate", List.of("TypeScript", "JavaScript", "Frontend"), "WEB", "Essential", "https://www.udemy.com/course/understanding-typescript/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_META_FRONTEND", "Meta Front-End Developer Professional Certificate", "Meta & Coursera", "Official Meta credential certifying mastery of React, JavaScript, HTML/CSS, and UX design.", List.of("React", "JavaScript", "Frontend"), "WEB", "https://www.coursera.org/professional-certificates/meta-front-end-developer", "#2563EB"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_META_BACKEND", "Meta Back-End Developer Professional Certificate", "Meta & Coursera", "Meta credential covering Python, Django, Databases, Node.js, and Cloud API deployment.", List.of("Node.js", "Python", "REST APIs", "Databases"), "WEB", "https://www.coursera.org/professional-certificates/meta-back-end-developer", "#2563EB"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_OPENJS_NODE", "OpenJS Node.js Application Developer (JSNAD)", "OpenJS Foundation & Linux Foundation", "Industry certification validating Node.js REST API and asynchronous application development.", List.of("Node.js", "JavaScript", "REST APIs"), "WEB", "https://training.linuxfoundation.org/certification/jsnad/", "#059669"));

        // ── 4. DATA SCIENCE & ANALYTICS ──────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_IBM_DATA", "IBM Data Analyst Professional Certificate", "IBM & Coursera", "4 Months", "Intermediate", List.of("SQL", "Python", "Pandas", "Power BI", "Excel"), "DATA", "IBM Certified", "https://www.coursera.org/professional-certificates/ibm-data-analyst"));
        ALL_COURSES.add(new Course("CRS_POWER_BI", "Microsoft Power BI Data Analyst Associate (PL-300)", "Microsoft Learn", "4 Weeks", "Intermediate", List.of("Power BI", "DAX", "SQL", "Data Modelling"), "DATA", "Microsoft", "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/"));
        ALL_COURSES.add(new Course("CRS_TABLEAU", "Tableau Analyst Training – Visual Analytics Mastery", "Tableau & Coursera", "5 Weeks", "Intermediate", List.of("Tableau", "Data Visualization", "Analytics"), "DATA", "High Demand", "https://www.tableau.com/learn/training"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_MS_PL300", "Microsoft Certified: Power BI Data Analyst Associate (PL-300)", "Microsoft", "Official Microsoft certification for Power BI dashboards, DAX calculations, and data modelling.", List.of("Power BI", "DAX", "Data Analysis"), "DATA", "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/", "#059669"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_GOOGLE_DATA", "Google Data Analytics Professional Certificate", "Google", "Industry-recognized credential in data cleaning, SQL analysis, R programming, and visualization.", List.of("SQL", "R", "Tableau", "Data Analysis"), "DATA", "https://www.coursera.org/professional-certificates/google-data-analytics", "#F59E0B"));

        // ── 5. DEVOPS & CLOUD ENGINEERING ─────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_AWS_DEVOPS", "DevOps Engineering on AWS – Complete Bootcamp", "AWS Training & Coursera", "6 Weeks", "Advanced", List.of("AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"), "DEVOPS", "AWS Backed", "https://www.coursera.org/learn/aws-devops"));
        ALL_COURSES.add(new Course("CRS_K8S_CKA", "Kubernetes & Docker – Container Orchestration Mastery", "Linux Foundation", "8 Weeks", "Advanced", List.of("Docker", "Kubernetes", "DevOps", "Helm"), "DEVOPS", "CNCF Official", "https://training.linuxfoundation.org/training/introduction-to-kubernetes/"));
        ALL_COURSES.add(new Course("CRS_TERRAFORM", "HashiCorp Terraform Associate – Infrastructure as Code", "HashiCorp & Udemy", "4 Weeks", "Intermediate", List.of("Terraform", "Cloud", "DevOps", "AWS"), "DEVOPS", "In Demand", "https://www.udemy.com/course/terraform-beginner-to-advanced/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_AWS_SAA", "AWS Certified Solutions Architect – Associate", "Amazon Web Services", "Global benchmark for designing scalable, resilient, and cost-effective cloud systems on AWS.", List.of("AWS", "Cloud Architecture", "High Availability"), "DEVOPS", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", "#F59E0B"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_AWS_CCP", "AWS Certified Cloud Practitioner", "Amazon Web Services", "Foundational certification validating core AWS cloud concepts, security, and billing.", List.of("AWS", "Cloud Fundamentals"), "CLOUD", "https://aws.amazon.com/certification/certified-cloud-practitioner/", "#F59E0B"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_CKA", "Certified Kubernetes Administrator (CKA)", "CNCF / Linux Foundation", "Hands-on exam proving ability to configure, manage, and troubleshoot Kubernetes clusters.", List.of("Kubernetes", "Docker", "DevOps"), "DEVOPS", "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "#3B82F6"));

        // ── 6. CYBERSECURITY ─────────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_GOOGLE_CYBER", "Google Cybersecurity Professional Certificate", "Google & Coursera", "6 Months", "Beginner–Intermediate", List.of("Cybersecurity", "Network Security", "SIEM", "Python", "Linux"), "CYBER", "Google Backed", "https://www.coursera.org/professional-certificates/google-cybersecurity"));
        ALL_COURSES.add(new Course("CRS_ETHICAL_HACK", "Practical Ethical Hacking – TCM Security", "TCM Security", "25 Hours", "Intermediate", List.of("Ethical Hacking", "Kali Linux", "Penetration Testing", "Metasploit"), "CYBER", "Top Rated", "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course"));
        ALL_COURSES.add(new Course("CRS_SOC_ANALYST", "TryHackMe SOC Level 1 Learning Path", "TryHackMe", "Ongoing", "Intermediate", List.of("SOC", "Wireshark", "Splunk", "Threat Analysis"), "CYBER", "Hands-On", "https://tryhackme.com/path/outline/soclevel1"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_COMPTIA_SEC", "CompTIA Security+", "CompTIA", "Global standard entry certification covering threat management, cryptography, and network security.", List.of("Cybersecurity", "Network Security", "Cryptography"), "CYBER", "https://www.comptia.org/certifications/security", "#DC2626"));
        ALL_CERTIFICATIONS.add(new Certification("CRT_CEH", "Certified Ethical Hacker (CEH)", "EC-Council", "Globally recognized credential validating ethical hacking, vulnerability scanning, and pen testing.", List.of("Ethical Hacking", "Penetration Testing", "Cybersecurity"), "CYBER", "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/", "#7C3AED"));

        // ── 7. MOBILE DEVELOPMENT ─────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_KOTLIN_ANDROID", "Android Development with Kotlin – Complete Bootcamp", "Google & Udacity", "6 Weeks", "Intermediate", List.of("Kotlin", "Android", "Jetpack Compose", "MVVM"), "MOBILE", "Google Backed", "https://developer.android.com/courses"));
        ALL_COURSES.add(new Course("CRS_FLUTTER", "Flutter & Dart – Build Cross-Platform Mobile Apps", "Google & Udemy", "8 Weeks", "Intermediate", List.of("Flutter", "Dart", "Firebase", "Mobile Development"), "MOBILE", "High Growth", "https://www.udemy.com/course/flutter-bootcamp-with-dart/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_ANDROID_DEV", "Associate Android Developer Certification", "Google", "Official Google credential certifying competency in Android app development with Kotlin.", List.of("Android", "Kotlin", "Jetpack"), "MOBILE", "https://developers.google.com/certification/associate-android-developer", "#10B981"));

        // ── 8. EMBEDDED & ECE ─────────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_EMBEDDED_IOT", "Embedded Systems & IoT Specialization", "CU Boulder & Coursera", "3 Months", "Intermediate", List.of("Embedded Systems", "C++", "C", "IoT", "Microcontrollers"), "ECE", "Academic Choice", "https://www.coursera.org/specializations/embedded-systems-communication"));
        ALL_COURSES.add(new Course("CRS_FPGA_VHDL", "FPGA Design & VHDL Hardware Description Language", "Udemy", "6 Weeks", "Intermediate", List.of("VHDL", "Verilog", "FPGA", "Digital Logic"), "ECE", "Specialized", "https://www.udemy.com/course/fpga-design-with-vhdl/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_AWS_IOT", "AWS Certified IoT Specialty", "Amazon Web Services", "Validates ability to design and deploy IoT solutions using AWS IoT Core and Greengrass.", List.of("AWS IoT", "MQTT", "Embedded Systems"), "ECE", "https://aws.amazon.com/certification/", "#F59E0B"));

        // ── 9. MECHANICAL & CAD ───────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_SOLIDWORKS", "Mechanical Design with SolidWorks – Professional Level", "Dassault Systèmes & Udemy", "6 Weeks", "Intermediate", List.of("SolidWorks", "3D Modelling", "CAD", "GD&T"), "MECH", "Industry Standard", "https://www.udemy.com/course/solidworks-for-engineers/"));
        ALL_COURSES.add(new Course("CRS_ANSYS_FEA", "FEA Structural Analysis with ANSYS Workbench", "Ansys & Coursera", "8 Weeks", "Advanced", List.of("ANSYS", "FEA", "Structural Analysis", "Simulation"), "MECH", "Simulation Expert", "https://www.coursera.org/learn/ansys"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_CSWA", "CSWA – Certified SolidWorks Associate", "Dassault Systèmes", "Entry-level industry certification for 3D parametric CAD design and engineering drawings.", List.of("SolidWorks", "CAD", "GD&T"), "MECH", "https://www.solidworks.com/sw/support/mcadtrainingworkshops.htm", "#DC2626"));

        // ── 10. FINANCE & FINTECH ─────────────────────────────────────────────
        ALL_COURSES.add(new Course("CRS_FINTECH", "FinTech: Foundations & Applications of Financial Technology", "Wharton & Coursera", "4 Weeks", "Intermediate", List.of("FinTech", "Blockchain", "Financial Analysis", "Python"), "FINANCE", "Wharton Backed", "https://www.coursera.org/learn/wharton-fintech"));
        ALL_COURSES.add(new Course("CRS_PYTHON_FIN", "Python for Finance & Algorithmic Trading", "Udemy", "6 Weeks", "Intermediate", List.of("Python", "Pandas", "Algorithmic Trading", "Finance"), "FINANCE", "Unique Crossover", "https://www.udemy.com/course/python-for-finance-and-trading-algorithms/"));

        ALL_CERTIFICATIONS.add(new Certification("CRT_CFA_L1", "CFA Level I – Chartered Financial Analyst", "CFA Institute", "World's most respected finance credential covering ethics, quantitative methods, and equity analysis.", List.of("Finance", "Financial Analysis", "Portfolio Management"), "FINANCE", "https://www.cfainstitute.org/programs/cfa", "#2563EB"));
    }
}
