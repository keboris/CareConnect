import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Listing, Category } from '../../config/api';
import { api } from '../../lib/api';
import { Plus, Filter, Euro, Heart } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

type Props = {
  onCreateListing: () => void;
  onSelectListing: (listing: Listing) => void;
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapView({ onCreateListing, onSelectListing }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [center, setCenter] = useState<[number, number]>([52.52, 13.405]);

  useEffect(() => {
    loadCategories();
    loadListings();
    getUserLocation();
  }, []);

  useEffect(() => {
    loadListings();
  }, [selectedCategory, showPaidOnly, showFreeOnly]);

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

      const data = await api.get(`/listings?${params.toString()}`);
      if (data) setListings(data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const createIcon = (color: string, isPaid: boolean) => {
    const iconHtml = isPaid
      ? `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-weight: bold;">€</span></div>`
      : `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-size: 18px;">♥</span></div>`;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40">${iconHtml}</svg>`
      )}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Filter</h3>
          <button
            onClick={onCreateListing}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            <span>Anzeige erstellen</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paidOnly"
              checked={showPaidOnly}
              onChange={(e) => {
                setShowPaidOnly(e.target.checked);
                if (e.target.checked) setShowFreeOnly(false);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="paidOnly" className="text-sm text-gray-700 cursor-pointer">
              Nur bezahlte Hilfe
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="freeOnly"
              checked={showFreeOnly}
              onChange={(e) => {
                setShowFreeOnly(e.target.checked);
                if (e.target.checked) setShowPaidOnly(false);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="freeOnly" className="text-sm text-gray-700 cursor-pointer">
              Nur freiwillige Hilfe
            </label>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {listings.length} Anzeige{listings.length !== 1 ? 'n' : ''} gefunden
          </p>
        </div>
      </div>

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
              <div className="min-w-[200px]">
                <h4 className="font-semibold text-gray-900 mb-1">{listing.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{listing.category?.name}</span>
                  {listing.is_paid && listing.price ? (
                    <span className="text-sm font-medium text-green-600">{listing.price.toFixed(2)} €</span>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">Ehrenamtlich</span>
                  )}
                </div>
                <button
                  onClick={() => onSelectListing(listing)}
                  className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Details anzeigen
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
