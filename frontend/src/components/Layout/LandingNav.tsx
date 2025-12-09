import { LogIn, Menu, UserPlus, X } from "lucide-react";
import { useLanguage } from "../../contexts";
import ReactCountryFlag from "react-country-flag";
import { useNavigate, Link } from "react-router";
import { useEffect, useRef, useState } from "react";

const LandingNav = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
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

          <div className="hidden sm:flex items-center space-x-3">
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

          {/* MOBILE BURGER */}
          <button
            className="sm:hidden p-2 cursor-pointer rounded-lg hover:bg-white/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="sm:hidden absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-6 py-6 space-y-4"
        >
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-xl cursor-pointer font-medium"
          >
            <LogIn size={18} />
            {t("nav.login")}
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full flex items-center justify-center cursor-pointer gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold shadow-lg"
          >
            <UserPlus size={18} />
            {t("nav.register")}
          </button>

          <button
            onClick={() => setLanguage(language === "en" ? "de" : "en")}
            className="w-full flex items-center justify-center cursor-pointer gap-2 py-3 rounded-xl text-white hover:bg-white/10 transition"
          >
            <ReactCountryFlag
              countryCode={language === "en" ? "GB" : "DE"}
              svg
              style={{ width: "0.9em", height: "0.9em" }}
            />
            <span className="uppercase">{language}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default LandingNav;
