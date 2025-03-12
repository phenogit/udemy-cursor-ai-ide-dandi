import { useState, useCallback } from "react";

export function useNotification(duration = 3000) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    (message, type = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), duration);
    },
    [duration]
  );

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    clearNotification,
  };
}
