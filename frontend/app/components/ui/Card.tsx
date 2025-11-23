"use client";

interface CardProps {
  title?: string;
  value?: string | number | React.ReactNode;
  children?: React.ReactNode;
}

export default function Card({ title, value, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 space-y-3 transition hover:shadow-md">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-800 tracking-tight">
          {title}
        </h3>
      )}

      {value !== undefined && (
        <div className="text-3xl font-bold text-neutral-900">
          {value}
        </div>
      )}

      {children && <div>{children}</div>}
    </div>
  );
}