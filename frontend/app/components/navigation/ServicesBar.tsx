"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { navItems } from "./constants";

type ServicesBarProps = {
  pathname: string;
};

export default function ServicesBar({ pathname }: ServicesBarProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverItem = useMemo(() => navItems.find((item) => item.name === hovered), [hovered]);

  return (
    <div className="relative z-10" onMouseLeave={() => setHovered(null)}>
      <nav
        className="h-14 flex items-center justify-center gap-10 bg-white border-y border-neutral-100 shadow"
        aria-label="Services"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          const highlight = active || hovered === item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHovered(item.name)}
              onFocus={() => setHovered(item.name)}
              className={`flex flex-col items-center text-normal tracking-wide transition border-b-2 pb-1 ${
                highlight ? "text-emerald-700 border-emerald-500" : "text-neutral-500 border-transparent hover:text-neutral-800"
              }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {hoverItem?.submenu && hoverItem.submenu.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 border-y border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-4 p-8 gap-6">
            <div className="sm:col-span-1 border-r border-neutral-100 pr-4">
              <p className="text-base font-bold uppercase tracking-wide text-neutral-600">{hoverItem.name}</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-1">Explore</p>
            </div>
            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {hoverItem.submenu.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className="px-5 py-3 text-base font-normal text-neutral-800 hover:text-emerald-800 hover:bg-emerald-50 transition"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
