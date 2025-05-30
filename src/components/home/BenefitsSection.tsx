
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Award, Sparkles, Laptop } from "lucide-react";

export default function BenefitsSection() {
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

  return (
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
  );
}
