import { useState } from "react";

function FallbackCover({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={`fallback-cover${className ? ` ${className}` : ""}`} role="img" aria-label={alt}>
      <span aria-hidden="true">△</span>
    </span>
  ) : (
    <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}

export default FallbackCover;