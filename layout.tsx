
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import NotificationHandler from "@/components/dashboard/NotificationHandler";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NotificationHandler />
      <DashboardSidebar />
      <SidebarInset className="bg-background flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
