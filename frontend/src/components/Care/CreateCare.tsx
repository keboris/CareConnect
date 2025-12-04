import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { OFFER_API_URL, REQUEST_API_URL, CAT_USER_API_URL } from "../../config";
import type { Category } from "../../types";
import { Loading, AddressInput, Card, CardContent } from "../../components";
import { motion } from "framer-motion";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth, useLanguage } from "../../contexts";

const CreateCare = ({ type }: { type: "offer" | "request" }) => {
  const { refreshUser, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Determine post type from props or params

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    longitude: 0,
    latitude: 0,
    isPaid: false,
    price: 0,
    images: [] as string[],
    urgency: "normal" as "low" | "normal" | "high",
    rewardType: "free" as "free" | "paid",
    typeRequest: "request" as "request" | "alert",
    radius: 500,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await refreshUser(`${CAT_USER_API_URL}`);
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (!loading) {
      fetchCategories();
    }
  }, [loading]);

  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type: inputType } = e.target as HTMLInputElement;

    if (inputType === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (inputType === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(newFiles);

    // Create preview URLs
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle location change
  const handleLocationChange = (location: any) => {
    setFormData((prev) => ({
      ...prev,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.category) {
      errors.category = "Category is required";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    if (formData.isPaid && formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Prepare form data
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("location", formData.location);
      submitData.append("latitude", formData.latitude.toString());
      submitData.append("longitude", formData.longitude.toString());

      if (type === "offer") {
        submitData.append("rewardType", formData.isPaid ? "paid" : "free");
        if (formData.isPaid) {
          submitData.append("price", formData.price.toString());
        }
      } else {
        submitData.append("typeRequest", formData.typeRequest);
        submitData.append("urgency", formData.urgency);
      }

      // Add images
      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      // Make API request
      const url = type === "offer" ? `${OFFER_API_URL}` : `${REQUEST_API_URL}`;

      const response = await refreshUser(url, {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setSuccessMessage(
        `${type === "offer" ? "Offer" : "Request"} created successfully!`
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        longitude: 0,
        latitude: 0,
        isPaid: false,
        price: 0,
        images: [],
        urgency: "normal",
        rewardType: "free",
        typeRequest: "request",
        radius: 500,
      });
      setImageFiles([]);
      setPreviewUrls([]);

      navigate("/app/" + (type === "offer" ? "offers" : "requests"));
    } catch (error) {
      console.error("Error creating post:", error);
      setFieldErrors({
        submit: "Failed to create post. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingCategories) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:col-span-1 flex flex-col gap-4 min-h-0"
    >
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-800">
            {t("dashboard.createNewOffer")}
          </h3>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {fieldErrors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-100 text-red-800 rounded-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-5 h-5" />
                {fieldErrors.submit}
              </motion.div>
            )}

            {/* Post Type Selector - Only show if not passed as prop */}
            {!type && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => navigate("/app/offers/create")}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    type === "offer"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Create Offer
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/app/requests/create")}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    type === "request"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Post Request
                </button>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  fieldErrors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.title && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                  fieldErrors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  fieldErrors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-red-600 text-xs mt-1">
                  {fieldErrors.category}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Location *
              </label>
              <AddressInput
                locationValue={formData.location}
                onSelect={handleLocationChange}
                error={fieldErrors.location}
              />
            </div>

            {/* Paid/Free Toggle */}
            {type === "offer" && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This is a paid offer
                  </span>
                </label>
              </div>
            )}

            {/* Price */}
            {type === "offer" && formData.isPaid && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    fieldErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {fieldErrors.price && (
                  <p className="text-red-600 text-xs mt-1">
                    {fieldErrors.price}
                  </p>
                )}
              </div>
            )}

            {/* Request Type */}
            {type === "request" && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Request Type
                </label>
                <select
                  name="typeRequest"
                  value={formData.typeRequest}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="request">Regular Request</option>
                  <option value="alert">SOS Alert</option>
                </select>
              </div>
            )}

            {/* Urgency */}
            {type === "request" && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Urgency
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Images (Max 5)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-all"
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">
                  Click to upload or drag and drop
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${i}`}
                        className="w-full h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 text-sm"
              >
                {submitting ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/app/" + (type === "offer" ? "offers" : "requests"))
                }
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateCare;
