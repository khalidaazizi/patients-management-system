import React from "react";

interface Column<T> {
  label: string;
  value?: (row: T) => React.ReactNode;
}

interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  emptyState?: React.ReactNode; // 👈 جدید
  page?: number;
  perPage?: number;
  renderRow?: (row: T, index: number) => React.ReactNode;
}

function CommonTable<T>({
  columns,
  data,
  emptyText,
  emptyState,
}: CommonTableProps<T>) {
  const getActionsColumn = () => columns.find((col) => col.label === "Actions");
  const getOtherColumns = () =>
    columns.filter((col) => col.label !== "Actions");

  return (
    <div className="w-full">
      {/* ================= DESKTOP TABLE (TEST STYLE) ================= */}
      <div className="hidden lg:block bg-white rounded-t-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Header */}
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-00 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
                    {emptyState ? (
                      emptyState
                    ) : (
                      <p className="text-gray-500">{emptyText}</p>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.label} className="px-6 py-4">
                        {col.value?.(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {data.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
            {emptyState ? (
              emptyState
            ) : (
              <p className="text-gray-500">{emptyText}</p>
            )}
          </div>
        ) : (
          data.map((row, index) => {
            const actionsColumn = getActionsColumn();
            const otherColumns = getOtherColumns();

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header: شماره یا نام آیتم */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {(() => {
                        const nameCol = columns.find((c) =>
                          ["Name", "Patient Name", "Title"].includes(c.label)
                        );
                        return nameCol?.value?.(row) || `Item ${index + 1}`;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  {otherColumns
                    .filter(
                      (col) =>
                        !["Name", "Patient Name", "Title"].includes(col.label)
                    )
                    .map((col) => (
                      <div
                        key={col.label}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-600">
                          {col.label}
                        </span>
                        <span className="text-sm text-gray-900 text-right">
                          {col.value?.(row)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Actions */}
                {actionsColumn && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {actionsColumn.value?.(row)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CommonTable;
