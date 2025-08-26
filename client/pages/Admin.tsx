import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Users, Briefcase, TrendingUp } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gradient-pm relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div></div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Internships</p>
                    <p className="text-2xl font-bold text-white">125</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Candidates</p>
                    <p className="text-2xl font-bold text-white">1,247</p>
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
                    <p className="text-2xl font-bold text-white">3,842</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Placement Rate</p>
                    <p className="text-2xl font-bold text-white">85%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  Upload Internships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">
                  Upload a CSV file with internship data to bulk import
                  opportunities.
                </p>
                <Button className="w-full bg-white text-purple-600 hover:bg-white/90">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV File
                </Button>
                <p className="text-white/50 text-sm">
                  Supported format: title, sector, orgName, city, state, pin,
                  remote, minEducation, requiredSkills, stipendMin, stipendMax,
                  applicationUrl, deadline, active
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  Manage Internships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">
                  View, edit, and manage all internship listings in the system.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  View All Internships
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  Add New Internship
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center">
            <Card className="glass-card border-white/10 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Full Admin Dashboard Coming Soon
                </h3>
                <p className="text-white/70 mb-6">
                  This is a preview of the admin interface. The complete
                  dashboard with full CRUD operations, analytics, and user
                  management will be available soon.
                </p>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  Continue Building This Feature
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
