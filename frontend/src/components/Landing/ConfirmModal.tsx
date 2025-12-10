import { motion } from "framer-motion";
import type { ConfirmModalProps } from "../../types";
import { type MouseEvent } from "react";
import { useLanguage } from "../../contexts";

export default function ConfirmModal({
  title = "Confirmation",
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // handler typed as a React MouseEvent handler so it matches the button onClick type;
  // the actual prop is invoked via a safe cast to avoid the incompatible parameter type error
  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (onConfirm as unknown as () => void)();
  };

  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md"
      >
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-3 text-gray-600">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 cursor-pointer rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 cursor-pointer rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-semibold hover:bg-gray-700 transition"
          >
            {t("common.confirm")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
