import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormModal from "@/components/FormModal";
import { useCreateSongMutation } from "@/hooks/useSongsApi";
import { formatApiError } from "@/utils/displayFormat";
import {
  fieldErrorClassName,
  inputClassName,
  inputErrorClassName,
  labelClassName,
} from "@/utils/formClasses";

const GENRES = [
  { value: "rnb", label: "R&B" },
  { value: "country", label: "Country" },
  { value: "classic", label: "Classic" },
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
];

export default function SongFormModal({ open, onClose, artists, defaultArtistId }) {
  const createMutation = useCreateSongMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      artist_id: "",
      title: "",
      album_name: "",
      genre: "jazz",
    },
  });

  useEffect(() => {
    if (!open) return;

    const fallback = defaultArtistId != null && defaultArtistId > 0 ? String(defaultArtistId) : artists?.[0]?.id != null
      ? String(artists[0].id)
      : "";

    reset({
      artist_id: fallback,
      title: "",
      album_name: "",
      genre: "jazz",
    });
  }, [open, artists, defaultArtistId, reset]);

  const onSubmit = (values) => {
    const artistId = Number(values.artist_id);
    if (!artistId) {
      setError("artist_id", { message: "Choose an artist" });
      return;
    }
    createMutation.mutate(
      {
        artistId,
        body: {
          title: values.title.trim(),
          album_name: values.album_name.trim(),
          genre: values.genre,
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => setError("root", {
          message: formatApiError(error)
        }),
      },
    );
  };

  return (
    <FormModal
      open={open}
      title="Add song"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn rounded-2xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="song-form"
            className="btn rounded-2xl border-none bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving…" : "Add song"}
          </button>
        </>
      }
    >
      <form id="song-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.root.message}
          </p>
        ) : null}

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Artist</span>
            <select
              className={errors.artist_id ? inputErrorClassName : inputClassName}
              {...register("artist_id", { required: "Artist is required" })}
            >
              <option value="">Select artist…</option>
              {(artists ?? []).map((artist) => (
                <option key={artist.id} value={String(artist.id)}>
                  {artist.name}
                </option>
              ))}
            </select>
          </label>
          {errors.artist_id ? (
            <p className={fieldErrorClassName}>{errors.artist_id.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Title</span>
            <input
              type="text"
              className={errors.title ? inputErrorClassName : inputClassName}
              {...register("title", { required: "Title is required" })}
            />
          </label>
          {errors.title ? (
            <p className={fieldErrorClassName}>{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Album</span>
            <input
              type="text"
              className={errors.album_name ? inputErrorClassName : inputClassName}
              {...register("album_name", { required: "Album is required" })}
            />
          </label>
          {errors.album_name ? (
            <p className={fieldErrorClassName}>{errors.album_name.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Genre</span>
            <select className={inputClassName} {...register("genre", { required: true })}>
              {GENRES.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>
    </FormModal>
  );
}
