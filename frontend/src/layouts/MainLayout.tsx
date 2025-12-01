import { Outlet } from "react-router";
import { Footer, NavBar } from "../components";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <NavBar />

      <Outlet />

      <Footer />
    </div>
  );
};

export default MainLayout;
