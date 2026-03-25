"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuildingIcon, MessageSquareIcon, LightbulbIcon } from "lucide-react";
import { useT } from "@/lib/i18n/context";

export default function NavLinks() {
  const pathname = usePathname();
  const { t } = useT();

  const links = [
    { href: "/dashboard", label: t.nav.company, icon: BuildingIcon },
    { href: "/workspace", label: t.nav.workspace, icon: MessageSquareIcon },
    { href: "/onboard", label: t.nav.vision, icon: LightbulbIcon },
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
