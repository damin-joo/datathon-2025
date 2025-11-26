import Link from "next/link";
import { languages, topNavItems } from "./constants";

type AudienceBarProps = {
  activeLanguage: string;
  onLanguageChange: (code: string) => void;
};

export default function AudienceBar({ activeLanguage, onLanguageChange }: AudienceBarProps) {
  return (
    <nav
      className="h-10 flex items-center justify-between px-10 bg-emerald-950 text-white text-xs tracking-widest"
      aria-label="Audience"
    >
      <div className="flex gap-6">
        {topNavItems.map((item) => (
          <Link key={item.name} href={item.href} className="uppercase text-white/80 hover:text-white">
            {item.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/70">Language</span>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`rounded-full border px-3 py-1 transition ${
                activeLanguage === lang.code
                  ? "bg-white text-emerald-900 border-white"
                  : "border-white/40 text-white/80 hover:text-white hover:border-white"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
