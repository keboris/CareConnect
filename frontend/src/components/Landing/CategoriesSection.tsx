import {
  ShoppingCart,
  Baby,
  Hammer,
  Users,
  Leaf,
  Home,
  Dog,
  Car,
} from "lucide-react";
import type { CategoriesSectionProps } from "../../types";

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onCategoryClick,
}) => {
  const categories = [
    {
      icon: ShoppingCart,
      name: "Einkaufen",
      color: "bg-emerald-500",
      count: "24+",
    },
    { icon: Baby, name: "Kinderbetreuung", color: "bg-blue-500", count: "18+" },
    { icon: Hammer, name: "Heimwerken", color: "bg-amber-500", count: "31+" },
    { icon: Users, name: "Begleitung", color: "bg-purple-500", count: "15+" },
    { icon: Leaf, name: "Gartenarbeit", color: "bg-green-500", count: "22+" },
    { icon: Home, name: "Haushalt", color: "bg-cyan-500", count: "28+" },
    { icon: Dog, name: "Tierbetreuung", color: "bg-pink-500", count: "19+" },
    { icon: Car, name: "Fahrdienst", color: "bg-red-500", count: "13+" },
  ];

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
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={onCategoryClick}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:-translate-y-1"
            >
              <div
                className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <category.icon size={28} className="text-white" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {category.name}
              </h3>

              <p className="text-sm text-gray-500">{category.count} Anzeigen</p>

              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onCategoryClick}
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
