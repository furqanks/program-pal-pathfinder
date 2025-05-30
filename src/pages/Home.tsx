
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
      gradient: "from-slate-600 to-slate-800"
    },
    {
      title: "Smart Shortlist Management",
      description: "Organize and track your favorite university programs with intelligent comparisons",
      icon: Bookmark,
      path: "/",
      gradient: "from-slate-500 to-slate-700"
    },
    {
      title: "Document Preparation",
      description: "Get AI assistance to prepare and optimize your application documents",
      icon: FileText,
      path: "/documents",
      gradient: "from-slate-700 to-slate-900"
    },
    {
      title: "Application Insights",
      description: "Visualize your application progress and get personalized recommendations",
      icon: BarChart,
      path: "/insights",
      gradient: "from-slate-600 to-slate-800"
    }
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Reduce application preparation time by up to 70% with AI-powered tools",
      icon: CheckCircle,
      color: "text-slate-600"
    },
    {
      title: "Increase Acceptance Rates",
      description: "Students using UniApp Space see 35% higher program acceptance rates",
      icon: Award,
      color: "text-slate-700"
    },
    {
      title: "Personalized Matching",
      description: "Our AI analyzes thousands of programs to find your perfect academic match",
      icon: Sparkles,
      color: "text-slate-800"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Students Helped" },
    { icon: Globe, value: "500+", label: "Universities" },
    { icon: TrendingUp, value: "85%", label: "Success Rate" },
    { icon: Zap, value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-full flex flex-col bg-white">
      {/* Hero Section with clean, minimal design */}
      <section className="relative bg-white py-20 md:py-32 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-96 h-96 bg-slate-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-slate-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-block p-2 px-4 bg-slate-100 text-slate-700 rounded-full text-sm font-medium mb-4">
              ✨ Elegant University Applications
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 leading-tight">
              Your Mac deserves
              <span className="block font-normal text-slate-600">elegance, even at rest.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
              UniApp Space brings the same attention to detail and craftsmanship to your university application process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/search")} 
                  className="text-lg px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                >
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")} 
                    className="text-lg px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/auth", { state: { tab: "login" } })} 
                    className="text-lg px-8 py-6 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with minimal design */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-300 transition-colors duration-200">
                  <stat.icon className="h-6 w-6 text-slate-600" />
                </div>
                <div className="text-2xl font-light text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with card design */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-900">
              Beautiful design,
              <span className="block text-slate-600">inside and out.</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
              Every detail has been carefully crafted to provide an elegant application experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <Card 
                key={i}
                className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white rounded-2xl overflow-hidden"
              >
                <CardContent className="p-8">
                  <div className={`mb-6 rounded-xl bg-gradient-to-r ${feature.gradient} w-12 h-12 flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 justify-start text-slate-700 hover:text-slate-900 font-medium"
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

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-900">
                Intentionally crafted,
                <span className="block text-slate-600">carefully refined.</span>
              </h2>
            </div>
            <div className="space-y-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="rounded-xl bg-white border border-slate-200 p-4 group-hover:shadow-md transition-shadow duration-200">
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-2 text-slate-900">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-900">
              What students are saying
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "UniApp Space helped me find and apply to programs I never would have discovered on my own. The interface is beautifully designed.",
                name: "Alex Chen",
                role: "MSc Computer Science student"
              },
              {
                quote: "The attention to detail in both design and functionality is remarkable. It made my application process so much smoother.",
                name: "Maria Rodriguez",
                role: "MBA student"
              },
              {
                quote: "Finally, a university application tool that's as elegant as it is powerful. The insights feature is game-changing.",
                name: "David Kim",
                role: "PhD Biology student"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-slate-200 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-slate-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 text-slate-700 leading-relaxed font-light italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight">
              Ready to experience
              <span className="block text-slate-300">elegance in every application?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10 font-light leading-relaxed">
              Join thousands of students who have discovered a more refined way to apply to universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 rounded-lg font-medium"
                  onClick={() => navigate("/search")}
                >
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 rounded-lg font-medium"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8 py-6 rounded-lg font-medium"
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
      <footer className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-light text-slate-900 mb-2">
                UniApp Space
              </h2>
              <p className="text-slate-500">Elegant university applications</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:items-center text-center md:text-left">
              <div className="space-y-4">
                <p className="text-sm text-slate-500">© 2025 UniApp Space. All rights reserved.</p>
                <div className="flex justify-center md:justify-start space-x-6">
                  <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Terms</a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Privacy</a>
                  <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
