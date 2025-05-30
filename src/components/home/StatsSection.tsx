
import { Users, Globe, TrendingUp, Zap } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { icon: Users, value: "10,000+", label: "Students Helped" },
    { icon: Globe, value: "500+", label: "Universities" },
    { icon: TrendingUp, value: "85%", label: "Success Rate" },
    { icon: Zap, value: "24/7", label: "AI Support" }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
