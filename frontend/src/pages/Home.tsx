import { useEffect, useState } from "react";
import {
  CategoriesSection,
  FeaturesSection,
  HeroSection,
  MapModal,
  ServiceSection,
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
      <ServiceSection />
      <FeaturesSection />
      <CategoriesSection />
      <StatsSection />

      {showMap && <MapModal onClose={() => setShowMap(false)} />}
    </>
  );
};

export default Home;
