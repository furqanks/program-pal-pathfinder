
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Search, FileText, BarChart, CheckCircle, Award, Sparkles, Laptop } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Program Search",
      description: "Find the perfect academic programs tailored to your profile with our advanced AI matching system",
      icon: Search,
      path: "/search"
    },
    {
      title: "Smart Shortlist Management",
      description: "Organize and track your favorite university programs with intelligent comparisons",
      icon: Bookmark,
      path: "/"
    },
    {
      title: "Document Preparation",
      description: "Get AI assistance to prepare and optimize your application documents",
      icon: FileText,
      path: "/documents"
    },
    {
      title: "Application Insights",
      description: "Visualize your application progress and get personalized recommendations",
      icon: BarChart,
      path: "/insights"
    }
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Reduce application preparation time by up to 70% with AI-powered tools",
      icon: CheckCircle
    },
    {
      title: "Increase Acceptance Rates",
      description: "Students using UniApp Space see 35% higher program acceptance rates",
      icon: Award
    },
    {
      title: "Personalized Matching",
      description: "Our AI analyzes thousands of programs to find your perfect academic match",
      icon: Sparkles
    }
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-block p-2 px-3 bg-accent text-primary rounded-full text-sm font-medium mb-2">
              The Smart Way to Apply to Universities
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl leading-tight">
              Your AI-powered University Application Assistant
            </h1>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              UniApp Space helps international students find ideal programs, prepare standout applications, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <Button size="lg" onClick={() => navigate("/search")} className="text-base px-8">
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")} className="text-base px-8">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/auth", { state: { tab: "login" } })} className="text-base">
                    Sign In to Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamline Your University Applications</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform offers everything you need for successful university applications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="flex flex-col p-8 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-5 rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-6 flex-1">{feature.description}</p>
                <Button 
                  variant="link" 
                  className="px-0 justify-start text-primary"
                  onClick={() => navigate(feature.path)}
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Why Students Choose UniApp Space</h2>
              <p className="text-xl text-slate-600">
                Join thousands of students who have simplified their university application process
              </p>
              <div className="space-y-6 pt-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 mt-1">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-slate-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full rounded-xl bg-primary/10 -z-10"></div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="aspect-video w-full max-w-lg bg-slate-100 rounded-lg flex items-center justify-center">
                    <Laptop className="h-24 w-24 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Success Stories</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how UniApp Space has helped students around the world
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
              <div className="flex items-center mb-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg mb-4">"UniApp Space helped me find and apply to programs I never would have discovered on my own. I got accepted to my dream university!"</blockquote>
              <p className="font-semibold">Alex Chen</p>
              <p className="text-sm text-slate-500">MSc Computer Science student</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
              <div className="flex items-center mb-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg mb-4">"The document preparation tools saved me hours of work and helped me create professional application materials."</blockquote>
              <p className="font-semibold">Maria Rodriguez</p>
              <p className="text-sm text-slate-500">MBA student</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
              <div className="flex items-center mb-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg mb-4">"The insights and analytics helped me make strategic decisions about which programs to prioritize. Highly recommended!"</blockquote>
              <p className="font-semibold">David Kim</p>
              <p className="text-sm text-slate-500">PhD Biology student</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to simplify your university application journey?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of students who are achieving their academic goals with UniApp Space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100 text-base px-8"
                  onClick={() => navigate("/search")}
                >
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-slate-900 hover:bg-slate-100 text-base px-8"
                    onClick={() => navigate("/auth")}
                  >
                    Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white/10 text-base"
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

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-400">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold text-white">UniApp Space</h2>
              <p className="mt-2">Your AI-powered university application assistant</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:items-center">
              <div className="space-y-4">
                <p className="text-sm">© 2025 UniApp Space. All rights reserved.</p>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-white">Terms</a>
                  <a href="#" className="hover:text-white">Privacy</a>
                  <a href="#" className="hover:text-white">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
