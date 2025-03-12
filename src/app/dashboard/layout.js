"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-0" : "ml-[-256px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
