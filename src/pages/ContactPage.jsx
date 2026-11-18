import ContributionForm from "../components/ui/contact/ContributionForm.jsx";
import LeaveNoTraceList from "../components/ui/contact/LeaveNoTraceList.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function ContactPage({ onNavigate }) {
  return (
    <div className="inner-page contact-page">
      <section className="inner-hero contact-hero">
        <div className="page-width inner-hero-content">
          <span className="eyebrow eyebrow-light">KONTAK & KONTRIBUSI</span>
          <h1>Pengetahuan alam tumbuh saat dibagikan.</h1>
          <p>
            Punya koreksi, usulan lokasi, atau cerita konservasi? Sampaikan
            masukan dengan konteks yang jelas agar dapat ditinjau dengan baik.
          </p>
        </div>
      </section>

      <section className="contact-content page-width section-space">
        <div className="contact-form-column reveal">
          <div className="contact-form-heading">
            <span className="eyebrow">RUANG KONTRIBUSI</span>
            <h2>Kirimkan masukan Anda.</h2>
            <p>
              Mohon sertakan sumber atau konteks lokasi jika mengusulkan koreksi data.
            </p>
          </div>
          <ContributionForm />
        </div>
        <aside className="contact-side reveal">
          <div className="contact-photo-contribution">
            <span className="eyebrow eyebrow-light">KONTRIBUSI VISUAL</span>
            <h2>Punya foto cerita alam?</h2>
            <p>Kirim gambar destinasi beserta nama dan email untuk kredit fotografer.</p>
            <button className="button button-lime" type="button" onClick={() => onNavigate("/kontribusi")}>
              Kontribusi foto <Icon name="arrow-up-right" />
            </button>
          </div>
          <div className="contact-aside-card">
            <span className="contact-aside-icon" aria-hidden="true">✳</span>
            <span className="eyebrow eyebrow-light">SEBELUM MENJELAJAH</span>
            <h2>Jaga alam, jaga sesama.</h2>
            <p>Checklist sederhana untuk perjalanan yang lebih bertanggung jawab.</p>
            <LeaveNoTraceList />
          </div>
          <div className="contact-note">
            <span className="eyebrow">INFORMASI KESELAMATAN</span>
            <p>
              Untuk status gunung api dan akses kawasan, hubungi otoritas terkait
              secara langsung. NUSA bukan layanan darurat atau sumber status
              real-time.
            </p>
            <a href="https://magma.esdm.go.id/" target="_blank" rel="noreferrer">
              Kunjungi MAGMA Indonesia <Icon name="arrow-up-right" />
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
