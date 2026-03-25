"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuildingIcon, MessageSquareIcon } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Company", icon: BuildingIcon },
  { href: "/workspace", label: "Workspace", icon: MessageSquareIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
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
