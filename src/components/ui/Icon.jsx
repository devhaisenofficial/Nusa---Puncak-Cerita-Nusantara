function Icon({ name, className = "" }) {
  const paths = {
    "arrow-right": <><path d="M4.5 12h14" /><path d="m12.5 5.5 6.5 6.5-6.5 6.5" /></>,
    "arrow-up-right": <><path d="M6 18 18 6" /><path d="M8 6h10v10" /></>,
    "arrow-up": <><path d="M12 19.5v-15" /><path d="m5.5 11 6.5-6.5 6.5 6.5" /></>,
    "arrow-left": <><path d="M19.5 12h-14" /><path d="m11.5 18.5-6.5-6.5 6.5-6.5" /></>,
    "chevron-left": <path d="m14.5 5-7 7 7 7" />,
    "chevron-right": <path d="m9.5 5 7 7-7 7" />,
    "chevrons-left": <><path d="m11 5-7 7 7 7" /><path d="m20 5-7 7 7 7" /></>,
    "chevrons-right": <><path d="m4 5 7 7-7 7" /><path d="m13 5 7 7-7 7" /></>,
    "zoom-in": <><circle cx="10.8" cy="10.8" r="6.8" /><path d="M16 16l4.7 4.7M10.8 7.7v6.2m-3.1-3.1h6.2" /></>,
    "zoom-out": <><circle cx="10.8" cy="10.8" r="6.8" /><path d="M16 16l4.7 4.7m-13-5.2 6.2-6.2" /></>,
    reset: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 1-2.05-4.95L20 12" /></>,
  };

  return (
    <svg
      className={className || undefined}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
