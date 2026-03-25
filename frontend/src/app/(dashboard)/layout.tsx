import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotIcon, DownloadIcon } from "lucide-react";
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
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
            <Link
              href="/download"
              className="hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <DownloadIcon className="size-3.5" />
              Free Local
            </Link>
            <LanguageToggle />
            <ConnectionModal />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
