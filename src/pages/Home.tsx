
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Search, 
  Brain, 
  Target, 
  ArrowRight, 
  Check,
  Star,
  Users,
  BookOpen,
  Award
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "AI Document Review",
      description: "Get intelligent feedback on essays, personal statements, and application documents with AI-powered suggestions for improvement."
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "University Search",  
      description: "Discover and compare programs from over 1,200 universities worldwide with detailed information and requirements."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Smart Notes",
      description: "Organize your research and application materials with AI-enhanced note-taking and intelligent categorization."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Application Tracking",
      description: "Never miss a deadline with comprehensive application management and automated reminder systems."
    }
  ];

  const benefits = [
    "Save 20+ hours per application",
    "Increase acceptance rates by 40%",
    "Get expert-level feedback instantly",
    "Track all deadlines in one place",
    "Access global university database",
    "Improve writing with AI assistance"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">UniApp Space</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                  Pricing
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?redirect=pricing">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-8 bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 text-sm font-medium">
            🎓 AI-Powered University Application Assistant
          </Badge>
          
          <h1 className="text-6xl font-bold mb-8 text-gray-900 leading-tight">
            Your Path to 
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"> Dream Universities</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your university application process with AI-powered document editing, 
            intelligent program search, and comprehensive application management. 
            <span className="font-semibold text-gray-800">Join thousands of successful applicants.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/auth?redirect=pricing">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/documents">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                Try Free Demo
              </Button>
            </Link>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">8,000+</div>
              <div className="text-gray-600">Students Helped</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">1,200+</div>
              <div className="text-gray-600">Universities</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-2">20hrs</div>
              <div className="text-gray-600">Saved Per App</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-gray-900 text-white">Powerful Features</Badge>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed to make your university application process seamless, 
              efficient, and successful from start to finish.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 bg-white hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="mb-4 p-3 bg-gray-100 rounded-xl w-fit group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-gray-100 text-gray-800">Why Choose UniApp Space</Badge>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Streamline Your Applications Like Never Before
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered platform combines cutting-edge technology with proven application strategies 
                to give you the competitive edge you need.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <BookOpen className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Smart Writing</h3>
                <p className="text-sm text-gray-600">AI analyzes your essays and provides targeted feedback</p>
              </Card>
              <Card className="p-6 border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 mt-8">
                <Award className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-sm text-gray-600">Higher acceptance rates with our methodology</p>
              </Card>
              <Card className="p-6 border-gray-200 bg-gradient-to-br from-green-50 to-green-100 -mt-4">
                <Users className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-sm text-gray-600">Get help from our experienced team</p>
              </Card>
              <Card className="p-6 border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100 mt-4">
                <Target className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Stay Organized</h3>
                <p className="text-sm text-gray-600">Never miss important deadlines again</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gray-900 text-white">Student Success Stories</Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Trusted by Students Worldwide</h2>
            <p className="text-xl text-gray-600">See how UniApp Space helped students achieve their dreams</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "UniApp Space's AI feedback transformed my personal statement. I got into Harvard!"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-gray-600 text-sm">Harvard University, Class of 2028</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "The deadline tracking saved my life. I never missed a single application!"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marcus Johnson</div>
                    <div className="text-gray-600 text-sm">MIT, Computer Science</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">
                  "Found my perfect match university through their search feature. Amazing!"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Aisha Patel</div>
                    <div className="text-gray-600 text-sm">Stanford University, Medicine</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Applications?</h2>
          <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto">
            Join thousands of successful students who streamlined their university applications 
            and achieved their academic dreams with UniApp Space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/auth?redirect=pricing">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium">
                Start Your Free Trial
              </Button>
            </Link>
            
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-gray-400 text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-medium">
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="text-gray-400 text-sm">
            💳 No credit card required for free trial • 🚀 Get started in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">UniApp Space</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Empowering students worldwide to achieve their academic dreams through 
                AI-powered application assistance and comprehensive university guidance.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">8,000+ Students</Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">95% Success Rate</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link to="/documents" className="hover:text-gray-900">Try Demo</Link></li>
                <li><Link to="/auth" className="hover:text-gray-900">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 UniApp Space. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-600 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
