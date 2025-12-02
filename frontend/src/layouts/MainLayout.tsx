import { Outlet, useLocation } from "react-router";
import { Footer, NavBar } from "../components";

const MainLayout: React.FC = () => {
  const location = useLocation();
  // Hide footer on dashboard/app routes
  const isAppRoute = location.pathname.startsWith("/app");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <NavBar />

      <div className="pt-20">
        <Outlet />
      </div>

      {/* Show footer only on non-app routes */}
      {!isAppRoute && <Footer />}
    </div>
  );
};

export default MainLayout;
