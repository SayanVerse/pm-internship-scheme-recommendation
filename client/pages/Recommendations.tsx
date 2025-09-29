import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Calendar,
  IndianRupee,
  Building,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLocalRecommendations,
  LocalRecommendationMatch,
} from "@/lib/localStorage-recommendations";
import { initializeLocalStorage } from "@/lib/localStorage-internships";
import { addLocalApplication } from "@/lib/localStorage-applications";

interface RecommendationMatch {
  internship: {
    id: string;
    title: string;
    sector: string;
    orgName: string;
    description?: string;
    stipendMin?: number;
    stipendMax?: number;
    city?: string;
    state?: string;
    remote: boolean;
    applicationUrl: string;
    deadline: string;
    requiredSkills: string[];
  };
  score: number;
  matchReasons: string[];
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationMatch[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get profileId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get("profileId");

  const handleApplyNow = async (
    internshipId: string,
    applicationUrl: string,
    internshipTitle: string,
    orgName: string,
  ) => {
    try {
      // Try server API first
      try {
        await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            internshipId,
          }),
        });
      } catch (serverError) {
        console.warn(
          "Server application tracking failed, using localStorage:",
          serverError,
        );
      }

      // Always track in localStorage as fallback/backup
      if (profileId) {
        const result = addLocalApplication(
          profileId,
          internshipId,
          internshipTitle,
          orgName,
        );
        if (result) {
          console.log("Application tracked in localStorage");
        }
      }
    } catch (error) {
      console.error("Error tracking application:", error);
    }

    // Open the external application URL
    window.open(applicationUrl, "_blank");
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to get profile data for localStorage fallback
      let profileData = null;

      if (profileId) {
        // Try to get the candidate profile from localStorage
        const storedProfiles = JSON.parse(
          localStorage.getItem("candidate-profiles") || "[]",
        );
        profileData = storedProfiles.find((p: any) => p.id === profileId);
      }

      // Try server API first
      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.recommendations && data.recommendations.length > 0) {
            setRecommendations(data.recommendations);
            setUsingLocalStorage(false);
            setLoading(false);
            return;
          }
        }
      } catch (serverError) {
        console.warn(
          "Server API failed, falling back to localStorage:",
          serverError,
        );
      }

      // Fallback to localStorage
      console.log("Using localStorage fallback for recommendations");
      initializeLocalStorage(); // Ensure data is loaded

      if (profileData) {
        const localRecommendations = getLocalRecommendations({
          name: profileData.name || "User",
          educationLevel: profileData.educationLevel || "UNDERGRADUATE",
          major: profileData.major,
          stream: profileData.stream,
          skills: Array.isArray(profileData.skills)
            ? profileData.skills
            : typeof profileData.skills === "string"
              ? JSON.parse(profileData.skills)
              : [],
          sectorInterests: Array.isArray(profileData.sectorInterests)
            ? profileData.sectorInterests
            : typeof profileData.sectorInterests === "string"
              ? JSON.parse(profileData.sectorInterests)
              : [],
          preferredLocations: Array.isArray(profileData.preferredLocations)
            ? profileData.preferredLocations
            : typeof profileData.preferredLocations === "string"
              ? JSON.parse(profileData.preferredLocations)
              : [],
          residencyPin: profileData.residencyPin,
          ruralFlag: profileData.ruralFlag || false,
        });

        setRecommendations(localRecommendations as any);
        setUsingLocalStorage(true);
      } else {
        // No profile data, show some default recommendations
        const defaultRecommendations = getLocalRecommendations({
          name: "User",
          educationLevel: "UNDERGRADUATE",
          skills: ["JavaScript", "Communication"],
          sectorInterests: ["IT"],
          preferredLocations: ["Remote"],
          ruralFlag: false,
        });

        setRecommendations(defaultRecommendations as any);
        setUsingLocalStorage(true);
        setError(
          "Using default recommendations. Please update your profile for better matches.",
        );
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchRecommendations();
    }
  }, [profileId]);

  const formatStipend = (min?: number, max?: number) => {
    if (!min && !max) return "Unpaid";
    if (min && max)
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card p-8 text-center">
            <RefreshCw className="h-8 w-8 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">
              Finding your perfect matches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/intake")}
              className="text-sm sm:text-lg font-medium"
              size="sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Adjust Preferences</span>
              <span className="sm:hidden">Adjust</span>
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={fetchRecommendations}
            className="text-sm sm:text-lg font-medium"
            size="sm"
          >
            <RefreshCw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Refresh
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Your Top Internship Matches
          </h1>
          <p className="text-lg sm:text-xl text-white/80">
            Found {recommendations.length} perfect opportunities for you
          </p>
          {error && (
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-orange-400">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <Card className="max-w-2xl mx-auto glass-card border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-white text-lg mb-4">No matches found.</p>
              <p className="text-white/70 mb-6">
                Try adjusting your preferences or adding more skills.
              </p>
              <Button
                variant="accent"
                onClick={() => (window.location.href = "/intake")}
                className="text-lg font-bold"
              >
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
            {recommendations.map((match, index) => (
              <Card
                key={match.internship.id}
                className="glass-card border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <span className="text-lg sm:text-2xl font-bold text-white">
                          #{index + 1}
                        </span>
                        <div
                          className={cn(
                            "text-lg sm:text-2xl font-bold",
                            getScoreColor(match.score),
                          )}
                        >
                          Recommended
                        </div>
                      </div>
                      <CardTitle className="text-lg sm:text-2xl text-white mb-2">
                        {match.internship.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/80">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span className="text-sm sm:text-base">
                            {match.internship.orgName}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-white/30 text-white w-fit"
                        >
                          {match.internship.sector}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Key Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="glass p-2 sm:p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm mb-1">
                        <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                        Stipend
                      </div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {formatStipend(
                          match.internship.stipendMin,
                          match.internship.stipendMax,
                        )}
                      </div>
                    </div>

                    <div className="glass p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                      <div className="text-white font-semibold">
                        {match.internship.remote
                          ? "Remote"
                          : `${match.internship.city}, ${match.internship.state}`}
                      </div>
                    </div>

                    <div className="glass p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Deadline
                      </div>
                      <div className="text-white font-semibold">
                        {formatDeadline(match.internship.deadline)}
                      </div>
                    </div>

                    <div className="glass p-2 sm:p-3 rounded-xl">
                      <Button
                        variant="vibrant"
                        className="w-full text-sm sm:text-lg font-bold shadow-lg h-10 sm:h-auto"
                        onClick={() =>
                          handleApplyNow(
                            match.internship.id,
                            match.internship.applicationUrl,
                            match.internship.title,
                            match.internship.orgName,
                          )
                        }
                      >
                        <span className="hidden sm:inline">Apply Now</span>
                        <span className="sm:hidden">Apply</span>
                        <ExternalLink className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-white/70 text-xs sm:text-sm mb-2">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {match.internship.requiredSkills
                        .slice(0, 5)
                        .map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="border-white/30 text-white text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {match.internship.requiredSkills.length > 5 && (
                        <Badge
                          variant="outline"
                          className="border-white/30 text-white/70 text-xs"
                        >
                          +{match.internship.requiredSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Why this match - Expandable */}
                  <div>
                    <button
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === match.internship.id
                            ? null
                            : match.internship.id,
                        )
                      }
                      className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                    >
                      <span className="font-medium">Why this match?</span>
                      {expandedCard === match.internship.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedCard === match.internship.id && (
                      <div className="mt-3 glass p-4 rounded-xl">
                        <ul className="space-y-2">
                          {match.matchReasons.map((reason, idx) => (
                            <li
                              key={idx}
                              className="text-white/80 flex items-start gap-2"
                            >
                              <span className="text-green-400 mt-1">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>

                        {match.internship.description && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-white/70 text-sm font-medium mb-2">
                              Description
                            </p>
                            <p className="text-white/80 text-sm">
                              {match.internship.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="text-sm sm:text-lg font-medium"
            size="sm"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
