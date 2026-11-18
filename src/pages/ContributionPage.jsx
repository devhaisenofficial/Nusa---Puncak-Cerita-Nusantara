import { useEffect, useMemo, useRef, useState } from "react";
import { places } from "../services/alamService.js";
import Icon from "../components/ui/Icon.jsx";

const maximumPhotos = 5;

function getPhotoArchive() {
  const archive = new Map();
  for (const place of places) {
    const attribution = place.imageCredit;
    if (place.image && attribution?.sourcePage && !archive.has(place.image)) {
      archive.set(place.image, {
        src: place.image,
        name: attribution.name || place.name,
        attribution,
      });
    }
  }
  return [...archive.values()];
}

const photoArchive = getPhotoArchive();

export default function ContributionPage({ onNavigate }) {
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const createdUrls = useRef([]);
  const selectedPlace = useMemo(() => places.find((place) => place.id === placeId), [placeId]);

  useEffect(() => () => {
    createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function handlePhotoChange(event) {
    createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
    createdUrls.current = [];
    setSubmitted(false);
    setFormError("");

    const nextFiles = [...(event.target.files ?? [])];
    if (nextFiles.length > maximumPhotos) {
      event.target.value = "";
      setFiles([]);
      setPreviewUrls([]);
      setFormError(`Pilih maksimal ${maximumPhotos} foto untuk pratinjau kontribusi.`);
      return;
    }
    const invalidFile = nextFiles.find((file) => (
      !/\.(jpe?g|png|webp)$/i.test(file.name)
      || (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    ));
    if (invalidFile) {
      event.target.value = "";
      setFiles([]);
      setPreviewUrls([]);
      setFormError("Format foto harus JPG, PNG, atau WebP.");
      return;
    }
    const oversizedFile = nextFiles.find((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      event.target.value = "";
      setFiles([]);
      setPreviewUrls([]);
      setFormError("Ukuran setiap foto maksimal 10 MB.");
      return;
    }

    const nextUrls = nextFiles.map((file) => URL.createObjectURL(file));
    createdUrls.current = nextUrls;
    setFiles(nextFiles);
    setPreviewUrls(nextUrls);
  }

  function submitContribution(event) {
    event.preventDefault();
    setFormError("");
    if (!selectedPlace || !files.length) {
      setFormError("Pilih destinasi dan unggah setidaknya satu foto.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="inner-page contribution-page">
      <section className="inner-hero contribution-hero">
        <div className="page-width inner-hero-content">
          <span className="eyebrow eyebrow-light">RUANG KONTRIBUSI NUSA</span>
          <h1>Bagikan cerita melalui lensa.</h1>
          <p>
            Kirim foto untuk pratinjau koleksi destinasi. Sertakan nama dan email
            agar kredit fotografer dapat dicatat dengan benar.
          </p>
        </div>
      </section>

      <section className="page-width contribution-workspace section-space">
        <div className="contribution-upload-column">
          {submitted ? (
            <section className="contribution-thank-you" role="status">
              <span className="contribution-thank-you-mark" aria-hidden="true">✓</span>
              <span className="eyebrow">KONTRIBUSI TERCATAT DI PRATINJAU</span>
              <h2>Terima kasih telah berkontribusi, {name}.</h2>
              <p>
                Foto untuk <strong>{selectedPlace.name}</strong> siap ditinjau sebagai
                pratinjau lokal. Kredit contoh: <strong>{name}</strong> · {email}.
              </p>
              <div className="contribution-submitted-photos">
                {previewUrls.map((url, index) => (
                  <img key={url} src={url} alt={`Foto kontribusi ${index + 1}`} />
                ))}
              </div>
              <p className="contribution-demo-notice">
                Ini simulasi demo. Foto dan informasi tidak diunggah atau disimpan ke server.
              </p>
              <button className="button button-forest" type="button" onClick={() => setSubmitted(false)}>
                Tambahkan kontribusi lain
              </button>
            </section>
          ) : (
            <>
              <div className="contribution-form-heading">
                <span className="eyebrow">FORM KONTRIBUSI FOTO</span>
                <h2>Lengkapi kredit foto.</h2>
                <p>Pilih destinasi, lalu unggah hingga {maximumPhotos} foto.</p>
              </div>
              <form className="contribution-form photo-contribution-form" onSubmit={submitContribution}>
                <label>
                  Destinasi
                  <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} required>
                    {places.map((place) => <option key={place.id} value={place.id}>{place.name} · {place.location}</option>)}
                  </select>
                </label>
                <div className="form-row">
                  <label>Nama untuk kredit<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama fotografer" required /></label>
                  <label>Email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></label>
                </div>
                <label className="photo-upload-field">
                  Foto destinasi
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} required />
                  <span className="photo-upload-hint">JPG, PNG, atau WebP · maksimal 10 MB per foto · maks. {maximumPhotos} foto</span>
                </label>
                {previewUrls.length > 0 && (
                  <div className="contribution-upload-previews" aria-label="Pratinjau foto yang dipilih">
                    {previewUrls.map((url, index) => (
                      <img key={url} src={url} alt={`Pratinjau foto ${index + 1}`} />
                    ))}
                  </div>
                )}
                {formError && <p className="contribution-form-error" role="alert">{formError}</p>}
                <button className="button button-lime form-submit" type="submit">Kirim pratinjau <Icon name="arrow-up-right" /></button>
                <p className="form-privacy">Email hanya dipakai sebagai informasi kredit pada simulasi ini. Form belum mengirim data ke layanan.</p>
              </form>
            </>
          )}
        </div>
        <aside className="contribution-guidance">
          <span className="eyebrow eyebrow-light">PANDUAN SINGKAT</span>
          <h2>Jaga cerita dan kreditnya.</h2>
          <ul>
            <li>Unggah foto milik Anda atau foto yang boleh dibagikan.</li>
            <li>Pastikan nama kredit sesuai pilihan fotografer.</li>
            <li>Jangan unggah gambar yang memuat informasi pribadi sensitif.</li>
          </ul>
          <button className="contribution-back-link" type="button" onClick={() => onNavigate("/kontak")}>Kembali ke kontak <Icon name="arrow-left" /></button>
        </aside>
      </section>

      <section className="contribution-archive-section">
        <div className="page-width section-space">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONTOH GALERI DEMO</span>
              <h2>Arsip foto beratribusi.</h2>
              <p>{photoArchive.length} foto contoh dari sumber terbuka, bukan kiriman pengguna.</p>
            </div>
          </div>
          <div className="contribution-archive-grid">
            {photoArchive.map((photo) => (
              <article className="contribution-archive-card" key={photo.src}>
                <img src={photo.src} alt={`Foto ${photo.name}`} loading="lazy" />
                <div>
                  <span className="contribution-demo-badge">FOTO REFERENSI · DEMO</span>
                  <h3>{photo.name}</h3>
                  <a href={photo.attribution.sourcePage} target="_blank" rel="noreferrer">
                    Kredit: {photo.attribution.author || "Pencipta tidak tercantum"} <Icon name="arrow-up-right" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
