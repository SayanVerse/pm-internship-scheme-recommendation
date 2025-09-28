// Local storage fallback for internship data
export interface LocalInternship {
  id: string;
  title: string;
  sector: string;
  orgName: string;
  description?: string;
  stipendMin?: number;
  stipendMax?: number;
  city?: string;
  state?: string;
  pin?: string;
  remote: boolean;
  minEducation: string;
  applicationUrl: string;
  deadline: string;
  active: boolean;
  requiredSkills: string[];
}

const STORAGE_KEY = "pm-internships-data";
const CSV_LOADED_KEY = "pm-csv-loaded";
const CSV_VERSION = "v2-2026-01-seed";

// Default CSV data provided by user
const DEFAULT_CSV_DATA = `title,sector,orgName,description,city,state,pin,remote,minEducation,requiredSkills,stipendMin,stipendMax,applicationUrl,deadline,active
"Software Engineering Intern","Software Engineering","Google","Work on backend systems, services, and scalable APIs","Bengaluru","Karnataka","560103","Yes","B.Tech","Java;Python;Distributed Systems;Git",30000,50000,"https://careers.google.com/students/","2026-01-31","true"
"Software Engineering Intern","Software Engineering","Google","Work on backend systems, services, and scalable APIs","Hyderabad","Telangana","500081","Yes","B.Tech","Java;Python;Distributed Systems;Git",30000,50000,"https://careers.google.com/students/","2026-01-31","true"
"STEP Intern (Software)","Software Engineering","Google","STEP program — coding, algorithms and product-focused projects","Bengaluru","Karnataka","560066","Yes","B.Tech","C++;Problem Solving;Algorithms",25000,40000,"https://careers.google.com/students/","2026-02-15","true"
"Software Engineer Intern","Software Engineering","Microsoft","Full-stack feature development and cloud services","Bengaluru","Karnataka","560045","No","B.Tech","C#;Azure;React;Node.js",30000,45000,"https://careers.microsoft.com/students/","2026-01-30","true"
"Software Engineer Intern","Software Engineering","Microsoft","Full-stack feature development and cloud services","Hyderabad","Telangana","500081","No","B.Tech","C#;Azure;React;Node.js",30000,45000,"https://careers.microsoft.com/students/","2026-01-30","true"
"Software Development Intern","Software Engineering","Amazon","Work on microservices, data pipelines and production services","Mumbai","Maharashtra","400013","Yes","B.Tech","Java;AWS;Microservices;Docker",32000,50000,"https://www.amazon.jobs/en/teams/student-programs","2026-02-05","true"
"Software Development Intern","Software Engineering","Amazon","Work on microservices, data pipelines and production services","New Delhi","Delhi","110001","Yes","B.Tech","Java;AWS;Microservices;Docker",32000,50000,"https://www.amazon.jobs/en/teams/student-programs","2026-02-05","true"
"AI/ML Intern","AI/ML","Meta","Develop ML models for recommendations and personalization","Bengaluru","Karnataka","560001","Yes","B.Tech","Python;PyTorch;TensorFlow;Statistics",35000,60000,"https://www.metacareers.com/students/","2026-01-25","true"
"AI/ML Intern","AI/ML","Meta","Develop ML models for recommendations and personalization","Pune","Maharashtra","411045","Yes","B.Tech","Python;PyTorch;TensorFlow;Statistics",35000,60000,"https://www.metacareers.com/students/","2026-01-25","true"
"Research Intern - ML","Research","NVIDIA","Work on GPU-accelerated ML and model optimization","Bengaluru","Karnataka","560048","Yes","B.Tech","CUDA;PyTorch;Deep Learning",35000,60000,"https://www.nvidia.com/en-us/about-nvidia/careers/","2026-01-28","true"
"Data Science Intern","Data Analytics","IBM","Data pipelines, model prototyping, and dashboarding","Bengaluru","Karnataka","560070","Yes","B.Tech","Python;SQL;Pandas;Spark",30000,50000,"https://www.ibm.com/employment/entry-level/","2026-02-15","true"
"Data Engineering Intern","Big Data","IBM","Build ETL pipelines and optimize data flows","Gurugram","Haryana","122002","Yes","B.Tech","SQL;Spark;Airflow;Python",30000,50000,"https://www.ibm.com/employment/entry-level/","2026-02-15","true"
"Frontend Intern","Web","Adobe","Implement responsive UI, accessibility and performance","Noida","Uttar Pradesh","201301","Yes","B.Tech","HTML;CSS;JavaScript;React",28000,42000,"https://careers.adobe.com/","2026-02-02","true"
"Graphics/Rendering Intern","Graphics","NVIDIA","Research and implement rendering algorithms and shaders","Bengaluru","Karnataka","560048","Yes","B.Tech","C++;Graphics;CUDA;Math",35000,60000,"https://www.nvidia.com/en-us/about-nvidia/careers/","2026-02-10","true"
"Embedded Systems Intern","Embedded","Intel","Firmware development and low-level driver work","Chennai","Tamil Nadu","600028","No","B.Tech","C;Embedded C;RTOS;ARM",30000,50000,"https://jobs.intel.com/","2026-01-28","true"
"Embedded Systems Intern","Embedded","Intel","Firmware development and low-level driver work","Bengaluru","Karnataka","560081","No","B.Tech","C;Embedded C;RTOS;ARM",30000,50000,"https://jobs.intel.com/","2026-01-28","true"
"Network Engineer Intern","Networking","Cisco","Routing, switching and network automation projects","Hyderabad","Telangana","500081","No","B.Tech","Networking;Python;Cisco;BGP/OSPF",25000,40000,"https://jobs.cisco.com/","2026-01-20","true"
"Security Research Intern","Cybersecurity","Cisco","Vulnerability analysis and secure network design","Bengaluru","Karnataka","560066","No","B.Tech","Linux;Network Security;Python",25000,42000,"https://jobs.cisco.com/","2026-01-20","true"
"Robotics Intern","Robotics","Bosch","Robot control, sensor integration and prototyping","Bengaluru","Karnataka","560035","No","B.Tech","ROS;C++;Embedded Systems",20000,35000,"https://www.bosch-career.com/","2026-01-14","true"
"Autonomous Systems Intern","Autonomy","Bosch","Perception and control for automated platforms","Pune","Maharashtra","411006","No","B.Tech","Python;ROS;Computer Vision",20000,35000,"https://www.bosch-career.com/","2026-01-14","true"
"Computer Vision Intern","AI/ML","DeepMind","Work on perception and vision models (research intern)","London","England","WC2N","Yes","B.Tech","Python;TensorFlow;OpenCV;Research",40000,65000,"https://deepmind.com/careers/","2026-02-12","true"
"Computer Vision Intern","AI/ML","DeepMind","Work on perception and vision models (research intern)","Bengaluru","Karnataka","560048","Yes","B.Tech","Python;TensorFlow;OpenCV;Research",40000,65000,"https://deepmind.com/careers/","2026-02-12","true"
"Full Stack Intern","Software Engineering","Zoho","Build full-stack features for SaaS apps","Chennai","Tamil Nadu","600027","Yes","B.Tech","JavaScript;Node.js;React;SQL",20000,35000,"https://www.zoho.com/careers/","2026-01-10","true"
"Backend Intern","Software Engineering","Zoho","Design REST APIs and backend services","Chennai","Tamil Nadu","600027","Yes","B.Tech","Java;MySQL;REST;Spring",20000,35000,"https://www.zoho.com/careers/","2026-01-10","true"
"Payments Platform Intern","Fintech","Razorpay","Work on payments systems, reliability and scaling","Bengaluru","Karnataka","560001","Yes","B.Tech","Java;Kotlin;Distributed Systems",22000,38000,"https://razorpay.com/careers/","2026-01-18","true"
"Backend Intern","Fintech","Razorpay","Work on payments systems, reliability and scaling","Pune","Maharashtra","411045","Yes","B.Tech","Java;Kotlin;Distributed Systems",22000,38000,"https://razorpay.com/careers/","2026-01-18","true"
"Platform Intern","Cloud","Red Hat","Contribute to open-source infra and tooling","Bengaluru","Karnataka","560102","Yes","B.Tech","Linux;Ansible;Go;C",25000,42000,"https://www.redhat.com/en/jobs","2026-01-26","true"
"DevOps Intern","Cloud","Red Hat","CI/CD pipelines and automation for enterprise infra","Hyderabad","Telangana","500081","Yes","B.Tech","CI/CD;Jenkins;Ansible;Docker",25000,42000,"https://www.redhat.com/en/jobs","2026-01-26","true"
"Mobile App Intern","Mobile","Flipkart","Android feature development and performance tuning","Bengaluru","Karnataka","560100","No","B.Tech","Kotlin;Android Studio;Firebase",20000,34000,"https://www.flipkartcareers.com/","2026-01-22","true"
"Mobile App Intern","Mobile","PhonePe","Payment app features and SDK integration","Bengaluru","Karnataka","560103","No","B.Tech","Kotlin;Android;Payments;SDKs",20000,34000,"https://www.phonepe.com/careers/","2026-01-22","true"
"QA Automation Intern","Quality Assurance","BrowserStack","Automated testing, parallelization and infra","Mumbai","Maharashtra","400051","Yes","B.Tech","Selenium;Java;CI/CD;TestNG",22000,36000,"https://www.browserstack.com/careers","2026-01-12","true"
"QA Automation Intern","Quality Assurance","BrowserStack","Automated testing, parallelization and infra","Bengaluru","Karnataka","560045","Yes","B.Tech","Selenium;Java;CI/CD;TestNG",22000,36000,"https://www.browserstack.com/careers","2026-01-12","true"
"Hardware Design Intern","Hardware","Qualcomm","SoC verification and RTL work","Bengaluru","Karnataka","560102","No","B.Tech","Verilog;SystemVerilog;RTL;UVM",30000,52000,"https://www.qualcomm.com/company/careers","2026-02-05","true"
"ASIC Verification Intern","Hardware","Qualcomm","Verification of ASIC blocks and simulation","Bengaluru","Karnataka","560102","No","B.Tech","SystemVerilog;UVM;Verification",30000,52000,"https://www.qualcomm.com/company/careers","2026-02-05","true"
"Site Reliability Intern","SRE","Twitter (X)","Reliability engineering, monitoring and incident response","Bengaluru","Karnataka","560001","Yes","B.Tech","Linux;Python;Kubernetes;Monitoring",28000,46000,"https://careers.twitter.com/","2026-02-08","true"
"Data Platform Intern","SRE/Data","Twitter (X)","Work on large-scale data infra and pipelines","Pune","Maharashtra","411001","Yes","B.Tech","Spark;Kafka;Scala;SQL",28000,46000,"https://careers.twitter.com/","2026-02-08","true"
"Mechanical Design Intern","Mechanical","Tesla","Prototype design, CAD and product testing","Pune","Maharashtra","411045","No","B.Tech","SolidWorks;FEA;CAD",25000,40000,"https://www.tesla.com/careers","2026-02-20","true"
"Battery R&D Intern","Electronics/Energy","Tesla","Battery testing, BMS and performance analytics","Bengaluru","Karnataka","560037","No","B.Tech","Battery Testing;BMS;Data Analysis",26000,42000,"https://www.tesla.com/careers","2026-02-20","true"
"Power Electronics Intern","Power","Siemens","Power converter design and testing for industrial systems","Bengaluru","Karnataka","560066","No","B.Tech","Power Electronics;MATLAB;PSPICE",22000,38000,"https://new.siemens.com/global/en/company/jobs.html","2026-01-16","true"
"Industrial Automation Intern","Automation","Siemens","PLC/SCADA integration and factory automation","Pune","Maharashtra","411045","No","B.Tech","PLC;SCADA;Automation",22000,38000,"https://new.siemens.com/global/en/company/jobs.html","2026-01-16","true"
"Civil/Infrastructure Intern","Civil Engineering","L&T Construction","Site planning, CAD drawings and estimation support","Mumbai","Maharashtra","400023","No","B.Tech","AutoCAD;STAAD.Pro;Estimation",18000,30000,"https://www.larsentoubro.com/en/careers/","2026-02-02","true"
"Structural Design Intern","Civil Engineering","L&T Construction","Structural analysis and reinforcement detailing","Chennai","Tamil Nadu","600002","No","B.Tech","ETABS;STAAD.Pro;AutoCAD",18000,30000,"https://www.larsentoubro.com/en/careers/","2026-02-02","true"
"Embedded AI Intern","AI/Embedded","EdgeCore (startup)","Deploy tinyML models on MCUs and optimize latency","Bengaluru","Karnataka","560048","Yes","B.Tech","TensorFlow Lite;C++;Embedded Systems",20000,34000,"https://edgecore.example/careers/","2026-01-11","true"
"IoT Intern","IoT","Samsung R&D","Sensor integration, firmware and cloud analytics","Noida","Uttar Pradesh","201301","Yes","B.Tech","IoT;MQTT;Embedded C;AWS IoT",23000,39000,"https://research.samsung.com/careers","2026-01-29","true"
"Cloud Infrastructure Intern","Cloud","Oracle","Work on cloud services and database infra","Bengaluru","Karnataka","560102","Yes","B.Tech","OCI;Kubernetes;Database;Linux",27000,44000,"https://www.oracle.com/corporate/careers/","2026-02-11","true"
"Intern - Automotive Systems","Automotive","Mahindra & Mahindra","Vehicle electronics, ECU testing and embedded software","Pune","Maharashtra","411036","No","B.Tech","Embedded C;Automotive ECUs;CAN",18000,32000,"https://www.mahindra.com/careers","2026-01-24","true"
"Intern - Automotive Software","Automotive","Mahindra & Mahindra","ADAS prototyping and sensor fusion work","Chennai","Tamil Nadu","600001","No","B.Tech","Python;ROS;Sensor Fusion",18000,32000,"https://www.mahindra.com/careers","2026-01-24","true"`;

