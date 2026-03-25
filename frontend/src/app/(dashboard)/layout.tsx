import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotIcon } from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";
import ConnectionModal from "@/components/dashboard/ConnectionModal";
import NavLinks from "@/components/dashboard/NavLinks";
import LanguageToggle from "@/components/dashboard/LanguageToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header
        style={{ height: 56, flexShrink: 0 }}
        className="z-50 border-b bg-background w-full"
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <BotIcon className="size-4" />
              </div>
              <span className="hidden sm:inline font-bold text-sm tracking-tight">AI Worker Maker</span>
            </Link>
            <NavLinks />
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ConnectionModal />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</main>
    </div>
  );
}
