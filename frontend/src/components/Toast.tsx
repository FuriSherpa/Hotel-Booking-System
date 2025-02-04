import { useEffect } from "react";
import { X } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles =
    type === "success"
      ? "bg-green-600 border-l-4 border-green-800"
      : "bg-red-600 border-l-4 border-red-800";

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-md flex items-center gap-3 transition-all duration-300 transform animate-fade-in ${styles}`}
    >
      <span className="text-lg font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:opacity-75">
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;