"use client";

import React, { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`transition-all duration-300 min-h-screen ${
          collapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
