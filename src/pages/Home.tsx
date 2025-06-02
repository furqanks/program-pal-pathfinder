
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
      gradient: "from-primary to-primary/80"
    },
    {
      title: "AI-Powered Program Discovery",
      description: "Find the perfect academic programs with our advanced AI matching system",
      icon: Search,
      path: "/search",
      gradient: "from-emerald-600 to-emerald-700"
    },
    {
      title: "Document Assistance",
      description: "Get AI help to create compelling application documents and essays",
      icon: FileText,
      path: "/documents",
      gradient: "from-violet-600 to-violet-700"
    },
    {
      title: "Application Insights",
      description: "Visualize your progress and get personalized recommendations",
      icon: BarChart,
      path: "/insights",
      gradient: "from-amber-600 to-amber-700"
    }
  ];

  const benefits = [
    {
      title: "Organize Everything",
      description: "Keep all your applications, documents, and deadlines in one organized platform",
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "AI-Powered Assistance",
      description: "Get intelligent help with program research, document writing, and application strategy",
      icon: GraduationCap,
      color: "text-emerald-600"
    },
    {
      title: "Track Progress",
      description: "Monitor your application status and never miss important deadlines",
      icon: BookOpen,
      color: "text-violet-600"
    }
  ];

  const stats = [
    { icon: Users, value: "25,000+", label: "Students Helped" },
    { icon: Globe, value: "800+", label: "Universities" },
    { icon: TrendingUp, value: "92%", label: "Success Rate" },
    { icon: Zap, value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-16 md:py-24 overflow-hidden">
        {/* Enhanced background pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-block p-3 px-6 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2 border border-primary/20">
              ✨ Complete University Application Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-tight">
              Organize your university
              <span className="block font-medium text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">applications like a pro.</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              From program discovery to application submission - manage your entire university application journey with AI-powered tools and intelligent organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/")} 
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Open Application Hub <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")} 
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Organizing <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/auth", { state: { tab: "login" } })} 
                    className="text-lg px-8 py-6 border-2 border-border text-foreground hover:bg-accent rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-semibold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-foreground">
              Everything you need for
              <span className="block text-primary font-medium">successful applications.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              Comprehensive tools to organize, track, and optimize your university application journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <Card 
                key={i}
                className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-border/50 bg-card rounded-3xl overflow-hidden hover:border-primary/20"
              >
                <CardContent className="p-8">
                  <div className={`mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} w-14 h-14 flex items-center justify-center shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 justify-start text-primary hover:text-primary/80 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                    onClick={() => navigate(feature.path)}
                  >
                    Explore feature <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-foreground">
                Why students choose
                <span className="block text-primary font-medium">UniApp Space</span>
              </h2>
            </div>
            <div className="space-y-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-6 group">
                  <div className="rounded-2xl bg-card border-2 border-border/50 p-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-foreground">
              Success stories from students
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
              <Card key={i} className="border-2 border-border/50 bg-card rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-primary fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed italic text-lg">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-8 leading-tight">
              Ready to organize your
              <span className="block text-primary-foreground/90 font-medium">university applications?</span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 font-light leading-relaxed">
              Join thousands of students who have streamlined their application process with UniApp Space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  size="lg" 
                  className="bg-background text-primary hover:bg-background/90 text-lg px-8 py-6 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => navigate("/")}
                >
                  Open Application Hub <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-background text-primary hover:bg-background/90 text-lg px-8 py-6 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-lg px-8 py-6 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
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
      <footer className="py-16 bg-muted/50 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                UniApp Space
              </h2>
              <p className="text-muted-foreground">Organize your university applications</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:items-center text-center md:text-left">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">© 2025 UniApp Space. All rights reserved.</p>
                <div className="flex justify-center md:justify-start space-x-8">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Terms</a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Privacy</a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
