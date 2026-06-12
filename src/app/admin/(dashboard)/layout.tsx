import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionExpired,
} from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { SessionGuard } from "@/components/auth/session-guard";
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

  const cookieStore = await cookies();
  const sessionStart = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (isAdminSessionExpired(sessionStart)) {
    await supabase.auth.signOut();
    redirect("/admin/login?reason=session_expired");
  }

  return (
    <ToastProvider>
      <SessionGuard />
      <div className="min-h-screen bg-slate-100">
        <AdminHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
