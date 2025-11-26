import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Listing, Category } from '../../config/api';
import { api } from '../../lib/api';
import { X, Search, Filter, MapPin, Euro, Heart, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

type Props = {
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onCreateListing: () => void;
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapModal({ onClose, onSelectListing, onCreateListing }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState<[number, number]>([52.52, 13.405]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadListings();
    getUserLocation();
  }, []);

  useEffect(() => {
    loadListings();
  }, [selectedCategory, showPaidOnly, showFreeOnly, searchQuery]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('Could not get user location');
        }
      );
    }
  };

  const loadCategories = async () => {
    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Category objects
    try {
      const data = await api.get('/categories');
      if (data) setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadListings = async () => {
    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Listing objects with populated profile and category
    try {
      const params = new URLSearchParams();
      params.append('status', 'active');

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      if (showPaidOnly) {
        params.append('is_paid', 'true');
      }

      if (showFreeOnly) {
        params.append('is_paid', 'false');
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const data = await api.get(`/listings?${params.toString()}`);
      if (data) setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const createIcon = (color: string, isPaid: boolean) => {
    const iconHtml = isPaid
      ? `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px;">€</span></div>`
      : `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-size: 20px;">♥</span></div>`;

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
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full flex flex-col">
        <div className="bg-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Hilfsanzeigen erkunden</h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen Sie nach Hilfsanzeigen..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  showFilters
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>

              <button
                onClick={onCreateListing}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Neue Anzeige</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategorie</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="all">Alle Kategorien</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Art der Hilfe</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPaidOnly}
                          onChange={(e) => {
                            setShowPaidOnly(e.target.checked);
                            if (e.target.checked) setShowFreeOnly(false);
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Nur bezahlte Hilfe</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showFreeOnly}
                          onChange={(e) => {
                            setShowFreeOnly(e.target.checked);
                            if (e.target.checked) setShowPaidOnly(false);
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Nur freiwillige Hilfe</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ergebnisse</label>
                    <div className="px-4 py-3 bg-white rounded-lg border-2 border-gray-200">
                      <div className="text-3xl font-bold text-blue-600">{listings.length}</div>
                      <div className="text-sm text-gray-600">Anzeigen gefunden</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={center} />
            {listings.map((listing) => (
              <Marker
                key={listing.id}
                position={[listing.latitude, listing.longitude]}
                icon={createIcon(listing.category?.color || '#3b82f6', listing.is_paid)}
              >
                <Popup>
                  <div className="min-w-[250px] p-2">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">{listing.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: listing.category?.color + '20', color: listing.category?.color }}>
                        {listing.category?.name}
                      </span>

                      {listing.is_paid && listing.price ? (
                        <span className="flex items-center text-green-600 font-bold">
                          <Euro size={16} />
                          {listing.price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="flex items-center text-blue-600 font-semibold text-sm">
                          <Heart size={16} className="mr-1" fill="currentColor" />
                          Ehrenamtlich
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onSelectListing(listing);
                        onClose();
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Details anzeigen
                    </button>
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
