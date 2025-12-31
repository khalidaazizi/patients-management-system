// components/ToastMessage.tsx
import React, { useEffect } from "react";

interface ToastMessageProps {
  message: string;
  type?: "success" | "error";
  duration?: number; // مدت زمان نمایش به میلی ثانیه
  onClose: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-0 right-0 left-0  z-50 px-4 py-5 rounded shadow-md  ${
        type === "success" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
      }`}
    >
      {message}
    </div>
  );
};

export default ToastMessage;
