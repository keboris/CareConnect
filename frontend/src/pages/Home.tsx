import { useEffect, useState } from "react";
import {
  CategoriesSection,
  FeaturesSection,
  HeroSection,
  MapModal,
  StatsSection,
} from "../components";

const Home = () => {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    document.title = `CareConnect`;
  }, []);

  return (
    <>
      <HeroSection
        onGetStarted={() => console.log("Get started")}
        onOpenMap={() => setShowMap(true)}
      />
      <FeaturesSection />
      <CategoriesSection onCategoryClick={() => setShowMap(true)} />
      <StatsSection />

      {showMap && <MapModal onClose={() => setShowMap(false)} />}
    </>
  );
};

export default Home;
