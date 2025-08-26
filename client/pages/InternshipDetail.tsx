import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function InternshipDetail() {
  // Get ID from URL params
  const pathParts = window.location.pathname.split('/');
  const internshipId = pathParts[pathParts.length - 1];

  return (
    <div className="min-h-screen bg-gradient-pm relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Internship Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <p className="text-white/70 text-lg">
                  Internship ID: {internshipId}
                </p>
                <p className="text-white/70">
                  Detailed internship view with description, requirements, 
                  application process, and company information will be implemented here.
                </p>
                <div className="space-y-4">
                  <Button 
                    className="bg-white text-purple-600 hover:bg-white/90 w-full"
                  >
                    Apply for This Internship
                  </Button>
                  <p className="text-white/50 text-sm">
                    This page will show full internship details, eligibility criteria, 
                    application deadlines, and allow direct application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
