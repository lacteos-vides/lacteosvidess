import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Imagen de fondo: móvil = LAST VERSION, escritorio = BANNER */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] scale-105 md:hidden"
          style={{ backgroundImage: "url('/brand/LAST%20VERSION%20VIDES%20BRAND.png')" }}
        />
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat blur-[2px] scale-105 md:block"
          style={{ backgroundImage: "url('/brand/BANNER%20PARA%20IMPRESION2.png')" }}
        />
        <div className="absolute inset-0 bg-slate-900/60" />
      </div>
      <div className="relative z-10 w-full flex justify-center px-4 py-8">{children}</div>
    </div>
  );
}
