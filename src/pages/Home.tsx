
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
  Star,
  CheckCircle2
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Document Assistant",
      description: "Get AI feedback on your essays, SOPs, and application documents",
      status: "Active"
    },
    {
      icon: <Search className="h-8 w-8 text-green-500" />,
      title: "Program Search",
      description: "Find and compare university programs worldwide",
      status: "Active"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      title: "AI Notes",
      description: "Organize your research with intelligent note-taking",
      status: "Active"
    },
    {
      icon: <Target className="h-8 w-8 text-orange-500" />,
      title: "Application Tracking",
      description: "Track deadlines and manage your application pipeline",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            🎓 Your AI-Powered University Application Assistant
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            UniApp Space
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your university applications with AI-powered document editing, 
            program search, and intelligent application management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/documents">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Try Free Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-600 text-lg">
              Comprehensive tools to make your university application process seamless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className="mx-auto bg-green-100 text-green-800"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {feature.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have streamlined their university applications
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                View Pricing <Star className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
