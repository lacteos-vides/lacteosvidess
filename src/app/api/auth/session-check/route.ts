import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionExpired,
} from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionStart = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expired = isAdminSessionExpired(sessionStart);

  if (!user || expired) {
    if (user) {
      await supabase.auth.signOut();
    }

    const response = NextResponse.json({ ok: false, expired: true }, { status: 401 });
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  return NextResponse.json({ ok: true });
}
