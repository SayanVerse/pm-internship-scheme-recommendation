import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Upload,
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  Calendar,
  MapPin,
  IndianRupee,
  Building,
  Eye,
  UserCheck,
  UserX,
  Download,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLocalInternships,
  addLocalInternship,
  uploadCSVToLocalStorage,
  initializeLocalStorage,
  saveLocalInternships,
  LocalInternship,
} from "@/lib/localStorage-internships";
import {
  getApplicationStats,
  getRecentApplications,
  getInternUsers,
  LocalApplication,
} from "@/lib/localStorage-applications";

interface Internship {
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

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  createdAt: string;
}

interface AdminStats {
  totalInternships: number;
  activeInternships: number;
  totalUsers: number;
  registeredUsers: number;
  internUsers: number;
  totalApplications: number;
  recentApplications: number;
}

interface Application {
  id: string;
  createdAt: string;
  user: {
    candidateProfile?: {
      name: string;
    };
    email: string;
  };
  internship: {
    title: string;
    orgName: string;
  };
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "internships" | "users" | "upload"
  >("dashboard");
  const [internships, setInternships] = useState<Internship[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalInternships: 0,
    activeInternships: 0,
    totalUsers: 0,
    registeredUsers: 0,
    internUsers: 0,
    totalApplications: 0,
    recentApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: boolean;
    uploaded: number;
    errors: string[];
    message: string;
  } | null>(null);
  const [viewInternship, setViewInternship] = useState<Internship | null>(null);
  const [editInternship, setEditInternship] = useState<Internship | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
    fetchInternships();
    fetchUsers();
    fetchApplications();

    // Set up auto-refresh for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchInternships();
      fetchUsers();
      fetchApplications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Try server API first
      try {
        const internshipsRes = await fetch("/api/internships");
        if (internshipsRes.ok) {
          const internshipsData = await internshipsRes.json();
          if (internshipsData.success) {
            setStats((prev) => ({
              ...prev,
              totalInternships: internshipsData.total || 0,
              activeInternships:
                internshipsData.internships?.filter((i: Internship) => i.active)
                  .length || 0,
            }));
            return;
          }
        }
      } catch (serverError) {
        console.warn("Server stats failed, using localStorage:", serverError);
      }

