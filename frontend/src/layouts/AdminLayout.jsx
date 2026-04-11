import Icon from "../Icon";
import { NavLink, useNavigate } from "react-router-dom";

const navigationItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    path: "/dashboard",
    available: true,
  },
  {
    key: "artists",
    label: "Artists",
    icon: "user",
    path: "/artists",
    available: true,
  },
  {
    key: "songs",
    label: "Songs",
    icon: "music",
    path: "/songs",
    available: true,
  },
  {
    key: "users",
    label: "Users",
    icon: "user",
    path: "/users",
    available: true,
  },
];

function SidebarItem({ item }) {
  const baseClassName =
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition";

  if (!item.available) {
    return (
      <li>
        <span
          className={`${baseClassName} cursor-not-allowed text-slate-600`}
          aria-disabled="true"
        >
          <Icon name={item.icon} className="size-5" />
          <span>{item.label}</span>
        </span>
      </li>
    );
  }

  return (
    <span>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          isActive
            ? `${baseClassName} bg-indigo-50 text-indigo-700 shadow-sm`
            : `${baseClassName} text-slate-900 hover:bg-slate-100 hover:text-slate-950`
        }
      >
        <Icon name={item.icon} className="size-5" />
        <span>{item.label}</span>
      </NavLink>
    </span>
  );
}

export default function AdminLayout({ children, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1440px] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200/70 bg-white/85 px-5 py-6 lg:border-b-0 lg:border-r lg:px-6">

          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-500/30">
                SC
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-indigo-700">
                  Sonic Curator
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-600">
                  Editorial Admin
                </p>
              </div>
            </div>

            <nav className="mt-10">
              <ul className="menu gap-2 rounded-box bg-transparent p-0">
                {navigationItems.map((item) => (
                  <SidebarItem key={item.key} item={item} />
                ))}
              </ul>
            </nav>

            <div className="mt-auto hidden lg:block">
              <div className="card border border-slate-200/70 bg-white shadow-sm">
                <div className="card-body gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="h-11 w-11 rounded-full bg-slate-900 text-sm font-semibold text-white text-center">
                        AR
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Alex Rivera</p>
                      <p className="text-xs text-slate-700">Artist Manager</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-error btn-sm w-full rounded-xl border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    type="button"
                    onClick={() => {
                      onLogout();
                      navigate("/login", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="border-b border-slate-200/70 px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <label className="input flex h-13 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-none lg:max-w-md">
                <Icon name="search" className="size-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search artists, metadata, or logs..."
                  className="grow text-sm"
                />
              </label>

              <button
                className="btn btn-circle border-none bg-slate-100 text-slate-500 shadow-none hover:bg-slate-200 hover:text-slate-700"
                type="button"
                aria-label="Notifications"
              >
                <Icon name="bell" className="size-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-5 py-6 sm:px-8">{children}</main>

          <footer className="border-t border-slate-200/70 bg-white/90 px-5 py-4 sm:px-8">
            <div className="card rounded-[1.75rem] border border-white/80 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <div className="card-body flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-circle h-14 min-h-14 w-14 border-none bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
                    type="button"
                  >
                    <Icon name="play" className="size-6" />
                  </button>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                      Currently Curating
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      Midnight in Berlin (Edit)
                    </p>
                    <p className="text-sm text-slate-500">Luna Trace - Dark Synth EP</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-4 lg:max-w-xl">
                  <span className="text-xs text-slate-400">1:45</span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                    <div className="h-1.5 w-1/2 rounded-full bg-indigo-500" />
                  </div>
                  <span className="text-xs text-slate-400">3:24</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <button className="btn btn-circle btn-ghost" type="button">
                    <Icon name="expand" className="size-5" />
                  </button>
                  <button className="btn btn-circle btn-ghost" type="button">
                    <Icon name="previous" className="size-5" />
                  </button>
                  <button
                    className="btn btn-circle border-none bg-indigo-600 text-white hover:bg-indigo-500"
                    type="button"
                  >
                    <Icon name="pause" className="size-5" />
                  </button>
                  <button className="btn btn-circle btn-ghost" type="button">
                    <Icon name="next" className="size-5" />
                  </button>
                  <button className="btn btn-circle btn-ghost" type="button">
                    <Icon name="volume" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
