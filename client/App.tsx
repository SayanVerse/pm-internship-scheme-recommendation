import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "./pages/Index";
import Intake from "./pages/Intake";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import InternshipDetail from "./pages/InternshipDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <LanguageProvider>
      <DarkModeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route
                    path="/intake"
                    element={
                      <ProtectedRoute>
                        <Intake />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/recommendations"
                    element={
                      <ProtectedRoute>
                        <Recommendations />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/internships/:id"
                    element={
                      <ProtectedRoute>
                        <InternshipDetail />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </DarkModeProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

// Create React root
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
