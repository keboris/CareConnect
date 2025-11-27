import { useEffect } from "react";
import { useMap } from "react-leaflet";

const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export default RecenterMap;
