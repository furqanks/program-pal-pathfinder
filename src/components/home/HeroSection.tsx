
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 md:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-32 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-block p-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 animate-fade-in">
            ✨ The Smart Way to Apply to Universities
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl leading-tight animate-fade-in">
            Your AI-powered University 
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Application Assistant</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto animate-fade-in">
            UniApp Space helps international students find ideal programs, prepare standout applications, and make data-driven decisions with cutting-edge AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-8 animate-fade-in">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => navigate("/search")} 
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
              >
                Explore Programs <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/auth", { state: { tab: "login" } })} 
                  className="text-lg px-10 py-6 border-white text-white hover:bg-white hover:text-slate-900 transform hover:scale-105 transition-all duration-200"
                >
                  Sign In to Account
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
