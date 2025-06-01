
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Search, FileText, BarChart, Calendar, Users, Globe, TrendingUp, Zap, Star, GraduationCap, BookOpen, Target } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Smart Application Management",
      description: "Track your university applications with intelligent progress monitoring and deadline management",
      icon: Target,
      path: "/",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      title: "AI-Powered Program Discovery",
      description: "Find the perfect academic programs with our advanced AI matching system",
      icon: Search,
      path: "/search",
      gradient: "from-green-600 to-green-800"
    },
    {
      title: "Document Assistance",
      description: "Get AI help to create compelling application documents and essays",
      icon: FileText,
      path: "/documents",
      gradient: "from-purple-600 to-purple-800"
    },
    {
      title: "Application Insights",
      description: "Visualize your progress and get personalized recommendations",
      icon: BarChart,
      path: "/insights",
      gradient: "from-orange-600 to-orange-800"
    }
  ];

  const benefits = [
    {
      title: "Organize Everything",
      description: "Keep all your applications, documents, and deadlines in one organized platform",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "AI-Powered Assistance",
      description: "Get intelligent help with program research, document writing, and application strategy",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Track Progress",
      description: "Monitor your application status and never miss important deadlines",
      icon: BookOpen,
      color: "text-purple-600"
    }
  ];

  const stats = [
    { icon: Users, value: "25,000+", label: "Students Helped" },
    { icon: Globe, value: "800+", label: "Universities" },
    { icon: TrendingUp, value: "92%", label: "Success Rate" },
    { icon: Zap, value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-full flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-12 md:py-20 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block p-2 px-4 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium mb-2">
              ✨ Complete University Application Platform
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-slate-900 leading-tight">
              Organize your university
              <span className="block font-normal text-blue-600">applications like a pro.</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
              From program discovery to application submission - manage your entire university application journey with AI-powered tools and intelligent organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/")} 
                  className="text-base px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Open Application Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")} 
                    className="text-base px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Start Organizing <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/auth", { state: { tab: "login" } })} 
                    className="text-base px-6 py-4 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                  <stat.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xl font-light text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 text-slate-900">
              Everything you need for
              <span className="block text-blue-600">successful applications.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Comprehensive tools to organize, track, and optimize your university application journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <Card 
                key={i}
                className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className={`mb-4 rounded-xl bg-gradient-to-r ${feature.gradient} w-10 h-10 flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 justify-start text-blue-600 hover:text-blue-700 font-medium text-sm"
                    onClick={() => navigate(feature.path)}
                  >
                    Explore feature <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 text-slate-900">
                Why students choose
                <span className="block text-blue-600">UniApp Space</span>
              </h2>
            </div>
            <div className="space-y-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="rounded-xl bg-white border border-slate-200 p-3 group-hover:shadow-md transition-shadow duration-200">
                    <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2 text-slate-900">{benefit.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 text-slate-900">
              Success stories from students
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "UniApp Space completely transformed how I organized my applications. I got into 4 out of 5 programs I applied to!",
                name: "Sarah Chen",
                role: "MSc Computer Science at Stanford"
              },
              {
                quote: "The deadline tracking and document management saved me from missing important dates. Couldn't have done it without this platform.",
                name: "Marcus Johnson",
                role: "MBA at Wharton"
              },
              {
                quote: "The AI assistance helped me craft better essays and find programs I never would have discovered on my own.",
                name: "Elena Rodriguez",
                role: "PhD Biology at Cambridge"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-slate-200 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-blue-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm mb-4 text-slate-700 leading-relaxed font-light italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 leading-tight">
              Ready to organize your
              <span className="block text-blue-200">university applications?</span>
            </h2>
            <p className="text-base md:text-lg text-blue-100 mb-8 font-light leading-relaxed">
              Join thousands of students who have streamlined their application process with UniApp Space.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 text-base px-6 py-4 rounded-lg font-medium"
                  onClick={() => navigate("/")}
                >
                  Open Application Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 text-base px-6 py-4 rounded-lg font-medium"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-blue-300 text-blue-100 hover:bg-blue-700 hover:text-white text-base px-6 py-4 rounded-lg font-medium"
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
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h2 className="text-xl font-light text-slate-900 mb-1">
                UniApp Space
              </h2>
              <p className="text-sm text-slate-500">Organize your university applications</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:items-center text-center md:text-left">
              <div className="space-y-3">
                <p className="text-xs text-slate-500">© 2025 UniApp Space. All rights reserved.</p>
                <div className="flex justify-center md:justify-start space-x-6">
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Terms</a>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Privacy</a>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
