import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import type {
  OfferProps,
  OrtMapProps,
  RequestProps,
  User as UserType,
} from "../../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { FilePlus2, Handshake, User, Zap } from "lucide-react";
import { useLanguage } from "../../contexts";
import { chooseColor } from "../../lib";
import { useNavigate } from "react-router";

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
  zoom?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom !== undefined) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
    //console.log("ChangeView center:", center);
    //console.log("ChangeView zoom:", zoom);
    //console.log("Map object in ChangeView:", map);
  }, [center, zoom, map]);

  return null;
};

/*--------------------------------------------------------*/

const OrtMap = (props: OrtMapProps) => {
  const {
    orts,
    mapCenter,
    isClick,
    setIsClick,
    currentOrt,
    onMarkerClick,
    isClickedZoom,
    setIsClickedZoom,
    onAccept,
    acceptLoading,
    mapRef,
    overview,
  } = props;

  const navigate = useNavigate();
  const [center, setCenter] = useState<L.LatLngExpression>([0, 0]);

  const { t } = useLanguage();

  const [zoom, setZoom] = useState(10);

  const [initialLoad, setInitialLoad] = useState(true);
  const [, setMapClick] = useState<boolean>(false);
  const [, setPopupOpened] = useState<boolean>(true);

  const createBlinkingMarker = (iconUrl: string) => {
    return L.divIcon({
      html: `
      <div class="blink-alert-wrapper">
        <div class="blink-alert-circle"></div>
        <img src="${iconUrl}" class="blink-alert-icon" />
      </div>
    `,
      className: "",
      iconSize: [30, 41],
      iconAnchor: [15, 41],
      popupAnchor: [0, -41],
    });
  };

  const zoomValue = overview ? [10, 11] : [10, 18];

  const createUserMarker = (iconUrl: string) => {
    return L.divIcon({
      html: `
      <div class="blink-user-wrapper">
        <div class="blink-user-circle"></div>
        <img src="${iconUrl}" class="blink-user-icon" />
      </div>
    `,
      className: "",
      iconSize: [30, 41],
      iconAnchor: [15, 41],
      popupAnchor: [0, -41],
    });
  };

  if (initialLoad && mapCenter) {
    setCenter(L.latLng(mapCenter as any));
    setInitialLoad(false);
  }
  console.log("Map center set to:", mapCenter);

  useEffect(() => {
    if (!mapCenter) return;

    if (initialLoad) return;
    //setCenter(mapCenter);
    if (isClickedZoom) {
      setZoom(zoomValue[1]);
    } else {
      setZoom(zoomValue[0]);
    }
  }, [mapCenter, isClickedZoom]);

  useEffect(() => {
    if (isClick) {
      setMapClick(false);
      setPopupOpened(false);
    }
  }, [isClick, setIsClick]);

  const handleMarkerClick = (ort: OfferProps | RequestProps | UserType) => {
    console.log("Marker clicked:", ort);
    setIsClick && setIsClick(false);
    onMarkerClick(ort);
    setIsClickedZoom && setIsClickedZoom(true);

    setCenter(L.latLng(ort.latitude, ort.longitude));

    setZoom(zoomValue[1]);
    setMapClick(true);
  };

  const getOrtType = (item: OfferProps | RequestProps | UserType) => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    if ("typeRequest" in item && item.typeRequest === "request")
      return "request";
    return "user";
  };

  // Get marker icon based on ort type and status
  const getMarkerIcon = (item: OfferProps | RequestProps | UserType) => {
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
      zoom={zoom}
      className="h-full w-full rounded-xl mt-4"
      ref={mapRef}
    >
      {center && <ChangeView center={center} zoom={zoom} />}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {orts.map((ort) => (
        <Marker
          key={ort._id}
          position={[ort.latitude, ort.longitude]}
          icon={
            getOrtType(ort) === "alert" &&
            "status" in ort &&
            (ort as RequestProps).status === "active"
              ? createBlinkingMarker(
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                )
              : getOrtType(ort) === "user"
              ? createUserMarker(
                  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png"
                )
              : getMarkerIcon(ort)
          }
          eventHandlers={{
            click: () => handleMarkerClick(ort),
          }}
          ref={(markerOrt) => {
            if (
              markerOrt &&
              isClick &&
              currentOrt &&
              ort._id === currentOrt._id
            ) {
              setTimeout(() => {
                markerOrt.openPopup();
                setPopupOpened(true);
              }, 500);
            }
          }}
        >
          <Popup>
            <div className="flex items-start gap-3">
              <div
                className={`rounded-lg ${
                  getOrtType(ort) === "offer"
                    ? "bg-blue-100"
                    : getOrtType(ort) === "request"
                    ? "bg-green-100"
                    : getOrtType(ort) === "alert"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                {getOrtType(ort) === "offer" ? (
                  <Handshake className="w-5 h-5 text-blue-600" />
                ) : getOrtType(ort) === "request" ? (
                  <FilePlus2 className="w-5 h-5 text-green-600" />
                ) : getOrtType(ort) === "alert" ? (
                  <Zap className="w-5 h-5 text-red-600" />
                ) : (
                  <User className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold text-gray-800 text-sm">
                  {"title" in ort
                    ? ort.title
                    : getOrtType(ort) === "alert"
                    ? "SOS Alert"
                    : "Your Location"}
                </span>
              </div>
            </div>

            {/* Location */}
            {getOrtType(ort) !== "user" && (
              <>
                <div>
                  {!overview && (
                    <span className="flex items-start gap-3 py-2 text-xs text-gray-800 line-clamp-2">
                      <User className="w-5 h-5 text-blue-900" />{" "}
                      {"userId" in ort
                        ? `${ort.userId.firstName} ${ort.userId.lastName}`
                        : ""}
                    </span>
                  )}
                  <span
                    className={`text-xs ${
                      overview ? "mt-2 mb-3" : "mb-2"
                    } text-gray-800 line-clamp-2`}
                  >
                    📍 {ort.location}
                  </span>
                </div>

                <div className="flex gap-3">
                  {overview ? (
                    <span
                      className={`inline-flex items-center text-sm font-semibold p-2 rounded-md capitalize ${
                        getOrtType(ort) === "offer"
                          ? "text-blue-600"
                          : getOrtType(ort) === "request"
                          ? "text-green-600"
                          : getOrtType(ort) === "alert"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      <span className="w-1 h-4 bg-current mr-2 rounded-sm"></span>
                      {getOrtType(ort) === "offer"
                        ? "Offer"
                        : getOrtType(ort) === "request"
                        ? "Request"
                        : getOrtType(ort) === "alert"
                        ? "Alert"
                        : "User"}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center text-sm font-semibold p-2 rounded-md capitalize text-${chooseColor(
                        getOrtType(ort),
                        "status" in ort ? (ort as any).status : undefined
                      )}-800  `}
                    >
                      <span className="w-1 h-4 bg-current mr-2 rounded-sm"></span>
                      {"status" in ort ? (ort as any).status : ""}
                    </span>
                  )}

                  {onAccept && !overview && (
                    <button
                      className="bg-purple-700 text-white cursor-pointer font-semibold p-2 text-sm rounded-md"
                      onClick={() => onAccept(ort)}
                      disabled={acceptLoading}
                    >
                      {t("map.acceptHelp")}
                    </button>
                  )}

                  {overview && (
                    <button
                      className="bg-purple-700 text-white cursor-pointer font-semibold p-2 text-sm rounded-md"
                      onClick={() =>
                        getOrtType(ort) === "offer"
                          ? navigate(`/map/offer/${ort._id}`)
                          : navigate(`/map/request/${ort._id}`)
                      }
                    >
                      {t("map.viewInDetails")}
                    </button>
                  )}
                </div>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OrtMap;
