import { useEffect, useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

import { useAuth, useLanguage } from "../contexts";
import { Navigate, useLocation, useNavigate } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | Record<string, string>>("");

  const { isAuthenticated, signIn } = useAuth();
  const { t } = useLanguage();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      //navigate(from, { replace: true });
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message); // string
      } else {
        setError(err); // object
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t("nav.login")} - CareConnect`;
  }, [t]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 mt-10 mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <img
                src="/logo.png"
                alt="CareConnect Logo"
                className="h-16 w-auto"
              />
            </div>
            <div className="flex justify-center items-center space-x-3">
              <LogIn size={32} />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("nav.login")}
              </h2>
            </div>

            <p className="text-gray-600">{t("auth.signInAccount")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && typeof error === "string" && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              {typeof error !== "string" && error.email && (
                <p className="text-red-500 text-sm">{error.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              {typeof error !== "string" && error.password && (
                <p className="text-red-500 text-sm">{error.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 duration-300 cursor-pointer"
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              {t("auth.registerNow")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
