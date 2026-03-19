import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500 rounded-3xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
