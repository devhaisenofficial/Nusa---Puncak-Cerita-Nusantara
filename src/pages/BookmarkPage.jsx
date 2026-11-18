import { places } from "../services/alamService.js";
import Icon from "../components/ui/Icon.jsx";

function BookmarkPage({ favorites, onToggleFavorite, onNavigate }) {
  const savedPlaces = favorites
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean);

  return (
    <section className="bookmark-page inner-page">
      <div className="bookmark-page-inner page-width">
        <button className="bookmark-page-back" type="button" onClick={() => onNavigate("/jelajah")}>
          <Icon name="arrow-left" /> Kembali ke jelajah
        </button>
        <header className="bookmark-page-heading">
          <span className="eyebrow">KOLEKSI PRIBADI · NUSA</span>
          <h1>Destinasi tersimpan.</h1>
          <p>Kumpulan puncak dan bentang alam pilihan Anda, siap dijelajahi kembali.</p>
          <span className="bookmark-page-total">{savedPlaces.length} destinasi</span>
        </header>

        {savedPlaces.length > 0 ? (
          <div className="bookmark-page-grid">
            {savedPlaces.map((place) => (
              <article className="bookmark-page-card" key={place.id}>
                <button
                  className="bookmark-page-cover"
                  type="button"
                  style={{ backgroundImage: `linear-gradient(180deg, rgb(9 24 15 / 8%) 20%, rgb(9 24 15 / 78%) 100%), url("${place.image}")` }}
                  onClick={() => onNavigate(`/jelajah/${place.id}`)}
                  aria-label={`Buka detail ${place.name}`}
                >
                  <span className="bookmark-page-kind">{place.type}</span>
                  <span className="bookmark-page-copy">
                    <small>{place.location} · {place.regionLabel}</small>
                    <strong>{place.name}</strong>
                    <span>{place.elevation == null ? "Ketinggian belum tersedia" : `${place.elevation.toLocaleString("id-ID")} mdpl`} <Icon name="arrow-up-right" /></span>
                  </span>
                </button>
                <button
                  className="bookmark-page-remove"
                  type="button"
                  onClick={() => onToggleFavorite(place.id)}
                  aria-label={`Hapus ${place.name} dari bookmark`}
                >
                  Hapus dari simpanan
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="bookmark-page-empty">
            <span className="bookmark-page-empty-icon" aria-hidden="true">⌑</span>
            <h2>Belum ada destinasi tersimpan</h2>
            <p>Simpan destinasi dari katalog Jelajah untuk menyusun koleksi pribadi Anda.</p>
            <button type="button" onClick={() => onNavigate("/jelajah")}>Jelajahi destinasi</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookmarkPage;
