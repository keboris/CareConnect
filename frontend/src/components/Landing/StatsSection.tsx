import { Users, Heart, MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts";

const StatsSection: React.FC = () => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({
    users: 0,
    listings: 0,
    messages: 0,
    reviews: 0,
  });

  useEffect(() => {
    const targets = { users: 150, listings: 234, messages: 1200, reviews: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        users: Math.floor(targets.users * progress),
        listings: Math.floor(targets.listings * progress),
        messages: Math.floor(targets.messages * progress),
        reviews: Math.floor(targets.reviews * progress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Users,
      labelKey: "stats.users",
      value: counts.users,
      suffix: "+",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Heart,
      labelKey: "stats.listings",
      value: counts.listings,
      suffix: "+",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      value: counts.messages,
      suffix: "+",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Star,
      label: "Reviews",
      value: counts.reviews,
      suffix: "%",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("stats.badge")}
          </h2>
          <p className="text-xl text-blue-100">{t("stats.title")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div
                className={`inline-flex w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl`}
              >
                <stat.icon size={36} className="text-white" />
              </div>

              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {stat.value}
                {stat.suffix}
              </div>

              <div className="text-lg text-blue-100 font-medium">
                {stat.labelKey ? t(stat.labelKey) : stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
