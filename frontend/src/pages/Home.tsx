import { useState } from "react";
import HeroSection from "../components/Landing/HeroSection";
import FeaturesSection from "../components/Landing/FeaturesSection";
import CategoriesSection from "../components/Landing/CategoriesSection";
import StatsSection from "../components/Landing/StatsSection";
import Footer from "../components/Landing/Footer";
import MapModal from "../components/Map/MapModal";

const Home: React.FC = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <HeroSection
        onGetStarted={() => console.log("Get started")}
        onOpenMap={() => setShowMap(true)}
      />
      <FeaturesSection />
      <CategoriesSection onCategoryClick={() => setShowMap(true)} />
      <StatsSection />
      <Footer />

      {showMap && <MapModal onClose={() => setShowMap(false)} />}
    </>
  );
};

export default Home;