export function parseCSV(csvText: string): LocalInternship[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const mapMinEducation = (value: string): string => {
    const v = (value || "").toLowerCase();
    if (v.includes("b.tech") || v.includes("be") || v.includes("bsc") || v.includes("undergrad")) return "UNDERGRADUATE";
    if (v.includes("mba") || v.includes("m.tech") || v.includes("postgrad") || v.includes("masters")) return "POSTGRADUATE";
    if (v.includes("diploma")) return "DIPLOMA";
    if (v.includes("10") || v.includes("12")) return "TENTH_PLUS_TWO";
    return value || "UNDERGRADUATE";
  };

  return lines.slice(1).map((line, index) => {
    // Simple CSV parsing - handle quoted values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.replace(/^"|"$/g, "") || "";
    });

    // Convert to our format
    return {
      id: `intern-${index + 1}`,
      title: row.title || "Untitled Internship",
      sector: row.sector || "General",
      orgName: row.orgName || "Unknown Organization",
      description: row.description || "",
      stipendMin: row.stipendMin ? parseInt(row.stipendMin) : undefined,
      stipendMax: row.stipendMax ? parseInt(row.stipendMax) : undefined,
      city: row.city || "",
      state: row.state || "",
      pin: row.pin || "",
      remote:
        row.remote?.toLowerCase() === "yes" ||
        row.remote?.toLowerCase() === "true",
      minEducation: mapMinEducation(row.minEducation),
      applicationUrl: row.applicationUrl || "#",
      deadline: row.deadline
        ? new Date(row.deadline).toISOString()
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      active:
        row.active?.toLowerCase() !== "no" &&
        row.active?.toLowerCase() !== "false",
      requiredSkills: row.requiredSkills
        ? row.requiredSkills.split(/[;,]+/).map((s: string) => s.trim()).filter(Boolean)
        : [],
    };
  });
}

