import Link from "next/link";
import { navItems } from "./constants";

type MobileBottomNavProps = {
  pathname: string;
};

export default function MobileBottomNav({ pathname }: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 py-3 flex justify-around z-50"
      aria-label="Mobile"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-[0.7rem] font-medium transition ${
              active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span
              className={`mb-1 flex h-9 w-9 items-center justify-center rounded-full border ${
                active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"
              }`}
            >
              <Icon size={18} />
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
