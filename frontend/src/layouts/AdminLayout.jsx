import Icon from "../Icon";
import { useAuth } from "@/context/AuthContext";
import {
  canAccessArtistsSection,
  canManageUsers,
  ROLE_TOOLTIP,
} from "@/constants/roles";
import { formatRole, initialsFromName } from "@/utils/displayFormat";
import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";

const navigationItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    path: "/dashboard",
  },
  {
    key: "artists",
    label: "Artists",
    icon: "user",
    path: "/artists",
    denyReason: ROLE_TOOLTIP.ARTISTS_NAV,
    isAllowed: (role) => canAccessArtistsSection(role),
  },
  {
    key: "songs",
    label: "Songs",
    icon: "music",
    path: "/songs",
  },
  {
    key: "users",
    label: "Users",
    icon: "user",
    path: "/users",
    denyReason: ROLE_TOOLTIP.USERS_NAV,
    isAllowed: (role) => canManageUsers(role),
  },
];

function SidebarItem({ item, role, profileLoading }) {
  const baseClassName =
    "flex items-center gap-3 rounded-2xl px-4 py-3 mt-2 text-sm font-medium transition";

  const restricted = typeof item.isAllowed === "function";
  const denied =
    restricted &&
    !profileLoading &&
    (role == null || !item.isAllowed(role));

  if (denied) {
    return (
      <li>
        <span className="group relative block">
          <span
            className={`${baseClassName} cursor-not-allowed text-slate-500 opacity-60`}
            aria-disabled="true"
          >
            <Icon name={item.icon} className="size-5" />
            <span>{item.label}</span>
          </span>
          <span
            className="pointer-events-none absolute left-0 top-full z-[60] mt-2 hidden w-64 max-w-[min(18rem,calc(100vw-2rem))] rounded-xl bg-slate-900 px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-lg group-hover:block"
            role="tooltip"
          >
            {item.denyReason}
          </span>
        </span>
      </li>
    );
  }

  return (
    <li>
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
    </li>
  );
}

export default function AdminLayout({ children, onLogout }) {
  const navigate = useNavigate();
  const { user, role, isLoading: profileLoading } = useAuth();

  const displayName = profileLoading
    ? "Loading profile…"
    : user?.name?.trim() || user?.email || "Signed in";
  const initials = initialsFromName(user?.name || user?.email || "?");
  const roleLabel = profileLoading ? "…" : formatRole(role);

  return (
    <div className="min-h-screen bg-transparent px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1440px] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200/70 bg-white/85 px-5 py-6 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex h-full flex-col">
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
              <ul className=" gap-2 rounded-box bg-transparent p-0">
                {navigationItems.map((item) => (
                  <SidebarItem
                    key={item.key}
                    item={item}
                    role={role}
                    profileLoading={profileLoading}
                  />
                ))}
              </ul>
            </nav>

            <div className="mt-8 border-t border-slate-200/70 pt-6 lg:mt-auto lg:border-t-0 lg:pt-0">
              <div className="card border border-slate-200/70 bg-white shadow-sm">
                <div className="card-body gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={user?.name ?? ""}
                      size={56}
                      initials={initials}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-slate-600">{roleLabel}</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-error btn-sm w-full rounded-xl border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    type="button"
                    onClick={async () => {
                      await onLogout();
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
              <div className="input flex h-13 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-none lg:max-w-md">
                <Icon name="music" className="size-5 text-slate-400" />
                <p className="text-sm font-semibold text-slate-900">Go Through the Data</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
