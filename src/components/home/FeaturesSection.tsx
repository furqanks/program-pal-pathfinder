
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bookmark, Search, FileText, BarChart } from "lucide-react";

export default function FeaturesSection() {
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

  return (
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
  );
}
