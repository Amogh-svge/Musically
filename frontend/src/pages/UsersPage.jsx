import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../Icon";
import { useUsersQuery } from "@/hooks/useUsersApi";
import {
  accentForIndex,
  formatApiError,
  formatRole,
  initialsFromName,
} from "@/utils/displayFormat";

export default function UsersPage({ onLogout }) {
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, isPending, isError, error } = useUsersQuery(page, perPage);

  const users = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const pages = meta?.pages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="breadcrumbs p-0 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <ul>
                <li>Admin</li>
                <li className="text-indigo-600">User Management</li>
              </ul>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Users
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Super admin only. Data loads from{" "}
                <span className="font-medium text-slate-700">GET /users</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn rounded-2xl border-none bg-slate-100 px-5 text-slate-700 shadow-none hover:bg-slate-200"
              type="button"
            >
              <Icon name="import" className="size-5" />
              Import CSV
            </button>
            <button
              className="btn rounded-2xl border-none bg-slate-100 px-5 text-slate-700 shadow-none hover:bg-slate-200"
              type="button"
            >
              <Icon name="download" className="size-5" />
              Export
            </button>
            <button
              className="btn btn-primary rounded-2xl border-none bg-indigo-600 px-5 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
              type="button"
            >
              <Icon name="plus" className="size-5" />
              Add User
            </button>
          </div>
        </div>

        <div className="card border border-slate-200/70 bg-white shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              {isPending ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading users…
                </p>
              ) : isError ? (
                <p className="px-6 py-10 text-center text-sm text-rose-600">
                  {formatApiError(error)}
                </p>
              ) : (
                <table className="table table-lg">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="bg-transparent px-6 py-5 font-semibold">User</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">Joined</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">Role</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">
                        Artist ID
                      </th>
                      <th className="bg-transparent px-6 py-5 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      const initials = initialsFromName(user.name);
                      const accent = accentForIndex(index);
                      const joined = user.created_at
                        ? String(user.created_at).slice(0, 10)
                        : "—";
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="avatar placeholder">
                                <div
                                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-sm font-semibold text-white`}
                                >
                                  {initials}
                                </div>
                              </div>
                              <div>
                                <p className="text-base font-semibold text-slate-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">{joined}</td>
                          <td className="px-6 py-5">
                            <span className="badge badge-soft rounded-full border-none bg-indigo-50 px-3 py-3 text-xs font-semibold capitalize text-indigo-600">
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {user.artist_id != null ? user.artist_id : "—"}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="btn btn-circle btn-ghost text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
                                type="button"
                                aria-label={`Open ${user.name}`}
                              >
                                <Icon name="external" className="size-5" />
                              </button>
                              <button
                                className="btn btn-circle btn-ghost text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                type="button"
                                aria-label={`Edit ${user.name}`}
                              >
                                <Icon name="details" className="size-5" />
                              </button>
                              <button
                                className="btn btn-circle btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                type="button"
                                aria-label={`Delete ${user.name}`}
                              >
                                <Icon name="trash" className="size-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {from} - {to} of {total} users
          </p>

          <div className="join gap-2 self-start sm:self-auto">
            <button
              className="btn join-item btn-ghost rounded-2xl border-none bg-slate-100 px-4 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Icon name="chevronLeft" className="size-5" />
              Previous
            </button>
            <span className="join-item flex items-center px-3 text-slate-600">
              Page {page} of {pages || 1}
            </span>
            <button
              className="btn join-item btn-ghost rounded-2xl border-none bg-slate-100 px-4 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              type="button"
              disabled={page >= pages || isPending}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <Icon name="chevronRight" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
