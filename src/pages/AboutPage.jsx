import EdukasiStatus from "../components/ui/about/EdukasiStatus.jsx";
import Icon from "../components/ui/Icon.jsx";

const principles = [
  {
    number: "01",
    title: "Berangkat dari data",
    text: "Informasi geografis disajikan dengan konteks yang jelas, satuan yang mudah dibaca, dan rujukan yang dapat ditelusuri.",
  },
  {
    number: "02",
    title: "Menghormati alam",
    text: "Cerita tentang bentang alam berjalan bersama kepedulian pada ekosistem, keselamatan pengunjung, dan masyarakat setempat.",
  },
  {
    number: "03",
    title: "Belajar bersama",
    text: "Atlas ini menjadi titik awal untuk rasa ingin tahu, percakapan, pendidikan, dan kontribusi pengetahuan yang bertanggung jawab.",
  },
];

const sources = [
  ["PVMBG", "Informasi vulkanologi dan rekomendasi resmi aktivitas gunung api."],
  ["Badan Informasi Geospasial", "Referensi nama rupabumi dan informasi geospasial."],
  ["BRIN & publikasi ilmiah", "Riset kebumian, biodiversitas, dan ekologi Indonesia."],
  ["Pengelola kawasan", "Informasi konservasi, akses, dan tata kunjung kawasan."],
];

export default function AboutPage() {
  return (
    <div className="inner-page about-page">
      <section className="inner-hero about-hero">
        <div className="page-width inner-hero-content">
          <span className="eyebrow eyebrow-light">TENTANG NUSA</span>
          <h1>Alam lebih dekat saat kita mengenalnya.</h1>
          <p>
            NUSA adalah ruang belajar untuk mengenali bentang alam Indonesia melalui
            cerita, lokasi, dan wawasan konservasi.
          </p>
        </div>
        <div className="about-hero-mark" aria-hidden="true">EA<span>.</span></div>
      </section>

      <section className="about-story page-width section-space">
        <div className="about-story-heading reveal">
          <span className="eyebrow">MENGAPA NUSA</span>
          <h2>Rasa ingin tahu adalah langkah pertama menjaga alam.</h2>
        </div>
        <div className="about-story-copy reveal">
          <p>
            Indonesia memiliki gunung dan perbukitan dengan keunikan geologi,
            ekologi, dan budaya di setiap wilayah. Informasinya tersebar di banyak
            tempat, sementara cerita alam sering kali terasa jauh dari keseharian.
          </p>
          <p>
            NUSA merangkum pengenalan bentang alam dalam pengalaman yang
            tenang dan mudah dijelajahi. Setiap profil adalah undangan untuk
            belajar lebih jauh—bukan pengganti informasi resmi atau panduan lapangan.
          </p>
          <a className="text-link" href="/jelajah">Jelajahi direktori alam <Icon name="arrow-up-right" /></a>
        </div>
      </section>

      <section className="principles-section">
        <div className="page-width section-space">
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">PEGANGAN KAMI</span>
              <h2>Informasi dengan rasa tanggung jawab.</h2>
              <p>Prinsip sederhana yang membentuk cara kami bercerita tentang alam.</p>
            </div>
          </div>
          <div className="principles-grid">
            {principles.map((item) => (
              <article className="principle-card reveal" key={item.number}>
                <span className="principle-number">{item.number}</span>
                <span className="principle-leaf" aria-hidden="true">✳</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="page-width">
        <EdukasiStatus />
      </div>

      <section className="about-method page-width section-space">
        <div className="method-visual reveal">
          <div className="contour-ring contour-ring-one" />
          <div className="contour-ring contour-ring-two" />
          <div className="contour-ring contour-ring-three" />
          <span>0° 47′ 55″ S</span>
          <strong>INDONESIA</strong>
          <small>3.676 M · GUNUNG SEMERU</small>
        </div>
        <div className="method-copy reveal">
          <span className="eyebrow">BAGAIMANA KAMI MENYUSUNNYA</span>
          <h2>Ringkas, terbuka, dan terus belajar.</h2>
          <p>
            Informasi umum disusun sebagai bahan pengenalan. Data lokasi dan
            karakter bentang alam dibaca bersama sumber geospasial, pengelola
            kawasan, serta rujukan sains yang relevan.
          </p>
          <ol className="method-steps">
            <li><span>01</span><div><strong>Kenali konteks</strong><p>Setiap tempat memiliki kondisi dan cerita yang berbeda.</p></div></li>
            <li><span>02</span><div><strong>Telusuri sumber</strong><p>Gunakan rujukan resmi untuk informasi yang berubah dari waktu ke waktu.</p></div></li>
            <li><span>03</span><div><strong>Bagikan dengan bijak</strong><p>Gunakan pengetahuan untuk belajar, bukan untuk mengambil risiko yang tidak perlu.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="sources-section">
        <div className="page-width section-space">
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">RUJUKAN UNTUK DITELUSURI</span>
              <h2>Mulai dari sumber yang tepercaya.</h2>
            </div>
          </div>
          <div className="source-list">
            {sources.map(([name, description], index) => (
              <article className="source-row reveal" key={name}>
                <span>0{index + 1}</span>
                <strong>{name}</strong>
                <p>{description}</p>
                {name === "PVMBG" ? (
                  <a href="https://magma.esdm.go.id/" target="_blank" rel="noreferrer" aria-label="Buka situs MAGMA Indonesia"><Icon name="arrow-up-right" /></a>
                ) : (
                  <span className="source-arrow"><Icon name="arrow-up-right" /></span>
                )}
              </article>
            ))}
          </div>
          <p className="source-disclaimer">
            NUSA adalah media pengenalan independen dan bukan kanal resmi
            lembaga pemerintah. Periksa sumber primer untuk informasi terkini.
          </p>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="page-width about-cta reveal">
          <div>
            <span className="eyebrow eyebrow-light">LANGKAH BERIKUTNYA</span>
            <h2>Setiap perjalanan dimulai dari mengenal.</h2>
          </div>
          <a className="button button-lime" href="/jelajah">Jelajahi atlas <Icon name="arrow-up-right" /></a>
        </div>
      </section>
    </div>
  );
}