export function initializeLocalStorage() {
  try {
    const loaded = localStorage.getItem(CSV_LOADED_KEY);
    if (loaded !== CSV_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      const internships = parseCSV(DEFAULT_CSV_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(internships));
      localStorage.setItem(CSV_LOADED_KEY, CSV_VERSION);
      console.log("✅ Internship data reset with new dataset");
    }
  } catch (error) {
    console.error("Error initializing localStorage:", error);
  }
}

export function getLocalInternships(): LocalInternship[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }

    // If no data, initialize with default CSV
    initializeLocalStorage();
    const newData = localStorage.getItem(STORAGE_KEY);
    return newData ? JSON.parse(newData) : [];
  } catch (error) {
    console.error("Error getting local internships:", error);
    return [];
  }
}

export function saveLocalInternships(internships: LocalInternship[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(internships));
    return true;
  } catch (error) {
    console.error("Error saving local internships:", error);
    return false;
  }
}

export function addLocalInternship(internship: Omit<LocalInternship, "id">) {
  try {
    const existing = getLocalInternships();
    const newInternship: LocalInternship = {
      ...internship,
      id: `intern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = [...existing, newInternship];
    return saveLocalInternships(updated) ? newInternship : null;
  } catch (error) {
    console.error("Error adding local internship:", error);
    return null;
  }
}

export function uploadCSVToLocalStorage(csvText: string) {
  try {
    const newInternships = parseCSV(csvText);
    const existing = getLocalInternships();

    // Merge with existing, avoiding duplicates based on title + orgName
    const merged = [...existing];

    newInternships.forEach((newIntern) => {
      const exists = existing.some(
        (e) => e.title === newIntern.title && e.orgName === newIntern.orgName,
      );
      if (!exists) {
        merged.push(newIntern);
      }
    });

    const success = saveLocalInternships(merged);
    return {
      success,
      uploaded: success ? newInternships.length : 0,
      total: success ? merged.length : existing.length,
      errors: success ? [] : ["Failed to save to localStorage"],
    };
  } catch (error) {
    console.error("Error uploading CSV to localStorage:", error);
    return {
      success: false,
      uploaded: 0,
      total: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
