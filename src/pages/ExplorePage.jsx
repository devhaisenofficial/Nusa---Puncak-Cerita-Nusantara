import { useEffect, useState } from "react";
import FavoriteButton from "../components/FavoriteButton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import FallbackCover from "../components/ui/FallbackCover.jsx";
import FilterControls from "../components/ui/explore/FilterControls.jsx";
import RegionalDirectory from "../components/ui/explore/RegionalDirectory.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";
import PhotoCredit from "../components/ui/PhotoCredit.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import WeatherClock from "../components/ui/WeatherClock.jsx";
import DestinationPhotoGallery from "../components/ui/explore/DestinationPhotoGallery.jsx";
import Icon from "../components/ui/Icon.jsx";
import { alamMetadata, places, getPlaceById } from "../services/alamService.js";
import useAlamFilter from "../hooks/useAlamFilter.js";

export { places, getPlaceById };

const categories = [
  ["semua", "Semua gunung & bukit"],
  ["gunung", "Gunung"],
  ["bukit", "Bukit"],
];

const regions = [
  ["semua", "Semua wilayah"],
  ...[...new Map(places.map((place) => [place.region, place.regionLabel])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "id")),
];

function Detail({ label, value }) {
  return (
    <div className="detail-block">
      <span className="detail-label">{label}</span>
      <p>{value}</p>
    </div>
  );
}

