import { useEffect } from "react";
import { CategoriesSection } from "../components";

const Categories = () => {
  useEffect(() => {
    document.title = `CareConnect - Categories`;
  }, []);

  return (
    <>
      <CategoriesSection />
    </>
  );
};

export default Categories;