      // Fallback to localStorage
      const localInternships = getLocalInternships();
      const appStats = getApplicationStats();
      const internUsers = getInternUsers();
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      setStats({
        totalInternships: localInternships.length,
        activeInternships: localInternships.filter(i => i.active).length,
        totalUsers: registeredUsers.length + 1, // +1 for admin
        registeredUsers: registeredUsers.length,
        internUsers: appStats.uniqueApplicants,
        totalApplications: appStats.totalApplications,
        recentApplications: appStats.recentApplications,
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalInternships: 0,
        activeInternships: 0,
        totalUsers: 0,
        registeredUsers: 0,
        internUsers: 0,
        totalApplications: 0,
        recentApplications: 0,
      });
    }
  };

  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      // Try server API first
      try {
        const response = await fetch("/api/internships");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.internships) {
            setInternships(data.internships);
            setUsingLocalStorage(false);
            setLoading(false);
            return;
          }
        }
      } catch (serverError) {
        console.warn("Server API failed, using localStorage:", serverError);
      }

      // Fallback to localStorage
      console.log("Using localStorage for internships");
      initializeLocalStorage();
      const localInternships = getLocalInternships();

      // Convert LocalInternship to Internship format
      const convertedInternships = localInternships.map((local) => ({
        ...local,
        deadline: local.deadline,
      }));

      setInternships(convertedInternships);
      setUsingLocalStorage(true);
    } catch (error) {
      console.error("Error fetching internships:", error);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get users from localStorage
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );
      const transformedUsers = registeredUsers.map(
        (user: any, index: number) => ({
          id: `user-${index}`,
          email: user.email,
          role: "CANDIDATE",
          name: `${user.firstName} ${user.lastName}`,
          createdAt: new Date().toISOString(),
        }),
      );

      // Add the admin user if it exists in localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser && currentUser.isAdmin) {
        const adminExists = transformedUsers.find(
          (u) => u.email === currentUser.email,
        );
        if (!adminExists) {
          transformedUsers.push({
            id: "admin-user",
            email: currentUser.email,
            role: "ADMIN",
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            createdAt: new Date().toISOString(),
          });
        }
      }

      setUsers(transformedUsers);

      // Count registered users (excluding admin)
      const registeredUserCount = transformedUsers.filter(
        (u) => u.role !== "ADMIN",
      ).length;
      const totalUserCount = transformedUsers.length;

      setStats((prev) => ({
        ...prev,
        totalUsers: totalUserCount,
        registeredUsers: registeredUserCount,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const [applicationsResponse, statsResponse] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/applications/stats"),
      ]);

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        if (applicationsData.success) {
          setRecentApplications(applicationsData.applications.slice(0, 10));
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats((prev) => ({
            ...prev,
            internUsers: statsData.stats.uniqueApplicants,
            totalApplications: statsData.stats.totalApplications,
            recentApplications: statsData.stats.recentApplications,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const formatStipend = (min?: number, max?: number) => {
    if (!min && !max) return "Unpaid";
    if (min && max)
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredInternships = internships.filter(
    (internship) =>
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.sector.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadResults(null);

    try {
      const text = await file.text();

      // Try server API first
      try {
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const csvData = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || "";
            });
            return row;
          });

        const response = await fetch("/api/internships/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData }),
        });

        if (response.ok) {
          const result = await response.json();
          setUploadResults(result);
          if (result.success) {
            await fetchStats();
            await fetchInternships();
            setUploadLoading(false);
            event.target.value = "";
            return;
          }
        }
      } catch (serverError) {
        console.warn("Server upload failed, using localStorage:", serverError);
      }

      // Fallback to localStorage
      console.log("Using localStorage for CSV upload");
      const result = uploadCSVToLocalStorage(text);
      setUploadResults({
        success: result.success,
        uploaded: result.uploaded,
        errors: result.errors,
        message: result.success
          ? `Successfully uploaded ${result.uploaded} internships to local storage`
          : "Failed to upload CSV to local storage",
      });

      if (result.success) {
        await fetchStats();
        await fetchInternships();
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      setUploadResults({
        success: false,
        uploaded: 0,
        errors: ["Failed to process CSV file"],
        message: "Error uploading CSV file",
      });
    } finally {
      setUploadLoading(false);
      event.target.value = "";
    }
  };

  const handleAddInternship = async (formData: any) => {
    try {
      // Try server API first
      try {
        const response = await fetch("/api/internships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setIsAddModalOpen(false);
          await fetchStats();
          await fetchInternships();
          return;
        }
      } catch (serverError) {
        console.warn("Server add failed, using localStorage:", serverError);
      }

      // Fallback to localStorage
      console.log("Using localStorage for adding internship");
      const result = addLocalInternship({
        title: formData.title,
        sector: formData.sector,
        orgName: formData.orgName,
        description: formData.description,
        stipendMin: formData.stipendMin,
        stipendMax: formData.stipendMax,
        city: formData.city,
        state: formData.state,
        pin: formData.pin,
        remote: formData.remote,
        minEducation: formData.minEducation,
        applicationUrl: formData.applicationUrl,
        deadline: formData.deadline,
        active: formData.active,
        requiredSkills: formData.requiredSkills,
      });

      if (result) {
        setIsAddModalOpen(false);
        await fetchStats();
        await fetchInternships();
      } else {
        alert("Failed to add internship to local storage");
      }
    } catch (error) {
      console.error("Error adding internship:", error);
      alert("Error adding internship. Please try again.");
    }
  };

  const downloadSampleCSV = () => {
    const a = document.createElement("a");
    a.href = "/sample_internships.csv";
    a.download = "sample_internships.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-cyberpunk relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="text-white hover:bg-white/10"
              size="sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                Admin Dashboard
              </h1>
              {usingLocalStorage && (
                <div className="flex items-center gap-1 sm:gap-2 text-yellow-400 text-xs sm:text-sm mt-1">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Using local storage - Changes saved locally only</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchStats();
              fetchInternships();
              fetchUsers();
              fetchApplications();
            }}
            className="border-white/30 text-white hover:bg-white/10"
            size="sm"
          >
            <RefreshCw className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto">
          {[
            {
              id: "dashboard",
              label: "Dashboard",
              icon: TrendingUp,
              shortLabel: "Home",
            },
            {
              id: "internships",
              label: "Internships",
              icon: Briefcase,
              shortLabel: "Jobs",
            },
            { id: "users", label: "Users", icon: Users, shortLabel: "Users" },
            {
              id: "upload",
              label: "Upload CSV",
              icon: Upload,
              shortLabel: "Upload",
            },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              size="sm"
              className={cn(
                "text-xs sm:text-lg font-medium whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white text-purple-600"
                  : "text-white hover:bg-white/10",
              )}
            >
              <tab.icon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="glass-card border-white/10">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">
                        Total Internships
                      </p>
                      <p className="text-lg sm:text-3xl font-bold text-white">
                        {stats.totalInternships}
                      </p>
                      <p className="text-white/50 text-xs">
                        {internships.length} loaded
                      </p>
                    </div>
                    <Briefcase className="h-5 w-5 sm:h-8 sm:w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">
                        Active Internships
                      </p>
                      <p className="text-lg sm:text-3xl font-bold text-white">
                        {stats.activeInternships}
                      </p>
                      <p className="text-white/50 text-xs">
                        {internships.filter((i) => i.active).length} active
                      </p>
                    </div>
                    <UserCheck className="h-5 w-5 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">
                        Intern Users
                      </p>
                      <p className="text-lg sm:text-3xl font-bold text-white">
                        {stats.internUsers}
                      </p>
                      <p className="text-white/50 text-xs">Registered user</p>
                    </div>
                    <Users className="h-5 w-5 sm:h-8 sm:w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs sm:text-sm">
                        Last Update
                      </p>
                      <p className="text-lg sm:text-3xl font-bold text-white">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-white/50 text-xs">Auto-refresh: 30s</p>
                    </div>
                    <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg sm:text-xl">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full btn-primary text-sm sm:text-lg"
                    size="sm"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Internship
                  </Button>
                  <Button
                    onClick={() => setActiveTab("upload")}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload CSV File
                  </Button>
                  <Button
                    onClick={() => setActiveTab("users")}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentApplications.length > 0 ? (
                      recentApplications.map((application) => (
                        <div
                          key={application.id}
                          className="flex items-start gap-3 text-white/80 text-sm"
                        >
                          <UserCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>
                            User{" "}
                            <span className="text-white font-medium">
                              {application.user.candidateProfile?.name ||
                                application.user.email.split("@")[0]}
                            </span>{" "}
                            applied internship at{" "}
                            <span className="text-white font-medium">
                              {application.internship.orgName}
                            </span>
                            <div className="text-white/50 text-xs mt-1">
                              {new Date(application.createdAt).toLocaleString()}
                            </div>
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-3 text-white/80">
                          <UserCheck className="h-5 w-5 text-green-400" />
                          <span className="text-sm">
                            {stats.registeredUsers} registered users
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <Users className="h-5 w-5 text-purple-400" />
                          <span className="text-sm">
                            {stats.internUsers} intern users
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <Briefcase className="h-5 w-5 text-blue-400" />
                          <span className="text-sm">
                            {stats.activeInternships} active internships
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                          <TrendingUp className="h-5 w-5 text-yellow-400" />
                          <span className="text-sm">
                            {stats.totalInternships} total opportunities
                          </span>
                        </div>
                      </>
                    )}
                    {uploadResults && uploadResults.success && (
                      <div className="flex items-center gap-3 text-white/80">
                        <Upload className="h-5 w-5 text-green-400" />
                        <span className="text-sm">
                          Last upload: {uploadResults.uploaded} internships
                          added
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Internships Tab */}
        {activeTab === "internships" && (
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                <Input
                  placeholder="Search internships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pl-9 sm:pl-10 h-10 sm:h-12"
                />
              </div>
              <Button
                className="btn-primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Internship</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Internships List */}
            <div className="space-y-4">
              {loading ? (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading internships...</p>
                  </CardContent>
                </Card>
              ) : filteredInternships.length === 0 ? (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-lg">No internships found</p>
                    <p className="text-white/70">
                      Try adjusting your search or add a new internship
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredInternships.map((internship) => (
                  <Card
                    key={internship.id}
                    className="glass-card border-white/10 hover:border-white/20"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-white">
                              {internship.title}
                            </h3>
                            <Badge
                              variant={
                                internship.active ? "default" : "secondary"
                              }
                              className={
                                internship.active
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {internship.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 text-white/80">
                              <Building className="h-4 w-4" />
                              <span className="text-sm">
                                {internship.orgName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <Badge
                                variant="outline"
                                className="border-white/30 text-white"
                              >
                                {internship.sector}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">
                                {internship.remote
                                  ? "Remote"
                                  : `${internship.city}, ${internship.state}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <IndianRupee className="h-4 w-4" />
                              <span className="text-sm">
                                {formatStipend(
                                  internship.stipendMin,
                                  internship.stipendMax,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-white/80 mb-4">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              Deadline: {formatDate(internship.deadline)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {internship.requiredSkills
                              .slice(0, 3)
                              .map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="border-white/30 text-white text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {internship.requiredSkills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="border-white/30 text-white/70 text-xs"
                              >
                                +{internship.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 sm:gap-2 sm:ml-4 w-full sm:w-auto justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 p-2"
                            onClick={() => setSelectedInternship(internship)}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 p-2"
                            onClick={() => {
                              setSelectedInternship(internship);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10 p-2"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-9 sm:pl-10 h-10 sm:h-12"
              />
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-lg">No users found</p>
                    <p className="text-white/70">
                      Users will appear here once they register
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="glass-card border-white/10 hover:border-white/20"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                              {user.name || "Unknown User"}
                            </h3>
                            <p className="text-white/70 text-sm truncate">
                              {user.email}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="border-white/30 text-white text-xs w-fit"
                              >
                                {user.role}
                              </Badge>
                              <span className="text-white/60 text-xs">
                                Joined {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 self-end sm:self-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 p-2"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10 p-2"
                          >
                            <UserX className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Upload CSV Tab */}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  Upload Internships CSV
                </CardTitle>
                <p className="text-white/70 text-center">
                  Upload a CSV file to bulk import internship opportunities
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors">
                  <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white mb-2">Drop your CSV file here or</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                    disabled={uploadLoading}
                  />
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() =>
                      document.getElementById("csv-upload")?.click()
                    }
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Browse Files"
                    )}
                  </Button>
                </div>

                <div className="glass p-4 rounded-xl">
                  <h4 className="text-white font-medium mb-2">
                    Required CSV Format:
                  </h4>
                  <p className="text-white/70 text-sm mb-3">
                    title, sector, orgName, description, city, state, pin,
                    remote, minEducation, requiredSkills, stipendMin,
                    stipendMax, applicationUrl, deadline, active
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={downloadSampleCSV}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResults && (
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <Alert
                    className={
                      uploadResults.success
                        ? "border-green-500/50 bg-green-500/10"
                        : "border-red-500/50 bg-red-500/10"
                    }
                  >
                    <AlertDescription className="text-white">
                      <strong>{uploadResults.message}</strong>
                      {uploadResults.uploaded > 0 && (
                        <p className="mt-2">
                          Successfully uploaded {uploadResults.uploaded}{" "}
                          internships
                        </p>
                      )}
                      {uploadResults.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {uploadResults.errors
                              .slice(0, 5)
                              .map((error, index) => (
                                <li key={index} className="text-red-300">
                                  {error}
                                </li>
                              ))}
                            {uploadResults.errors.length > 5 && (
                              <li className="text-red-300">
                                ... and {uploadResults.errors.length - 5} more
                                errors
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add Internship Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="glass-card border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                Add New Internship
              </DialogTitle>
            </DialogHeader>
            <AddInternshipForm
              onSubmit={handleAddInternship}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Add Internship Form Component
interface AddInternshipFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function AddInternshipForm({ onSubmit, onCancel }: AddInternshipFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    sector: "",
    orgName: "",
    description: "",
    city: "",
    state: "",
    pin: "",
    remote: false,
    minEducation: "UNDERGRADUATE",
    requiredSkills: "",
    stipendMin: "",
    stipendMax: "",
    applicationUrl: "",
    deadline: "",
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      stipendMin: formData.stipendMin
        ? parseInt(formData.stipendMin)
        : undefined,
      stipendMax: formData.stipendMax
        ? parseInt(formData.stipendMax)
        : undefined,
      requiredSkills: formData.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      deadline: new Date(formData.deadline).toISOString(),
    };

    onSubmit(submitData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="glass-input"
            required
          />
        </div>
        <div>
          <Label className="text-white">Organization *</Label>
          <Input
            value={formData.orgName}
            onChange={(e) => updateField("orgName", e.target.value)}
            className="glass-input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Sector *</Label>
          <Select
            value={formData.sector}
            onValueChange={(value) => updateField("sector", value)}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Public Admin">Public Admin</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Tourism">Tourism</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white">Min Education *</Label>
          <Select
            value={formData.minEducation}
            onValueChange={(value) => updateField("minEducation", value)}
          >
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TENTH_PLUS_TWO">10+2</SelectItem>
              <SelectItem value="DIPLOMA">Diploma</SelectItem>
              <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
              <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="glass-input min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-white">City</Label>
          <Input
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="glass-input"
          />
        </div>
        <div>
          <Label className="text-white">State</Label>
          <Input
            value={formData.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="glass-input"
          />
        </div>
        <div>
          <Label className="text-white">PIN Code</Label>
          <Input
            value={formData.pin}
            onChange={(e) => updateField("pin", e.target.value)}
            className="glass-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Min Stipend (₹)</Label>
          <Input
            type="number"
            value={formData.stipendMin}
            onChange={(e) => updateField("stipendMin", e.target.value)}
            className="glass-input"
          />
        </div>
        <div>
          <Label className="text-white">Max Stipend (₹)</Label>
          <Input
            type="number"
            value={formData.stipendMax}
            onChange={(e) => updateField("stipendMax", e.target.value)}
            className="glass-input"
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Required Skills (comma-separated)</Label>
        <Input
          value={formData.requiredSkills}
          onChange={(e) => updateField("requiredSkills", e.target.value)}
          className="glass-input"
          placeholder="JavaScript, React, Node.js"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Application URL *</Label>
          <Input
            type="url"
            value={formData.applicationUrl}
            onChange={(e) => updateField("applicationUrl", e.target.value)}
            className="glass-input"
            required
          />
        </div>
        <div>
          <Label className="text-white">Deadline *</Label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => updateField("deadline", e.target.value)}
            className="glass-input"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input
            type="checkbox"
            checked={formData.remote}
            onChange={(e) => updateField("remote", e.target.checked)}
            className="rounded"
          />
          Remote Work Available
        </label>
        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => updateField("active", e.target.checked)}
            className="rounded"
          />
          Active
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="btn-primary flex-1">
          Add Internship
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-white/30 text-white"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
