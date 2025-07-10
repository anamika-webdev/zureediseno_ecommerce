// src/app/dashboard/admin/layout.tsx - Simplified admin layout (remove this file or make it minimal)
// Since we're using the main dashboard layout, this file should be minimal or removed entirely

import { ReactNode } from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The main dashboard layout handles all the authentication and sidebar
  // This layout is just a pass-through for admin routes
  return <>{children}</>;
}