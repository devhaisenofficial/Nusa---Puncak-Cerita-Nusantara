import logoNusa from "../../assets/logo-nusa.png";
import Icon from "../ui/Icon.jsx";

function Footer({ activePage, onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <a className="brand footer-brand" href="/" onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }} aria-label="NUSA — Puncak Cerita Nusantara, beranda">
          <img className="brand-logo" src={logoNusa} alt="" />
        </a>
        <p>
          <strong>Puncak Cerita Nusantara</strong>
          <span>Setiap puncak memiliki cerita, setiap gunung menyimpan makna. NUSA hadir untuk merangkai keindahan, pengetahuan, dan kisah dari pegunungan Nusantara dalam satu ruang digital.</span>
        </p>
        {activePage === "/" ? (
          <a className="footer-top-link" href="#beranda">Kembali ke atas <Icon name="arrow-up" /></a>
        ) : (
          <button className="footer-top-link footer-top-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Kembali ke atas <Icon name="arrow-up" />
          </button>
        )}
      </div>
      <div className="page-width footer-bottom">
        <span>© 2026 NUSA — Puncak Cerita Nusantara</span>
        <span>Jelajah dengan rasa ingin tahu. Jaga dengan sepenuh hati.</span>
      </div>
    </footer>
  );
}

export default Footer;