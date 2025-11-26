import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import type { Offer, Request } from "../../config/api";
import { api } from "../../lib/api";
import { X, MapPin, Search, Filter } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Props = {
  onClose: () => void;
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapModal({ onClose }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [center, setCenter] = useState<[number, number]>([35.5, 33.9]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOffers, setShowOffers] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadOffers();
    loadRequests();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log("Could not get user location");
        }
      );
    }
  };

  const loadOffers = async () => {
    try {
      const data = await api.get("/offers");
      if (data && data.offers) setOffers(data.offers);
    } catch (error) {
      console.error("Failed to load offers:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await api.get("/requests");
      if (data && data.requests) setRequests(data.requests);
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      !searchQuery ||
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || offer.category?.name === selectedCategory;

    return matchesSearch && matchesCategory && showOffers;
  });

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      !searchQuery ||
      (request.title &&
        request.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && showRequests;
  });

  const createIcon = (color: string) => {
    const iconHtml = `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44">${iconHtml}</svg>`
      )}`,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="bg-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Explore Map
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, title, or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOffers(!showOffers)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                    showOffers
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span>Offers</span>
                </button>

                <button
                  onClick={() => setShowRequests(!showRequests)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                    showRequests
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span>Requests</span>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredOffers.length} offers and{" "}
              {filteredRequests.length} requests
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={center} />

            {filteredOffers.map((offer) => (
              <Marker
                key={offer._id}
                position={[offer.latitude, offer.longitude]}
                icon={createIcon("#3b82f6")}
              >
                <Popup>
                  <div className="min-w-[250px] p-2">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {offer.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {offer.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {offer.location}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filteredRequests.map((request) => (
              <Marker
                key={request._id}
                position={[request.latitude, request.longitude]}
                icon={createIcon("#ef4444")}
              >
                <Popup>
                  <div className="min-w-[250px] p-2">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {request.title || "Request"}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {request.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {request.location}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
