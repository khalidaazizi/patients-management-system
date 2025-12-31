// components/DeleteModal.tsx
import  { useState } from "react";
import { IoClose } from "react-icons/io5";
import api from "../services/api"; // axios instance
import { useToast } from "../hooks/useToast";
interface DeleteModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  target: T | null;
  getName: (item: T) => string; // تابع برای گرفتن نام رکورد
  deleteEndpoint: (id: number | string) => string; // مسیر API
  onDeleteSuccess: (id: number | string) => void; // پاک کردن از state
}
interface HasId {
  id: number | string;
}

function DeleteModal<T extends HasId>({
  isOpen,
  onClose,
  target,
  getName,
  deleteEndpoint,
  onDeleteSuccess,
}: DeleteModalProps<T>) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  if (!isOpen || !target) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(deleteEndpoint(target.id));
      onDeleteSuccess(target.id);
      success("Deleted successfully ✅");
      onClose();
    } catch (err) {
      console.error(err);
      error("Delete failed ❌");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="bg-white rounded shadow p-6 z-10 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Confirm Delete</h3>
          <button onClick={onClose} disabled={loading}>
            <IoClose size={20} />
          </button>
        </div>
        <p className="text-gray-600">
          Are you sure you want to delete{" "}
          <strong>{getName(target)}</strong>?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-2  text-white rounded hover:bg-[#027a6c] disabled:opacity-50 bg-gradient-to-r from-red-600 to-red-500"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
