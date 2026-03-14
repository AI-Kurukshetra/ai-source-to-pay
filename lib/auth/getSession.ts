import type { Session } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

type SessionResult = {
  session: Session | null;
  role: UserRole | null;
};

export async function getSession(): Promise<SessionResult> {
  const supabase = await createClient();
  const [
    {
      data: { session },
    },
    {
      data: { user },
    },
  ] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

  if (!session || !user) {
    return { session: null, role: null };
  }

  const metadataRole = user.user_metadata?.role as UserRole | undefined;
  return { session, role: metadataRole ?? null };
}
