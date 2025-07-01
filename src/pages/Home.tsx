
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
  Check
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Document Assistant",
      description: "Get AI feedback on your essays, SOPs, and application documents"
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Program Search",  
      description: "Find and compare university programs worldwide"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Notes",
      description: "Organize your research with intelligent note-taking"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Application Tracking",
      description: "Track deadlines and manage your application pipeline"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 bg-black rounded"></div>
              <span className="text-lg font-medium text-gray-900">UniApp Space</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
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
          <Badge variant="secondary" className="mb-8 bg-gray-100 text-gray-700 hover:bg-gray-200">
            AI-Powered University Application Assistant
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Your Path to Dream Universities
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your university applications with AI-powered document editing, 
            intelligent program search, and comprehensive application management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/pricing">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/documents">
              <Button size="lg" variant="outline" className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">5,000+</div>
              <div className="text-gray-600 text-sm">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">95%</div>
              <div className="text-gray-600 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">1,200+</div>
              <div className="text-gray-600 text-sm">Universities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to make your university application process seamless and successful
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 bg-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="mb-3 p-2 bg-gray-100 rounded-lg w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Trusted by Students Worldwide</h2>
            <p className="text-lg text-gray-600">See what our users have to say</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-8">
                <p className="text-gray-700 mb-6 text-lg italic">
                  "UniApp Space helped me organize my applications and improved my essays significantly!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Sarah Chen</div>
                    <div className="text-gray-600 text-sm">Harvard Graduate Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white">
              <CardContent className="p-8">
                <p className="text-gray-700 mb-6 text-lg italic">
                  "The AI feedback was incredibly helpful in refining my statement of purpose."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Marcus Johnson</div>
                    <div className="text-gray-600 text-sm">MIT Applicant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of students who have successfully streamlined their university applications
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
                View Pricing
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-black rounded"></div>
            <span className="font-medium text-gray-900">UniApp Space</span>
          </div>
          <p className="text-gray-600 mb-4">Empowering students to achieve their academic dreams</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link to="/auth" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
