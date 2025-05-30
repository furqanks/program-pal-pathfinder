
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bookmark, Search, FileText, BarChart, CheckCircle, Award, Sparkles, Laptop, Globe, TrendingUp, Users, Zap, Star } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Program Search",
      description: "Find the perfect academic programs tailored to your profile with our advanced AI matching system",
      icon: Search,
      path: "/search",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Smart Shortlist Management",
      description: "Organize and track your favorite university programs with intelligent comparisons",
      icon: Bookmark,
      path: "/",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Document Preparation",
      description: "Get AI assistance to prepare and optimize your application documents",
      icon: FileText,
      path: "/documents",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Application Insights",
      description: "Visualize your application progress and get personalized recommendations",
      icon: BarChart,
      path: "/insights",
      gradient: "from-pink-500 to-violet-600"
    }
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Reduce application preparation time by up to 70% with AI-powered tools",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Increase Acceptance Rates",
      description: "Students using UniApp Space see 35% higher program acceptance rates",
      icon: Award,
      color: "text-yellow-600"
    },
    {
      title: "Personalized Matching",
      description: "Our AI analyzes thousands of programs to find your perfect academic match",
      icon: Sparkles,
      color: "text-purple-600"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Students Helped" },
    { icon: Globe, value: "500+", label: "Universities" },
    { icon: TrendingUp, value: "85%", label: "Success Rate" },
    { icon: Zap, value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero Section with animated gradient */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-32 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-block p-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium mb-4 animate-fade-in">
              ✨ The Smart Way to Apply to Universities
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-5xl leading-tight animate-fade-in">
              Your AI-powered University 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Application Assistant</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto animate-fade-in">
              UniApp Space helps international students find ideal programs, prepare standout applications, and make data-driven decisions with cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-8 animate-fade-in">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/search")} 
                  className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                >
                  Explore Programs <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")} 
                    className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
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

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with enhanced cards */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Streamline Your University Applications
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform offers everything you need for successful university applications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card 
                key={i}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-slate-50"
              >
                <CardContent className="p-8">
                  <div className={`mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 flex-1">{feature.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 justify-start text-purple-600 hover:text-purple-700 group-hover:translate-x-2 transition-transform duration-200"
                    onClick={() => navigate(feature.path)}
                  >
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with improved layout */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why Students Choose UniApp Space
              </h2>
              <p className="text-xl text-slate-600">
                Join thousands of students who have simplified their university application process
              </p>
              <div className="space-y-8 pt-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className={`rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 p-4 group-hover:scale-110 transition-transform duration-200`}>
                      <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-slate-900">{benefit.title}</h3>
                      <p className="text-slate-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <Card className="relative bg-white rounded-2xl shadow-2xl">
                  <CardContent className="p-8">
                    <div className="aspect-video w-full max-w-lg bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Laptop className="h-32 w-32 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Student Success Stories
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how UniApp Space has helped students around the world achieve their dreams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "UniApp Space helped me find and apply to programs I never would have discovered on my own. I got accepted to my dream university!",
                name: "Alex Chen",
                role: "MSc Computer Science student",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                quote: "The document preparation tools saved me hours of work and helped me create professional application materials.",
                name: "Maria Rodriguez",
                role: "MBA student",
                gradient: "from-green-500 to-teal-600"
              },
              {
                quote: "The insights and analytics helped me make strategic decisions about which programs to prioritize. Highly recommended!",
                name: "David Kim",
                role: "PhD Biology student",
                gradient: "from-orange-500 to-red-600"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 text-slate-700 italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-semibold`}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="6" cy="6" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
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

      {/* Enhanced Footer */}
      <footer className="py-16 bg-slate-950 text-slate-400">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                UniApp Space
              </h2>
              <p className="text-slate-400">Your AI-powered university application assistant</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:items-center text-center md:text-left">
              <div className="space-y-4">
                <p className="text-sm">© 2025 UniApp Space. All rights reserved.</p>
                <div className="flex justify-center md:justify-start space-x-6">
                  <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
