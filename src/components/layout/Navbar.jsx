import { useEffect, useRef, useState } from "react";
import logoNusa from "../../assets/logo-nusa.png";

function NavigationIcon({ name }) {
  const paths = {
    home: <><path d="m3.5 10 8.5-7 8.5 7v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V10Z" /><path d="M9 20.5v-7h6v7" /></>,
    explore: <><circle cx="10.8" cy="10.8" r="7" /><path d="m16 16 5 5M10.8 7v7.6m-3.8-3.8h7.6" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.4-.75L4 20l1.5-4A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8.5 11.5h.01m3.5 0h.01m3.5 0h.01" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Navbar({ items, activePage, onNavigate, themeControl }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!mobileMenuRef.current?.contains(event.target)) setIsMobileMenuOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => setIsMobileMenuOpen(false), [activePage]);

  function navigateFromMenu(event, path) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigate(path);
  }

  const renderLinks = (className, links = items) => links.map((item) => {
    const isActive = activePage === item.path;
    return (
      <a
        key={item.path}
        href={item.path}
        className={`${className}${isActive ? " is-active" : ""}`}
        aria-current={isActive ? "page" : undefined}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onNavigate(item.path);
        }}
      >
        <span className={`${className}-icon`}><NavigationIcon name={item.icon} /></span>
        <span className={`${className}-label`}>{item.label}</span>
      </a>
    );
  });
  const mobilePrimaryLinks = renderLinks("bottom-tab", items.filter((item) => item.path === "/" || item.path === "/jelajah"));
  const menuIsActive = ["/peta", "/bookmark", "/kontak", "/tentang"].includes(activePage);
  const chatIsActive = activePage === "/chat";

  return (
    <>
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="/" onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onNavigate("/");
          }} aria-label="NUSA — Puncak Cerita Nusantara, beranda">
            <img className="brand-logo" src={logoNusa} alt="" />
          </a>
          <nav className="primary-navigation" aria-label="Navigasi utama">
            {renderLinks("primary-nav-link")}
          </nav>
          <div className="header-theme-control">{themeControl}</div>
        </div>
      </header>
      <nav className="bottom-tabbar" aria-label="Navigasi utama mobile">
        <div className="bottom-tabbar-inner">
          {mobilePrimaryLinks}
          <div className={`mobile-menu${isMobileMenuOpen ? " is-open" : ""}`} ref={mobileMenuRef}>
            <button
              className={`bottom-tab mobile-menu-toggle${menuIsActive ? " is-active" : ""}`}
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span className="bottom-tab-icon"><NavigationIcon name="menu" /></span>
              <span className="bottom-tab-label">Menu</span>
            </button>
            {isMobileMenuOpen && (
              <div className="mobile-menu-panel" id="mobile-menu-panel" aria-label="Menu lainnya">
                {[
                  { path: "/bookmark", label: "Bookmark", icon: "bookmark" },
                  { path: "/peta", label: "Peta", icon: "map" },
                  { path: "/kontak", label: "Kontak", icon: "contact" },
                  { path: "/tentang", label: "Tentang", icon: "about" },
                ].map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`mobile-menu-link${activePage === item.path ? " is-active" : ""}`}
                    aria-current={activePage === item.path ? "page" : undefined}
                    onClick={(event) => navigateFromMenu(event, item.path)}
                  >
                    {item.icon === "bookmark" ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6.5 4.5h11v16l-5.5-3.8-5.5 3.8v-16Z" /></svg>
                    ) : <NavigationIcon name={item.icon} />}
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          <a
            href="/chat"
            className={`bottom-tab${chatIsActive ? " is-active" : ""}`}
            aria-current={chatIsActive ? "page" : undefined}
            onClick={(event) => navigateFromMenu(event, "/chat")}
          >
            <span className="bottom-tab-icon"><NavigationIcon name="chat" /></span>
            <span className="bottom-tab-label">Chat</span>
          </a>
        </div>
      </nav>
    </>
  );
}

export default Navbar;