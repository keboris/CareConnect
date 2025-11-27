import { Navigate, Outlet } from "react-router";

import { useState } from "react";
import Header from "../components/Layout/Header";
import MessagesView from "../components/Messages/MessagesView";
import MapModal from "../components/Map/MapModal";
import { useAuth, useLanguage } from "../contexts";

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

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

  if (!user) return <Navigate to="/login" replace />;

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

export default ProtectedLayout;
