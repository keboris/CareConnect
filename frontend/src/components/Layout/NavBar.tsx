import { Link } from "react-router";
import { useAuth } from "../../contexts";
import UserNav from "./UserNav";
import LandingNav from "./LandingNav";

const NavBar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="CareConnect Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-white">CareConnect</span>
          </Link>

          {!isAuthenticated && <LandingNav />}

          {isAuthenticated && <UserNav />}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
