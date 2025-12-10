import { useState, useEffect, useRef } from "react";

import { OFFER_API_URL, REQUEST_API_URL, CAT_USER_API_URL } from "../../config";
import { type CareProps, type Category } from "../../types";
import { Loading, AddressInput, Card, CardContent } from "../../components";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  MapPin,
  Edit2,
  Plus,
} from "lucide-react";
import { useAuth, useLanguage } from "../../contexts";

const CreateCare = ({
  item,
  option,
  page,
  handleAction,
  closeModal,
}: CareProps & { closeModal: () => void }) => {
  const { user, refreshUser, loading, issuesToFieldErrors } = useAuth();
  const { t } = useLanguage();

  const contentRef = useRef<HTMLDivElement>(null);

  // Determine post type from props or params

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage] = useState("");

  const [removedImagePublicIds, setRemovedImagePublicIds] = useState<string[]>(
    []
  );
  const [removedImageIndexes, setRemovedImageIndexes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: option === "edit" && item ? item.title : "",
    description: option === "edit" && item ? item.description : "",
    category:
      option === "edit" && item
        ? typeof item.category === "string"
          ? item.category
          : item.category?._id || ""
        : "",
    location: option === "edit" && item ? item.location : user?.location || "",
    longitude:
      option === "edit" && item ? item.longitude : user?.longitude || 0,
    latitude: option === "edit" && item ? item.latitude : user?.latitude || 0,
    isPaid:
      option === "edit" && item && "isPaid" in item
        ? (item as any).isPaid
        : false,
    price: option === "edit" && item ? item.price : 0,
    image:
      option === "edit" && item && item.images && item.images.length > 0
        ? item.images
        : ([] as File[]),
    urgency:
      option === "edit" && item && "urgency" in item
        ? (item as any).urgency
        : ("normal" as "low" | "normal" | "high"),
    rewardType:
      option === "edit" && item && "rewardType" in item
        ? (item as any).rewardType
        : ("free" as "free" | "paid"),
    typeRequest:
      option === "edit" && item && "typeRequest" in item
        ? (item as any).typeRequest
        : ("" as "" | "request" | "alert"),
    typeAlert:
      option === "edit" && item && "typeAlert" in item
        ? (item as any).typeAlert
        : ("" as
            | ""
            | "medical"
            | "fire"
            | "police"
            | "danger"
            | "assistance"
            | "other"),
    radius: 500,
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  let titleAction = "";
  if (option === "edit" && !item) {
    titleAction =
      page === "offer" || !page
        ? t("dashboard.createOffer")
        : page === "request"
        ? t("dashboard.postRequest")
        : t("dashboard.createAlert");
  } else {
    titleAction =
      page === "offer" || !page
        ? t("dashboard.editOffer")
        : page === "request"
        ? t("dashboard.editRequest")
        : t("dashboard.editAlert");
  }

  const colorSet =
    page === "offer" || !page ? "blue" : page === "request" ? "green" : "red";

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

    if (option === "edit" && item && item.images && item.images.length > 0) {
      setImageFiles((item.images as unknown as File[]) || []);
      const urls = (item.images as unknown as string[]).map((img) => img);
      setPreviewUrls(urls);
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
        [name]:
          name === "isPaid"
            ? (e.target as HTMLInputElement).checked
            : (e.target as HTMLInputElement).checked
            ? "true"
            : "false",
      }));
    } else if (inputType === "number") {
      if (name === "radius") {
        setFormData((prev) => ({
          ...prev,
          [name]: Number(value),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: parseFloat(value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
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

  const removeImageCloud = (index: number) => {
    const img = (item as any)?.imagesPublicIds?.[index];
    if (!img) return;
    setRemovedImagePublicIds((prev) => [...prev, img]);
    setRemovedImageIndexes((prev) => [...prev, String(index)]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle location change
  const handleLocationChange = (location: any) => {
    setFormData((prev) => ({
      ...prev,
      location: location.location,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  // Validate form
  /*const validateForm = () => {
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
  };*/

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Submitting form with data:", formData);
    //if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Prepare form data
      const submitData = new FormData();
      imageFiles.forEach((file) => submitData.append("image", file));
      submitData.append("title", formData.title ?? "");
      submitData.append("description", formData.description);
      if (page !== "alert")
        submitData.append("category", String(formData.category ?? ""));
      else submitData.append("category", "692599bb49a323657a269f86"); // Default category for alerts
      submitData.append("location", formData.location);
      submitData.append("latitude", formData.latitude.toString());
      submitData.append("longitude", formData.longitude.toString());

      if (!page || page === "offer") {
        submitData.append("isPaid", formData.isPaid.toString());
        if (formData.isPaid) {
          submitData.append("price", (formData.price ?? 0).toString());
        }
      } else {
        submitData.append("rewardType", formData.rewardType);
        submitData.append("typeRequest", page);
        submitData.append("urgency", formData.urgency);
        submitData.append("radius", formData.radius.toString());

        if (page === "alert") {
          submitData.append("typeAlert", String(formData.typeAlert ?? ""));
        }

        if (formData.rewardType === "paid") {
          submitData.append("price", (formData.price ?? 0).toString());
        }
      }

      if (option === "edit" && item && item.images && item.images.length > 0) {
        if (removedImagePublicIds.length > 0) {
          removedImagePublicIds.forEach((publicId) => {
            submitData.append("removedImages", publicId);
          });

          removedImageIndexes.forEach((indexId) => {
            submitData.append("removedIndexes", indexId);
          });
        }
      }

      for (const pair of submitData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      //console.log("Submitting data:", formData);
      // Make API request
      const url = page ? REQUEST_API_URL : OFFER_API_URL;
      let response;
      if (option === "edit" && item) {
        response = await refreshUser(`${url}/${item._id}`, {
          method: "PUT",
          body: submitData,
        });
      } else {
        response = await refreshUser(url, {
          method: "POST",
          body: submitData,
        });
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.issues) {
          issuesToFieldErrors(data.issues);
        }
        const message =
          data && typeof data.message === "string"
            ? data.message
            : "An error occurred";
        const err = new Error(message);
        if (data && "field" in data) {
          (err as any).field = data.field;
        }
        throw err;
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: user?.location || "",
        longitude: user?.longitude || 0,
        latitude: user?.latitude || 0,
        isPaid: false,
        price: 0,
        image: [],
        urgency: "normal",
        rewardType: "free",
        typeRequest: "request",
        radius: 500,
        typeAlert: "",
      });
      setImageFiles([]);
      setPreviewUrls([]);

      if (!page || page === "offer")
        handleAction && handleAction(data.offer, option);
      else handleAction && handleAction(data.request, option);

      closeModal();
    } catch (error: any) {
      if (typeof error === "object" && !("message" in error)) {
        setFieldErrors(error);
        return;
      }

      if (error instanceof Error && (error as any).field) {
        setFieldErrors({ [(error as any).field]: error.message });
        return;
      }

      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      contentRef.current?.scrollTo(0, 0);
      setSubmitting(false);
    }
  };

  if (loading || loadingCategories) return <Loading />;

  return (
    <Card className="flex-1 overflow-hidden flex flex-col p-4 gap-0">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex flex-cols gap-3 items-center">
          {option === "edit" ? (
            <Edit2 className={`w-6 h-6 text-${colorSet}-600`} />
          ) : (
            <Plus className={`w-6 h-6 text-${colorSet}-600`} />
          )}
          <h3 className="font-bold text-gray-800">{titleAction}</h3>
        </div>
        <button
          onClick={() => closeModal()}
          className={`p-1 hover:bg-${colorSet}-700 cursor-pointer rounded-lg transition-all`}
        >
          <X className="w-6 h-6 text-gray-800 hover:text-white" />
        </button>
      </div>

      <CardContent
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-w-[70vw]"
      >
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

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t("dashboard.title")} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm ${
                fieldErrors.title ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {fieldErrors.title && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{fieldErrors.title}</span>
              </div>
            )}
            {error && typeof error === "string" && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t("dashboard.description")} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm resize-none ${
                fieldErrors.description ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {fieldErrors.description && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{fieldErrors.description}</span>
              </div>
            )}
            {error && typeof error === "string" && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Category */}
          {page !== "alert" && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                {t("dashboard.category")} *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm ${
                  fieldErrors.category ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="" className={`hover:bg-${colorSet}-600`}>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{fieldErrors.category}</span>
                </div>
              )}
              {error && typeof error === "string" && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t("dashboard.location")} *
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <AddressInput
                locationValue={formData.location}
                onSelect={handleLocationChange}
                error={fieldErrors.location}
              />
            </div>
            {fieldErrors.location && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{fieldErrors.location}</span>
              </div>
            )}
            {error && typeof error === "string" && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Type Alert */}
          {page === "alert" && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                {t("sos.type") || "Type"}
              </label>
              <select
                name="typeAlert"
                value={formData.typeAlert}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm ${
                  fieldErrors.typeAlert ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" className="text-gray-900">
                  {t("sos.typePlaceholder") || "Select type"}
                </option>
                <option value="medical" className="text-gray-900">
                  {t("sos.medical") || "Medical"}
                </option>
                <option value="fire" className="text-gray-900">
                  {t("sos.fire") || "Fire"}
                </option>
                <option value="police" className="text-gray-900">
                  {t("sos.police") || "Police"}
                </option>
                <option value="danger" className="text-gray-900">
                  {t("sos.danger") || "Danger"}
                </option>
                <option value="assistance" className="text-gray-900">
                  {t("sos.assistance") || "Assistance"}
                </option>
                <option value="other" className="text-gray-900">
                  {t("sos.other") || "Other"}
                </option>
              </select>
            </div>
          )}

          {/* Paid/Free Toggle */}
          {(!page || page === "offer") && (
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
                  {t("dashboard.isPaid")}
                </span>
              </label>
            </div>
          )}

          {/* Price */}
          {(!page || page === "offer") && formData.isPaid && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                {t("dashboard.price")} ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm ${
                  fieldErrors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.price && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{fieldErrors.price}</span>
                </div>
              )}
              {error && typeof error === "string" && (
                <div role="alert" className="alert alert-error alert-soft">
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Paid/Free Toggle */}
          {(page === "request" || page === "alert") && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rewardType"
                  checked={formData.rewardType === "paid"}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t(
                    `dashboard.rewardType${
                      page.charAt(0).toUpperCase() + page.slice(1)
                    }`
                  )}
                </span>
              </label>
            </div>
          )}

          {/* Price */}
          {(page === "request" || page === "offer") &&
            formData.rewardType === "paid" && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  {t("dashboard.price")} ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm ${
                    fieldErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {fieldErrors.price && (
                  <div role="alert" className="alert alert-error alert-soft">
                    <span>{fieldErrors.price}</span>
                  </div>
                )}
                {error && typeof error === "string" && (
                  <div role="alert" className="alert alert-error alert-soft">
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

          {/* Request Type */}

          {/* Urgency */}
          {(page === "request" || page === "alert") && (
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                {t("dashboard.urgency")}
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorSet}-500 text-sm`}
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
              {t("dashboard.images")} (Max 5)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-${colorSet}-500 transition-all`}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600">
                {t("dashboard.clickToUpload")}
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
                      onClick={() =>
                        option === "edit" ? removeImageCloud(i) : removeImage(i)
                      }
                      className="absolute cursor-pointer -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
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
              className={`flex-1 cursor-pointer py-2 px-4 bg-${colorSet}-600 text-white rounded-lg font-semibold hover:bg-${colorSet}-700 transition-all disabled:opacity-50 text-sm`}
            >
              {option === "edit"
                ? submitting
                  ? t("common.updating")
                  : t("common.update")
                : submitting
                ? t("common.creating")
                : t("common.create")}
            </button>

            <button
              type="button"
              onClick={() => {
                closeModal();
              }}
              className="flex-1 cursor-pointer py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCare;
