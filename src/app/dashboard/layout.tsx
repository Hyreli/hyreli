import { DashboardSidebar, DashboardTopBar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="lg:hidden h-14" />
        <DashboardTopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
