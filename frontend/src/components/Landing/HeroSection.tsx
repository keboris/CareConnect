import {
  Heart,
  MapPin,
  ArrowRight,
  CheckCircle,
  Users,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useLanguage } from "../../contexts";
import type { HeroSectionProps } from "../../types";

const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onOpenMap,
}) => {
  const { t } = useLanguage();

  return (
    <div className="pt-6 pb-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent)] opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
              <img src="/logo.png" alt="CareConnect" className="h-5 w-auto" />
              <span className="text-sm font-medium">{t("hero.tagline")}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {t("hero.title")}
              <span className="block text-yellow-300">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-cyan-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <span>{t("hero.getStarted")}</span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={onOpenMap}
                className="group inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <MapPin size={20} />
                <span>{t("hero.exploreMap")}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle size={24} className="text-yellow-300" />
                <span className="text-white/90">100% Kostenlos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={24} className="text-yellow-300" />
                <span className="text-white/90">Verifizierte Profile</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={24} className="text-yellow-300" />
                <span className="text-white/90">Sicher & Datenschutz</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="bg-white rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    1.500+
                  </h3>
                  <p className="text-gray-600">Aktive Helfer</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">24/7</h3>
                  <p className="text-gray-600">Support verfügbar</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <Heart size={32} className="text-white" fill="white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    5.000+
                  </h3>
                  <p className="text-gray-600">Hilfestellungen</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                    <Shield size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">100%</h3>
                  <p className="text-gray-600">Sicher</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            className="w-full h-[120px] block"
          >
            <path
              d="M0,80 C360,140 720,20 1440,100 L1440,150 L0,150 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
