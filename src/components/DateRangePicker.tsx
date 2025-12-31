import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, X} from "lucide-react";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  width?: string;
  variant?: "default" | "minimal";
}

const DateRangePicker = ({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  width = "w-64",
  variant = "default",
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(dateFrom);
  const [tempTo, setTempTo] = useState(dateTo);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset temp values when props change
  useEffect(() => {
    setTempFrom(dateFrom);
    setTempTo(dateTo);
  }, [dateFrom, dateTo]);

  const dirty = tempFrom !== dateFrom || tempTo !== dateTo;
  const hasDates = dateFrom && dateTo;

  const handleApply = () => {
    setDateFrom(tempFrom);
    setDateTo(tempTo);
    setOpen(false);
  };

  const handleClear = () => {
    setTempFrom("");
    setTempTo("");
    setDateFrom("");
    setDateTo("");
    setOpen(false);
  };

  // Close if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const buttonStyles = {
    default: `bg-white  border-2 border-gray-200 shadow-sm hover:border-teal-500 
      hover:shadow-md ${open ? "border-[#019586] ring-2 ring-border-[#019586]/20" : ""}`,
    minimal: `bg-gray-50 border border-gray-300 hover:border-teal-500 
      ${open ? "border-teal-500 bg-white  " : ""}`,
  };

  const iconColor = variant === "default" ? "text-gray-500" : "text-gray-600";
  const hoverColor = variant === "default" ? "hover:text-teal-600" : "hover:text-teal-700";

  return (
    <div className={`relative inline-block ${width}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setOpen(!open)}
        className={`flex justify-between items-center rounded-lg cursor-pointer 
          transition-all duration-200 group select-none ${buttonStyles[variant]}`}
        style={{ minHeight: "2.25rem" }}
      >
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          <Calendar className={`w-4 h-4 ${iconColor} ${hoverColor} transition-colors`} />
          <span className={`text-sm font-medium truncate ${
            variant === "default" ? "text-gray-700" : "text-gray-800"
          }`}>
            {hasDates ? (
              <div className="flex items-center gap-1">
                <span className="text-teal-600">{formatDate(dateFrom)}</span>
                <span className="text-gray-400">→</span>
                <span className="text-teal-600">{formatDate(dateTo)}</span>
              </div>
            ) : (
              "Select Date Range"
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 px-2 border-l border-gray-200">
          {hasDates && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Clear dates"
            >
              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>
          )}
          <div className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <ChevronDown className={`w-3.5 h-3.5 ${iconColor} ${hoverColor}`} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute w-full bg-white rounded-lg shadow-xl border border-gray-200 
          z-50 overflow-hidden mt-2 top-full animate-fadeInDown">
          
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Select Date Range</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Date Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={tempFrom}
                    onChange={(e) => setTempFrom(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-teal-500/30 
                      focus:border-teal-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={tempTo}
                    onChange={(e) => setTempTo(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-teal-500/30 
                      focus:border-teal-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 
                  rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                disabled={!tempFrom || !tempTo}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${tempFrom && tempTo
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {dirty ? "Apply" : "Close"}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick select:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    
                    setTempFrom(weekAgo.toISOString().split('T')[0]);
                    setTempTo(today.toISOString().split('T')[0]);
                  }}
                  className="py-1.5 px-2 text-xs border border-gray-200 rounded 
                    hover:bg-gray-50 text-gray-700"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date();
                    monthAgo.setMonth(today.getMonth() - 1);
                    
                    setTempFrom(monthAgo.toISOString().split('T')[0]);
                    setTempTo(today.toISOString().split('T')[0]);
                  }}
                  className="py-1.5 px-2 text-xs border border-gray-200 rounded 
                    hover:bg-gray-50 text-gray-700"
                >
                  Last 30 days
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Animation */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;