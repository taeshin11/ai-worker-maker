"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Company" },
  { href: "/workspace", label: "Workspace" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith(href)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
