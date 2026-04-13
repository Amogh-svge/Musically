import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../Icon";
import { listArtists, listUsers } from "@/api/api";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

const shortcuts = [
  {
    to: "/artists",
    label: "Artists",
    description: "Catalog and CSV",
    icon: "user",
  },
  {
    to: "/songs",
    label: "Songs",
    description: "By artist",
    icon: "music",
  },
  {
    to: "/users",
    label: "Users",
    description: "Roles & access",
    icon: "user",
  },
];

export default function DashboardPage({ onLogout }) {


  const artistsQuery = useQuery({
    queryKey: ["dashboard", "artists-meta"],
    queryFn: () => listArtists({ page: 1, per_page: 1 }),
    staleTime: 60_000,
    retry: 1,
  });

  const usersQuery = useQuery({
    queryKey: ["dashboard", "users-meta"],
    queryFn: () => listUsers({ page: 1, per_page: 1 }),
    staleTime: 60_000,
    retry: false,
  });

  const artistTotal = artistsQuery.data?.meta?.total;
  const userTotal = usersQuery.data?.meta?.total;
  const usersHidden = usersQuery.isError;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            {today}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Overview and shortcuts. Counts reflect what your account can read from the API.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Artists"
            value={
              artistsQuery.isPending ? "…" : artistTotal != null ? String(artistTotal) : "—"
            }
            hint={artistsQuery.isError ? "No access or error" : "In directory"}
          />
          <StatCard
            label="Users"
            value={
              usersQuery.isPending && !usersHidden
                ? "…"
                : usersHidden
                  ? "—"
                  : userTotal != null
                    ? String(userTotal)
                    : "0"
            }
            hint={usersHidden ? "Super admin only" : "Accounts"}
          />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Go to
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {shortcuts.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-slate-900">{item.label}</span>
                    <span className="text-sm text-slate-500">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
