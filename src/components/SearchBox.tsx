// components/SearchBox.tsx
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { IoClose } from "react-icons/io5";

interface SearchBoxProps {
  query: string;
  setQuery: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  placeholder?: string;
 
}

export default function SearchBox({
  query,
  setQuery,
  open,
  setOpen,
  placeholder = "Search...",

}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const toggleSearch = () => {
    if (!open) {
      setOpen(true);
    } else if (query === "") {
      setOpen(false);
    } else {
      setQuery("");
    }
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-full border transition-all duration-300 ${
        open
          ? "bg-white px-3 py-1 shadow-md border-gray-300"
          : "cursor-pointer hover:bg-gray-100 hover:text-cyan-700 p-2 border-transparent"
      }`}
    >
      <button
        onClick={toggleSearch}
        className="flex items-center justify-center p-1 rounded-full transition"
      >
        {open && query.length > 0 ? <IoClose className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`bg-transparent text-sm outline-none transition-all duration-300 ${
          open ? "w-40 md:w-60 opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
