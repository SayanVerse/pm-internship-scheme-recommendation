import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  totalApplications: number;
  recentApplications: number;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "internships" | "users" | "upload">("dashboard");
  const [internships, setInternships] = useState<Internship[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalInternships: 0,
    activeInternships: 0,
    totalUsers: 0,
    totalApplications: 0,
    recentApplications: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
    fetchInternships();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      // For now, we'll calculate stats from the data we have
      // In a real app, you'd have dedicated API endpoints for analytics
      const internshipsRes = await fetch("/api/internships");
      const internshipsData = await internshipsRes.json();
      
      setStats({
        totalInternships: internshipsData.total || 0,
        activeInternships: internshipsData.internships?.filter((i: Internship) => i.active).length || 0,
        totalUsers: 0, // We'll get this from localStorage for now
        totalApplications: 0,
        recentApplications: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/internships");
      const data = await response.json();
      if (data.success) {
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // For now, get users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const transformedUsers = registeredUsers.map((user: any, index: number) => ({
        id: `user-${index}`,
        email: user.email,
        role: "CANDIDATE",
        name: `${user.firstName} ${user.lastName}`,
        createdAt: new Date().toISOString(),
      }));
      setUsers(transformedUsers);
      
      // Update stats with user count
      setStats(prev => ({ ...prev, totalUsers: transformedUsers.length }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formatStipend = (min?: number, max?: number) => {
    if (!min && !max) return "Unpaid";
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredInternships = internships.filter(internship =>
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-cyberpunk relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <Button
            variant="outline"
            onClick={fetchStats}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "internships", label: "Internships", icon: Briefcase },
            { id: "users", label: "Users", icon: Users },
            { id: "upload", label: "Upload CSV", icon: Upload },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "text-lg font-medium",
                activeTab === tab.id 
                  ? "bg-white text-purple-600" 
                  : "text-white hover:bg-white/10"
              )}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Total Internships</p>
                      <p className="text-3xl font-bold text-white">{stats.totalInternships}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Active Internships</p>
                      <p className="text-3xl font-bold text-white">{stats.activeInternships}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Registered Users</p>
                      <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">Applications</p>
                      <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setActiveTab("internships")}
                    className="w-full btn-primary text-lg"
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
                  <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/80">
                      <UserCheck className="h-5 w-5 text-green-400" />
                      <span className="text-sm">5 new user registrations today</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                      <span className="text-sm">3 new internships added this week</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm">15 applications submitted today</span>
                    </div>
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
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                <Input
                  placeholder="Search internships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
              <Button className="btn-primary">
                <Plus className="mr-2 h-5 w-5" />
                Add Internship
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
                    <p className="text-white/70">Try adjusting your search or add a new internship</p>
                  </CardContent>
                </Card>
              ) : (
                filteredInternships.map((internship) => (
                  <Card key={internship.id} className="glass-card border-white/10 hover:border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{internship.title}</h3>
                            <Badge
                              variant={internship.active ? "default" : "secondary"}
                              className={internship.active ? "bg-green-500" : "bg-gray-500"}
                            >
                              {internship.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-white/80">
                              <Building className="h-4 w-4" />
                              <span className="text-sm">{internship.orgName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <Badge variant="outline" className="border-white/30 text-white">
                                {internship.sector}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">
                                {internship.remote ? "Remote" : `${internship.city}, ${internship.state}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <IndianRupee className="h-4 w-4" />
                              <span className="text-sm">
                                {formatStipend(internship.stipendMin, internship.stipendMax)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-white/80 mb-4">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Deadline: {formatDate(internship.deadline)}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {internship.requiredSkills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="border-white/30 text-white text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {internship.requiredSkills.length > 3 && (
                              <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                                +{internship.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                            onClick={() => setSelectedInternship(internship)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                            onClick={() => {
                              setSelectedInternship(internship);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10"
              />
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-lg">No users found</p>
                    <p className="text-white/70">Users will appear here once they register</p>
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="glass-card border-white/10 hover:border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{user.name || "Unknown User"}</h3>
                            <p className="text-white/70">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="border-white/30 text-white text-xs">
                                {user.role}
                              </Badge>
                              <span className="text-white/60 text-xs">
                                Joined {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <UserX className="h-4 w-4" />
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
          <div className="max-w-2xl mx-auto">
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Browse Files
                  </Button>
                </div>
                
                <div className="glass p-4 rounded-xl">
                  <h4 className="text-white font-medium mb-2">Required CSV Format:</h4>
                  <p className="text-white/70 text-sm mb-3">
                    title, sector, orgName, city, state, pin, remote, minEducation, 
                    requiredSkills, stipendMin, stipendMax, applicationUrl, deadline, active
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample CSV
                  </Button>
                </div>

                <Button className="w-full btn-primary text-lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload CSV File
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
