import { LogIn, UserPlus } from "lucide-react";
import { useLanguage } from "../../contexts";
import ReactCountryFlag from "react-country-flag";
import { useNavigate } from "react-router";

const LandingNav = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => navigate("/login")}
        className="hidden sm:inline-flex items-center space-x-2 px-6 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 cursor-pointer"
      >
        <LogIn size={18} />
        <span>{t("nav.login")}</span>
      </button>

      <button
        onClick={() => navigate("/register")}
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
  );
};

export default LandingNav;
