import Link from "next/link";
import { languages, topNavItems } from "./constants";

type MobileUtilityBarProps = {
  activeLanguage: string;
  onLanguageChange: (code: string) => void;
};

export default function MobileUtilityBar({ activeLanguage, onLanguageChange }: MobileUtilityBarProps) {
  return (
    <nav
      className="md:hidden fixed top-0 left-0 right-0 h-12 bg-emerald-950 text-white text-xs flex items-center justify-between px-4 z-50"
      aria-label="Global mobile"
    >
      <div className="flex gap-4">
        {topNavItems.map((item) => (
          <Link key={item.name} href={item.href} className="uppercase tracking-widest text-[0.55rem] text-white/80">
            {item.name}
          </Link>
        ))}
      </div>
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLanguageChange(lang.code)}
            className={`px-2 py-0.5 rounded-full border text-[0.6rem] ${
              activeLanguage === lang.code ? "bg-white text-emerald-900" : "border-white/50 text-white/80"
            }`}
          >
            {lang.code}
          </button>
        ))}
      </div>
    </nav>
  );
}
