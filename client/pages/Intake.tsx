import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  GraduationCap,
  Briefcase,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EducationLevel =
  | "TENTH_PLUS_TWO"
  | "DIPLOMA"
  | "UNDERGRADUATE"
  | "POSTGRADUATE";
type Language = "EN" | "HI" | "BN";

interface FormData {
  name: string;
  educationLevel: EducationLevel | "";
  major: string;
  year: number | "";
  skills: string[];
  sectorInterests: string[];
  preferredLocations: string[];
  language: Language;
  residencyPin: string;
  ruralFlag: boolean;
}

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Education & Skills", icon: GraduationCap },
  { id: 3, title: "Interests", icon: Briefcase },
  { id: 4, title: "Location", icon: MapPin },
];

const SECTORS = [
  "IT",
  "Healthcare",
  "Agriculture",
  "Education",
  "Public Admin",
  "Finance",
  "Manufacturing",
  "Tourism",
  "Environment",
  "Social Work",
];

const COMMON_SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "React",
  "Node.js",
  "SQL",
  "HTML/CSS",
  "Excel",
  "PowerBI",
  "Communication",
  "Leadership",
  "Project Management",
  "Data Analysis",
  "Digital Marketing",
  "Content Writing",
  "Field Work",
  "Research",
  "Teaching",
  "Customer Service",
];

