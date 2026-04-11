const ACCENTS = [
  "from-amber-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-indigo-500",
  "from-slate-700 to-slate-950",
];

export function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const single = parts[0] || "?";
  return single.slice(0, 2).toUpperCase();
}

export function accentForIndex(index) {
  return ACCENTS[index % ACCENTS.length];
}

export function formatGender(value) {
  if (value === "m") return "Male";
  if (value === "f") return "Female";
  if (value === "o") return "Other";
  return "—";
}

export function formatRole(role) {
  if (!role) return "—";
  return String(role).replaceAll("_", " ");
}

export function formatApiError(error) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors)) {
    return data.errors.join(" ");
  }
  return data?.error ?? error?.message ?? "Something went wrong.";
}
