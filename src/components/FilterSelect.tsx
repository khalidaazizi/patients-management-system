// import { useState } from "react";
// import { ChevronUp, ChevronDown } from "lucide-react";

// interface FilterSelectProps {
//   value: string;
//   onChange: (v: string) => void;
//   options: string[];
//   icon?: React.ReactNode;
//   width?: string;
// }

// const FilterSelect: React.FC<FilterSelectProps> = ({
//   value,
//   onChange,
//   options,
//   icon,
//   width = "7rem",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleArrowClick = (direction: "up" | "down") => {
//     const index = options.indexOf(value);
//     if (direction === "up" && index > 0) {
//       onChange(options[index - 1]);
//     } else if (direction === "down" && index < options.length - 1) {
//       onChange(options[index + 1]);
//     }
//   };

//   return (
//     <div className="relative" style={{ width }}>
//       {/* main box */}
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         className="bg-white h-10 flex justify-between items-center rounded shadow cursor-pointer"
//       >
//         <span className="capitalize text-sm pl-1 flex items-center gap-1 text-gray-700">
//           {icon && <span className="mt-0.5">{icon}</span>}
//           {value}
//         </span>

//         <div className="flex flex-col items-center p-1">
//           <ChevronUp
//             className="w-3 h-3 text-gray-900 hover:text-cyan-700 cursor-pointer"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleArrowClick("up");
//             }}
//           />
//           <ChevronDown
//             className="w-3 h-3 text-gray-900 hover:text-cyan-700 cursor-pointer"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleArrowClick("down");
//             }}
//           />
//         </div>
//       </div>

//       {/* dropdown list */}
//       {isOpen && (
//         <div className="absolute left-0 mt-1 w-full bg-white rounded shadow z-20 max-h-48 overflow-auto">
//           {options.map((option) => (
//             <div
//               key={option}
//               className={`p-2 cursor-pointer capitalize hover:bg-cyan-50 ${
//                 option === value ? "text-cyan-700 font-medium" : "text-gray-700"
//               }`}
//               onClick={() => {
//                 onChange(option);
//                 setIsOpen(false);
//               }}
//             >
//               {option}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterSelect;
