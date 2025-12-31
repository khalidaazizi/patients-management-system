// components/Pagination.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

interface PaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>; // <-- این را تغییر بده
  perPage: number;
  setPerPage: React.Dispatch<React.SetStateAction<number>>; // برای consistency
  total: number;
  optionsPerPage?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  setPage,
  perPage,
  setPerPage,
  total,
  optionsPerPage = [10, 25, 50],
  className = "",
}) => {
  const pages = Math.ceil(total / perPage);


  return (
    <div
      className={`mt-2 rounded  md:rounded-none md:rounded-b-md lg:mt-0 lg:rounded-0 md:flex items-center bg-white  justify-between p-4 ${className}`}
    >
      <div className="text-[#009b8c] mb-5 md:mb-0">
        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of{" "}
        {total} items
      </div>

      <div className="flex items-center justify-end  ">
        
           <CustomSelect
          selected={perPage}
          setSelected={(value) => {
            setPerPage(Number(value));
            setPage(1); // Reset to first page on perPage change
          }}
          options={optionsPerPage}
          upArrow={true}
          downArrow={false}
          className=" w-25  h-8 "
        />
      

        <div className="flex items-center ">
         <button
  disabled={page <= 1}
  onClick={() => setPage((p) => Math.max(1, p - 1))}
  className={`p-2 border rounded transition-all duration-200 ${
    page <= 1
      ? "text-gray-400 border-gray-300 cursor-not-allowed"
      : "hover:bg-[#038a7c] hover:text-white border-[#038a7c]"
  }`}
>
  <ChevronLeft className="w-4 h-4" />
</button>


          <div className="px-3 font-medium ">
            {page} / {pages || 1}
          </div>

          <button
            disabled={page === pages || pages === 0}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className={`p-2 border rounded transition-all duration-200 ${
              page === pages || pages === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "hover:bg-[#038a7c] hover:text-white border-[#038a7c]"
            }`}
          >
            <ChevronRight
              className={`w-4 h-4 ${
                page === pages || pages === 0
                  ? "text-gray-400"
                  : "group-hover:text-white"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
