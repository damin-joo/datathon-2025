"use client";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 mt-10">
      <p>© {new Date().getFullYear()} EcoCard. All rights reserved.</p>
      <p className="mt-1">
        Built for the <span className="font-medium text-neutral-700">Sheridan Datathon</span>.
      </p>
    </footer>
  );
}
