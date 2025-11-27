import { LogIn, UserPlus } from "lucide-react";
import { useLanguage } from "../../contexts";
import type { LandingNavProps } from "../../types";
import ReactCountryFlag from "react-country-flag";

const LandingNav: React.FC<LandingNavProps> = ({
  onLogin,
  onRegister,
  onHome,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            onClick={onHome}
            className={`flex items-center space-x-3 ${
              onHome ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
            }`}
          >
            <img
              src="/logo.png"
              alt="CareConnect Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-white">CareConnect</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="hidden sm:inline-flex items-center space-x-2 px-6 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <LogIn size={18} />
              <span>{t("nav.login")}</span>
            </button>

            <button
              onClick={onRegister}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <UserPlus size={18} />
              <span>{t("nav.register")}</span>
            </button>

            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="p-2.5 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-1 cursor-pointer"
              title="Change Language"
            >
              <ReactCountryFlag
                countryCode={language === "en" ? "GB" : "DE"}
                svg
                style={{
                  width: "0.9em",
                  height: "0.9em",
                  borderRadius: "3px",
                  marginRight: "6px",
                }}
              />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
