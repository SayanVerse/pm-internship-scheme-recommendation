import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Users, Briefcase, TrendingUp, Globe, LogOut, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index() {
  const [language, setLanguage] = useState<"en" | "hi" | "bn">("en");
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const content = {
    en: {
      hero: "Find Your Perfect Internship Match",
      subtitle:
        "AI-powered recommendations for PM Internship Scheme candidates. Get 3-5 personalized internship suggestions based on your skills and preferences.",
      findCTA: "Find My 3 Best Internships",
      adminCTA: "Manage Internships",
      features: [
        {
          icon: Users,
          title: "Smart Matching",
          description:
            "AI-light algorithm matches you with internships based on your skills, education, and location preferences.",
        },
        {
          icon: Briefcase,
          title: "Quality Opportunities",
          description:
            "Curated internships across IT, Healthcare, Agriculture, Education, and Public Administration sectors.",
        },
        {
          icon: TrendingUp,
          title: "Career Growth",
          description:
            "Build practical skills and gain valuable work experience with stipend-based internship programs.",
        },
        {
          icon: Globe,
          title: "Nationwide Access",
          description:
            "Access internships across India with remote and location-based options to suit your needs.",
        },
      ],
      stats: [
        { number: "500+", label: "Active Internships" },
        { number: "10K+", label: "Students Placed" },
        { number: "50+", label: "Partner Organizations" },
        { number: "95%", label: "Satisfaction Rate" },
      ],
    },
    hi: {
      hero: "अपना सटीक इंटर्नशिप मैच खोजें",
      subtitle:
        "पीएम इंटर्नशिप योजना के उम्मीदवारों के लिए AI-संचालित सिफारिशें। अपने कौशल और प्राथमिकताओं के आधार पर 3-5 व्यक्तिगत इंटर्नशिप सुझाव प्राप्त करें।",
      findCTA: "मेरी 3 सर्वो���्तम इंटर्नशिप खोजें",
      adminCTA: "इंटर्नशिप प्रबंधित करें",
      features: [
        {
          icon: Users,
          title: "स्मार्ट मैचिंग",
          description:
            "AI-लाइट एल्गोरिदम आपको आपके कौशल, शिक्षा और स्थान प्राथमिकताओं के आधार पर इंटर्नशिप से मिलाता है।",
        },
        {
          icon: Briefcase,
          title: "गुणवत्तापूर्ण अवसर",
          description:
            "IT, स्वास्थ्य सेवा, कृषि, शिक्षा और लोक प्रशासन क्षेत्रों में क्यूरेटेड इंटर्नशिप।",
        },
        {
          icon: TrendingUp,
          title: "करियर विकास",
          description:
            "वेतन-आधारित इंटर्नशिप कार्यक्रमों के साथ व्यावहारिक कौशल बनाएं और मूल्यवान कार्य अनुभव प्राप्�� करें।",
        },
        {
          icon: Globe,
          title: "राष्ट्रव्यापी पहुंच",
          description:
            "आपकी आवश्यकताओं के अनुकूल रिमोट और स्थान-आधारित विकल्पों के साथ भारत भर में इंटर्नशिप का उपयोग करें।",
        },
      ],
      stats: [
        { number: "500+", label: "सक्रिय इंटर्नशिप" },
        { number: "10K+", label: "छात्र स्थापित" },
        { number: "50+", label: "सहयोगी संगठन" },
        { number: "95%", label: "संतुष्टि दर" },
      ],
    },
    bn: {
      hero: "আপনার নিখুঁত ইন্টার্নশিপ ম্যাচ খুঁজে নিন",
      subtitle:
        "PM ইন্টার্নশিপ স্কিমের প্রার্থীদের জন্য AI-চালিত সুপারিশ। আপনার দক্ষতা এবং পছন্দের উপর ভিত্তি করে ৩-৫টি ব্যক্তিগতকৃত ইন্টার্নশিপ পরামর্শ পান।",
      findCTA: "আমার ৩টি সেরা ইন্টার্নশিপ খুঁজুন",
      adminCTA: "ইন্টার্নশিপ পরিচালনা করুন",
      features: [
        {
          icon: Users,
          title: "স্মার্ট ম্যাচিং",
          description:
            "AI-লাইট অ্যালগরিদম আপনার দক্ষতা, শিক্ষা এবং অবস্থানের পছন্দের ��পর ভিত্তি করে আপনাকে ইন্টার্নশিপের সাথে মিলিয়ে দেয়।",
        },
        {
          icon: Briefcase,
          title: "মানসম্পন্ন সুযোগ",
          description:
            "IT, স্বাস্থ্যসেবা, কৃষি, শিক্ষা এবং পাবলিক অ্যাডমিনিস্ট্রেশন সেক্টরে কিউরেটেড ইন্টার্নশিপ।",
        },
        {
          icon: TrendingUp,
          title: "ক্যারিয়ার বৃদ্ধি",
          description:
            "বৃত্তি-ভিত্তিক ইন্টার্���শিপ প্রোগ্রামের সাথে ব্যবহারিক দক্ষতা তৈরি করুন এবং মূল্যবান কাজের অভিজ্ঞতা অর্জন করুন।",
        },
        {
          icon: Globe,
          title: "দেশব���যাপী অ্যাক্সেস",
          description:
            "আপনার প্রয়োজন অনুযায়ী রিমোট এবং অবস্থান-ভিত্তিক বি���ল্পের সাথে ভারত জুড়ে ইন্টার্নশিপ অ্যাক্সেস করুন।",
        },
      ],
      stats: [
        { number: "৫০০+", label: "সক্রিয় ইন্টার্নশিপ" },
        { number: "১০K+", label: "ছাত্র স্থাপিত" },
        { number: "৫০+", label: "অংশীদার সংস্থা" },
        { number: "৯৫%", label: "সন্তুষ্টির হার" },
      ],
    },
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-cyberpunk relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/15 to-cyan-500/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/2 w-60 h-60 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Header with Language Switcher and Auth */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
        <div className="flex items-center gap-2 sm:gap-4 order-2 sm:order-1">
          {isAuthenticated && (
            <div className="glass-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <span className="text-white font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">{user?.firstName} {user?.lastName}</span>
                <span className="sm:hidden">{user?.firstName}</span>
                {isAdmin && <span className="text-yellow-400 ml-1 sm:ml-2 text-xs sm:text-sm">(Admin)</span>}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2">
          <div className="glass-card p-1 sm:p-2 flex gap-1">
            {(["en", "hi", "bn"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105",
                  language === lang
                    ? "bg-white/30 text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="glass-card p-2">
            <DarkModeToggle />
          </div>

          <div className="glass-card p-1 sm:p-2">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={logout}
                size="sm"
                className="text-white hover:text-white/80 text-xs sm:text-sm"
              >
                <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/login")}
                size="sm"
                className="text-white hover:text-white/80 text-xs sm:text-sm"
              >
                <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2">
            {currentContent.hero}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
            {currentContent.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-16 px-4">
            <Button
              variant="accent"
              size="lg"
              className="text-lg font-bold group shadow-2xl"
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = "/intake";
                } else {
                  window.location.href = "/login";
                }
              }}
            >
              {currentContent.findCTA}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="lg"
                className="text-lg font-semibold"
                onClick={() => (window.location.href = "/admin")}
              >
                {currentContent.adminCTA}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-20 px-2">
            {currentContent.stats.map((stat, index) => (
              <div key={index} className="glass-card p-3 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-xs sm:text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto px-2 sm:px-0">
          {currentContent.features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 sm:mt-20 text-white/60 px-4">
          <p className="text-xs sm:text-sm">
            Developed by: Team "Tech Titans"
          </p>
        </footer>
      </main>
    </div>
  );
}
