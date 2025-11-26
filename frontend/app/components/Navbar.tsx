"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import AudienceBar from "./navigation/AudienceBar";
import BrandBar from "./navigation/BrandBar";
import ServicesBar from "./navigation/ServicesBar";
import MobileUtilityBar from "./navigation/MobileUtilityBar";
import MobileBottomNav from "./navigation/MobileBottomNav";

export default function Nav() {
  const pathname = usePathname();
  const [activeLanguage, setActiveLanguage] = useState("EN");

  return (
    <>
      {/* Desktop stacked navigation (web only) */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <AudienceBar activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage} />
        <BrandBar />
        <ServicesBar pathname={pathname} />
      </div>

      {/* Spacer to offset fixed desktop navs */}
      <div className="hidden md:block h-44" aria-hidden="true" />

      <MobileUtilityBar activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage} />

      <MobileBottomNav pathname={pathname} />
    </>
  );
}
