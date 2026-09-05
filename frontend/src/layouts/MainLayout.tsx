import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  );
}