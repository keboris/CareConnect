import { useEffect, useState } from "react";
import {
  CategoriesSection,
  FeaturesSection,
  HeroSection,
  MapModal,
  StatsSection,
} from "../components";
import { useLanguage } from "../contexts";

const Home = () => {
  const [showMap, setShowMap] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t("nav.home")} - CareConnect`;
  }, [t]);

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
