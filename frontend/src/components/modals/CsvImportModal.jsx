import { useRef } from "react";
import { useForm } from "react-hook-form";
import FormModal from "@/components/FormModal";
import { useImportArtistsCsvMutation } from "@/hooks/useArtistsApi";
import { formatApiError } from "@/utils/displayFormat";
import {
  fieldErrorClassName,
  inputClassName,
  inputErrorClassName,
  labelClassName,
} from "@/utils/formClasses";

export default function CsvImportModal({ open, onClose, onImportResult }) {
  const fileRef = useRef(null);
  const importMutation = useImportArtistsCsvMutation();

  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("file", { message: "Choose a .csv file" });
      return;
    }
    clearErrors();
    importMutation.mutate(file, {
      onSuccess: (result) => {
        onImportResult?.(result);
        if (fileRef.current) fileRef.current.value = "";
        onClose();
      },
      onError: (err) => {
        setError("root", { message: formatApiError(err) });
      },
    });
  };

  return (
    <FormModal
      open={open}
      title="Import artists (CSV)"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn rounded-2xl border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={importMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="csv-import-form"
            className="btn rounded-2xl border-none bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? "Importing…" : "Upload"}
          </button>
        </>
      }
    >
      <form id="csv-import-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.root.message}
          </p>
        ) : null}

        <p className="text-sm leading-relaxed text-slate-600">
          First row must be a header including:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            name,dob,gender,address,first_release_year,no_of_albums_released
          </code>
          . Field name <span className="font-medium">file</span> is sent as multipart form data.
        </p>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>CSV file</span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className={errors.file ? inputErrorClassName : inputClassName}
            />
          </label>
          {errors.file ? (
            <p className={fieldErrorClassName}>{errors.file.message}</p>
          ) : null}
        </div>
      </form>
    </FormModal>
  );
}
