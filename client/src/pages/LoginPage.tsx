import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";


import FuturisticAICanvas from "@/components/interactive/FuturisticAICanvas";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_LOGO_FULL, APP_TITLE } from "@/const";
import { LOGIN_REDIRECT_DELAY_MS } from "@shared/const";
import { useTheme } from "@/contexts/ThemeContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/lib/supabaseClient";
import { trpc } from "@/lib/trpc";

type LoginPageProps = { preview?: boolean };

export default function LoginPage({ preview = false }: LoginPageProps) {
  usePageTitle("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStage, setAuthStage] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const { theme } = useTheme();

  // Clear corrupted localStorage on mount to prevent JSON parsing errors
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("rq:dehydrated:v1");
      if (persisted) {
        // Try to parse to validate it's not corrupted
        JSON.parse(persisted);
      }
    } catch {
      // Corrupted - clear it
      localStorage.removeItem("rq:dehydrated:v1");
      // Note: Using console.log here as this is client-side cleanup
      if (process.env.NODE_ENV === "development") {
        console.log("[Login] Cleared corrupted localStorage cache");
      }
    }
  }, []);

  // Simple Browser/Preview friendly mode: disable heavy canvases and auth side-effects
  const isSimpleEnv = (() => {
    try {
      const ua = navigator?.userAgent?.toLowerCase?.() || "";
      const qs = new URLSearchParams(window.location.search);
      return (
        preview ||
        qs.has("simple") ||
        ua.includes("electron") ||
        ua.includes("vscode") ||
        ua.includes("codespaces")
      );
    } catch {
      return preview;
    }
  })();

  const [, navigate] = useLocation();
  
  // Get redirect destination from URL params, sessionStorage, or default to original path
  const getRedirectPath = () => {
    // First check URL params
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect && redirect.startsWith("/")) {
      sessionStorage.removeItem("loginRedirect"); // Clean up
      return redirect;
    }
    
    // Then check sessionStorage (backup)
    const storedRedirect = sessionStorage.getItem("loginRedirect");
    if (storedRedirect && storedRedirect.startsWith("/")) {
      sessionStorage.removeItem("loginRedirect"); // Clean up
      return storedRedirect;
    }
    
    // If we're on a specific path (not just /login), go back there
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== "/login" && currentPath !== "/" && currentPath !== "/preview/login") {
      // Make sure path is valid (doesn't contain "Page Not Found" or other invalid strings)
      if (!currentPath.toLowerCase().includes("not found") && !currentPath.toLowerCase().includes("404")) {
        return currentPath;
      }
    }
    
    return "/";
  };
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setAuthStage("success");
      toast.success("Velkommen tilbage! Forbereder din workspace...");
      const redirectPath = getRedirectPath();
      // Note: Using console.log here for debugging redirect path
      if (process.env.NODE_ENV === "development") {
        console.log("[Login] Redirecting to:", redirectPath);
      }
      setTimeout(() => {
        // Use window.location for full page reload to ensure auth state is fresh
        // Ensure path starts with / and is valid
        const cleanPath = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
        window.location.href = cleanPath;
      }, LOGIN_REDIRECT_DELAY_MS);
    },
    onError: error => {
      setError(error.message || "Login failed");
      setAuthStage("idle");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthStage("loading");
    setIsLoading(true);

    if (isSimpleEnv) {
      // In preview mode, don't perform any network/auth actions
      setTimeout(() => {
        setIsLoading(false);
        setAuthStage("idle");
      }, 150);
      toast.info("Preview mode: no authentication performed");
      return;
    }

    if (!email || !password) {
      setError("Udfyld venligst alle felter");
      setIsLoading(false);
      setAuthStage("idle");
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success("Login gennemført");
    } catch (err) {
      setAuthStage("idle");
      // Log error for debugging
      if (err instanceof Error) {
        // Note: Using console.error here for client-side error logging
        if (process.env.NODE_ENV === "development") {
          console.error("[Login] Error:", err.message, err);
        }
        // Check if it's a JSON parsing error
        if (err.message.includes("JSON") || err.message.includes("Unexpected")) {
          setError("Server response error. Please try again or refresh the page.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isSimpleEnv) {
      toast.info("Preview mode: Nulstilling af adgangskode er deaktiveret");
      return;
    }
    if (!email) {
      setError("Indtast din e-mail for at nulstille adgangskode");
      return;
    }
    try {
      if (!supabase) throw new Error("Supabase ikke konfigureret");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      toast.success(
        "Hvis e-mailen findes, er der sendt et link til nulstilling"
      );
    } catch (err) {
      toast.error("Kunne ikke sende nulstillingsmail");
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSimpleEnv) {
      toast.info("Preview mode: Google sign-in disabled");
      return;
    }
    if (!supabase) return;
    setAuthStage("loading");
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  // Supabase session bridge on mount
  useEffect(() => {
    if (isSimpleEnv) return; // Skip auth bridging in preview/simple env
    const run = async () => {
      if (!supabase) return;
      const hash = window.location.hash.startsWith("#")
        ? new URLSearchParams(window.location.hash.slice(1))
        : null;
      const hashAccess = hash?.get("access_token") || undefined;
      const hashRefresh = hash?.get("refresh_token") || undefined;
      if (hashAccess && hashRefresh) {
        try {
          await supabase.auth.setSession({
            access_token: hashAccess,
            refresh_token: hashRefresh,
          });
          await fetch("/api/auth/supabase/complete", {
            method: "POST",
            headers: { Authorization: `Bearer ${hashAccess}` },
            credentials: "include",
          });
          history.replaceState(null, "", window.location.pathname);
          window.location.href = "/";
          return;
        } catch {}
      }
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        try {
          await fetch("/api/auth/supabase/complete", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
            credentials: "include",
          });
          window.location.href = "/";
        } catch {}
      }
    };
    run();
  }, [isSimpleEnv]);

  useEffect(() => {
    if (isSimpleEnv) return; // Skip auth state listener in preview/simple env
    if (!supabase) return;
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const token = session?.access_token;
        if (!token) return;
        try {
          await fetch("/api/auth/supabase/complete", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          window.location.href = "/";
        } catch {}
      }
    );
    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, [isSimpleEnv]);

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundColor: theme === "dark" ? "#191970" : "#ffffff",
        }}
      >
        {!isSimpleEnv && (
          <FuturisticAICanvas className="absolute inset-0 z-0 w-full h-full pointer-events-none" />
        )}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-linear-to-br from-black/40 via-transparent to-black/20 rounded-2xl pointer-events-none" />
          <div className="relative backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-1 shadow-2xl">
            <Card className="w-full max-w-md bg-transparent border-none shadow-none rounded-[14px] relative overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-6 w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center p-2 backdrop-blur-sm">
                  <img
                    src={APP_LOGO_FULL}
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = APP_LOGO;
                    }}
                    alt={`${APP_TITLE} - AI-powered business automation platform`}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  <h1>{APP_TITLE}</h1>
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Log ind for at fortsætte
                </CardDescription>
                <p className="text-xs text-slate-400 mt-2 font-light">
                  Dit personlige AI-arbejdsrum, finjusteret.
                </p>
              </CardHeader>

              <form
                onSubmit={handleSubmit}
                aria-describedby={error ? "login-error" : undefined}
              >
                <CardContent className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      role="alert"
                      aria-live="assertive"
                      id="login-error"
                    >
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Indtast din e-mail"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="email"
                      autoFocus
                      className="input-glow h-12 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Adgangskode</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Indtast din adgangskode"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                      className="input-glow h-12 md:h-10"
                    />
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-cyan-200 hover:text-white underline"
                      >
                        Glemt adgangskode?
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 flex flex-col items-stretch gap-3 px-6">
                  <Button
                    type="submit"
                    className="w-full h-12 md:h-10 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 hover:ring-2 hover:ring-cyan-400/50"
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? "Logger ind..." : "Log ind"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black hover:bg-white/90 h-12 md:h-10"
                    disabled={preview || !supabase}
                  >
                    Log ind med Google
                  </Button>
                  <p className="text-center text-xs text-white/70">
                    Har du ikke en konto? Brug Google-login. E-mail-tilmelding
                    er ikke aktiveret.
                  </p>
                </CardFooter>
              </form>
              {authStage !== "idle" && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-br from-black/80 via-indigo-900/70 to-black/70 text-white backdrop-blur-md border border-white/10"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {authStage === "loading" ? (
                    <>
                      <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" aria-hidden="true" />
                      <div className="text-center space-y-1">
                        <p className="text-base font-semibold tracking-wide">
                          Sikrer dit AI-arbejdsrum…
                        </p>
                        <p className="text-xs text-white/70">
                          Verificerer dine legitimationsoplysninger
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-300/40 flex items-center justify-center" aria-hidden="true">
                        <svg
                          className="w-6 h-6 text-emerald-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-base font-semibold tracking-wide">
                          Alt klart!
                        </p>
                        <p className="text-xs text-white/70">
                          Starter dit personlige dashboard…
                        </p>
                      </div>
                    </>
                  )}
                  <div className="w-32 h-1 rounded-full bg-white/20 overflow-hidden">
                    <span className="block h-full w-1/2 bg-linear-to-r from-white via-cyan-200 to-white animate-[pulse_1.4s_ease-in-out_infinite]" />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
