import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Edit2,
  FilePlus2,
  Folder,
  Handshake,
  MapPin,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth, useLanguage } from "../../contexts";
import type { CareModalProps, OfferProps, RequestProps } from "../../types";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { timeAgo } from "../../lib";
import CreateCare from "./CreateCare";
import { useEffect, useRef, useState } from "react";

const CareModal: React.FC<CareModalProps> = ({
  dialogRef,
  selectedCare,
  option,
  setOption,
  page,
  isModalOpen,
  handleAction,
  closeModal,
}: CareModalProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  console.log("CareModal rendered with option:", option);

  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 640);
  const [modalMinLarge, setModalMinLarge] = useState("");

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 640);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (option !== "show") {
      if (isMobileLayout) setModalMinLarge("min-w-[90vw]");
      else setModalMinLarge("min-w-[60vw]");
    } else setModalMinLarge("");
  }, [isMobileLayout, option]);

  useEffect(() => {
    const modalElement = modalRef.current;
    const handleModalClose = (event: MouseEvent) => {
      if (modalElement && !modalElement.contains(event.target as Node)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleModalClose);
    return () => {
      document.removeEventListener("mousedown", handleModalClose);
    };
  }, [closeModal]);

  // derive author id and name safely when selectedCare.userId can be a string or an object
  const getAuthorId = (userField: any) =>
    typeof userField === "string" ? userField : userField?._id;
  const getAuthorName = (userField: any) =>
    typeof userField === "string"
      ? "-"
      : `${userField?.firstName ?? ""} ${userField?.lastName ?? ""}`.trim();

  const getType = (item: OfferProps | RequestProps) => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    if ("typeRequest" in item && item.typeRequest === "request")
      return "request";
  };

  console.log("Selected Care in Modal:", selectedCare);

  return (
    <dialog
      ref={dialogRef}
      onCancel={closeModal}
      onClose={closeModal}
      className="modal shadow-lg"
      aria-labelledby="care-modal-title"
      aria-describedby="care-modal-description"
    >
      <div className="p-6">
        {/* Selected Offer Details - Takes 1/4 of space */}

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`lg:col-span-1 flex flex-col gap-4 min-h-0 ${modalMinLarge} max-h-[95vh] overflow-y-auto overflow-x-hidden p-6`}
        >
          {option === "show" && selectedCare && (
            <>
              <Card className="flex-1 overflow-hidden flex flex-col p-4 gap-0">
                <div className="flex items-center justify-between p-2 border-b">
                  <div className="flex flex-cols gap-3 items-center">
                    {getType(selectedCare) === "offer" ? (
                      <Handshake className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FilePlus2 className="w-6 h-6 text-green-600" />
                    )}
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {getType(selectedCare) === "offer"
                        ? t("dashboard.offerDetails")
                        : t("dashboard.requestDetails")}
                    </h3>
                  </div>
                  <button
                    onClick={() => closeModal()}
                    className="p-1 hover:bg-red-800 cursor-pointer rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-gray-800 hover:text-white" />
                  </button>
                </div>
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-w-[70vw]">
                  {/*<div
                    className={`grid gap-4 items-stretch ${
                      selectedCare.images && selectedCare.images.length > 0
                        ? "grid-cols-1 md:grid-cols-[2fr_3fr]"
                        : "grid-cols-1"
                    }`}
                  >*/}
                  <div
                    className={`grid gap-4 items-stretch grid-cols-1 md:grid-cols-[2fr_3fr]`}
                  >
                    {/* Images Carousel */}
                    {selectedCare.images && selectedCare.images.length > 0 ? (
                      <div className="flex flex-col min-h-0">
                        <div className="flex-1 overflow-hidden">
                          <div className="carousel w-full h-full">
                            {selectedCare.images.slice(0, 5).map((img, i) => (
                              <div
                                id={`item${i + 1}`}
                                className="carousel-item w-full h-full flex items-center justify-center"
                              >
                                <img
                                  key={i}
                                  src={img}
                                  alt={selectedCare.title}
                                  className="max-h-full max-w-full object-contain rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        {selectedCare.images &&
                          selectedCare.images.length > 1 && (
                            <div className="flex justify-center gap-2 py-2 shrink-0">
                              {selectedCare.images.slice(0, 5).map((_, i) => (
                                <a
                                  href={`#item${i + 1}`}
                                  className="btn btn-xs"
                                >
                                  {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col min-h-0">
                        <div className="flex-1 overflow-hidden">
                          <div className="carousel w-full h-full">
                            <div className="carousel-item w-full h-full flex items-center justify-center">
                              <img
                                src="../logo.png"
                                alt={selectedCare.title}
                                className="max-h-full max-w-full object-contain rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-4 min-h-0">
                      {/* Title */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t("dashboard.title")}
                        </p>
                        <p className="text-xl text-gray-800 font-bold">
                          {selectedCare.title}
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t("dashboard.description")}
                        </p>
                        <p className="text-lg text-gray-800">
                          {selectedCare.description}
                        </p>
                      </div>

                      {/* Location */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t("dashboard.location")}
                        </p>
                        <div className="flex items-center gap-1">
                          <div>
                            <MapPin className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-lg text-gray-800 font-semibold">
                              {selectedCare.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                        {/* Category */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded">
                            <Folder className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              {t("dashboard.category")}
                            </p>
                            <p className="text-lg text-gray-800 font-semibold">
                              {selectedCare.category
                                ? language === "de"
                                  ? selectedCare.category.nameDE ||
                                    selectedCare.category.name
                                  : selectedCare.category.name ||
                                    selectedCare.category.nameDE
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 rounded">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              {t("dashboard.price")}
                            </p>
                            <p className="text-lg text-gray-800 font-semibold">
                              {(getType(selectedCare) === "offer" &&
                                "isPaid" in selectedCare &&
                                (selectedCare as any).isPaid) ||
                              (getType(selectedCare) === "request" &&
                                selectedCare &&
                                "rewardType" in selectedCare &&
                                selectedCare.rewardType === "paid")
                                ? `$${selectedCare.price}`
                                : t("dashboard.free")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                        {/* User OFFER / REQUEST */}

                        <div className="flex items-center gap-1">
                          <div className="p-2 bg-purple-100 rounded">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              {t("dashboard.publishedBy")}
                            </p>

                            <p className="text-lg text-gray-800 font-semibold">
                              {getAuthorId(selectedCare?.userId) === user?._id
                                ? "You"
                                : getAuthorName(selectedCare?.userId)}
                            </p>
                          </div>
                        </div>

                        {/* Created At */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-teal-100 rounded">
                            <Clock className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              {t("dashboard.dateCreated")}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {timeAgo(selectedCare.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      {user &&
                      getAuthorId(selectedCare?.userId) === user._id ? (
                        <>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-0">
                              {t("dashboard.status")}
                            </p>
                            <span
                              className={`inline-flex items-center text-md font-semibold p-1 rounded-md capitalize ${
                                selectedCare.status === "active"
                                  ? "text-green-800"
                                  : selectedCare.status === "inactive"
                                  ? " text-gray-800"
                                  : selectedCare.status === "in_progress"
                                  ? " text-yellow-800"
                                  : selectedCare.status === "completed"
                                  ? "text-blue-800"
                                  : selectedCare.status === "cancelled"
                                  ? "text-red-800"
                                  : "text-purple-800"
                              }`}
                            >
                              <span className="w-1 h-4 bg-current mr-2 rounded-sm"></span>
                              {selectedCare.status}
                            </span>
                          </div>

                          <div className="flex gap-6 flex-wrap justify-end">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setOption && setOption("edit");
                                console.log(
                                  "Edit button clicked, option set to edit",
                                  option
                                );
                              }}
                              className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-semibold"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />

                              {getType(selectedCare) === "offer"
                                ? t("dashboard.editOffer")
                                : getType(selectedCare) === "request"
                                ? t("dashboard.editRequest")
                                : getType(selectedCare) === "alert"
                                ? t("dashboard.editAlert")
                                : ""}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {}}
                              className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                              {getType(selectedCare) === "offer"
                                ? t("dashboard.deleteOffer")
                                : getType(selectedCare) === "request"
                                ? t("dashboard.deleteRequest")
                                : getType(selectedCare) === "alert"
                                ? t("dashboard.deleteAlert")
                                : ""}
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-6 flex-wrap justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              handleAction &&
                                handleAction(selectedCare, "accept");
                            }}
                            className="px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-semibold transition-all flex items-center gap-2 text-sm md:text-md lg:text-lg
                bg-green-700 text-white shadow-lg hover:shadow-xl"
                            title="Accept"
                          >
                            <CheckCircle className="w-5 h-5" />

                            {getType(selectedCare) === "offer"
                              ? t("dashboard.acceptOffer")
                              : getType(selectedCare) === "request"
                              ? t("dashboard.acceptRequest")
                              : getType(selectedCare) === "alert"
                              ? t("dashboard.acceptAlert")
                              : ""}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {}}
                            className="px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-semibold transition-all flex items-center gap-2 text-sm md:text-md lg:text-lg
                bg-orange-700 text-white shadow-lg hover:shadow-xl"
                            title="Signaler"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            {getType(selectedCare) === "offer"
                              ? t("dashboard.reportOffer")
                              : getType(selectedCare) === "request"
                              ? t("dashboard.reportRequest")
                              : getType(selectedCare) === "alert"
                              ? t("dashboard.reportAlert")
                              : ""}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {option === "edit" && selectedCare && (
            <CreateCare
              item={selectedCare}
              option={option}
              page={page}
              handleAction={handleAction}
              closeModal={closeModal}
            />
          )}

          {isModalOpen && !selectedCare && option === "create" && (
            <CreateCare
              option={option}
              page={page}
              closeModal={closeModal}
              handleAction={handleAction}
            />
          )}
        </motion.div>
      </div>

      <form method="dialog" className="modal-backdrop"></form>
    </dialog>
  );
};
export default CareModal;
