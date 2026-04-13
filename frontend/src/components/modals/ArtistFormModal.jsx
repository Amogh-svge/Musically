import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormModal from "@/components/FormModal";
import {
  useCreateArtistMutation,
  useUpdateArtistMutation,
} from "@/hooks/useArtistsApi";
import { formatApiError } from "@/utils/displayFormat";
import {
  fieldErrorClassName,
  inputClassName,
  inputErrorClassName,
  labelClassName,
} from "@/utils/formClasses";

const emptyDefaults = {
  name: "",
  dob: "",
  gender: "",
  address: "",
  first_release_year: "",
  no_of_albums_released: 0,
};

export default function ArtistFormModal({ open, onClose, artist }) {
  const isEdit = Boolean(artist?.id);
  const createMutation = useCreateArtistMutation();
  const updateMutation = useUpdateArtistMutation();
  const pending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: emptyDefaults });

  useEffect(() => {
    if (!open) return;
    if (artist?.id) {
      reset({
        name: artist.name ?? "",
        dob: artist.dob ? String(artist.dob).slice(0, 10) : "",
        gender: artist.gender ?? "",
        address: artist.address ?? "",
        first_release_year:
          artist.first_release_year != null ? String(artist.first_release_year) : "",
        no_of_albums_released: artist.no_of_albums_released ?? 0,
      });
    } else {
      reset(emptyDefaults);
    }
  }, [open, artist, reset]);

  const onSubmit = (values) => {
    const body = {
      name: values.name.trim(),
      no_of_albums_released: Number(values.no_of_albums_released) || 0,
    };
    if (values.dob) body.dob = values.dob;
    if (values.gender) body.gender = values.gender;
    if (values.address?.trim()) body.address = values.address.trim();
    if (values.first_release_year !== "" && values.first_release_year != null) {
      body.first_release_year = Number(values.first_release_year);
    }

    const onError = (err) => {
      setError("root", { message: formatApiError(err) });
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: artist.id, body },
        {
          onSuccess: () => onClose(),
          onError,
        },
      );
    } else {
      createMutation.mutate(body, {
        onSuccess: () => onClose(),
        onError,
      });
    }
  };

  return (
    <FormModal
      open={open}
      title={isEdit ? "Edit artist" : "Add artist"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn rounded-2xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="artist-form"
            className="btn rounded-2xl border-none bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create artist"}
          </button>
        </>
      }
    >
      <form id="artist-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.root.message}
          </p>
        ) : null}

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Name</span>
            <input
              type="text"
              className={errors.name ? inputErrorClassName : inputClassName}
              {...register("name", { required: "Name is required" })}
            />
          </label>
          {errors.name ? (
            <p className={fieldErrorClassName}>{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Date of birth</span>
            <input type="date" className={inputClassName} {...register("dob")} />
          </label>
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Gender</span>
            <select className={inputClassName} {...register("gender")}>
              <option value="">—</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
              <option value="o">Other</option>
            </select>
          </label>
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Address</span>
            <input type="text" className={inputClassName} {...register("address")} />
          </label>
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>First release year</span>
            <input
              type="number"
              className={inputClassName}
              placeholder="e.g. 2020"
              {...register("first_release_year")}
            />
          </label>
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Albums released</span>
            <input
              type="number"
              min={0}
              className={inputClassName}
              {...register("no_of_albums_released", {
                min: { value: 0, message: "Cannot be negative" },
                valueAsNumber: true,
              })}
            />
          </label>
          {errors.no_of_albums_released ? (
            <p className={fieldErrorClassName}>{errors.no_of_albums_released.message}</p>
          ) : null}
        </div>
      </form>
    </FormModal>
  );
}
