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

// Default CSV data provided by user
const DEFAULT_CSV_DATA = `title,sector,orgName,description,city,state,pin,remote,minEducation,requiredSkills,stipendMin,stipendMax,applicationUrl,deadline,active
Software Development Intern,IT,Infosys,Work on real-time web development projects using JavaScript and React.,Bengaluru,Karnataka,560100,Yes,B.Tech (CSE/IT),"JavaScript, React, HTML, CSS",10000,15000,https://careers.infosys.com/internship/apply,2025-09-21,Yes
Data Science Intern,Analytics,TCS,Assist in building ML models and data visualization dashboards.,Hyderabad,Telangana,500032,No,B.Tech/B.Sc (CS/Stats/Math),"Python, Pandas, Machine Learning",12000,18000,https://www.tcs.com/careers/internships,2025-09-26,Yes
Marketing Intern,Marketing,Flipkart,"Support digital campaigns, social media strategy, and market research.",Bengaluru,Karnataka,560103,Yes,MBA/BBA,"Digital Marketing, SEO, Social Media",8000,12000,https://flipkartcareers.com/internships,2025-09-16,Yes
Embedded Systems Intern,Electronics,Intel India,Work on microcontroller programming and embedded product testing.,Pune,Maharashtra,411057,No,B.Tech (ECE/EEE),"C, Embedded C, Microcontrollers",15000,20000,https://jobs.intel.com/page/show/internships,2025-10-01,Yes
AI Research Intern,Artificial Intelligence,Google Research India,Assist in research on deep learning and natural language processing.,Bengaluru,Karnataka,560095,Yes,B.Tech/M.Tech (CSE/AI),"Python, TensorFlow, NLP",20000,30000,https://careers.google.com/internships,2025-10-11,Yes
UI/UX Design Intern,Design,Adobe India,Contribute to designing user interfaces for web and mobile apps.,Noida,Uttar Pradesh,201301,Yes,B.Des/M.Des,"Figma, Photoshop, Illustrator",12000,16000,https://adobe.wd5.myworkdayjobs.com/internships,2025-09-23,Yes
Finance Intern,Finance,Goldman Sachs,Work on investment research and financial data analysis.,Mumbai,Maharashtra,400051,No,MBA/CA,"Excel, Financial Modeling, Data Analysis",25000,35000,https://www.goldmansachs.com/careers/students,2025-09-29,Yes
Cybersecurity Intern,Cybersecurity,Cisco,Assist in vulnerability testing and network security monitoring.,Bengaluru,Karnataka,560103,No,B.Tech (CSE/IT),"Networking, Ethical Hacking, Security Tools",18000,25000,https://jobs.cisco.com/internships,2025-09-19,Yes
Mechanical Engineering Intern,Mechanical,Larsen & Toubro,Work on CAD design and mechanical product testing.,Chennai,Tamil Nadu,600089,No,B.Tech (Mechanical),"AutoCAD, SolidWorks",10000,14000,https://www.larsentoubro.com/careers/internships,2025-09-21,Yes
Content Writing Intern,Media,Times Internet,Write SEO-optimized articles and manage digital content.,Gurugram,Haryana,122002,Yes,"BA/MA (English, Journalism)","Content Writing, SEO, Blogging",5000,10000,https://timesinternet.in/careers/internships,2025-09-15,Yes
HR Intern,Human Resources,Wipro,"Assist in recruitment, onboarding, and employee engagement.",Pune,Maharashtra,411014,No,MBA (HR),"Recruitment, Communication Skills",8000,12000,https://careers.wipro.com/internships,2025-09-20,Yes
Civil Engineering Intern,Civil Engineering,Tata Projects,Work on structural analysis and site inspection tasks.,Hyderabad,Telangana,500081,No,B.Tech (Civil),"AutoCAD, Structural Engineering",12000,16000,https://www.tataprojects.com/careers/internships,2025-09-25,Yes
Cloud Intern,Cloud Computing,Amazon AWS,Support cloud service deployment and optimization.,Hyderabad,Telangana,500032,Yes,B.Tech (CSE/IT),"AWS, Cloud Computing, Linux",20000,30000,https://amazon.jobs/internships,2025-09-28,Yes
Game Development Intern,Gaming,Ubisoft India,Assist in Unity game development and testing.,Pune,Maharashtra,411045,No,B.Tech/B.Sc (Game Dev/CS),"Unity, C#, Game Design",15000,22000,https://www.ubisoft.com/careers/internships,2025-09-22,Yes`;

function parseCSV(csvText: string): LocalInternship[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

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
      minEducation: row.minEducation || "UNDERGRADUATE",
      applicationUrl: row.applicationUrl || "#",
      deadline: row.deadline
        ? new Date(row.deadline).toISOString()
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      active:
        row.active?.toLowerCase() !== "no" &&
        row.active?.toLowerCase() !== "false",
      requiredSkills: row.requiredSkills
        ? row.requiredSkills.split(",").map((s: string) => s.trim())
        : [],
    };
  });
}

export function initializeLocalStorage() {
  try {
    const isLoaded = localStorage.getItem(CSV_LOADED_KEY);
    if (!isLoaded) {
      const internships = parseCSV(DEFAULT_CSV_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(internships));
      localStorage.setItem(CSV_LOADED_KEY, "true");
      console.log("✅ Default internship data loaded to localStorage");
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
