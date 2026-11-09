"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ScanFace,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { FaceCapture } from "@/components/FaceCapture";
import { useDemoUser } from "@/lib/session";
import { roleForEmail } from "@/lib/roles";
import { TEST_ACCOUNTS } from "@/lib/testAccounts";
import {
  FaceTwoFactorRequiredError,
  clearStoredPendingToken,
  completeFacePending,
  faceLogin,
  getPublicConfig,
  getStoredPendingToken,
  issueFaceChallenge,
  requestPhoneLoginOtp,
  verifyFaceSecondFactor,
  verifyPhoneLogin,
} from "@/lib/api";
import type { FaceChallenge } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const REMEMBER_KEY = "grievai.remembered-email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInDemo, login, liveMode, applyAuthResponse } = useDemoUser();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Face auth UI is gated on GET /config — hidden entirely when the backend
  // runs with FACE_AUTH_ENABLED=false (the default).
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [mode, setMode] = useState<"password" | "phone" | "face">("password");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [faceIdentifier, setFaceIdentifier] = useState("");
  const [faceFailCount, setFaceFailCount] = useState(0);
  const [faceBusy, setFaceBusy] = useState(false);
  const [challenge, setChallenge] = useState<FaceChallenge | null>(null);
  // 2FA step: entered via password login (FaceTwoFactorRequiredError)
  const [pending, setPending] = useState(
    () =>
      typeof window !== "undefined" &&
      searchParams.get("two_factor") === "face" &&
      Boolean(getStoredPendingToken())
  );

  // Initial state read lazily so the remembered email is present on the
  // very first client render. Guarded for SSR, where window is undefined.
  const [initialEmail] = useState(() =>
    typeof window === "undefined" ? "" : (window.localStorage.getItem(REMEMBER_KEY) ?? "")
  );
  const [email, setEmail] = useState(initialEmail);
  const [remember, setRemember] = useState(initialEmail !== "");

  const urlError = searchParams.get("error");
  const nextPath = searchParams.get("next") || "";
  const [error, setError] = useState<string | null>(
    urlError ? t("errSignIn", { reason: urlError }) : null
  );

  useEffect(() => {
    if (!liveMode) return;
    let mounted = true;
    void getPublicConfig().then((cfg) => {
      if (mounted && cfg.faceAuthEnabled) setFaceEnabled(true);
    });
    return () => {
      mounted = false;
    };
  }, [liveMode]);

  // Dev-only credential hint. Visible only when NEXT_PUBLIC_SHOW_DEV_CREDS
  // is "true" (local .env.local). Remove before any shared deployment.
  const showDevCreds = process.env.NEXT_PUBLIC_SHOW_DEV_CREDS === "true";

  const errText = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  /** Where a successful live sign-in lands (staff dashboards win over ?next). */
  function targetAfterLogin(role: string): string {
    const upper = role.toUpperCase();
    const staffHome =
      upper === "SUPERADMIN"
        ? "/superadmin"
        : upper === "ADMIN"
          ? "/admin"
          : upper === "RESOLVER"
            ? "/resolver"
            : null;
    const safeNext =
      nextPath.startsWith("/") && nextPath !== "/submit" ? nextPath : null;
    return staffHome ?? safeNext ?? "/submit";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError(t("errEnterCreds"));
      return;
    }
    setError(null);
    setIsSubmitting(true);

    if (remember) {
      window.localStorage.setItem(REMEMBER_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBER_KEY);
    }

    try {
      if (liveMode) {
        const user = await login(email, password);
        router.push(targetAfterLogin(user.role));
      } else {
        const role = roleForEmail(email);
        signInDemo(email, role);
        const staffHome = role === "superadmin" ? "/superadmin" : role === "resolver" ? "/resolver" : role === "admin" ? "/admin" : null;
        const safeNext = nextPath.startsWith("/") && nextPath !== "/submit" ? nextPath : null;
        router.push(staffHome ?? safeNext ?? "/submit");
      }
    } catch (err) {
      if (err instanceof FaceTwoFactorRequiredError) {
        // Password accepted; the account opted into the face step (DEC-024).
        setPending(true);
        setError(null);
      } else {
        setError(errText(err, t("errInvalidCreds")));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Phone OTP sign-in (live mode; citizens with a verified number) ───── */

  async function sendPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestPhoneLoginOtp(phone);
      setPhoneCodeSent(true);
    } catch (err) {
      setError(errText(err, t("errInvalidCreds")));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    if (phoneCode.trim().length !== 6) {
      setError(t("errOtpInvalid"));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (!liveMode) {
        setError(t("errInvalidCreds"));
        return;
      }
      const res = await verifyPhoneLogin(phone, phoneCode.trim());
      const user = applyAuthResponse(res);
      router.push(targetAfterLogin(user.role));
    } catch (err) {
      setError(errText(err, t("errInvalidCreds")));
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Face flows (live mode only, flag-gated) ─────────────────────────── */

  async function beginFaceChallenge() {
    setError(null);
    setFaceBusy(true);
    try {
      setChallenge(await issueFaceChallenge());
    } catch (err) {
      setError(errText(err, t("faceUnavailable")));
    } finally {
      setFaceBusy(false);
    }
  }

  async function startFaceSignIn() {
    if (!faceIdentifier.trim()) {
      setError(t("errEnterCreds"));
      return;
    }
    await beginFaceChallenge();
  }

  async function onFaceLoginFrames(frames: string[]) {
    if (!challenge) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await faceLogin(faceIdentifier, {
        challenge_id: challenge.challenge_id,
        frames,
      });
      const user = applyAuthResponse(res);
      clearStoredPendingToken();
      setFaceFailCount(0);
      router.push(targetAfterLogin(user.role));
    } catch (err: unknown) {
      const isMismatch = (err as { faceReason?: string })?.faceReason === "MODEL_MISMATCH";
      if (isMismatch) {
        setError(t("faceReenrollRequired"));
      } else {
        const nextFails = faceFailCount + 1;
        setFaceFailCount(nextFails);
        if (nextFails >= 3) {
          setError(t("faceMaxFailsOfficeReset"));
        } else {
          setError(errText(err, t("faceUnavailable")));
        }
      }
      // The challenge was consumed with the attempt — issue a fresh one.
      setChallenge(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onFaceVerifyFrames(frames: string[]) {
    const token = getStoredPendingToken();
    if (!challenge || !token) {
      setPending(false);
      setError(t("errSignIn", { reason: "session expired" }));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await verifyFaceSecondFactor(
        { challenge_id: challenge.challenge_id, frames },
        token
      );
      clearStoredPendingToken();
      const user = applyAuthResponse(res);
      router.push(targetAfterLogin(user.role));
    } catch (err) {
      setError(errText(err, t("faceUnavailable")));
      setChallenge(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Skip path: /auth/complete-pending only succeeds once the account is
   *  locked out of the face endpoint — otherwise it answers 403 and we show
   *  that message; protected routes never accept the pending token. */
  async function skipFaceStep() {
    const token = getStoredPendingToken();
    if (!token) {
      setPending(false);
      setError(t("errSignIn", { reason: "session expired" }));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await completeFacePending(token);
      clearStoredPendingToken();
      const user = applyAuthResponse(res);
      router.push(targetAfterLogin(user.role));
    } catch (err) {
      setError(errText(err, t("faceUnavailable")));
    } finally {
      setIsSubmitting(false);
    }
  }

  function backToSignIn() {
    clearStoredPendingToken();
    setPending(false);
    setChallenge(null);
    setError(null);
  }

  const faceActionPanel = challenge ? (
    <FaceCapture
      key={challenge.challenge_id}
      action={challenge.action}
      onCapture={pending ? onFaceVerifyFrames : onFaceLoginFrames}
      disabled={isSubmitting}
      verifying={isSubmitting}
      onCancel={() => {
        setChallenge(null);
        setError(null);
      }}
    />
  ) : null;

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "bg-white text-ink-950 shadow-xs ring-1 ring-ink-200"
        : "text-ink-500 hover:text-ink-800"
    }`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-3 py-4 sm:px-6 sm:py-8">
      <div className="w-full max-w-4xl rounded-lg border border-ink-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/civora-logo.png"
                alt="CIVORA Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain shrink-0"
                priority
              />
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-teal-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800 ring-1 ring-teal-200">
                <ShieldCheck size={12} strokeWidth={2} />
                {t("securePortal")}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-950">
              {pending ? t("faceTwoFactorTitle") : t("signIn")}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {pending
                ? t("faceTwoFactorSub")
                : liveMode
                  ? t("loginSubLive")
                  : t("loginSubDemo")}
            </p>
          </div>

          {!pending && showDevCreds && (
            <div className="mb-5 rounded-sm border border-dashed border-ink-400 bg-ink-50 p-3 text-xs text-ink-700">
              <p className="font-semibold uppercase tracking-wider text-ink-900">
                Dev test credentials
              </p>
              <p className="mt-1 text-[11px] text-ink-500">
                Seeded when the backend runs with SEED_TEST_ACCOUNTS=true.
                Click Autofill to populate the form.
              </p>
              <div className="mt-2 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                {TEST_ACCOUNTS.map((acct) => (
                  <div
                    key={acct.email}
                    className="flex items-center justify-between gap-2 border-b border-ink-200/60 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-ink-900">{acct.label}:</span>{" "}
                      <code className="font-mono text-[11px] break-all">
                        {acct.email}
                      </code>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 font-medium text-primary-700 underline hover:text-primary-800"
                      onClick={() => {
                        setEmail(acct.email);
                        setPassword(acct.password);
                      }}
                    >
                      Autofill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!pending && liveMode && (
            <div
              role="tablist"
              aria-label={t("signIn")}
              className={`mb-5 grid gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 ${faceEnabled ? "grid-cols-3" : "grid-cols-2"}`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "password"}
                onClick={() => {
                  setMode("password");
                  setChallenge(null);
                  setError(null);
                }}
                className={tabClass(mode === "password")}
              >
                {t("passwordLabel")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "phone"}
                onClick={() => {
                  setMode("phone");
                  setChallenge(null);
                  setError(null);
                }}
                className={tabClass(mode === "phone")}
              >
                {t("phoneSignInTab")}
              </button>
              {faceEnabled && (
              <button
                type="button"
                role="tab"
                aria-selected={mode === "face"}
                onClick={() => {
                  setMode("face");
                  setChallenge(null);
                  setError(null);
                }}
                className={tabClass(mode === "face")}
              >
                {t("faceSignInTab")}
              </button>
              )}
            </div>
          )}

          {error && mode !== "password" && (
            <div className="mb-5">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          {pending && (
            <div className="space-y-3">
              {faceActionPanel ?? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={() => void beginFaceChallenge()}
                  disabled={faceBusy || isSubmitting}
                >
                  <ScanFace size={16} strokeWidth={2} />
                  {faceBusy ? t("loading") : t("faceVerifyBtn")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void skipFaceStep()}
                disabled={isSubmitting}
              >
                {t("faceSkipBtn")}
              </Button>
              <button
                type="button"
                onClick={backToSignIn}
                className="mx-auto block text-xs font-medium text-ink-500 hover:text-ink-800"
              >
                {t("backToSignIn")}
              </button>
            </div>
          )}

          {!pending && mode === "face" && (
            <div className="space-y-4">
              <Field label={t("faceIdentifierLabel")} required>
                <Input
                  type="text"
                  name="identifier"
                  autoComplete="username"
                  placeholder={t("faceIdentifierPlaceholder")}
                  value={faceIdentifier}
                  onChange={(e) => setFaceIdentifier(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
              {faceActionPanel ?? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={() => void startFaceSignIn()}
                  disabled={faceBusy || isSubmitting}
                >
                  <ScanFace size={16} strokeWidth={2} />
                  {faceBusy ? t("loading") : t("faceStart")}
                </Button>
              )}
              <p className="text-xs text-ink-500">{t("faceLoginHint")}</p>
              <div className="space-y-1.5 pt-2 text-center text-xs">
                <div>
                  <Link
                    href="/signup/face"
                    className="font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    {t("newHereFaceSignup")}
                  </Link>
                </div>
                <div>
                  <Link
                    href="/re-enroll"
                    className="text-ink-500 hover:text-ink-800 hover:underline"
                  >
                    {t("haveRecoveryToken")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!pending && mode === "phone" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                <p className="mt-0 text-xs leading-5 text-ink-600">{t("phoneLoginText")}</p>
              </div>
              {!phoneCodeSent ? (
                <form onSubmit={sendPhoneCode} className="space-y-4">
                  <Field label={t("mobileLabel")} required hint="+91 · 10-digit Indian mobile number">
                    <div className="flex overflow-hidden rounded-lg border border-ink-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                      <span className="flex items-center border-r border-ink-200 bg-ink-50 px-3 text-sm text-ink-600" aria-hidden="true">+91</span>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        disabled={isSubmitting}
                        required
                        className="rounded-none border-0 focus:ring-0"
                      />
                    </div>
                  </Field>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !/^[6-9]\d{9}$/.test(phone)}
                  >
                    {isSubmitting ? t("btnSigningIn") : t("sendCodeBtn")}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyPhoneCode} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      aria-label={t("phoneCodePlaceholder")}
                      placeholder={t("phoneCodePlaceholder")}
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isSubmitting}
                      required
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || phoneCode.trim().length !== 6}
                  >
                    {isSubmitting ? t("btnSigningIn") : t("phoneSignInBtn")}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneCodeSent(false);
                        setPhoneCode("");
                        setError(null);
                      }}
                      disabled={isSubmitting}
                      className="text-xs font-medium text-ink-500 hover:text-ink-800"
                    >
                      {t("useDifferentNumber")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!pending && mode === "password" && (
          <form onSubmit={submit} className="space-y-4">
            <Field label={t("emailLabel")} required>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
            <Field label={t("passwordLabel")} required>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-400 transition-colors hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-ink-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-ink-300 accent-primary-700"
                />
                {t("rememberMe")}
              </label>
              <Link
                href="mailto:support@grievai.gov.in?subject=Password%20reset%20request"
                className="text-xs font-medium text-primary-700 hover:underline"
                title="Opens your email client"
              >
                {t("forgotPassword")} ✉
              </Link>
            </div>

            {/* Error shown close to submit so it's always visible without scrolling */}
            {error && (
              <Alert tone="error">{error}</Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("btnSigningIn") : t("signIn")}
              {!isSubmitting && <ArrowRight size={16} strokeWidth={2} />}
            </Button>
          </form>
          )}

          {!pending && !liveMode && (
            <div className="mt-5">
              <Alert>
                Demo mode: any email works. Use an address containing &quot;admin&quot; to
                preview the admin dashboard.
              </Alert>
            </div>
          )}

          {!pending && (
            <div className="mt-6 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-center text-sm text-ink-500">
              {t("newHere")}{" "}
              <Link
                href="/register"
                className="font-semibold text-primary-700 hover:underline"
              >
                {t("createAccount")} →
              </Link>
            </div>
          )}
        </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
      <LoginForm />
    </Suspense>
  );
}
