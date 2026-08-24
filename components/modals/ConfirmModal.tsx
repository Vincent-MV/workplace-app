"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, LogOut, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  // Define styles based on the variant
  const styles = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-red-600" />,
      bg: "bg-red-100",
      btn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: <LogOut className="h-6 w-6 text-amber-600" />,
      bg: "bg-amber-100",
      btn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    default: {
      icon: <AlertTriangle className="h-6 w-6 text-slate-600" />,
      bg: "bg-slate-100",
      btn: "bg-slate-800 hover:bg-slate-900 text-white",
    },
  };

  const currentStyle = styles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${currentStyle.bg} mb-4`}>
                {currentStyle.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 mb-6">{description}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer ${currentStyle.btn}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}