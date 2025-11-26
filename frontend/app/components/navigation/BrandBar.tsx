"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import UserMenu from "../ui/UserMenu";

export default function BrandBar() {
    const { data: session } = useSession();

    return (
        <nav
        className="relative z-20 h-24 flex items-center justify-between gap-10 px-12 bg-white/95 backdrop-blur border-b border-white/70 shadow-sm"
        aria-label="Brand"
        >
        <Link href="/" className="flex items-center gap-6 group">
            <div className="leading-tight">
                <h1 className="font-brand text-5xl font-semibold uppercase tracking-[0.35em] text-green-700">Greener</h1>
            </div>
        </Link>

        <form className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-8" role="search">
            <div className="relative">
                <input
                    type="search"
                    placeholder="Search sustainability insights"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-6 pr-40 text-base text-neutral-800 shadow-inner focus:border-emerald-500 focus:outline-none"
                />
                <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 p-3 text-white shadow"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>
        </form>

        <div className="flex items-center gap-5">
            {!session && (
                <Link
                href="/login"
                className="rounded-full border border-emerald-600 px-6 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                Log In
                </Link>
            )}
            <UserMenu />
        </div>
        </nav>
    );
}
