import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../Icon";
import RestrictedAction from "@/components/RestrictedAction";
import ArtistFormModal from "@/components/modals/ArtistFormModal";
import CsvImportModal from "@/components/modals/CsvImportModal";
import { useAuth } from "@/context/AuthContext";
import { canManageArtists, ROLE_TOOLTIP } from "@/constants/roles";
import {
  useArtistsQuery,
  useDeleteArtistMutation,
  useExportArtistsCsvMutation,
} from "@/hooks/useArtistsApi";
import {
  accentForIndex,
  formatApiError,
  formatGender,
  initialsFromName,
} from "@/utils/displayFormat";
import Avatar from "../components/Avatar";

function AlbumDots({ count }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={`${count}-${index}`}
          className={`h-3 w-3 rounded-full ${index < Math.min(count, 4) ? "bg-slate-300" : "bg-slate-100"
            }`}
        />
      ))}
      {count > 4 ? (
        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-500 px-1 text-[10px] font-semibold text-white">
          +{count - 4}
        </span>
      ) : null}
    </div>
  );
}

export default function ArtistsPage({ onLogout }) {
  const { role, isLoading: profileLoading } = useAuth();
  const canMutateArtists = profileLoading || canManageArtists(role);
  const artistMutationsDisabled = !canMutateArtists;

  const [page, setPage] = useState(1);
  const perPage = 15;
  const [banner, setBanner] = useState("");
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { data, isPending, isError, error } = useArtistsQuery(page, perPage);
  const exportMutation = useExportArtistsCsvMutation();
  const deleteMutation = useDeleteArtistMutation();

  const artists = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const pages = meta?.pages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const openCreate = () => {
    if (artistMutationsDisabled) return;
    setEditingArtist(null);
    setArtistModalOpen(true);
  };

  const openEdit = (artist) => {
    if (artistMutationsDisabled) return;
    setEditingArtist(artist);
    setArtistModalOpen(true);
  };

  const closeArtistModal = () => {
    setArtistModalOpen(false);
    setEditingArtist(null);
  };

  const handleDelete = (artist) => {
    if (artistMutationsDisabled) return;
    if (
      !window.confirm(
        `Delete artist “${artist.name}”? This cannot be undone if the API cascades related data.`,
      )
    ) {
      return;
    }
    setBanner("");
    deleteMutation.mutate(artist.id, {
      onError: (err) => setBanner(formatApiError(err)),
    });
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <ArtistFormModal
          open={artistModalOpen}
          onClose={closeArtistModal}
          artist={editingArtist}
        />
        <CsvImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImportResult={(result) => {
            const n = result?.imported ?? 0;
            const errs = result?.errors?.length ?? 0;
            setBanner(
              errs
                ? `Imported ${n} row(s). ${errs} issue(s) reported.`
                : `Imported ${n} row(s).`,
            );
          }}
        />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="breadcrumbs p-0 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <ul>
                <li>Admin</li>
                <li className="text-indigo-600">Artists Management</li>
              </ul>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Artists
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                List and manage artists. CSV import/export uses the backend (
                <span className="font-medium text-slate-700">artist_manager</span> role).
                Creating and editing artists requires{" "}
                <span className="font-medium text-slate-700">artist_manager</span>.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <RestrictedAction
              allowed={canMutateArtists}
              reason={ROLE_TOOLTIP.ARTISTS_MUTATE}
            >
              <button
                className="btn rounded-2xl border-none bg-slate-100 px-5 text-slate-700 shadow-none hover:bg-slate-200 disabled:opacity-50"
                type="button"
                disabled={artistMutationsDisabled}
                title={artistMutationsDisabled ? ROLE_TOOLTIP.ARTISTS_MUTATE : undefined}
                onClick={() => {
                  setBanner("");
                  setImportModalOpen(true);
                }}
              >
                <Icon name="import" className="size-5" />
                Import CSV
              </button>
            </RestrictedAction>
            <RestrictedAction
              allowed={canMutateArtists}
              reason={ROLE_TOOLTIP.ARTISTS_MUTATE}
            >
              <button
                className="btn rounded-2xl border-none bg-slate-100 px-5 text-slate-700 shadow-none hover:bg-slate-200 disabled:opacity-50"
                type="button"
                disabled={artistMutationsDisabled || exportMutation.isPending}
                title={
                  artistMutationsDisabled
                    ? ROLE_TOOLTIP.ARTISTS_MUTATE
                    : exportMutation.isPending
                      ? undefined
                      : "Export artists as CSV"
                }
                onClick={() => {
                  setBanner("");
                  exportMutation.mutate(undefined, {
                    onError: (err) => setBanner(formatApiError(err)),
                  });
                }}
              >
                <Icon name="download" className="size-5" />
                {exportMutation.isPending ? "Exporting…" : "Export CSV"}
              </button>
            </RestrictedAction>
            <RestrictedAction
              allowed={canMutateArtists}
              reason={ROLE_TOOLTIP.ARTISTS_MUTATE}
            >
              <button
                className="btn btn-primary rounded-2xl border-none bg-indigo-600 px-5 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50"
                type="button"
                disabled={artistMutationsDisabled}
                title={artistMutationsDisabled ? ROLE_TOOLTIP.ARTISTS_MUTATE : undefined}
                onClick={() => {
                  setBanner("");
                  openCreate();
                }}
              >
                <Icon name="plus" className="size-5" />
                Add Artist
              </button>
            </RestrictedAction>
          </div>
        </div>

        {banner ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {banner}
          </p>
        ) : null}

        <div className="card border border-slate-200/70 bg-white shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              {isPending ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading artists…
                </p>
              ) : isError ? (
                <p className="px-6 py-10 text-center text-sm text-rose-600">
                  {formatApiError(error)}
                </p>
              ) : (
                <table className="table table-lg">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="bg-transparent px-6 py-5 font-semibold">
                        Name & Identity
                      </th>
                      <th className="bg-transparent px-6 py-5 font-semibold">DOB</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">Gender</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">
                        Albums Released
                      </th>
                      <th className="bg-transparent px-6 py-5 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists.map((artist, index) => {
                      const initials = initialsFromName(artist.name);
                      const accent = accentForIndex(index);
                      const albums = artist.no_of_albums_released ?? 0;
                      const dobDisplay = artist.dob
                        ? String(artist.dob).slice(0, 10)
                        : "—";
                      return (
                        <tr
                          key={artist.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <Avatar name={artist.name} size={56} initials={initials} />
                              <div>
                                <p className="text-base font-semibold text-slate-900">
                                  {artist.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {artist.address || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {dobDisplay}
                          </td>
                          <td className="px-6 py-5">
                            <span className="badge badge-soft rounded-full border-none bg-indigo-50 px-3 py-3 text-xs font-semibold text-indigo-600">
                              {formatGender(artist.gender)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <span className="text-base font-semibold text-slate-900">
                                {albums}
                              </span>
                              <AlbumDots count={albums} />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">

                              <RestrictedAction
                                allowed={canMutateArtists}
                                reason={ROLE_TOOLTIP.ARTISTS_MUTATE}
                              >
                                <button
                                  className="btn btn-circle btn-ghost bg-transparent text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-none shadow-none"
                                  aria-label={`Edit ${artist.name}`}
                                  disabled={artistMutationsDisabled}
                                  title={artistMutationsDisabled ? ROLE_TOOLTIP.ARTISTS_MUTATE : `Edit ${artist.name}`}
                                  onClick={() => openEdit(artist)}
                                >
                                  <Icon name="details" className="size-5" />
                                </button>
                              </RestrictedAction>
                              <RestrictedAction
                                allowed={canMutateArtists}
                                reason={ROLE_TOOLTIP.ARTISTS_MUTATE}
                              >
                                <button
                                  className="btn btn-circle btn-ghost bg-transparent text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-none shadow-none"
                                  aria-label={`Delete ${artist.name}`}
                                  disabled={artistMutationsDisabled || deleteMutation.isPending}
                                  title={
                                    artistMutationsDisabled
                                      ? ROLE_TOOLTIP.ARTISTS_MUTATE
                                      : deleteMutation.isPending
                                        ? undefined
                                        : `Delete ${artist.name}`
                                  }
                                  onClick={() => handleDelete(artist)}
                                >
                                  <Icon name="trash" className="size-5" />
                                </button>
                              </RestrictedAction>
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
            Showing {from} - {to} of {total} artists
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