export default function ExplorePage({ onNavigate, favorites = [], onToggleFavorite }) {
  const [category, setCategory] = useState("semua");
  const [region, setRegion] = useState("semua");
  const [sort, setSort] = useState("elevation-desc");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlaces = useAlamFilter(places, { category, region, query, sort });

  const pageCount = pageSize === "all" ? 1 : Math.max(1, Math.ceil(filteredPlaces.length / Number(pageSize)));
  const visiblePlaces = pageSize === "all"
    ? filteredPlaces
    : filteredPlaces.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));
  const firstVisible = filteredPlaces.length === 0 ? 0 : (currentPage - 1) * (pageSize === "all" ? filteredPlaces.length : Number(pageSize)) + 1;
  const lastVisible = pageSize === "all" ? filteredPlaces.length : Math.min(currentPage * Number(pageSize), filteredPlaces.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, region, sort, query, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );
    document.querySelectorAll(".catalog-card.reveal:not(.is-visible)").forEach((card) => {
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, [filteredPlaces]);

  function resetFilters() {
    setCategory("semua");
    setRegion("semua");
    setSort("elevation-desc");
    setQuery("");
    setPageSize("10");
    setCurrentPage(1);
  }

  return (
    <div className="inner-page explore-page">
      <section className="inner-hero explore-hero">
        <div className="page-width inner-hero-content">
          <span className="eyebrow eyebrow-light">ARSIP ALAM · NUSANTARA</span>
          <h1>Gunung & bukit Nusantara.</h1>
          <p>
            Temukan pegunungan dan perbukitan Indonesia melalui kisah lokasi,
            ketinggian, ekologi, dan sejarahnya.
          </p>
          <div className="hero-stats">
            <span><strong>{places.length}</strong> profil pilihan</span>
            <span><strong>02</strong> kategori data</span>
            <span><strong>WGS84</strong> acuan koordinat</span>
          </div>
        </div>
      </section>

      <WeatherClock places={places} />

      <section className="catalog-section page-width">
        <div className="catalog-heading reveal">
          <div>
            <span className="eyebrow">KATALOG BENTANG ALAM · {alamMetadata.datum}</span>
            <h2>Jelajahi puncak Indonesia.</h2>
            <p>Pilih gunung atau bukit, jelajahi wilayah, atau cari nama destinasi.</p>
          </div>
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <FilterControls
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          regions={regions}
          region={region}
          onRegionChange={setRegion}
          sort={sort}
          onSortChange={setSort}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onReset={resetFilters}
        />

        <div className="catalog-result-count" aria-live="polite">
          Menampilkan <strong>{firstVisible}–{lastVisible}</strong> dari <strong>{filteredPlaces.length}</strong> destinasi
        </div>

        {filteredPlaces.length > 0 ? (
          <div className="catalog-grid">
            {visiblePlaces.map((place) => (
              <article
                className="catalog-card reveal"
                key={place.id}
              >
                <button className="catalog-cover" type="button" onClick={() => onNavigate(`/jelajah/${place.id}`)}>
                  <FallbackCover src={place.image} alt="Foto gunung dan perbukitan di Indonesia" />
                  <span className="cover-shade" />
                  <span className="cover-badges">
                    <span>{place.type}</span>
                    <StatusBadge status={place.status} />
                  </span>
                  <span className="cover-caption">
                    <span>{place.location}</span>
                    <strong>{place.name}</strong>
                  </span>
                  <span className="cover-height">{place.elevation == null ? "?" : place.elevation.toLocaleString("id-ID")} <small>MDPL</small></span>
                </button>
                <FavoriteButton
                  className="catalog-favorite"
                  placeName={place.name}
                  isSaved={favorites.includes(place.id)}
                  onToggle={() => onToggleFavorite?.(place.id)}
                />
                <div className="catalog-card-body">
                  <div className="catalog-facts">
                    <div><span>KOORDINAT</span><strong>{place.coordinates}</strong></div>
                    <div><span>WILAYAH</span><strong>{place.location}</strong></div>
                  </div>
                  <p>{place.summary}</p>
                  <div className="catalog-card-footer">
                      <PhotoCredit attribution={place.imageCredit} />
                    <button type="button" onClick={() => onNavigate(`/jelajah/${place.id}`)}>
                      Lihat detail <Icon name="arrow-up-right" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ditemukan bentang alam yang cocok."
            description="Coba ubah kata pencarian atau pilihan filternya."
            actionLabel="Tampilkan semua"
            onAction={resetFilters}
          />
        )}
        {filteredPlaces.length > 0 && pageCount > 1 && (
          <nav className="catalog-pagination" aria-label="Halaman destinasi">
            <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} aria-label="Halaman pertama"><Icon name="chevrons-left" /></button>
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}><Icon name="chevron-left" /> Sebelumnya</button>
            <span>Halaman <strong>{currentPage}</strong> dari <strong>{pageCount}</strong></span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount}>Berikutnya <Icon name="chevron-right" /></button>
            <button type="button" onClick={() => setCurrentPage(pageCount)} disabled={currentPage === pageCount} aria-label="Halaman terakhir"><Icon name="chevrons-right" /></button>
          </nav>
        )}
      </section>

      <RegionalDirectory places={places} selectedRegion={region} onSelectRegion={setRegion} />

      <section className="data-note-section">
        <div className="page-width data-note reveal">
          <div>
            <span className="eyebrow eyebrow-light">CATATAN DATA</span>
            <h2>Informasi alam selalu berkembang.</h2>
            <p>
              Profil ini merupakan pengantar untuk pendidikan dan eksplorasi.
              Verifikasi status aktivitas, keselamatan, serta akses kawasan melalui
              otoritas resmi sebelum mengambil keputusan perjalanan.
            </p>
          </div>
          <a className="button button-lime" href="/kontak" onClick={(event) => {
            event.preventDefault();
            onNavigate("/kontak");
          }}>Bagikan masukan <Icon name="arrow-up-right" /></a>
        </div>
      </section>
    </div>
  );
}

