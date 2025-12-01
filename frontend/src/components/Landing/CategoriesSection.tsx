import { IconMap } from "../ui/icons";
import type { Category } from "../../types";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router";
import { useLanguage } from "../../contexts";

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const colorMapping: Record<string, string> = {
    "bg-red-500": "bg-red-500",
    "bg-blue-500": "bg-blue-500",
    "bg-green-500": "bg-green-500",
    "bg-indigo-500": "bg-indigo-500",
    "bg-amber-500": "bg-amber-500",
    "bg-purple-500": "bg-purple-500",
    "bg-cyan-500": "bg-cyan-500",
    "bg-pink-500": "bg-pink-500",
  };

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();

        const sortedCategories = data.categories
          .sort(
            (a: Category, b: Category) =>
              (b.offersCount || 0) +
              (b.requestsCount || 0) -
              ((a.offersCount || 0) + (a.requestsCount || 0))
          )
          .slice(0, 8);

        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hilfe in allen Bereichen
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Von alltäglichen Besorgungen bis zu speziellen Dienstleistungen
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories &&
            categories.map((category) => {
              const Icon = category.icon ? IconMap[category.icon] : undefined;
              const bgColor = colorMapping[category.color] || "bg-gray-500";
              return (
                <button
                  key={category._id}
                  onClick={() => navigate("/categories")}
                  className="group relative cursor-pointer bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:-translate-y-1"
                >
                  <div
                    className={`${bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {Icon && <Icon size={28} className="text-white" />}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {category.offersCount} {t("dashboard.offers")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.requestsCount} {t("dashboard.requests")}
                  </p>

                  <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              );
            })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/categories")}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Alle Kategorien durchsuchen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
