import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BotIcon } from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";
import ApiKeyModal from "@/components/dashboard/ApiKeyModal";
import NavLinks from "@/components/dashboard/NavLinks";

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
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <BotIcon className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">AI Worker Maker</span>
            </Link>
            <NavLinks />
          </div>
          <div className="flex items-center gap-3">
            <ApiKeyModal />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
