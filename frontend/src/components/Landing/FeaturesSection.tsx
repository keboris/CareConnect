import { MapPin, Heart, Star, Calendar, Shield, Zap } from "lucide-react";
import { useLanguage } from "../../contexts";

const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MapPin,
      titleKey: "features.geolocated",
      descKey: "features.geolocatedDesc",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Heart,
      titleKey: "features.voluntary",
      descKey: "features.voluntaryDesc",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: Star,
      titleKey: "features.rating",
      descKey: "features.ratingDesc",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Calendar,
      titleKey: "features.flexible",
      descKey: "features.flexibleDesc",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      titleKey: "features.secure",
      descKey: "features.secureDesc",
      color: "from-purple-500 to-violet-500",
    },
    {
      icon: Zap,
      titleKey: "features.instant",
      descKey: "features.instantDesc",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-4">
            {t("features.badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("features.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-blue-300 hover:-translate-y-3"
            >
              <div className="absolute -top-6 left-8">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <feature.icon size={32} className="text-white" />
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(feature.titleKey)}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
