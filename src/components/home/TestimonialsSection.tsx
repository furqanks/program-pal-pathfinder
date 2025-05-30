
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
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
  ];

  return (
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
          {testimonials.map((testimonial, i) => (
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
  );
}
