"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type GoogleSignInButtonProps = {
  flow: "login" | "signup";
  acceptedTerms?: boolean;
  onStatusChange: (message: string | null) => void;
};

export function GoogleSignInButton({ flow, acceptedTerms = true, onStatusChange }: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!acceptedTerms) {
      onStatusChange("Acepta la política de privacidad y los términos para continuar con Google.");
      return;
    }

    setIsSubmitting(true);
    onStatusChange(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("oauth", "google");
    callbackUrl.searchParams.set("flow", flow);
    callbackUrl.searchParams.set("terms_accepted", "1");

    const onboardingToken = new URLSearchParams(window.location.search).get("onboarding_token")
      ?? window.sessionStorage.getItem("momentum_onboarding_token")
      ?? window.localStorage.getItem("momentum_onboarding_token");
    if (onboardingToken) callbackUrl.searchParams.set("onboarding_token", onboardingToken);

    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });
      if (!error) return;
      setIsSubmitting(false);
      onStatusChange("No hemos podido continuar con Google. Inténtalo de nuevo.");
    } catch {
      setIsSubmitting(false);
      onStatusChange("No hemos podido continuar con Google. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#d5dbd1] bg-white px-5 py-3 text-sm font-semibold text-[#26312c] transition-colors hover:bg-[#f8faf7] disabled:opacity-60"
      >
        {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <GoogleMark />}
        {isSubmitting ? "Conectando con Google..." : "Continuar con Google"}
      </button>
      <div className="mt-5 flex items-center gap-3 text-xs text-[#819078]">
        <span className="h-px flex-1 bg-[#d9ddd3]" />
        <span>o con tu email</span>
        <span className="h-px flex-1 bg-[#d9ddd3]" />
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[18px]">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z" />
      <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 15l6.9 5.2c1.6-4.7 6-8.1 11.2-8.1Z" />
    </svg>
  );
}