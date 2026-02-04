import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-800/50" />}>
      <LoginForm />
    </Suspense>
  );
}
