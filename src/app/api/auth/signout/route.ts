import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const redirectUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(redirectUrl, 302);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
