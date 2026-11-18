import Icon from "./Icon.jsx";

function PhotoCredit({ attribution, className = "" }) {
  if (!attribution?.sourcePage) return null;

  const author = attribution.author || "Pencipta tidak tercantum";
  const license = attribution.license || "Lisensi tidak tercantum";

  return (
    <a
      className={`photo-credit${className ? ` ${className}` : ""}`}
      href={attribution.sourcePage}
      target="_blank"
      rel="noreferrer"
      aria-label={`Foto oleh ${author}, lisensi ${license}. Buka sumber foto.`}
      title={`Foto oleh ${author} · ${license}`}
    >
      <span>Foto</span>
      <span aria-hidden="true">·</span>
      <span>{author}</span>
      <span aria-hidden="true">·</span>
      <span>{license}</span>
      <Icon name="arrow-up-right" />
    </a>
  );
}

export default PhotoCredit;
