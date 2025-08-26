import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, MapPin, GraduationCap, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

type EducationLevel = 'TENTH_PLUS_TWO' | 'DIPLOMA' | 'UNDERGRADUATE' | 'POSTGRADUATE';
type Language = 'EN' | 'HI' | 'BN';

interface FormData {
  name: string;
  educationLevel: EducationLevel | '';
  major: string;
  year: number | '';
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
  { id: 4, title: "Location", icon: MapPin }
];

const SECTORS = [
  "IT", "Healthcare", "Agriculture", "Education", "Public Admin", 
  "Finance", "Manufacturing", "Tourism", "Environment", "Social Work"
];

const COMMON_SKILLS = [
  "JavaScript", "Python", "Java", "C++", "React", "Node.js", "SQL", "HTML/CSS",
  "Excel", "PowerBI", "Communication", "Leadership", "Project Management",
  "Data Analysis", "Digital Marketing", "Content Writing", "Field Work",
  "Research", "Teaching", "Customer Service"
];

export default function Intake() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    educationLevel: '',
    major: '',
    year: '',
    skills: [],
    sectorInterests: [],
    preferredLocations: [],
    language: 'EN',
    residencyPin: '',
    ruralFlag: false
  });

  const [customSkill, setCustomSkill] = useState('');

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateFormData({ skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const submitForm = async () => {
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/recommendations?profileId=${data.profileId}`;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
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
    <div className="min-h-screen bg-gradient-pm relative overflow-hidden floating-elements">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-pink-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-white text-sm">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
                  currentStep >= step.id 
                    ? "bg-white text-purple-600 shadow-soft" 
                    : "bg-white/20 text-white"
                )}>
                  <step.icon className="h-5 w-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-8 h-1 mx-2 rounded-full transition-colors duration-200",
                    currentStep > step.id ? "bg-white" : "bg-white/20"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto glass-card border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label className="text-white mb-4 block">Education Level</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'TENTH_PLUS_TWO', label: '10+2' },
                      { value: 'DIPLOMA', label: 'Diploma' },
                      { value: 'UNDERGRADUATE', label: 'UG' },
                      { value: 'POSTGRADUATE', label: 'PG' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormData({ educationLevel: option.value as EducationLevel })}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                          formData.educationLevel === option.value
                            ? "border-white bg-white/10 text-white"
                            : "border-white/20 text-white/70 hover:border-white/40"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education & Skills */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="major" className="text-white mb-2 block">Major/Field</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) => updateFormData({ major: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-white mb-2 block">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => updateFormData({ year: e.target.value ? parseInt(e.target.value) : '' })}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="2024"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-4 block">Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={formData.skills.includes(skill) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          formData.skills.includes(skill)
                            ? "bg-white text-purple-600"
                            : "border-white/30 text-white hover:bg-white/10"
                        )}
                        onClick={() => updateFormData({ 
                          skills: toggleArrayItem(formData.skills, skill) 
                        })}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Add custom skill"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                    />
                    <Button 
                      type="button" 
                      onClick={addCustomSkill}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-4 block">Sector Interests</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => updateFormData({ 
                          sectorInterests: toggleArrayItem(formData.sectorInterests, sector) 
                        })}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all duration-200 text-sm",
                          formData.sectorInterests.includes(sector)
                            ? "border-white bg-white/10 text-white"
                            : "border-white/20 text-white/70 hover:border-white/40"
                        )}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="residencyPin" className="text-white mb-2 block">PIN Code</Label>
                  <Input
                    id="residencyPin"
                    value={formData.residencyPin}
                    onChange={(e) => updateFormData({ residencyPin: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="Enter your PIN code"
                  />
                </div>
                
                <div>
                  <Label htmlFor="locations" className="text-white mb-2 block">Preferred Work Locations</Label>
                  <Input
                    id="locations"
                    value={formData.preferredLocations.join(', ')}
                    onChange={(e) => updateFormData({ 
                      preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="e.g. Mumbai, Delhi, Remote"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="ruralFlag"
                    checked={formData.ruralFlag}
                    onChange={(e) => updateFormData({ ruralFlag: e.target.checked })}
                    className="w-4 h-4 text-white"
                  />
                  <Label htmlFor="ruralFlag" className="text-white">
                    I am from a rural area
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-white/30 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                type="button"
                onClick={nextStep}
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                {currentStep === STEPS.length ? 'Get Recommendations' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
