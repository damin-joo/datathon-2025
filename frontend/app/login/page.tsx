"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [submitting, setSubmitting] = useState(false);

  const handleCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (mode === "signin") {
        const result = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (result?.error) {
          setMessage(result.error);
          setMessageTone("error");
        } else {
          setMessage(null);
          router.push("/");
          router.refresh();
        }
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          setMessage(payload?.error ?? "Unable to create account");
          setMessageTone("error");
        } else {
          setMessage("Account created. You can sign in now.");
          setMessageTone("success");
          setMode("signin");
        }
      }
    } catch (err: any) {
      setMessage(err?.message ?? "Something went wrong");
      setMessageTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Login to EcoSpend</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">
              {error === "OAuthSignin" && "Error connecting to Google. Check your credentials."}
              {error === "OAuthCallback" && "Error with Google callback. Make sure redirect URI is configured."}
              {error === "OAuthCreateAccount" && "Could not create account."}
              {error === "EmailSignInError" && "Email signin error."}
              {error === "CredentialsSignin" && "Invalid credentials."}
              {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailSignInError", "CredentialsSignin"].includes(error) && error}
            </p>
          </div>
        )}

        {message && (
          <div
            className={`px-4 py-3 rounded text-sm ${
              messageTone === "success"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <button
            type="button"
            className={`rounded-full border px-4 py-2 font-medium ${
              mode === "signin" ? "border-emerald-600 text-emerald-700" : "border-neutral-200 text-neutral-500"
            }`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-full border px-4 py-2 font-medium ${
              mode === "signup" ? "border-emerald-600 text-emerald-700" : "border-neutral-200 text-neutral-500"
            }`}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleCredentials} className="space-y-4 text-left">
          {mode === "signup" && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="Ava, Liam, etc."
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">
              Email or username
            </label>
            <input
              id="email"
              type="text"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="guest_alpha or guest_alpha@demo.ecocard"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="relative text-xs text-neutral-400">
          <span className="bg-white px-2">or continue with</span>
          <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-neutral-200" aria-hidden />
        </div>

        <button
          onClick={() => signIn("google", { redirect: true, callbackUrl: "/" })}
          className="w-full py-3 bg-[#22c55e] text-white font-semibold rounded-lg hover:bg-[#1b9d4b] transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 px-4 py-12 flex items-center justify-center text-neutral-500">
          Preparing login experience…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
