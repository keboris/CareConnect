import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts";
import { Loading } from "../components";

const ProtectedLayout = () => {
  const location = useLocation();

  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;

  return !loading && !isAuthenticated ? (
    <Navigate to="/login" state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

export default ProtectedLayout;
