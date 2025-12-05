import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import type { OfferProps, OrtMapProps, RequestProps } from "../../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ChangeView = ({
  center,
  zoom,
}: {
  center: L.LatLngExpression | undefined;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom !== undefined) {
      //map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
};

const OrtMap = ({ orts, mapCenter, onMarkerClick, zoom }: OrtMapProps) => {
  const [center, setCenter] = useState<L.LatLngExpression | undefined>(
    mapCenter ?? undefined
  );
  //const [zoom, setZoom] = useState(13);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom ?? 10);

  const createBlinkingMarker = (iconUrl: string) => {
    return L.divIcon({
      html: `
      <div class="blink-alert-wrapper">
        <div class="blink-alert-circle"></div>
        <img src="${iconUrl}" class="blink-alert-icon" />
      </div>
    `,
      className: "", // pas de style Leaflet par défaut
      iconSize: [30, 41],
      iconAnchor: [15, 41], // centre sur le bas de l'icône
      popupAnchor: [0, -41],
    });
  };
  useEffect(() => {
    if (mapCenter) {
      setCenter(mapCenter);
      if (zoom !== undefined) {
        setCurrentZoom(zoom);
      }
    }
  }, [mapCenter, zoom]);

  const handleMarkerClick = (ort: OfferProps | RequestProps) => {
    onMarkerClick(ort);

    setCenter([ort.latitude, ort.longitude]);
    setCurrentZoom(18);
  };

  const getOrtType = (item: OfferProps | RequestProps) => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    return "request";
  };

  // Get custom marker icon

  const chooseColor = (ortType: string, status?: string) => {
    if (ortType === "offer") {
      switch (status) {
        case "active":
          return "blue";

        case "in_progress":
          return "orange";

        case "completed":
          return "violet";

        case "cancelled":
          return "black";

        case "archived":
          return "grey";

        default:
          return "blue";
      }
    } else if (ortType === "request") {
      switch (status) {
        case "active":
          return "green";

        case "in_progress":
          return "orange";

        case "completed":
          return "violet";

        case "cancelled":
          return "black";

        case "archived":
          return "grey";

        default:
          return "green";
      }
    } else if (ortType === "alert") {
      switch (status) {
        case "active":
          return "red";

        case "in_progress":
          return "orange";

        case "completed":
          return "violet";

        case "cancelled":
          return "black";

        case "archived":
          return "grey";

        default:
          return "red";
      }
    }
    return "blue"; // fallback
  };
  const getMarkerIcon = (item: OfferProps | RequestProps) => {
    const ortType = getOrtType(item); // 'offer', 'request', 'alert'
    const status = (item as any).status; // 'active', 'in_progress', 'completed', 'cancelled', 'archived'

    //let color = "blue"; // fallback
    const color = chooseColor(ortType, status);

    const url = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;

    return new L.Icon({
      iconUrl: url,
      shadowUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={currentZoom}
      className="h-full w-full rounded-xl mt-4"
    >
      <ChangeView center={center} zoom={currentZoom} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {orts.map((ort) => (
        <Marker
          key={ort._id}
          position={[ort.latitude, ort.longitude]}
          icon={
            getOrtType(ort) === "alert" && ort.status === "active"
              ? createBlinkingMarker(
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                ) // ton icône normale
              : getMarkerIcon(ort) // icône normale pour les autres
          }
          eventHandlers={{
            click: () => handleMarkerClick(ort),
          }}
        >
          <Popup>
            {ort.title}
            <br />
            {ort.location}
            <br />
            <span
              className={`text-sm font-semibold text-${chooseColor(
                getOrtType(ort),
                (ort as any).status
              )}-500`}
            >
              {ort.status.toUpperCase()}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OrtMap;
