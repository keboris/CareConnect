import { Outlet, useNavigate } from "react-router";
import LandingNav from "../components/Landing/LandingNav";
import { useState } from "react";

const MainLayout: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <LandingNav
        onHome={() => {
          navigate("/");
          setShowHome(true);
          setShowRegister(false);
        }}
        onLogin={() => {
          navigate("/login");
          setShowHome(false);
          setShowRegister(false);
        }}
        onRegister={() => {
          navigate("/register");
          setShowHome(false);
          setShowRegister(true);
        }}
      />

      {showHome && (
        <>
          <Outlet />
        </>
      )}

      {!showHome && showRegister && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Outlet /> {/* Register page via Outlet */}
        </div>
      )}

      {!showHome && !showRegister && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Outlet /> {/* Login page via Outlet */}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
