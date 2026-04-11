const icons = {
  dashboard: (
    <path d="M4 4h6v6H4zm10 0h6v9h-6zM4 14h6v6H4zm10-3h6v9h-6z" />
  ),
  user: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <path d="M9 10 19 8" />
      <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </>
  ),
  search: <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
  bell: (
    <>
      <path d="M15 17H9a2 2 0 0 1-2-2v-4a5 5 0 1 1 10 0v4a2 2 0 0 1-2 2Z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>
  ),
  play: <path d="m9 7 8 5-8 5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <path d="M10 8v8" />
      <path d="M14 8v8" />
    </>
  ),
  previous: (
    <>
      <path d="M6 7v10" />
      <path d="m18 8-8 4 8 4z" fill="currentColor" stroke="none" />
    </>
  ),
  next: (
    <>
      <path d="M18 7v10" />
      <path d="m6 8 8 4-8 4z" fill="currentColor" stroke="none" />
    </>
  ),
  volume: (
    <>
      <path d="M5 15h3l4 4V5L8 9H5z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
    </>
  ),
  expand: (
    <>
      <path d="M9 3H3v6" />
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 15v6h-6" />
      <path d="m3 9 6-6" />
      <path d="m15 3 6 6" />
      <path d="m3 15 6 6" />
      <path d="m15 21 6-6" />
    </>
  ),
  import: (
    <>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 21h14" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 14v5H5V5h5" />
    </>
  ),
  details: (
    <>
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
};

export default function Icon({ name, className = "size-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}
