
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
      </div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Ready to simplify your university application journey?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl">
            Join thousands of students who are achieving their academic goals with UniApp Space's revolutionary AI platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            {user ? (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-10 py-6 transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/search")}
              >
                Explore Programs <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-10 py-6 transform hover:scale-105 transition-all duration-200"
                  onClick={() => navigate("/auth")}
                >
                  Create Free Account <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-slate-900 text-lg px-10 py-6 transform hover:scale-105 transition-all duration-200"
                  onClick={() => navigate("/auth", { state: { tab: "login" } })}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
