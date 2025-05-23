
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Search, FileText, BarChart } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Program Search",
      description: "Find the perfect academic programs with our AI-powered search",
      icon: Search,
      path: "/search"
    },
    {
      title: "Shortlist Management",
      description: "Organize and track your favorite university programs",
      icon: Bookmark,
      path: "/"
    },
    {
      title: "Document Preparation",
      description: "Prepare and manage your application documents",
      icon: FileText,
      path: "/documents"
    },
    {
      title: "Application Insights",
      description: "Get analytics and insights about your applications",
      icon: BarChart,
      path: "/insights"
    }
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 max-w-3xl">
              Your AI-powered University Application Assistant
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              UniApp Space helps you manage university applications, prepare documents, and make informed decisions with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <Button size="lg" onClick={() => navigate("/search")}>
                  Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/auth", { state: { tab: "login" } })}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="flex flex-col p-6 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 mb-4 flex-1">{feature.description}</p>
                <Button 
                  variant="link" 
                  className="px-0 justify-start"
                  onClick={() => navigate(feature.path)}
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900 text-white rounded-lg">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Ready to start your application journey?</h2>
              <p className="text-slate-300">UniApp Space makes university applications simpler and more efficient.</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => navigate(user ? "/search" : "/auth")}
            >
              {user ? "Explore Programs" : "Create Free Account"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
