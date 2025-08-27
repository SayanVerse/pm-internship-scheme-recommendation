import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError("Invalid email or password");
        }
      } else {
        if (!formData.firstName || !formData.lastName) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }
        success = await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        if (!success) {
          setError("User with this email already exists");
        }
      }

      if (success) {
        // Redirect based on user type
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-cyberpunk relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-green-400/15 to-purple-500/15 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-8 flex items-center justify-center min-h-screen">
        {/* Back to Home Button */}
        <div className="absolute top-8 left-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="text-lg font-medium"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Login/Register Form */}
        <Card className="w-full max-w-md glass-card border-white/20">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-white font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-white/70">
              {isLogin 
                ? "Sign in to access your internship dashboard" 
                : "Join us to find your perfect internship match"
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Fields */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white mb-2 block">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      className="glass-input"
                      placeholder="John"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white mb-2 block">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      className="glass-input"
                      placeholder="Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="glass-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-white mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="glass-input pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full text-lg font-bold"
                disabled={loading}
              >
                {loading ? (
                  "Please wait..."
                ) : isLogin ? (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Switch Mode */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-white/70 mb-3">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({ firstName: "", lastName: "", email: "", password: "" });
                }}
                className="text-white hover:text-white/80"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </Button>
            </div>

            {/* Admin Demo */}
            {isLogin && (
              <div className="mt-6 p-4 glass rounded-xl">
                <p className="text-white/70 text-sm mb-2">Admin Demo:</p>
                <p className="text-white/60 text-xs">
                  Email: admin@pminternship.in<br />
                  Password: Admin@12345
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
