"use client";

import type { CoachingAckAction, CoachingSuggestion } from "../../types/coaching";

type AckState = CoachingAckAction | "pending" | "error" | undefined;

type CoachingSuggestionsProps = {
  suggestions: CoachingSuggestion[];
  ackStatuses: Record<string, AckState>;
  onAction?: (suggestionId: string, action: CoachingAckAction) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
};

const badgeStyles: Record<string, { label: string; className: string }> = {
  good: { label: "Low impact", className: "bg-emerald-50 text-emerald-700" },
  neutral: { label: "Moderate impact", className: "bg-amber-50 text-amber-800" },
  bad: { label: "High impact", className: "bg-rose-50 text-rose-700" },
};

const statusCopy: Record<Exclude<AckState, undefined>, string> = {
  pending: "Recording...",
  accepted: "Added to your plan",
  dismissed: "Dismissed",
  error: "Something went wrong — try again",
};

const getStatusLabel = (state: AckState) =>
  state ? statusCopy[state as Exclude<AckState, undefined>] : undefined;

export default function CoachingSuggestions({
  suggestions,
  ackStatuses,
  onAction,
  loading,
  error,
}: CoachingSuggestionsProps) {
  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-neutral-500">Loading coaching tips…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && !hasSuggestions && (
        <p className="text-sm text-neutral-500">Log a few purchases to unlock personalized coaching guidance.</p>
      )}

      {suggestions.map((suggestion) => {
        const badge = badgeStyles[suggestion.env_label] ?? badgeStyles.neutral;
        const state = ackStatuses[suggestion.suggestion_id];
        const savings = Number(suggestion.estimated_savings_kg ?? 0);
        const statusLabel = getStatusLabel(state);

        return (
          <article
            key={suggestion.suggestion_id}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{suggestion.title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{suggestion.description}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
              {suggestion.category_name && (
                <span className="rounded-full bg-white px-3 py-1 border border-neutral-200 text-neutral-600">
                  {suggestion.category_name}
                </span>
              )}
              <span>{savings.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg CO₂e</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm items-center">
              {state && state !== "error" && state !== "pending" && statusLabel ? (
                <span className="text-emerald-700 font-medium">{statusLabel}</span>
              ) : (
                <>
                  <button
                    className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60"
                    disabled={state === "pending"}
                    onClick={() => onAction?.(suggestion.suggestion_id, "accepted")}
                  >
                    I'll try this
                  </button>
                  <button
                    className="rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
                    disabled={state === "pending"}
                    onClick={() => onAction?.(suggestion.suggestion_id, "dismissed")}
                  >
                    Skip for now
                  </button>
                </>
              )}
              {(state === "pending" || state === "error") && statusLabel && (
                <span
                  className={`text-xs ${state === "error" ? "text-rose-600" : "text-neutral-500"} ml-auto`}
                >
                  {statusLabel}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
