import { useEffect, useRef, useState } from "react";

import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Wand2,
  Languages,
} from "lucide-react";

import { API_BASE_URL } from "../config";
import { useAuth, useLanguage } from "../contexts";
import { useNavigate } from "react-router";
import type { Lang } from "../types";
import { AddressInput } from "../components";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    longitude: 0,
    latitude: 0,
    profileImage: null as File | null,
    skills: "",
    languages: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const skillsModalRef = useRef<HTMLDivElement | null>(null);
  const languagesModalRef = useRef<HTMLDivElement | null>(null);

  const [availableSkills, setAvailableSkills] = useState<Lang[]>([]);
  const [openSkillsModal, setOpenSkillsModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [availableLanguages, setAvailableLanguages] = useState<Lang[]>([]);
  const [openLanguagesModal, setOpenLanguagesModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const { signUp } = useAuth();
  const { t, language } = useLanguage();

  const navigate = useNavigate();

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

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && key !== "skills" && key !== "languages") {
        form.append(key, value as any);
      }
    });

    selectedSkills.forEach((skillId) => form.append("skills", skillId));
    selectedLanguages.forEach((langId) => form.append("languages", langId));

    try {
      console.log("Form Data:", Array.from(form.entries()));
      await signUp(form);
      navigate("/app", {
        state: { successMessage: "auth.welcomeMsgRegister" },
      });
    } catch (error: any) {
      if (typeof error === "object" && !("message" in error)) {
        setFieldErrors(error);
        return;
      }

      if (error instanceof Error && (error as any).field) {
        setFieldErrors({ [(error as any).field]: error.message });
        return;
      }

      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t("nav.register")} - CareConnect`;
  }, [t]);

  useEffect(() => {
    const fetchAll = async () => {
      const [skillsRes, langRes] = await Promise.all([
        fetch(`${API_BASE_URL}/skills`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/languages`, { credentials: "include" }),
      ]);

      setAvailableSkills((await skillsRes.json()).skills);
      setAvailableLanguages((await langRes.json()).languages);
    };

    fetchAll();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openSkillsModal &&
        skillsModalRef.current &&
        !skillsModalRef.current.contains(event.target as Node)
      ) {
        setOpenSkillsModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSkillsModal]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openLanguagesModal &&
        languagesModalRef.current &&
        !languagesModalRef.current.contains(event.target as Node)
      ) {
        setOpenLanguagesModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openLanguagesModal]);

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-1/2 mx-auto bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 mt-10 mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <img
                src="/logo.png"
                alt="CareConnect Logo"
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("auth.createAccount")}
            </h2>
            <p className="text-gray-600">{t("auth.joinCommunity")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-sm">
                    {fieldErrors.firstName}
                  </p>
                )}
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
              {fieldErrors.lastName && (
                <p className="text-red-500 text-sm">{fieldErrors.lastName}</p>
              )}
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
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                )}
                {error && typeof error === "string" && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
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
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                )}
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
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm">{fieldErrors.phone}</p>
                )}
                {error && typeof error === "string" && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
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
                  <AddressInput
                    locationValue={formData.location}
                    onSelect={(data) => setFormData({ ...formData, ...data })}
                  />
                </div>
              </div>
              {fieldErrors.location && (
                <p className="text-red-500 text-sm">{fieldErrors.location}</p>
              )}
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
                    readOnly
                    className="w-full text-xs text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. First Aid, Counseling"
                  />
                </div>
                <button
                  onClick={() => setOpenSkillsModal(true)}
                  className="mt-2 p-2 bg-blue-500 text-white rounded cursor-pointer"
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
                    readOnly
                    className="w-full text-xs text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. English, Spanish"
                  />
                </div>
                <button
                  onClick={() => setOpenLanguagesModal(true)}
                  className="mt-2 p-2 bg-blue-500 text-white rounded cursor-pointer"
                >
                  {t("auth.chooseLanguages") || "Choose Languages"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 duration-300 cursor-pointer"
            >
              {loading ? t("auth.signingUp") : t("auth.signUp")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t("auth.haveAccount")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              {t("auth.loginNow")}
            </button>
          </p>

          {/* Skills Modal */}
          {openSkillsModal && !openLanguagesModal && (
            <div className="top fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20">
              <div
                ref={skillsModalRef}
                className="bg-white p-6 rounded-lg w-2xl max-w-full shadow-lg"
              >
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
          {openLanguagesModal && !openSkillsModal && (
            <div className="top fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20">
              <div
                ref={languagesModalRef}
                className="bg-white p-6 rounded-lg w-2xl max-w-full shadow-lg"
              >
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
                            return language === "en"
                              ? langObj?.en
                              : langObj?.de;
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
      </div>
    </>
  );
};

export default Register;