export function PlaceDetailPage({ place, onNavigate, isSaved = false, onToggleFavorite }) {
  if (!place) {
    return (
      <div className="inner-page">
        <section className="detail-not-found page-width">
          <span className="eyebrow">DESTINASI TIDAK DITEMUKAN</span>
          <h1>Jalur ini belum tercatat.</h1>
          <p>Silakan kembali ke direktori gunung dan bukit Nusantara.</p>
          <button className="button button-lime" type="button" onClick={() => onNavigate("/jelajah")}>
            Kembali ke Jelajah <Icon name="arrow-right" />
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="inner-page place-detail-page">
      <section className="place-detail-hero" style={{ "--detail-image": `url("${place.image}")` }}>
        <div className="place-detail-shade" />
        <div className="page-width place-detail-hero-content">
          <div className="place-detail-top-actions">
            <button className="detail-back-button" type="button" onClick={() => onNavigate("/jelajah")}>
              <Icon name="arrow-left" /> Kembali ke Jelajah
            </button>
          </div>
          <div className="place-detail-title">
            <span className="eyebrow eyebrow-light">{place.type} · {place.location}</span>
            <h1>{place.name}</h1>
            <p>{place.summary}</p>
            <div className="detail-hero-stats">
              <span><strong>{place.elevation == null ? "?" : `${place.elevation.toLocaleString("id-ID")} m`}</strong>Ketinggian</span>
              <span><strong>{place.kind === "gunung" ? "GUNUNG" : "BUKIT"}</strong>Kategori</span>
              <span><strong>{place.status}</strong>Informasi status</span>
            </div>
          </div>
        </div>
        <span className="detail-hero-coordinate">WGS84 · {place.coordinates}</span>
      </section>

      <section className="page-width place-detail-content">
        <div className="detail-main-column">
          <article className="detail-intro-card reveal">
            <div className="detail-intro-heading">
              <span className="eyebrow">MENGENAL DESTINASI</span>
              <FavoriteButton
                className="detail-content-favorite"
                placeName={place.name}
                isSaved={isSaved}
                onToggle={onToggleFavorite}
              />
            </div>
            <h2>Tentang {place.name}.</h2>
            <p>{place.summary}</p>
            <p>{place.history}</p>
            <p className="detail-coordinate-note">
              Koordinat pada profil menggunakan datum WGS84. Sebagian sumber
              mencatat titik dengan pembulatan sekitar satu menit busur; gunakan
              peta sebagai konteks lokasi, bukan alat navigasi lapangan.
            </p>
            <a
              className="detail-map-link"
              href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=11/${place.latitude}/${place.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Buka koordinat di OpenStreetMap <Icon name="arrow-up-right" />
            </a>
          </article>
          <article className="detail-ecology-card reveal">
            <span className="eyebrow">ALAM & KEHIDUPAN</span>
            <h2>Ekologi setempat</h2>
            <Detail label="HABITAT & VEGETASI" value={place.ecology} />
            <Detail label="FLORA & FAUNA" value={place.species} />
          </article>
          {place.myth && (
            <article className="detail-story-card reveal">
              <span className="eyebrow">CERITA & KEBUDAYAAN</span>
              <h2>Warisan yang dihormati.</h2>
              <p>{place.myth}</p>
            </article>
          )}
        </div>
        <aside className="detail-side-column">
          <WeatherClock compact place={place} places={places} />
          <section className="detail-facts-card reveal">
            <span className="eyebrow eyebrow-light">PROFIL DESTINASI</span>
            <h2>Data ringkas</h2>
            <PhotoCredit attribution={place.imageCredit} className="detail-photo-credit" />
            <Detail label="NAMA" value={place.name} />
            <Detail label="LOKASI" value={place.location} />
            <Detail label="KETINGGIAN" value={place.elevation == null ? "Tidak tersedia dalam dataset" : `${place.elevation.toLocaleString("id-ID")} meter`} />
            <Detail label="KOORDINAT WGS84" value={place.coordinates} />
            <Detail label="JENIS BENTANG ALAM" value={place.type} />
          </section>
          <section className="detail-safety-card reveal">
            <span className="safety-mark" aria-hidden="true">!</span>
            <span className="eyebrow">SEBELUM BERKUNJUNG</span>
            <p>{place.visit}</p>
            <a href="https://magma.esdm.go.id/" target="_blank" rel="noreferrer">
              Periksa sumber resmi <Icon name="arrow-up-right" />
            </a>
          </section>
          <button className="button button-forest detail-all-button" type="button" onClick={() => onNavigate("/jelajah")}>
            Jelajahi destinasi lain <Icon name="arrow-up-right" />
          </button>
        </aside>
      </section>
      <DestinationPhotoGallery place={place} />
    </div>
  );
}
