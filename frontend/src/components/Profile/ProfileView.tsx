import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Listing } from '../../config/api';
import { api } from '../../lib/api';
import { User, Mail, Phone, MapPin, Star, Edit2, Save } from 'lucide-react';

export function ProfileView() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        bio: profile.bio || '',
      });
      loadUserListings();
    }
  }, [profile]);

  const loadUserListings = async () => {
    if (!profile) return;

    // TODO: Replace with actual MongoDB API endpoint
    // Expected response format: Array of Listing objects with populated category, sorted by created_at desc
    try {
      const data = await api.get(`/listings/user/${profile.id}`);
      if (data) setUserListings(data);
    } catch (error) {
      console.error('Failed to load user listings:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // TODO: Replace with actual MongoDB API endpoint
      // Update user profile with form data
      await api.put(`/profile/${profile.id}`, {
        ...formData,
        updated_at: new Date().toISOString(),
      });

      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

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
              <span>{loading ? 'Speichern...' : 'Speichern'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={40} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile.full_name}</h3>
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star size={18} fill="currentColor" />
              <span className="text-gray-700 font-medium">
                {profile.rating_average.toFixed(1)} ({profile.rating_count} Bewertungen)
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
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!editing}
              placeholder="Musterstraße 123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                disabled={!editing}
                placeholder="12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!editing}
                placeholder="Berlin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Über mich</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!editing}
              rows={3}
              placeholder="Erzählen Sie etwas über sich..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Meine Anzeigen</h3>
        {userListings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Noch keine Anzeigen erstellt</p>
        ) : (
          <div className="space-y-3">
            {userListings.map((listing) => (
              <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{listing.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{listing.status}</span>
                      {listing.is_paid && listing.price && (
                        <span className="font-medium text-green-600">{listing.price.toFixed(2)} €</span>
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
