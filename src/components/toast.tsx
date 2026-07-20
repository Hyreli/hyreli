"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "warning" | "info";
}

interface ToastContextValue {
  toast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig = {
  success: {
    icon: CheckCircle2,
    border: "border-l-emerald-500",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    border: "border-l-red-500",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-amber-500",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    border: "border-l-blue-500",
    iconColor: "text-blue-500",
  },
};

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = String(++toastCount);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80">
            {toasts.map((t) => {
              const config = variantConfig[t.variant];
              const Icon = config.icon;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border border-l-4 bg-[#1c1c1c] px-4 py-3 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-200",
                    config.border
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", config.iconColor)} />
                  <p className="text-sm text-white flex-1">{t.message}</p>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="shrink-0 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
