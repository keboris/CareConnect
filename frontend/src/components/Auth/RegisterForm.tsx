import { useEffect, useState } from "react";

import { useAuth, useLanguage } from "../../contexts";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Wand2,
  Languages,
} from "lucide-react";
import type { RegisterFormProps, Lang } from "../../types";
import { API_BASE_URL } from "../../config/api";

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    profileImage: null as File | null,
    skills: "",
    languages: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [availableSkills, setAvailableSkills] = useState<Lang[]>([]);
  const [openSkillsModal, setOpenSkillsModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [availableLanguages, setAvailableLanguages] = useState<Lang[]>([]);
  const [openLanguagesModal, setOpenLanguagesModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const { signUp } = useAuth();
  const { t, language } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files && files[0]) {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError(t("auth.passwordError"));
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          form.append(key, value as any);
        }
      });

      await signUp(form);
      onRegisterSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/skills`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch skills");
        }
        const data = await response.json();

        setAvailableSkills(data.skills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setAvailableSkills([]);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/languages`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }
        const data = await response.json();

        setAvailableLanguages(data.languages);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setAvailableLanguages([]);
      }
    };

    fetchSkills();
    fetchLanguages();
  }, []);

  return (
    <div className="w-full max-w-1/2 mx-auto bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 mt-10 mb-10">
      <div className="text-center mb-8">
        <div className="inline-flex mb-4">
          <img src="/logo.png" alt="CareConnect Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("auth.createAccount")}
        </h2>
        <p className="text-gray-600">{t("auth.joinCommunity")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.firstName") || "First Name"}
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.lastName") || "Last Name"}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {t("auth.passwordMin")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.phone") || "Phone Number"}
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("auth.location") || "Location"}
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.skills") || "Skills"}
          </label>
          <div>
            <div className="relative">
              <Wand2
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                id="skills"
                name="skills"
                type="text"
                value={formData.skills}
                onChange={handleChange}
                readOnly
                className="w-full text-xs text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. First Aid, Counseling"
              />
            </div>
            <button
              onClick={() => setOpenSkillsModal(true)}
              className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
              {t("auth.chooseSkills") || "Choose Skills"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="languages"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("auth.languages") || "Languages"}
          </label>
          <div>
            <div className="relative">
              <Languages
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                id="languages"
                name="languages"
                type="text"
                value={formData.languages}
                onChange={handleChange}
                readOnly
                className="w-full text-xs text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. English, Spanish"
              />
            </div>
            <button
              onClick={() => setOpenLanguagesModal(true)}
              className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
              {t("auth.chooseLanguages") || "Choose Languages"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 duration-300"
        >
          {loading ? t("auth.signingUp") : t("auth.signUp")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t("auth.haveAccount")}{" "}
        <button
          onClick={onRegisterSuccess}
          className="text-blue-600 hover:text-blue-700 font-bold"
        >
          {t("auth.loginNow")}
        </button>
      </p>

      {/* Skills Modal */}
      {openSkillsModal && !openLanguagesModal && (
        <div className="top fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20">
          <div className="bg-white p-6 rounded-lg w-2xl max-w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {t("auth.chooseSkills") || "Choose Skills"}
            </h2>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {availableSkills?.map((skill) => {
                const isSelected = selectedSkills.includes(skill._id);
                const skillLabel = skill[language] || skill.en;
                return (
                  <button
                    key={skill._id}
                    type="button"
                    onClick={() => {
                      setSelectedSkills((prev) =>
                        prev.includes(skill._id)
                          ? prev.filter((s) => s !== skill._id)
                          : [...prev, skill._id]
                      );
                    }}
                    className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {skillLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpenSkillsModal(false)}
                className="px-3 py-1 rounded bg-gray-300 cursor-pointer"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    skills: selectedSkills
                      .map((id) => {
                        const skillObj = availableSkills.find(
                          (s) => s._id === id
                        );
                        return skillObj?.[language] || skillObj?.en;
                      })
                      .filter(Boolean)
                      .join(", "),
                  });
                  setOpenSkillsModal(false);
                }}
                className="px-3 py-1 rounded bg-green-500 text-white cursor-pointer"
              >
                {t("common.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Languages Modal */}
      {openLanguagesModal && (
        <div className="top fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20">
          <div className="bg-white p-6 rounded-lg w-2xl max-w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {t("auth.chooseLanguages") || "Choose Languages"}
            </h2>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {availableLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang._id);
                return (
                  <button
                    key={lang._id}
                    type="button"
                    onClick={() => {
                      setSelectedLanguages((prev) =>
                        prev.includes(lang._id)
                          ? prev.filter((s) => s !== lang._id)
                          : [...prev, lang._id]
                      );
                    }}
                    className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {language === "en" ? lang.en : lang.de}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpenLanguagesModal(false)}
                className="px-3 py-1 rounded bg-gray-300 cursor-pointer"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    languages: selectedLanguages
                      .map((id) => {
                        const langObj = availableLanguages.find(
                          (s) => s._id === id
                        );
                        return language === "en" ? langObj?.en : langObj?.de;
                      })
                      .filter(Boolean)
                      .join(", "),
                  });
                  setOpenLanguagesModal(false);
                }}
                className="px-3 py-1 rounded bg-green-500 text-white cursor-pointer"
              >
                {t("common.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
