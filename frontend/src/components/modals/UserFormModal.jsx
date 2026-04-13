import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormModal from "@/components/FormModal";
import { useCreateUserMutation } from "@/hooks/useUsersApi";
import { formatApiError } from "@/utils/displayFormat";
import {
  fieldErrorClassName,
  inputClassName,
  inputErrorClassName,
  labelClassName,
} from "@/utils/formClasses";

const ROLES = [
  { value: "artist", label: "Artist" },
  { value: "artist_manager", label: "Artist manager" },
  { value: "super_admin", label: "Super admin" },
];

const emptyDefaults = {
  name: "",
  email: "",
  password: "",
  role: "artist",
  phone_number: "",
};

export default function UserFormModal({ open, onClose }) {
  const createMutation = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: emptyDefaults });

  useEffect(() => {
    if (open) reset(emptyDefaults);
  }, [open, reset]);

  const onSubmit = (values) => {
    const body = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: values.role,
    };
    const phone = values.phone_number?.trim();

    if (phone) {
      body.phone_number = phone
    };

    createMutation.mutate(body, {
      onSuccess: () => {
        reset(emptyDefaults);
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
      title="Add user"
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
            form="user-form"
            className="btn rounded-2xl border-none bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create user"}
          </button>
        </>
      }
    >
      <form id="user-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.root.message}
          </p>
        ) : null}

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Full name</span>
            <input
              type="text"
              autoComplete="name"
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
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              className={errors.email ? inputErrorClassName : inputClassName}
              {...register("email", { required: "Email is required" })}
            />
          </label>
          {errors.email ? (
            <p className={fieldErrorClassName}>{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              className={errors.password ? inputErrorClassName : inputClassName}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
          </label>
          {errors.password ? (
            <p className={fieldErrorClassName}>{errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Role</span>
            <select className={inputClassName} {...register("role", { required: true })}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className={`block space-y-2 ${labelClassName}`}>
            <span>Phone (optional)</span>
            <input
              type="text"
              className={inputClassName}
              placeholder="Defaults to placeholder if empty on server"
              {...register("phone_number")}
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">
            If left empty, the API stores a placeholder number so the record stays valid.
          </p>
        </div>
      </form>
    </FormModal>
  );
}
