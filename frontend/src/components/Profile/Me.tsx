import { useEffect, useState } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { USER_API_URL, OFFER_API_URL, REQUEST_API_URL } from "../../config";
import type { OfferProps, RequestProps } from "../../types";
import { Card, CardContent, Loading } from "..";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Star, Edit2, Save, X, Award } from "lucide-react";
import { useNavigate } from "react-router";

const Me = () => {
  const { user, refreshUser, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userOffers, setUserOffers] = useState<OfferProps[]>([]);
  const [userRequests, setUserRequests] = useState<RequestProps[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    bio: "",
    location: "",
  });

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
      });
      loadUserOffers();
      loadUserRequests();
    }
    setLoadingProfile(false);
  }, [user]);

  // Load user offers
  const loadUserOffers = async () => {
    if (!user) return;
    try {
      const response = await refreshUser(`${OFFER_API_URL}/myOffers`);
      const data = await response.json();
      if (data.offers) {
        setUserOffers(data.offers);
      }
    } catch (error) {
      console.error("Failed to load your Offers:", error);
    }
  };

  // Load user requests
  const loadUserRequests = async () => {
    if (!user) return;
    try {
      const response = await refreshUser(`${REQUEST_API_URL}/myRequests`);
      const data = await response.json();
      if (data.requests) {
        setUserRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to load your Requests:", error);
    }
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await refreshUser(`${USER_API_URL}/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Refresh user data
      await refreshUser(`${USER_API_URL}/auth/me`);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) return <Loading />;

  const activeOffers = userOffers.filter((o) => o.status === "active").length;
  const activeRequests = userRequests.filter(
    (r) => r.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800">{t("nav.profile")}</h2>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden">
          <CardContent className="p-8">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>

                {/* User Info */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                  {user?.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-700">
                        {user.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(!editing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  editing
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {editing ? (
                  <>
                    <X size={18} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 size={18} />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone</p>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{user?.phone}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Location</p>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="w-full font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">
                      {user?.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Bio</p>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <p className="font-semibold text-gray-800">
                    {user?.bio || "No bio added yet"}
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            {editing && (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg transition-all font-semibold"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Active Offers */}
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Active Offers
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {activeOffers}
                </p>
              </div>
              <Award className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Active Requests
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {activeRequests}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Total Activity */}
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Activity
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {userOffers.length + userRequests.length}
                </p>
              </div>
              <Award className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Recent Offers ({userOffers.length})
              </h3>
              <button
                onClick={() => navigate("/app/offers")}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            {userOffers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No offers yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {userOffers.slice(0, 3).map((offer) => (
                  <div
                    key={offer._id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                    onClick={() => navigate("/app/offers")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {offer.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {offer.description.substring(0, 50)}...
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          offer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="rounded-xl shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Recent Requests ({userRequests.length})
              </h3>
              <button
                onClick={() => navigate("/app/requests")}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            {userRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No requests yet. Post one to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {userRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                    onClick={() => navigate("/app/requests")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {request.title || "SOS Alert"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.description.substring(0, 50)}...
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Me;
