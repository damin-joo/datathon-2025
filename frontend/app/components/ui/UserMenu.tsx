"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 hover:bg-neutral-200 transition"
      >
        <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white font-bold">
          {session.user?.name?.[0]}
        </span>
        <span className="hidden md:inline">Hello, {session.user?.name}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-10">
          <div className="py-2">
            {["/dashboard", "/goals", "/ranking", "/scoring", "/transactions"].map((href) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                onClick={() => setOpen(false)}
              >
                {href === "/dashboard" && "Dashboard"}
                {href === "/goals" && "Goals"}
                {href === "/ranking" && "Ranking"}
                {href === "/scoring" && "Scoring"}
                {href === "/transactions" && "Transactions"}
              </Link>
            ))}
          </div>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 border-t border-neutral-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}