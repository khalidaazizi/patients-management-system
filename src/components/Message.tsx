// components/Message.tsx
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface MessageProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  type = "success",
  duration = 3000, // ✅ افزایش به 3 ثانیه
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // تأخیر برای انیمیشن خروج
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0  z-[9999] flex items-center justify-center animate-fadeIn">
      {/* Background */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl p-8 z-10 w-[400px] text-center animate-scaleIn">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {type === "success" ? (
            <FaCheckCircle className="text-green-500 text-6xl" />
          ) : (
            <FaTimesCircle className="text-red-500 text-6xl" />
          )}
        </div>

        {/* Message */}
        <h3 className={`text-xl font-bold mb-2 ${type === "success" ? "text-green-600" : "text-red-600"}`}>
          {type === "success" ? "Success!" : "Error!"}
        </h3>
        <p className="text-gray-700 text-lg mb-6">{message}</p>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{
              animation: `progress ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Message;