export default function Intake() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    educationLevel: "",
    major: "",
    year: "",
    skills: [],
    sectorInterests: [],
    preferredLocations: [],
    language: "EN",
    residencyPin: "",
    ruralFlag: false,
  });

  const [customSkill, setCustomSkill] = useState("");

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateFormData({ skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill("");
    }
  };

  const submitForm = async () => {
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/recommendations?profileId=${data.profileId}`;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-neon relative overflow-hidden floating-elements">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-black/15"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-green-400/15 to-purple-500/15 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="text-sm sm:text-lg font-medium"
              size="sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div className="glass px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
            <span className="text-white text-sm sm:text-lg font-semibold">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12 px-2">
          <div className="glass-card p-2 sm:p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between sm:space-x-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 group mx-auto",
                      currentStep >= step.id
                        ? "bg-white text-purple-600 shadow-soft pulse-glow transform scale-110"
                        : "glass-tile text-white hover:scale-105",
                    )}
                  >
                    <step.icon
                      className={cn(
                        "transition-all duration-300",
                        currentStep >= step.id ? "h-4 w-4 sm:h-6 sm:w-6" : "h-3 w-3 sm:h-5 sm:w-5",
                      )}
                    />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-4 sm:w-12 h-1 sm:h-2 mx-1 sm:mx-3 rounded-full transition-all duration-300 flex-shrink-0",
                        currentStep > step.id
                          ? "bg-gradient-to-r from-white to-white/80 shadow-glow"
                          : "bg-white/20",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 sm:mt-4">
              <p className="text-white/80 text-xs sm:text-sm font-medium text-center">
                {STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto glass-card border-white/20 hover:border-white/30 transition-all duration-500 mx-4 sm:mx-auto">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl text-white font-bold mb-2">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-white/50 to-white/20 rounded-full mx-auto"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="group">
                  <Label
                    htmlFor="name"
                    className="text-white mb-2 sm:mb-3 block text-base sm:text-lg font-medium"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="glass-input h-10 sm:h-12 text-base sm:text-lg"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label className="text-white mb-3 sm:mb-4 block text-base sm:text-lg font-medium">
                    Education Level
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      {
                        value: "TENTH_PLUS_TWO",
                        label: "10+2",
                        desc: "Higher Secondary",
                      },
                      {
                        value: "DIPLOMA",
                        label: "Diploma",
                        desc: "Technical Course",
                      },
                      {
                        value: "UNDERGRADUATE",
                        label: "UG",
                        desc: "Bachelor's Degree",
                      },
                      {
                        value: "POSTGRADUATE",
                        label: "PG",
                        desc: "Master's Degree",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateFormData({
                            educationLevel: option.value as EducationLevel,
                          })
                        }
                        className={cn(
                          "glass-tile p-3 sm:p-5 text-center group transition-all duration-300",
                          formData.educationLevel === option.value
                            ? "active ring-2 ring-white/40"
                            : "",
                        )}
                      >
                        <div className="text-base sm:text-lg font-semibold text-white mb-1">
                          {option.label}
                        </div>
                        <div className="text-xs sm:text-sm text-white/70">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education & Skills */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <Label
                      htmlFor="major"
                      className="text-white mb-3 block text-lg font-medium"
                    >
                      Major/Field
                    </Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) =>
                        updateFormData({ major: e.target.value })
                      }
                      className="glass-input h-12"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="group">
                    <Label
                      htmlFor="year"
                      className="text-white mb-3 block text-lg font-medium"
                    >
                      Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        updateFormData({
                          year: e.target.value ? parseInt(e.target.value) : "",
                        })
                      }
                      className="glass-input h-12"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-4 block text-lg font-medium">
                    Skills
                  </Label>
                  <div className="glass p-4 rounded-2xl mb-6">
                    <div className="flex flex-wrap gap-3">
                      {COMMON_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            updateFormData({
                              skills: toggleArrayItem(formData.skills, skill),
                            })
                          }
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                            formData.skills.includes(skill)
                              ? "bg-white text-purple-600 shadow-lg transform scale-105"
                              : "glass-button hover:scale-105",
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Add custom skill"
                      className="glass-input flex-1"
                      onKeyPress={(e) => e.key === "Enter" && addCustomSkill()}
                    />
                    <Button
                      type="button"
                      onClick={addCustomSkill}
                      className="glass-button px-6"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <Label className="text-white mb-6 block text-lg font-medium">
                    Sector Interests
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() =>
                          updateFormData({
                            sectorInterests: toggleArrayItem(
                              formData.sectorInterests,
                              sector,
                            ),
                          })
                        }
                        className={cn(
                          "glass-tile p-4 text-center transition-all duration-300 group",
                          formData.sectorInterests.includes(sector)
                            ? "active ring-2 ring-white/40 transform scale-105"
                            : "",
                        )}
                      >
                        <div className="text-white font-medium text-sm group-hover:text-white transition-colors">
                          {sector}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="group">
                  <Label
                    htmlFor="residencyPin"
                    className="text-white mb-3 block text-lg font-medium"
                  >
                    PIN Code
                  </Label>
                  <Input
                    id="residencyPin"
                    value={formData.residencyPin}
                    onChange={(e) =>
                      updateFormData({ residencyPin: e.target.value })
                    }
                    className="glass-input h-12"
                    placeholder="Enter your PIN code"
                  />
                </div>

                <div className="group">
                  <Label
                    htmlFor="locations"
                    className="text-white mb-3 block text-lg font-medium"
                  >
                    Preferred Work Locations
                  </Label>
                  <Input
                    id="locations"
                    value={formData.preferredLocations.join(", ")}
                    onChange={(e) =>
                      updateFormData({
                        preferredLocations: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s),
                      })
                    }
                    className="glass-input h-12"
                    placeholder="e.g. Mumbai, Delhi, Remote"
                  />
                </div>

                <div className="glass p-4 rounded-2xl">
                  <label className="flex items-center space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="ruralFlag"
                      checked={formData.ruralFlag}
                      onChange={(e) =>
                        updateFormData({ ruralFlag: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/20 transition-all"
                    />
                    <Label
                      htmlFor="ruralFlag"
                      className="text-white text-lg font-medium group-hover:text-white/90 transition-colors"
                    >
                      I am from a rural area
                    </Label>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 sm:pt-8 gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                size="lg"
                className={cn(
                  "text-sm sm:text-lg font-medium flex-1 sm:flex-none",
                  currentStep === 1 && "opacity-50 cursor-not-allowed",
                )}
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <Button
                type="button"
                variant="accent"
                onClick={nextStep}
                size="lg"
                className="text-sm sm:text-lg font-bold shadow-2xl flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">
                  {currentStep === STEPS.length ? "Get Recommendations" : "Next"}
                </span>
                <span className="sm:hidden">
                  {currentStep === STEPS.length ? "Get Results" : "Next"}
                </span>
                <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
