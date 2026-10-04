import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const onboardingToken = requestUrl.searchParams.get("onboarding_token");
  const isGoogleOAuth = requestUrl.searchParams.get("oauth") === "google";
  const flow = requestUrl.searchParams.get("flow");
  const termsAccepted = requestUrl.searchParams.get("terms_accepted") === "1";

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Unable to exchange Supabase confirmation code", error.message);
      const message = isGoogleOAuth
        ? "No hemos podido completar el acceso con Google. Inténtalo de nuevo."
        : "No se pudo confirmar el enlace. Solicita un correo nuevo e inténtalo otra vez.";
      return NextResponse.redirect(new URL(`/login?confirmed=0&error=${encodeURIComponent(message)}`, requestUrl.origin));
    }

    const authUser = sessionData.session?.user;
    if (isGoogleOAuth && (flow === "login" || flow === "signup") && termsAccepted && authUser) {
      const metadata = authUser.user_metadata ?? {};
      const providerName = [metadata.given_name, metadata.family_name]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .join(" ") || [metadata.full_name, metadata.name].find((value): value is string => typeof value === "string" && value.trim().length > 0);
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          ...metadata,
          name: typeof metadata.name === "string" && metadata.name.trim() ? metadata.name : providerName ?? "Usuario Atempo Fit",
          accepted_terms: true,
          consent_version: "1.0",
          consent_language: "es",
        },
      });
      if (metadataError) {
        console.error("Unable to save Google account metadata", metadataError.message);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("No hemos podido completar el acceso con Google. Inténtalo de nuevo.")}`, requestUrl.origin));
      }
    }

    if (onboardingToken && authUser?.id) {
      const db = createAdminClient();
      const tokenHash = createHash("sha256").update(onboardingToken).digest("hex");
      await db.from("onboarding_sessions").update({ auth_user_id: authUser.id }).eq("session_token_hash", tokenHash).in("status", ["completed", "converted"]);
    }
  } else {
    const providerError = requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_description");
    const message = isGoogleOAuth || providerError
      ? "No hemos podido completar el acceso con Google. Inténtalo de nuevo."
      : "El enlace de confirmación está incompleto o ha caducado.";
    return NextResponse.redirect(new URL(`/login?confirmed=0&error=${encodeURIComponent(message)}`, requestUrl.origin));
  }

  const loginUrl = new URL(isGoogleOAuth ? "/login?oauth=1" : "/login?confirmed=1", requestUrl.origin);
  const response = NextResponse.redirect(loginUrl);
  if (onboardingToken) {
    response.cookies.set("momentum_onboarding_token", onboardingToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
  return response;
}
