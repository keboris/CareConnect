import { useState, useEffect } from "react";

import { api } from "../../lib/api";
import { User, Mail, Phone, MapPin, Star, Edit2, Save } from "lucide-react";
import type { OfferProps, RequestProps } from "../../types";
import { useAuth } from "../../contexts";
import { API_BASE_URL } from "../../config/api";

export function ProfileView() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userOffers, setUserOffers] = useState<OfferProps[]>([]);
  const [userRequests, setUserRequests] = useState<RequestProps[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    profileImage: null as File | string | null,
    bio: "",
    skills: [] as string[],
    location: "",
    longitude: 0,
    latitude: 0,
    languages: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
        profileImage: user.profileImage || "",
        bio: user.bio || "",
        skills: user.skills || [],
        location: user.location || "",
        longitude: user.longitude || 0,
        latitude: user.latitude || 0,
        languages: user.languages || [],
      });
      loadUserOffers();
      loadUserRequests();
    }
  }, [user]);

  const loadUserOffers = async () => {
    if (!user) return;

    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Offer objects with populated category, sorted by created_at desc
    try {
      const data = await api.get(`${API_BASE_URL}/offers/myOffers`);
      if (data) setUserOffers(data);
    } catch (error) {
      console.error("Failed to load your Offers:", error);
    }
  };

  const loadUserRequests = async () => {
    if (!user) return;

    try {
      const data = await api.get(`${API_BASE_URL}/requests/myRequests`);
      if (data) setUserRequests(data);
    } catch (error) {
      console.error("Failed to load your Requests:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await refreshUser(`${API_BASE_URL}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      await refreshUser(`${API_BASE_URL}/auth/me`);

      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Fehler beim Speichern des Profils");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mein Profil</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={18} />
              <span>Bearbeiten</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{loading ? "Speichern..." : "Speichern"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={40} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star size={18} fill="currentColor" />
              <span className="text-gray-700 font-medium">
                {/*{user.rating_average.toFixed(1)} ({user.rating_count}{" "}
                Bewertungen)*/}
                {user.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="inline mr-1" />
              E-Mail
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} className="inline mr-1" />
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!editing}
              placeholder="+49 123 456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} className="inline mr-1" />
              Adresse
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              disabled={!editing}
              placeholder="Musterstraße 123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <input
                type="text"
                value={formData.skills.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skills: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                disabled={!editing}
                placeholder="Kochen, Erste Hilfe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profilbild
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData({ ...formData, profileImage: file });
                  }
                }}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />

              {/* Preview of selected Image */}
              {formData.profileImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData.profileImage as File)}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Über mich
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={!editing}
              rows={3}
              placeholder="Erzählen Sie etwas über sich..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Meine Offers</h3>
        {userOffers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Noch keine Anzeigen erstellt
          </p>
        ) : (
          <div className="space-y-3">
            {userOffers.map((offer) => (
              <div
                key={offer._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {offer.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {offer.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{offer.status}</span>
                      {offer.isPaid && offer.price && (
                        <span className="font-medium text-green-600">
                          {offer.price.toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Meine Requests</h3>
        {userRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Noch keine Anzeigen erstellt
          </p>
        ) : (
          <div className="space-y-3">
            {userRequests.map((request) => (
              <div
                key={request._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {request.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{request.status}</span>
                      {request.rewardType && request.price && (
                        <span className="font-medium text-green-600">
                          {request.price.toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
