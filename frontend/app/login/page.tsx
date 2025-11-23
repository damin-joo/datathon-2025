"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md space-y-6 text-center">
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
