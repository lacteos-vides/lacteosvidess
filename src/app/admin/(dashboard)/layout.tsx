import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToastProvider } from "@/components/ui/toast";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100">
        <AdminHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
