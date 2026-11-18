import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

function MainLayout({ children, items, activePage, onNavigate, themeControl }) {
  return (
    <>
      <Navbar
        items={items}
        activePage={activePage}
        onNavigate={onNavigate}
        themeControl={themeControl}
      />
      {children}
      <Footer activePage={activePage} onNavigate={onNavigate} />
    </>
  );
}

export default MainLayout;