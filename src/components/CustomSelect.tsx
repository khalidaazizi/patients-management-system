import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Check } from "lucide-react";

interface CustomSelectProps<T extends string | number> {
  selected: T;
  setSelected: (value: T) => void;
  options: T[];
  width?: string;
  leadingIcon?: React.ReactNode;
  className?: string;
  upArrow?: boolean;
  downArrow?: boolean;
  rotateOnOpen?: boolean;
  variant?: "default" | "minimal";
}

const CustomSelect = <T extends string | number>({
  selected,
  setSelected,
  options,
  width = "w-40",
  leadingIcon,
  className = "",
  upArrow = false,
  downArrow = true,
  rotateOnOpen = true,
  variant = "default",
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 150 && spaceAbove > 150) {
      setOpenDirection("up");
    } else {
      setOpenDirection("down");
    }

    setIsOpen((prev) => !prev);
  };

  const handleChange = (value: T) => {
    setSelected(value);
    setIsOpen(false);
  };

  const handleArrowNavigation = (direction: "up" | "down") => {
    // Only allow arrow navigation if both arrows are enabled
    if (!(upArrow && downArrow)) {
      // اگر هر دو arrow نیستند، dropdown را باز کن
      return;
    }

    const currentIndex = options.indexOf(selected);
    
    // Prevent navigation if already at the limit
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === options.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    setSelected(options[newIndex]);
  };

  // اگر فقط یک arrow داریم، آن arrow باید dropdown را باز کند
  const handleSingleArrowClick = (e: React.MouseEvent, arrowType: "up" | "down") => {
    e.stopPropagation();
    
    // اگر هر دو arrow فعال نیستند، dropdown را باز کن
    if (!(upArrow && downArrow)) {
      // محاسبه جهت برای dropdown
      const rect = e.currentTarget.closest('div[role="button"]')?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < 150 && spaceAbove > 150) {
          setOpenDirection("up");
        } else {
          setOpenDirection("down");
        }
      }
      setIsOpen(true);
      return;
    }
    
    // اگر هر دو arrow فعال هستند، navigation انجام بده
    handleArrowNavigation(arrowType);
  };

  // Variant styles
  const buttonStyles = {
    default: `bg-white border-2 border-[#0195868d] 
      hover:shadow-md ${isOpen ? "border-[#0195868d] ring-2 ring-[#0195868d]/20" : ""}`,
    minimal: `bg-gray-50 border border-gray-300 hover:border-teal-500 
      ${isOpen ? "border-teal-500 bg-white" : ""}`,
  };

  const iconColor = variant === "default" ? "text-gray-500" : "text-gray-600";
  const hoverColor = variant === "default" ? "hover:text-teal-600" : "hover:text-teal-700";

  return (
    <div className={`relative inline-block border-[#0195868d] ${width}`} ref={dropdownRef}>
      {/* Select Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleDropdown}
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown(e as any)}
        className={`flex justify-between items-center rounded-lg cursor-pointer 
          transition-all duration-200 group select-none ${buttonStyles[variant]} ${className}`}
        style={{ minHeight: "2.25rem" }}
      >
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          {leadingIcon && (
            <div className={`${iconColor} ${hoverColor} transition-colors`}>
              {leadingIcon}
            </div>
          )}
          <span className={`text-sm font-medium capitalize truncate ${
            variant === "default" ? "text-gray-700" : "text-gray-800"
          }`}>
            {selected}
          </span>
        </div>

        <div className="flex flex-col items-center px-2 border-l border-gray-200">
          {upArrow && (
            <div 
              className="cursor-pointer"
              onClick={(e) => handleSingleArrowClick(e, "up")}
            >
              <ChevronUp
                className={`w-3.5 h-3.5 ${iconColor} ${hoverColor} transition-all ${
                  rotateOnOpen && isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          )}
          {downArrow && (
            <div 
              className="cursor-pointer"
              onClick={(e) => handleSingleArrowClick(e, "down")}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 ${iconColor} ${hoverColor} transition-all ${
                  rotateOnOpen && isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute bg-white rounded-lg shadow-lg border border-gray-200 
            z-50 overflow-hidden min-w-full ${
              openDirection === "down" 
                ? "mt-1 top-full animate-fadeInDown" 
                : "bottom-full mb-1 animate-fadeInUp"
            }`}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.toString()}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150 
                  flex items-center justify-between
                  ${option === selected
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => handleChange(option)}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    option === selected ? "bg-teal-500" : "bg-transparent"
                  }`} />
                  <span className="capitalize truncate">{option}</span>
                </div>
                
                {option === selected && (
                  <Check className="h-3.5 w-3.5 text-teal-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

     

      {/* Animations */}
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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomSelect;



