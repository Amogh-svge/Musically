import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "@/hooks/useAuthMutations";
import { formatApiError } from "@/utils/displayFormat";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useRegisterMutation();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-slate-950 lg:block">
          <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.4),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.35),transparent_24%),linear-gradient(180deg,#0f172a,#020617)] p-10 text-white">
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold backdrop-blur">
                SC
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Join the network
              </p>
              <h1 className="max-w-sm text-4xl font-semibold leading-tight">
                Build your editorial space with a clean React starting point.
              </h1>
              <p className="max-w-sm text-sm leading-7 text-white/70">
                New accounts register as artists. Admins can promote roles from the backend.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                Included now
              </p>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p>Get sense of the latest tracks and enjoy yourself</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 lg:mx-0">
                SC
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Creates an account via the backend register endpoint, then you can sign in.
              </p>
            </div>

            {error ? (
              <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <form
              className="space-y-4 rounded-[2rem] border border-slate-200/70 bg-white p-7 shadow-sm sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                setError("");
                registerMutation.mutate(
                  { name, email, password },
                  {
                    onSuccess: () => {
                      navigate("/login", {
                        replace: true,
                        state: { registered: true },
                      });
                    },
                    onError: (err) => setError(formatApiError(err)),
                  },
                );
              }}
            >
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Full Name
                </span>
                <input
                  className={inputClassName}
                  type="text"
                  autoComplete="name"
                  placeholder="Alexander Thorne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email Address
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
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Secure Password
                </span>
                <input
                  className={inputClassName}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>

              <button
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:opacity-60"
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account…" : "Register"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-indigo-600 transition hover:text-indigo-500"
                  to="/login"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
