import React, { createContext, useState,  } from "react";
import Message from "../components/Message";

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

export  const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const success = (message: string) => {
    setToast({ message, type: "success" });
  };

  const error = (message: string) => {
    setToast({ message, type: "error" });
  };

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}

      {toast && (
        <Message
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}
