function FavoriteButton({ placeName, isSaved, onToggle, className = "" }) {
  return (
    <button
      className={`favorite-button${isSaved ? " is-saved" : ""}${className ? ` ${className}` : ""}`}
      type="button"
      aria-label={`${isSaved ? "Hapus" : "Simpan"} ${placeName} ${isSaved ? "dari" : "ke"} bookmark`}
      aria-pressed={isSaved}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 4.5h11v16l-5.5-3.8-5.5 3.8v-16Z"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default FavoriteButton;
