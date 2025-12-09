import { useAuth } from "../../contexts";
import { LandingNav, Loading, UserNav } from "..";

const NavBar = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {!isAuthenticated && <LandingNav />}

      {isAuthenticated && <UserNav />}
    </nav>
  );
};

export default NavBar;
