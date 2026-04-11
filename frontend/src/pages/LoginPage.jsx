import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatApiError } from "@/utils/displayFormat";
import { useLoginMutation } from "../hooks/useAuthMutations";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.from?.pathname ?? "/artists";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLoginMutation();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setError("");
      loginMutation.mutate({ email, password },
        {
          onSuccess: (data) => {
            if (!data?.token) {
              setError("Invalid response from server.");
              return;
            }
            navigate(nextPath, { replace: true });
          },
          onError: (err) => setError(formatApiError(err)),
        },
      );
    } catch (error) {
      setError(formatApiError(error));
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:grid xl:grid-cols-[1.1fr_0.9fr]">
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30">
                SC
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight">Sonic Curator</p>
                <p className="text-sm text-slate-500">
                  Editorial Artist Management System
                </p>
              </div>
            </div>

            <div className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white p-7 shadow-sm sm:p-8">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Welcome back
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue curating artists, metadata, and release activity.
                </p>
              </div>

              {location.state?.registered ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Account created. Sign in with your email and password.
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <form className="space-y-4" onSubmit={handleLogin}>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Email
                  </span>
                  <input
                    className={inputClassName}
                    type="email"
                    autoComplete="email"
                    placeholder="alex@curator.fm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <span>Password</span>
                    <button
                      className="normal-case tracking-normal text-indigo-600 transition hover:text-indigo-500"
                      type="button"
                    >
                      Forgot?
                    </button>
                  </span>
                  <input
                    className={inputClassName}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-500">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    type="checkbox"
                  />
                  <span>Stay signed in</span>
                </label>

                <button
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:opacity-60"
                  type="submit"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in…" : "Login"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  className="font-semibold text-indigo-600 transition hover:text-indigo-500"
                  to="/register"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </section>

        <aside className="relative hidden min-h-full overflow-hidden bg-slate-950 xl:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.45),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.15),rgba(2,6,23,0.85))]" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/20 to-transparent blur-2xl" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div className="max-w-sm space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Platform Access
              </p>
              <h2 className="text-4xl font-semibold leading-tight">
                Curate artists and releases from one focused workspace.
              </h2>
              <p className="text-sm leading-7 text-white/70">
                Sign in with your backend account. JWTs are stored locally for API calls.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                Featured Track
              </p>
              <p className="mt-4 text-xl font-semibold">The Electric Muse</p>
              <p className="mt-1 text-sm text-white/65">Editorial preview</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
