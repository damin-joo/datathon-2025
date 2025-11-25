"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Target,
  Medal,
  ListOrdered,
} from "lucide-react";
import UserMenu from "./ui/UserMenu";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Ranking", href: "/ranking", icon: Medal },
  { name: "Transactions", href: "/transactions", icon: ListOrdered },
  { name: "Scoring", href: "/scoring", icon: BarChart3 },
  { name: "Goals", href: "/goals", icon: Target },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop TOP NAV */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 border-b border-neutral-200 bg-white px-8 items-center justify-between z-50">
        {/* Logo */}
        <div className="text-xl font-bold tracking-tight">
          EcoCard
        </div>

        {/* Nav Links */}
        <div className="flex gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-neutral-900 border-b-2 border-neutral-900 pb-1"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User menu / settings */}
        <UserMenu />
      </nav>

      {/* Mobile BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-3 flex justify-around z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs transition ${
                active ? "text-black font-medium" : "text-neutral-500"
              }`}
            >
              <Icon size={22} className="mb-1" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
