import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Brain, Target, ArrowRight, Check, Star, Users, BookOpen, Award, ChevronRight } from "lucide-react";
const Home = () => {
  const features = [{
    icon: <FileText className="h-8 w-8" />,
    title: "AI Document Review",
    description: "Upload your essays, personal statements, and CVs to get intelligent feedback and suggestions for improvement.",
    details: ["Advanced grammar and style analysis", "Content structure optimization", "Tone and clarity improvements", "Personalized enhancement suggestions"],
    screenshot: "photo-1461749280684-dccba630e2f6"
  }, {
    icon: <Search className="h-8 w-8" />,
    title: "University Search",
    description: "Discover and compare programs from universities worldwide with detailed information and requirements.",
    details: ["Comprehensive university database", "Program requirement matching", "Deadline tracking and reminders", "Custom filtering and comparison tools"],
    screenshot: "photo-1488590528505-98d2b5aba04b"
  }, {
    icon: <Brain className="h-8 w-8" />,
    title: "Smart Notes & Organization",
    description: "Organize your research and application materials with AI-enhanced note-taking and intelligent categorization.",
    details: ["AI-powered content organization", "Automatic tagging and categorization", "Smart search across all notes", "Progress tracking and insights"],
    screenshot: "photo-1486312338219-ce68d2c6f44d"
  }, {
    icon: <Target className="h-8 w-8" />,
    title: "Application Management",
    description: "Never miss a deadline with comprehensive application tracking and automated reminder systems.",
    details: ["Deadline calendar and notifications", "Application status tracking", "Document version control", "Progress monitoring dashboard"],
    screenshot: "photo-1531297484001-80022131f5a1"
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src="/lovable-uploads/9804e8a0-76d7-4ec7-9860-5ce7921027ff.png" alt="Hey Grad' Logo" className="h-full w-full object-contain" />
              </div>
              
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/pricing">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?redirect=pricing">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-secondary text-secondary-foreground">
            AI-Powered University Applications
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Your Path to Dream Universities
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Streamline your university application process with AI-powered document editing, 
            intelligent program search, and comprehensive application management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth?redirect=pricing">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/documents">
              <Button size="lg" variant="outline" className="px-8 border-border text-foreground hover:bg-accent">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create winning university applications
            </p>
          </div>
          
          <div className="space-y-20">
            {features.map((feature, index) => <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                {/* Feature Content */}
                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary text-primary-foreground rounded-lg mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {feature.details.map((detail, idx) => <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{detail}</span>
                      </li>)}
                  </ul>
                  
                  <Link to="/auth?redirect=pricing">
                    <Button variant="outline" className="group">
                      Try This Feature
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                
                {/* Feature Screenshot */}
                <div className={index % 2 === 1 ? 'md:col-start-1' : ''}>
                  <div className="relative">
                    <div className="bg-muted rounded-lg overflow-hidden shadow-lg">
                      <img src={`https://images.unsplash.com/${feature.screenshot}?auto=format&fit=crop&w=600&h=400`} alt={`${feature.title} interface preview`} className="w-full h-64 object-cover" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-card p-3 rounded-lg shadow-lg border border-border">
                      {feature.icon}
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Why Students Choose Hey Grad'</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Join students worldwide who have streamlined their application process
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border p-6">
              <div className="text-blue-600 mb-4">
                <BookOpen className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Expert-Level Feedback</h3>
              <p className="text-muted-foreground">Get professional-quality document reviews and improvement suggestions powered by advanced AI</p>
            </Card>
            
            <Card className="border-border p-6">
              <div className="text-green-600 mb-4">
                <Target className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Never Miss Deadlines</h3>
              <p className="text-muted-foreground">Stay organized with intelligent tracking and automated reminders for all your applications</p>
            </Card>
            
            <Card className="border-border p-6">
              <div className="text-purple-600 mb-4">
                <Award className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Proven Results</h3>
              <p className="text-muted-foreground">Students using our platform report improved application quality and better organization</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Student Success Stories</h2>
            <p className="text-lg text-muted-foreground">See how Hey Grad' helped students achieve their goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
              </div>
              <p className="text-foreground mb-4 italic">
                "The AI feedback on my personal statement was incredibly detailed. It helped me identify areas I never would have thought to improve."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  S
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sarah M.</div>
                  <div className="text-muted-foreground text-sm">Computer Science Student</div>
                </div>
              </div>
            </Card>
            
            <Card className="border-border p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
              </div>
              <p className="text-foreground mb-4 italic">
                "The deadline tracking feature was a lifesaver. I was able to stay on top of all my applications without the stress."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  M
                </div>
                <div>
                  <div className="font-semibold text-foreground">Marcus J.</div>
                  <div className="text-muted-foreground text-sm">Engineering Student</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Applications?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Start your journey to your dream university today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?redirect=pricing">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8">
                Get Started Free
              </Button>
            </Link>
            
            <Link to="/documents">
              <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground hover:text-primary px-8">
                Try Demo First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 flex items-center justify-center">
                  <img src="/lovable-uploads/9804e8a0-76d7-4ec7-9860-5ce7921027ff.png" alt="Hey Grad' Logo" className="h-full w-full object-contain" />
                </div>
                <span className="text-xl font-semibold text-foreground">Hey Grad'</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered university application assistance for students worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/documents" className="hover:text-foreground">Try Demo</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 text-center">
            <p className="text-muted-foreground">
              © 2024 Hey Grad'. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Home;