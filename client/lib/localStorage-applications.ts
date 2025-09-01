// Local storage application tracking system

export interface LocalApplication {
  id: string;
  profileId: string;
  internshipId: string;
  internshipTitle: string;
  orgName: string;
  candidateName: string;
  candidateEmail: string;
  createdAt: string;
  status: "APPLIED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
}

const APPLICATIONS_KEY = "pm-applications";
const INTERN_USERS_KEY = "pm-intern-users";

export function getLocalApplications(): LocalApplication[] {
  try {
    const data = localStorage.getItem(APPLICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting local applications:", error);
    return [];
  }
}

export function saveLocalApplications(
  applications: LocalApplication[],
): boolean {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    return true;
  } catch (error) {
    console.error("Error saving local applications:", error);
    return false;
  }
}

export function addLocalApplication(
  profileId: string,
  internshipId: string,
  internshipTitle: string,
  orgName: string,
): LocalApplication | null {
  try {
    const existing = getLocalApplications();

    // Check if application already exists
    const existingApp = existing.find(
      (app) => app.profileId === profileId && app.internshipId === internshipId,
    );

    if (existingApp) {
      return existingApp; // Already applied
    }

    // Get candidate info from profiles
    const profiles = JSON.parse(
      localStorage.getItem("candidate-profiles") || "[]",
    );
    const profile = profiles.find((p: any) => p.id === profileId);

    const newApplication: LocalApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      profileId,
      internshipId,
      internshipTitle,
      orgName,
      candidateName: profile?.name || "Unknown Candidate",
      candidateEmail: profile?.email || "unknown@example.com",
      createdAt: new Date().toISOString(),
      status: "APPLIED",
    };

    const updated = [...existing, newApplication];
    const success = saveLocalApplications(updated);

    if (success) {
      // Update intern users set
      updateInternUsers(
        profileId,
        profile?.name || "Unknown Candidate",
        profile?.email || "unknown@example.com",
      );
      return newApplication;
    }

    return null;
  } catch (error) {
    console.error("Error adding local application:", error);
    return null;
  }
}

function updateInternUsers(profileId: string, name: string, email: string) {
  try {
    const internUsers = JSON.parse(
      localStorage.getItem(INTERN_USERS_KEY) || "[]",
    );

    // Check if user already exists
    const exists = internUsers.find(
      (user: any) => user.profileId === profileId,
    );

    if (!exists) {
      const newUser = {
        profileId,
        name,
        email,
        firstApplicationDate: new Date().toISOString(),
        totalApplications: 1,
      };

      internUsers.push(newUser);
      localStorage.setItem(INTERN_USERS_KEY, JSON.stringify(internUsers));
    } else {
      // Update application count
      exists.totalApplications = (exists.totalApplications || 0) + 1;
      localStorage.setItem(INTERN_USERS_KEY, JSON.stringify(internUsers));
    }
  } catch (error) {
    console.error("Error updating intern users:", error);
  }
}

export function getInternUsers() {
  try {
    return JSON.parse(localStorage.getItem(INTERN_USERS_KEY) || "[]");
  } catch (error) {
    console.error("Error getting intern users:", error);
    return [];
  }
}

export function getApplicationStats() {
  try {
    const applications = getLocalApplications();
    const internUsers = getInternUsers();

    const totalApplications = applications.length;
    const uniqueApplicants = internUsers.length;

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentApplications = applications.filter(
      (app) => new Date(app.createdAt) > sevenDaysAgo,
    ).length;

    return {
      totalApplications,
      uniqueApplicants,
      recentApplications,
    };
  } catch (error) {
    console.error("Error getting application stats:", error);
    return {
      totalApplications: 0,
      uniqueApplicants: 0,
      recentApplications: 0,
    };
  }
}

export function getRecentApplications(limit: number = 10): LocalApplication[] {
  try {
    const applications = getLocalApplications();
    return applications
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting recent applications:", error);
    return [];
  }
}
