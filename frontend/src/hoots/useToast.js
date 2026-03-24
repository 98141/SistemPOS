import { useCallback, useEffect, useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      clearToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.message, clearToast]);

  return {
    toast,
    showToast,
    clearToast,
  };
};