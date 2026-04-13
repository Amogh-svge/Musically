import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../Icon";
import RestrictedAction from "@/components/RestrictedAction";
import SongFormModal from "@/components/modals/SongFormModal";
import { canManageSongsForAnyArtist, ROLE_TOOLTIP } from "@/constants/roles";
import { useAuth } from "@/context/AuthContext";
import { useArtistsQuery } from "@/hooks/useArtistsApi";
import { useDeleteSongMutation, useSongsByArtistQuery } from "@/hooks/useSongsApi";
import { formatApiError, formatSongGenre } from "@/utils/displayFormat";

export default function SongsPage({ onLogout }) {
  const { role, isLoading: profileLoading } = useAuth();
  const canSongCrud = profileLoading || canManageSongsForAnyArtist(role);
  const songMutationsDisabled = !canSongCrud;

  const [artistId, setArtistId] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [songModalOpen, setSongModalOpen] = useState(false);
  const [banner, setBanner] = useState("");

  const { data: artistsData } = useArtistsQuery(1, 100);
  const artists = artistsData?.data ?? [];

  useEffect(() => {
    if (!artistId && artists.length > 0) {
      setArtistId(String(artists[0].id));
    }
  }, [artistId, artists]);

  const numericArtistId = artistId ? Number(artistId) : 0;

  const { data, isPending, isError, error } = useSongsByArtistQuery(
    numericArtistId,
    page,
    perPage,
    numericArtistId > 0,
  );

  const deleteMutation = useDeleteSongMutation();

  const songs = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const pages = meta?.pages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const openAddSongModal = () => {
    if (songMutationsDisabled || !numericArtistId) return;
    setBanner("");
    setSongModalOpen(true);
  };

  const handleDelete = (song) => {
    if (songMutationsDisabled) return;
    if (!window.confirm(`Delete “${song.title}”?`)) return;
    setBanner("");
    deleteMutation.mutate(
      { artistId: numericArtistId, songId: song.id },
      { onError: (err) => setBanner(formatApiError(err)) },
    );
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="space-y-6">
        <SongFormModal
          open={songModalOpen}
          onClose={() => setSongModalOpen(false)}
          artists={artists}
          defaultArtistId={numericArtistId}
        />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="breadcrumbs p-0 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <ul>
                <li>Admin</li>
                <li className="text-indigo-600">Songs</li>
              </ul>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Songs
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Pick an artist to list tracks.{" "}
                <span className="font-medium text-slate-700">Super admin</span> and{" "}
                <span className="font-medium text-slate-700">artist manager</span> can add
                and delete songs for any artist.
              </p>
            </div>
          </div>

          <div className="flex  items-end gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Artist
              </span>
              <select
                className="select select-bordered min-w-[200px] rounded-2xl border-slate-200 bg-slate-50"
                value={artistId}
                onChange={(e) => {
                  setArtistId(e.target.value);
                  setPage(1);
                  setBanner("");
                }}
              >
                {artists.length === 0 ? (
                  <option value="">No artists yet</option>
                ) : null}
                {artists.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            {canSongCrud ? (
              <span className="group relative inline-flex">
                <button
                  className="btn btn-primary rounded-2xl border-none bg-indigo-600 px-5 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50"
                  type="button"
                  disabled={!numericArtistId}
                  title={
                    !numericArtistId
                      ? "Select an artist to add a song"
                      : undefined
                  }
                  onClick={openAddSongModal}
                >
                  <Icon name="plus" className="size-5" />
                  Add song
                </button>
                <span
                  className="pointer-events-none absolute left-1/2 top-full z-[60] mt-2 hidden w-max max-w-xs -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-lg group-hover:block"
                  role="tooltip"
                >
                  {ROLE_TOOLTIP.SONGS_ARTIST_PICKER}
                </span>
              </span>
            ) : (
              <RestrictedAction allowed={false} reason={ROLE_TOOLTIP.SONGS_MUTATE}>
                <button
                  className="btn btn-primary rounded-2xl border-none bg-indigo-600 px-5 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-50"
                  type="button"
                  disabled
                  title={ROLE_TOOLTIP.SONGS_MUTATE}
                  onClick={openAddSongModal}
                >
                  <Icon name="plus" className="size-5" />
                  Add song
                </button>
              </RestrictedAction>
            )}
          </div>
        </div>

        {banner ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {banner}
          </p>
        ) : null}

        <div className="card border border-slate-200/70 bg-white shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              {!numericArtistId ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">
                  Create an artist first, then select them here.
                </p>
              ) : isPending ? (
                <p className="px-6 py-10 text-center text-sm text-slate-500">
                  Loading songs…
                </p>
              ) : isError ? (
                <p className="px-6 py-10 text-center text-sm text-rose-600">
                  {formatApiError(error)}
                </p>
              ) : (
                <table className="table table-lg">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="bg-transparent px-6 py-5 font-semibold">Title</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">Album</th>
                      <th className="bg-transparent px-6 py-5 font-semibold">Genre</th>
                      <th className="bg-transparent px-6 py-5 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song) => (
                      <tr
                        key={song.id}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-6 py-5 font-semibold text-slate-900">
                          {song.title}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {song.album_name}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatSongGenre(song.genre)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end">
                            <RestrictedAction
                              allowed={canSongCrud}
                              reason={ROLE_TOOLTIP.SONGS_MUTATE}
                            >
                              <button
                                className="btn btn-circle btn-ghost bg-transparent text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-none shadow-none"
                                type="button"
                                aria-label={`Delete ${song.title}`}
                                disabled={songMutationsDisabled || deleteMutation.isPending}
                                title={
                                  songMutationsDisabled
                                    ? ROLE_TOOLTIP.SONGS_MUTATE
                                    : deleteMutation.isPending
                                      ? undefined
                                      : `Delete ${song.title}`
                                }
                                onClick={() => handleDelete(song)}
                              >
                                <Icon name="trash" className="size-5" />
                              </button>
                            </RestrictedAction>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {numericArtistId ? (
          <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {from} - {to} of {total} songs
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
        ) : null}
      </div>
    </AdminLayout>
  );
}
