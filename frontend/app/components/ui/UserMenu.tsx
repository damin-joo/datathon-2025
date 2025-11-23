"use client";

import { useState } from "react";
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
        <span className="hidden md:inline">{session.user?.name}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-10">
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}