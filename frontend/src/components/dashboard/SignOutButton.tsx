"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useT();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
      <LogOutIcon className="size-4" />
      <span className="hidden sm:inline">{t.header.signOut}</span>
    </Button>
  );
}
