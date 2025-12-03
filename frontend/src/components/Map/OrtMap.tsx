import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import type { OfferProps, OrtMapProps, RequestProps } from "../../types";

// cast to any to avoid TypeScript error: property '_getIconUrl' is internal to Leaflet's types
if ((L.Icon.Default as any).prototype._getIconUrl) {
  delete (L.Icon.Default as any).prototype._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet-images/marker-icon-2x.png",
  iconUrl: "/leaflet-images/marker-icon.png",
  shadowUrl: "/leaflet-images/marker-shadow.png",
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
    if (center) {
      //map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
};

const OrtMap = ({ orts, mapCenter, onMarkerClick }: OrtMapProps) => {
  const [center, setCenter] = useState<L.LatLngExpression | undefined>(
    mapCenter ?? undefined
  );
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (mapCenter) {
      setCenter(mapCenter ?? undefined);
      setZoom(13);
    }
  }, [mapCenter]);

  const handleMarkerClick = (ort: OfferProps | RequestProps) => {
    onMarkerClick(ort);

    setCenter([ort.latitude, ort.longitude]);
    setZoom(15);
  };
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-96 w-full rounded-xl mt-4"
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {orts.map((ort) => (
        <Marker
          key={ort._id}
          position={[ort.latitude, ort.longitude]}
          eventHandlers={{
            click: () => handleMarkerClick(ort),
          }}
        >
          <Popup>
            {ort.title}
            <br />
            {ort.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OrtMap;
