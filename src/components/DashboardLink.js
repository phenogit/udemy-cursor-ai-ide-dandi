"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Notification from "./Notification";

export default function DashboardLink({ className }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showNotification, setShowNotification] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (!session) {
      setShowNotification(true);
      // Auto-hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    } else {
      router.push("/dashboard");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(e);
    }
  };

  return (
    <>
      <a
        href="/dashboard"
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        role="button"
        tabIndex={0}
        className={className}
      >
        API Keys Dashboard
      </a>
      {showNotification && (
        <Notification
          message="Please sign in to access the dashboard"
          type="error"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}
