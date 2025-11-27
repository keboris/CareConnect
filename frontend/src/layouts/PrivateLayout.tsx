import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import Header from "../components/Layout/Header";
import MapModal from "../components/Map/MapModal";
import MessagesView from "../components/Messages/MessagesView";
import LandingNav from "../components/Landing/LandingNav";
import HeroSection from "../components/Landing/HeroSection";
import FeaturesSection from "../components/Landing/FeaturesSection";
import StatsSection from "../components/Landing/StatsSection";
import Footer from "../components/Landing/Footer";
import CategoriesSection from "../components/Landing/CategoriesSection";
import { useLanguage } from "../contexts";

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<"map" | "messages">("map");
  const [showMap, setShowMap] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding && !showRegister) {
      return (
        <div className="min-h-screen">
          <LandingNav
            onLogin={() => {
              setShowLanding(false);
              setShowRegister(false);
            }}
            onRegister={() => {
              setShowLanding(false);
              setShowRegister(true);
            }}
            onHome={() => {
              setShowLanding(true);
              setShowRegister(false);
            }}
          />
          <HeroSection
            onGetStarted={() => {
              setShowLanding(false);
              setShowRegister(true);
            }}
            onOpenMap={() => setShowMap(true)}
          />
          <FeaturesSection />
          <CategoriesSection onCategoryClick={() => setShowMap(true)} />
          <StatsSection />
          <Footer />

          {showMap && <MapModal onClose={() => setShowMap(false)} />}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <LandingNav
          onLogin={() => {
            setShowLanding(false);
            setShowRegister(false);
          }}
          onRegister={() => {
            setShowLanding(false);
            setShowRegister(true);
          }}
          onHome={() => {
            setShowLanding(true);
            setShowRegister(false);
          }}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          {showRegister ? (
            <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
          ) : (
            <LoginForm onLoginSuccess={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-hidden">
        <Outlet />

        {currentView === "messages" && <MessagesView />}
        {currentView === "map" && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <button
              onClick={() => setShowMap(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {t("common.openMap")}
            </button>
          </div>
        )}
      </main>

      {showMap && <MapModal onClose={() => setShowMap(false)} />}
    </div>
  );
};

export default MainLayout;
