import { useEffect, useMemo, useRef, useState } from "react";
import BookmarkDrawer from "./components/BookmarkDrawer.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import AboutPage from "./components/pages/AboutPage.jsx";
import ContactPage from "./components/pages/ContactPage.jsx";
import ExplorePage, { PlaceDetailPage } from "./components/pages/ExplorePage.jsx";
import HomePage from "./components/pages/HomePage.jsx";
import { resolveRoute } from "./router/AppRouter.jsx";
import useDocumentTitle from "./hooks/useDocumentTitle.js";
import Chatbot from "./components/Chatbot.jsx";
import InfiniteDestinationCarousel from "./components/ui/InfiniteDestinationCarousel.jsx";
import ContributionPage from "./pages/ContributionPage.jsx";
import BookmarkPage from "./pages/BookmarkPage.jsx";
import { getPlaceById, places } from "./services/alamService.js";
import Icon from "./components/ui/Icon.jsx";
import { MapExplorerPage } from "./components/ui/home/MapExplorer.jsx";

const initialMapZoom = 5;
const mapTileColumns = 5;
const mapTileRows = 3;
const minimumMapZoom = 4;
const maximumMapZoom = 8;

function getWorldTilePosition(latitude, longitude, zoom) {
  const scale = 2 ** zoom;
  const radians = (latitude * Math.PI) / 180;
  const worldX = ((longitude + 180) / 360) * scale;
  const worldY = ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * scale;
  return {
    x: worldX,
    y: worldY,
  };
}

function getMapPosition(latitude, longitude, zoom, startX, startY) {
  const world = getWorldTilePosition(latitude, longitude, zoom);
  return {
    x: ((world.x - startX) / mapTileColumns) * 100,
    y: ((world.y - startY) / mapTileRows) * 100,
  };
}

const locations = places.map((place) => {
  return {
    id: place.id,
    name: place.name,
    kind: place.kind === "bukit" ? "Bukit" : "Gunung",
    island: place.regionLabel,
    status: place.status,
    altitude: place.elevation == null ? "Data ketinggian belum tersedia" : `${place.elevation.toLocaleString("id-ID")} mdpl`,
    coordinates: place.coordinates,
    latitude: place.latitude,
    longitude: place.longitude,
    description: place.summary,
  };
});

const destinations = places.map((place) => ({
  title: place.name,
  id: place.id,
  subtitle: `${place.location} · ${place.regionLabel}`,
  label: place.kind === "bukit" ? "BUKIT" : "GUNUNG",
  region: place.region,
  regionLabel: place.regionLabel,
  image: place.image,
  imageCredit: place.imageCredit,
  alt: `Panorama ${place.name}, Indonesia`,
  description: place.summary,
}));

function ArrowIcon({ diagonal = false }) {
  return <Icon name={diagonal ? "arrow-up-right" : "arrow-right"} />;
}

function VideoAudioToggle({ muted, onToggle, className }) {
  return (
    <button
      className={className}
      type="button"
      aria-label={muted ? "Aktifkan suara video" : "Nonaktifkan suara video"}
      aria-pressed={!muted}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        {muted ? (
          <path d="m17 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        ) : (
          <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        )}
      </svg>
      <span>{muted ? "Suara mati" : "Suara aktif"}</span>
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Memuat NUSA">
      <div className="chasing-squares" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="loading-label">Menyusuri Nusantara</span>
    </div>
  );
}

function VideoIntro({ phase, progressRef, videoRef, muted, onToggleAudio, onAutoplayFallback, onFinish, onMetadata, onProgress, onAnimationEnd }) {
  const [canSkip, setCanSkip] = useState(false);
  const fadeFrameRef = useRef(0);
  const isFadingRef = useRef(false);

  useEffect(() => {
    if (phase !== "playing") {
      setCanSkip(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setCanSkip(true), 5000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    return () => window.cancelAnimationFrame(fadeFrameRef.current);
  }, []);

  function handlePlaybackBlocked(error) {
    if (error?.name !== "NotAllowedError") {
      console.error("Video pembuka tidak dapat diputar.", error);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    onAutoplayFallback();
    video.play()?.catch((fallbackError) => {
      console.error("Autoplay video pembuka gagal, termasuk dalam mode senyap.", fallbackError);
    });
  }

  function toggleAudio() {
    onToggleAudio();
    videoRef.current?.play()?.catch(handlePlaybackBlocked);
  }

  function fadeOutAndFinish() {
    if (phase === "playing" && !isFadingRef.current) {
      isFadingRef.current = true;
      const video = videoRef.current;
      if (video) {
        window.cancelAnimationFrame(fadeFrameRef.current);
        const initialVolume = video.volume;
        const startedAt = performance.now();
        function fadeAudio(timestamp) {
          const progress = Math.max(0, Math.min((timestamp - startedAt) / 1500, 1));
          video.volume = Math.max(0, Math.min(initialVolume * (1 - progress), 1));
          if (progress < 1) {
            fadeFrameRef.current = window.requestAnimationFrame(fadeAudio);
          }
        }
        fadeFrameRef.current = window.requestAnimationFrame(fadeAudio);
      }
    }
    onFinish();
  }

  return (
    <div
      className={`video-intro${phase === "exiting" ? " is-exiting" : ""}`}
      onAnimationEnd={onAnimationEnd}
    >
      <video
        ref={videoRef}
        className="video-intro-media"
        aria-hidden="true"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onCanPlay={(event) => {
          const playback = event.currentTarget.play();
          playback?.catch(handlePlaybackBlocked);
        }}
        onLoadedMetadata={onMetadata}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          if (Number.isFinite(duration) && duration > 0) {
            onProgress(Math.min((currentTime / duration) * 100, 100));
            const timeRemaining = duration - currentTime;
            if (timeRemaining <= 1.6 && phase === "playing") fadeOutAndFinish();
          }
        }}
        onEnded={fadeOutAndFinish}
        onError={onFinish}
      >
        <source src="/images/hero/hero-nature.mp4" type="video/mp4" />
      </video>
      <VideoAudioToggle
        className="video-audio-toggle"
        muted={muted}
        onToggle={toggleAudio}
      />
      <div
        ref={progressRef}
        className="video-progress-shell"
        style={{ "--video-progress": "0%" }}
        role="progressbar"
        aria-label="Progres video pembuka"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <span className="video-progress-pine" aria-hidden="true">
          <svg viewBox="0 0 24 30" fill="none">
            <path
              d="M12 1.5 6.1 9h3L4.6 15.1h4.7l-4 5.1h5.3v7.4h2.8v-7.4h5.3l-4-5.1h4.7L14.9 9h3L12 1.5Z"
              fill="currentColor"
            />
            <path d="M12 4.2v18.4" stroke="#f4f4e8" strokeOpacity=".65" strokeWidth=".8" />
          </svg>
        </span>
        <span className="video-progress-track" aria-hidden="true">
          <span className="video-progress-fill" />
        </span>
      </div>
      {canSkip && phase === "playing" && (
        <button className="video-skip-button" type="button" onClick={fadeOutAndFinish}>
          Lewati video
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h10m-4-4 4 4-4 4M17 5v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function TreeScrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    function updateThumb() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const track = trackRef.current;
        const thumb = thumbRef.current;
        if (track && thumb && !draggingRef.current) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
          const maxTravel = Math.max(track.clientHeight - thumb.offsetHeight, 0);
          thumb.style.transform = `translateY(${progress * maxTravel}px)`;
          thumb.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        }
        frame = 0;
      });
    }

    updateThumb();
    window.addEventListener("scroll", updateThumb, { passive: true });
    window.addEventListener("resize", updateThumb);
    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function scrollAt(clientY) {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    const bounds = track.getBoundingClientRect();
    const maxTravel = Math.max(track.clientHeight - thumb.offsetHeight, 1);
    const progress = Math.max(0, Math.min((clientY - bounds.top - thumb.offsetHeight / 2) / maxTravel, 1));
    window.scrollTo({
      top: progress * (document.documentElement.scrollHeight - window.innerHeight),
      behavior: "auto",
    });
    thumb.style.transform = `translateY(${progress * maxTravel}px)`;
    thumb.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  }

  return (
    <div
      className="tree-scrollbar"
      ref={trackRef}
      aria-label="Navigasi gulir halaman"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) scrollAt(event.clientY);
      }}
    >
      <button
        className="tree-scroll-thumb"
        ref={thumbRef}
        type="button"
        role="slider"
        aria-label="Gulir halaman"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        onPointerDown={(event) => {
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          scrollAt(event.clientY);
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) scrollAt(event.clientY);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        onKeyDown={(event) => {
          const page = window.innerHeight * 0.8;
          let top;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") top = window.scrollY + 80;
          else if (event.key === "ArrowUp" || event.key === "ArrowLeft") top = window.scrollY - 80;
          else if (event.key === "PageDown") top = window.scrollY + page;
          else if (event.key === "PageUp") top = window.scrollY - page;
          else if (event.key === "Home") top = 0;
          else if (event.key === "End") top = document.documentElement.scrollHeight;
          if (top !== undefined) {
            event.preventDefault();
            window.scrollTo({ top, behavior: "smooth" });
          }
        }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 30" fill="none">
          <path d="M12 1.5 6.1 9h3L4.6 15.1h4.7l-4 5.1h5.3v7.4h2.8v-7.4h5.3l-4-5.1h4.7L14.9 9h3L12 1.5Z" fill="currentColor" />
          <path d="M12 4.2v18.4" stroke="#f4f4e8" strokeOpacity=".7" strokeWidth=".8" />
        </svg>
      </button>
    </div>
  );
}

function ThemeSun({ theme, onToggle }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleClick() {
    setIsAnimating(false);
    window.requestAnimationFrame(() => setIsAnimating(true));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsAnimating(false), 720);
    onToggle();
  }

  return (
    <button
      className={`theme-sun${theme === "dark" ? " is-dark" : ""}${isAnimating ? " is-animating" : ""}`}
      type="button"
      aria-label={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
      aria-pressed={theme === "dark"}
      onClick={handleClick}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          <svg className="theme-toggle-icon theme-toggle-sun" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <svg className="theme-toggle-icon theme-toggle-moon" viewBox="0 0 24 24" fill="none">
            <path d="M19.2 15.1A8 8 0 0 1 8.9 4.8 8.2 8.2 0 1 0 19.2 15.1Z" fill="currentColor" />
            <path d="m16.8 4 .5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <span className="sun-tooltip" aria-hidden="true">Tema {theme === "dark" ? "terang" : "gelap"}</span>
    </button>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selectedLocation, setSelectedLocation] = useState(
    locations.find((location) => location.id === "118") ?? locations[0],
  );
  const [mapZoom, setMapZoom] = useState(initialMapZoom);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [mapViewportWidth, setMapViewportWidth] = useState(() => window.innerWidth);
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [introPhase, setIntroPhase] = useState(() =>
    window.location.pathname === "/" ? "playing" : "done",
  );
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem("eco-atlas-theme") === "dark" ? "dark" : "light";
    } catch (error) {
      console.error("Tidak dapat memuat preferensi tema Eco-Atlas.", error);
      return "light";
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = window.localStorage.getItem("eco-atlas-favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) {
        console.error("Format bookmark Eco-Atlas di penyimpanan lokal tidak valid.");
        return [];
      }
      const ids = parsed.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.id === "string") return item.id;
        return null;
      });
      if (ids.some((id) => id === null)) {
        console.error("Sebagian bookmark Eco-Atlas tidak memiliki ID yang valid.");
      }
      const validIds = ids.filter((id) => id && getPlaceById(id));
      if (validIds.length !== ids.filter(Boolean).length) {
        console.error("Bookmark yang tidak lagi tersedia di katalog telah diabaikan.");
      }
      return [...new Set(validIds)];
    } catch (error) {
      console.error("Tidak dapat memuat bookmark Eco-Atlas dari penyimpanan lokal.", error);
      return [];
    }
  });
  const introVideoRef = useRef(null);
  const heroVideoRef = useRef(null);
  const introProgressRef = useRef(null);
  const introFallbackTimerRef = useRef(0);
  const mapDragRef = useRef(null);
  const mapPanelRef = useRef(null);
  const mapScale = 2 ** mapZoom;
  const mapCenter = getWorldTilePosition(selectedLocation.latitude, selectedLocation.longitude, mapZoom);
  const mapStartX = mapCenter.x - mapTileColumns / 2 - mapPan.x;
  const mapStartY = mapCenter.y - mapTileRows / 2 - mapPan.y;
  const mapTiles = Array.from({ length: mapTileColumns * mapTileRows }, (_, index) => {
    const column = index % mapTileColumns;
    const row = Math.floor(index / mapTileColumns);
    const rawX = Math.floor(mapStartX) + column;
    const y = Math.floor(mapStartY) + row;
    return {
      x: ((rawX % mapScale) + mapScale) % mapScale,
      y,
      left: `${((rawX - mapStartX) / mapTileColumns) * 100}%`,
      top: `${((y - mapStartY) / mapTileRows) * 100}%`,
    };
  }).filter((tile) => tile.y >= 0 && tile.y < mapScale);

  function navigate(path) {
    if (path === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.history.pushState({}, "", path);
    setPathname(path);
  }

  function toggleFavorite(placeId) {
    setFavorites((current) => current.includes(placeId)
      ? current.filter((id) => id !== placeId)
      : [...current, placeId]);
  }

  function toggleVideoAudio() {
    const nextMuted = !isVideoMuted;
    setIsVideoMuted(nextMuted);
    const video = introVideoRef.current;
    if (!video) return;

    video.muted = nextMuted;
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("eco-atlas-theme", theme);
    } catch (error) {
      console.error("Tidak dapat menyimpan preferensi tema Eco-Atlas.", error);
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem("eco-atlas-favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Tidak dapat menyimpan bookmark Eco-Atlas.", error);
    }
  }, [favorites]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const panel = mapPanelRef.current;
    if (!panel) return undefined;
    function zoomWithWheel(event) {
      event.preventDefault();
      setMapZoom((zoom) => Math.max(
        minimumMapZoom,
        Math.min(maximumMapZoom, zoom + (event.deltaY < 0 ? 1 : -1)),
      ));
    }
    panel.addEventListener("wheel", zoomWithWheel, { passive: false });
    return () => panel.removeEventListener("wheel", zoomWithWheel);
  }, [pathname]);

  useEffect(() => {
    function updateMapViewportWidth() {
      setMapViewportWidth(window.innerWidth);
    }

    window.addEventListener("resize", updateMapViewportWidth);
    return () => window.removeEventListener("resize", updateMapViewportWidth);
  }, []);

  useEffect(() => {
    if (introPhase === "done") {
      document.body.classList.remove("intro-active");
      return undefined;
    }

    document.body.classList.add("intro-active");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finishForReducedMotion = () => {
      if (motionQuery.matches) setIntroPhase("done");
    };
    finishForReducedMotion();
    motionQuery.addEventListener("change", finishForReducedMotion);
    introFallbackTimerRef.current = window.setTimeout(finishVideoIntro, 45000);

    return () => {
      document.body.classList.remove("intro-active");
      motionQuery.removeEventListener("change", finishForReducedMotion);
      window.clearTimeout(introFallbackTimerRef.current);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase === "playing") return;
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch((error) => {
      if (error?.name !== "NotAllowedError") {
        console.error("Video latar beranda tidak dapat diputar.", error);
      }
    });
  }, [introPhase, pathname]);

  function finishVideoIntro() {
    window.clearTimeout(introFallbackTimerRef.current);
    updateIntroProgress(100);
    setIntroPhase((phase) => (phase === "playing" ? "exiting" : phase));
  }

  function updateIntroProgress(progress) {
    const element = introProgressRef.current;
    if (!element) return;
    element.style.setProperty("--video-progress", `${progress}%`);
    element.setAttribute("aria-valuenow", String(Math.round(progress)));
  }

  function handleIntroMetadata(event) {
    const duration = event.currentTarget.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    window.clearTimeout(introFallbackTimerRef.current);
    introFallbackTimerRef.current = window.setTimeout(
      finishVideoIntro,
      Math.min(duration * 1000 + 5000, 300000),
    );
  }

  useEffect(() => {
    function onPopState() {
      setPathname(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
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
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    return () => revealObserver.disconnect();
  }, [pathname]);

  const visibleLocations = useMemo(
    () => activeFilter === "Semua"
      ? locations
      : locations.filter((location) =>
          activeFilter === "Gunung" ? location.kind === "Gunung" : location.kind === "Bukit",
        ),
    [activeFilter],
  );
  const projectedLocations = useMemo(() => {
    const mobileViewport = mapViewportWidth <= 760;
    const mapWidth = mobileViewport ? Math.max(mapViewportWidth - 32, 1) : mapViewportWidth * 0.6;
    const mapHeight = mobileViewport
      ? Math.min(350, Math.max(250, mapViewportWidth * 0.7))
      : 440;
    const minCellSize = mobileViewport ? 28 : 30;
    const bucketWidth = Math.max(
      mapZoom >= 7 ? 1.8 : mapZoom >= 6 ? 2.5 : 3.3,
      (minCellSize / mapWidth) * 100,
    );
    const bucketHeight = Math.max(
      mapZoom >= 7 ? 2.5 : mapZoom >= 6 ? 3.5 : 4.5,
      (minCellSize / mapHeight) * 100,
    );
    const clusters = new Map();

    visibleLocations.forEach((location) => {
      const position = getMapPosition(location.latitude, location.longitude, mapZoom, mapStartX, mapStartY);
      if (position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) return;
      const key = `${Math.floor(position.x / bucketWidth)}:${Math.floor(position.y / bucketHeight)}`;
      const cluster = clusters.get(key);
      if (cluster) {
        cluster.locations.push(location);
        cluster.x += position.x;
        cluster.y += position.y;
      } else {
        clusters.set(key, { locations: [location], x: position.x, y: position.y });
      }
    });

    return [...clusters.values()].map(({ locations: clusterLocations, x, y }) => ({
      location: clusterLocations[0],
      count: clusterLocations.length,
      isSelected: clusterLocations.some((location) => location.id === selectedLocation.id),
      position: { x: x / clusterLocations.length, y: y / clusterLocations.length },
    }));
  }, [mapZoom, mapStartX, mapStartY, mapViewportWidth, selectedLocation.id, visibleLocations]);
  const visibleMapLocationCount = projectedLocations.reduce((total, cluster) => total + cluster.count, 0);

  function chooseFilter(filter) {
    setActiveFilter(filter);
    const nextLocations =
      filter === "Semua"
        ? locations
        : locations.filter((location) =>
            filter === "Gunung" ? location.kind === "Gunung" : location.kind === "Bukit",
          );
    if (!nextLocations.some((location) => location.id === selectedLocation.id)) {
      setSelectedLocation(nextLocations[0]);
      setMapPan({ x: 0, y: 0 });
    }
  }

  const navItems = [
    { path: "/", label: "Beranda", icon: "home" },
    { path: "/jelajah", label: "Jelajah", icon: "explore" },
    { path: "/peta", label: "Peta", icon: "map" },
    { path: "/tentang", label: "Tentang", icon: "about" },
    { path: "/kontak", label: "Kontak", icon: "contact" },
  ];
  const route = resolveRoute(pathname);
  const activePage = route.activePage;
  const detailId = route.detailId;
  const activePlace = detailId ? getPlaceById(detailId) : null;

  const pageTitle = activePage === "/jelajah"
    ? activePlace
        ? `${activePlace.name} — NUSA`
        : "Jelajah Gunung & Bukit — NUSA"
    : activePage === "/chat"
        ? "Teman Jelajah — NUSA"
    : activePage === "/peta"
        ? "Peta Sebaran Alam — NUSA"
    : activePage === "/bookmark"
        ? "Destinasi Tersimpan — NUSA"
    : activePage === "/kontribusi"
        ? "Kontribusi Foto — NUSA"
    : activePage === "/tentang"
        ? "Tentang NUSA"
      : activePage === "/kontak"
          ? "Kontak & Kontribusi — NUSA"
          : "NUSA — Puncak Cerita Nusantara";
  useDocumentTitle(pageTitle);

  function handleRouteClick(event, path) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(path);
  }

  return (
    <>
      {introPhase !== "done" && (
        <VideoIntro
          phase={introPhase}
          progressRef={introProgressRef}
          videoRef={introVideoRef}
          muted={isVideoMuted}
          onToggleAudio={toggleVideoAudio}
          onAutoplayFallback={() => setIsVideoMuted(true)}
          onFinish={finishVideoIntro}
          onProgress={updateIntroProgress}
          onMetadata={handleIntroMetadata}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && introPhase === "exiting") {
              setIntroPhase("done");
            }
          }}
        />
      )}
      <div className={`site-shell${introPhase === "done" ? " is-revealed" : introPhase === "exiting" ? " is-intro-revealing" : " is-hidden"}`}>
      {isLoading && activePage !== "/" && <LoadingScreen />}
      <MainLayout
        items={navItems}
        activePage={activePage}
        onNavigate={navigate}
        themeControl={introPhase === "done" ? (
          <ThemeSun
            theme={theme}
            onToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          />
        ) : null}
      >
        {introPhase === "done" && activePage !== "/chat" && activePage !== "/bookmark" && (
          <BookmarkDrawer favorites={favorites} onToggleFavorite={toggleFavorite} onNavigate={navigate} />
        )}

      <main>
        <div key={pathname} className="route-transition">
        {activePage === "/chat" ? (
          <div className="chat-page-backdrop" aria-hidden="true" />
        ) : activePage === "/peta" ? (
          <MapExplorerPage
            locations={locations}
            activeFilter={activeFilter}
            chooseFilter={chooseFilter}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            onNavigate={navigate}
            mapSurfaceProps={{
              panelRef: mapPanelRef,
              isDragging: isDraggingMap,
              setIsDragging: setIsDraggingMap,
              dragRef: mapDragRef,
              mapPan,
              setMapPan,
              mapTiles,
              mapZoom,
              setMapZoom,
              projectedLocations,
              visibleLocationCount: visibleMapLocationCount,
              selectedLocation,
              setSelectedLocation,
              minimumMapZoom,
              maximumMapZoom,
              initialMapZoom,
            }}
          />
        ) : activePage === "/bookmark" ? (
          <BookmarkPage favorites={favorites} onToggleFavorite={toggleFavorite} onNavigate={navigate} />
        ) : activePage === "/" ? (
          <HomePage>
          <>
        <section className="hero" id="beranda" data-section>
          <video
            ref={heroVideoRef}
            className="hero-video"
            autoPlay={introPhase === "done" || introPhase === "exiting"}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/peaks/indonesia-mountain-24.jpg"
            aria-hidden="true"
          >
            <source src="/images/hero/hero-nature.mp4" type="video/mp4" />
          </video>
          <div className="hero-shade" />
          <div className="hero-content page-width">
            <div className="hero-copy">
              <span className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                PUNCAK CERITA NUSANTARA
              </span>
              <h1>
                Mengenal Alam
                <br />
                <span>Mengabadikan Keindahan.</span>
              </h1>
              <p>
                Setiap puncak memiliki cerita, setiap gunung menyimpan makna. NUSA hadir
                untuk merangkai keindahan, pengetahuan, dan kisah dari pegunungan
                Nusantara dalam satu ruang digital.
              </p>
              <div className="hero-actions">
                <a className="button button-lime" href="#peta">
                  Jelajahi peta <ArrowIcon />
                </a>
                <a
                  className="button button-ghost"
                  href="/jelajah"
                  onClick={(event) => handleRouteClick(event, "/jelajah")}
                >
                  Kenali alam Indonesia
                </a>
              </div>
            </div>
            <div className="hero-footnote">
              <span className="live-indicator" />
              <span>MENJELAJAHI KEPULAUAN INDONESIA</span>
              <span className="hero-coordinate">0° 47′ 55″ S &nbsp; 113° 55′ 59″ E</span>
            </div>
          </div>
        </section>

        <section className="overview-section" id="ringkasan">
          <div className="page-width overview-grid">
            <div className="overview-intro reveal">
              <span className="eyebrow">MENGENAL NUSANTARA</span>
              <h2>Alam yang luas, cerita yang dekat.</h2>
            </div>
            <p className="overview-description reveal">
              Dari puncak gunung hingga perbukitan berhutan, kenali kekayaan
              pegunungan Indonesia melalui informasi yang dirangkum sederhana.
            </p>
            <div className="stat-list reveal">
              <div className="stat-item">
                <strong>{places.length}</strong>
                <span>profil gunung & bukit</span>
              </div>
              <div className="stat-item">
                <strong>7</strong>
                <span>wilayah Nusantara</span>
              </div>
              <div className="stat-item">
                <strong>2</strong>
                <span>kategori bentang alam</span>
              </div>
            </div>
          </div>
        </section>

        <section className="map-section section-space" id="peta" data-section>
          <div className="page-width">
            <div className="section-heading reveal">
              <div>
                <span className="eyebrow">JELAJAHI KEPULAUAN</span>
                <h2>Peta sebaran alam.</h2>
                <p>Pilih titik pengamatan untuk melihat informasi ringkasnya.</p>
              </div>
              <div className="map-section-actions">
                <button
                  className="full-map-entry-button"
                  type="button"
                  onClick={() => navigate("/peta")}
                >
                  Lihat peta penuh <Icon name="arrow-up-right" />
                </button>
                <div className="filter-group" role="group" aria-label="Filter titik peta">
                  {["Semua", "Gunung", "Bukit"].map((filter) => (
                    <button
                      className={activeFilter === filter ? "filter-button is-active" : "filter-button"}
                      key={filter}
                      type="button"
                      aria-pressed={activeFilter === filter}
                      onClick={() => chooseFilter(filter)}
                    >
                      {filter}
                      <span>
                        {filter === "Semua"
                          ? locations.length
                          : locations.filter((location) => location.kind === filter).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="map-layout reveal" id="interactive-map">
              <div
                ref={mapPanelRef}
                className={`map-panel${isDraggingMap ? " is-dragging" : ""}`}
                onPointerDown={(event) => {
                  if (event.button !== 0 || event.target.closest("button, a")) return;
                  mapDragRef.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                    panX: mapPan.x,
                    panY: mapPan.y,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setIsDraggingMap(true);
                }}
                onPointerMove={(event) => {
                  const drag = mapDragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const maxX = 1.5;
                  const maxY = 1.5;
                  setMapPan({
                    x: Math.max(-maxX, Math.min(maxX, drag.panX + ((event.clientX - drag.startX) / bounds.width) * mapTileColumns)),
                    y: Math.max(-maxY, Math.min(maxY, drag.panY + ((event.clientY - drag.startY) / bounds.height) * mapTileRows)),
                  });
                }}
                onPointerUp={(event) => {
                  if (mapDragRef.current?.pointerId !== event.pointerId) return;
                  mapDragRef.current = null;
                  setIsDraggingMap(false);
                }}
                onPointerCancel={() => {
                  mapDragRef.current = null;
                  setIsDraggingMap(false);
                }}
              >
                <div
                  className="map-pan-layer"
                >
                  <div className="map-tile-layer" aria-hidden="true">
                    {mapTiles.map((tile) => (
                      <img
                        key={`${tile.x}-${tile.y}`}
                        src={`https://tile.openstreetmap.org/${mapZoom}/${tile.x}/${tile.y}.png`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          left: tile.left,
                          top: tile.top,
                          width: `${100 / mapTileColumns}%`,
                          height: `${100 / mapTileRows}%`,
                        }}
                      />
                    ))}
                  </div>
                  {projectedLocations.map(({ location, position, count, isSelected }) => (
                    <button
                      className={`map-pin${isSelected ? " is-selected" : ""}${count > 1 ? " is-cluster" : ""}`}
                      key={location.id}
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      type="button"
                      aria-label={count > 1 ? `${count} destinasi berdekatan, pilih untuk memperbesar peta` : `Pilih ${location.name}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedLocation(location);
                        setMapPan({ x: 0, y: 0 });
                        if (count > 1 && mapZoom < maximumMapZoom) {
                          setMapZoom((zoom) => Math.min(maximumMapZoom, zoom + 1));
                        }
                      }}
                    >
                      <span className="pin-dot">{count > 1 ? count : null}</span>
                      {count === 1 && <span className="pin-name">{location.name}</span>}
                    </button>
                  ))}
                </div>
                <div className="map-legend">
                  <span className="legend-dot" />
                  <span>{visibleMapLocationCount} DESTINASI · ZOOM {mapZoom}</span>
                </div>
                <div className="map-zoom-controls" role="group" aria-label="Kontrol zoom peta">
                  <button
                    type="button"
                    aria-label="Perbesar peta"
                    title="Perbesar peta"
                    disabled={mapZoom >= maximumMapZoom}
                    onClick={() => setMapZoom((zoom) => Math.min(maximumMapZoom, zoom + 1))}
                  ><Icon name="zoom-in" /></button>
                  <span aria-live="polite">z{mapZoom}</span>
                  <button
                    type="button"
                    aria-label="Perkecil peta"
                    title="Perkecil peta"
                    disabled={mapZoom <= minimumMapZoom}
                    onClick={() => setMapZoom((zoom) => Math.max(minimumMapZoom, zoom - 1))}
                  ><Icon name="zoom-out" /></button>
                  <button
                    className="map-zoom-reset"
                    type="button"
                    aria-label="Atur ulang zoom peta"
                    title="Atur ulang zoom peta"
                    disabled={mapZoom === initialMapZoom && mapPan.x === 0 && mapPan.y === 0}
                    onClick={() => {
                      setMapZoom(initialMapZoom);
                      setMapPan({ x: 0, y: 0 });
                    }}
                  ><Icon name="reset" /></button>
                </div>
                <a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                  © OpenStreetMap
                </a>
              </div>

              <aside className="location-card" aria-live="polite">
                <div className="location-card-top">
                  <span className="eyebrow eyebrow-light">{selectedLocation.kind}</span>
                  <span className="location-index">
                    {selectedLocation.id.padStart(3, "0")}
                    <span> / {places.length}</span>
                  </span>
                </div>
                <div className="location-card-content">
                  <span className="location-island">{selectedLocation.island}, Indonesia</span>
                  <h3>{selectedLocation.name}</h3>
                  <p>{selectedLocation.description}</p>
                </div>
                <div className="location-details">
                  <div>
                    <span>STATUS</span>
                    <strong>{selectedLocation.status}</strong>
                  </div>
                  <div>
                    <span>KETINGGIAN</span>
                    <strong>{selectedLocation.altitude}</strong>
                  </div>
                  <div className="coordinate-row">
                    <span>KOORDINAT</span>
                    <strong>{selectedLocation.coordinates}</strong>
                  </div>
                </div>
                <button
                  className="location-link"
                  type="button"
                  onClick={() => navigate(`/jelajah/${selectedLocation.id}`)}
                >
                  Lihat detail destinasi <ArrowIcon />
                </button>
              </aside>
            </div>
            <p className="map-note">
              Peta dasar OpenStreetMap; titik memakai koordinat WGS84 pada dataset.
              Gunakan tombol +/− atau gulir untuk mengubah zoom, dan seret peta untuk bergeser; status kawasan tetap
              perlu diperiksa melalui sumber resmi.
            </p>
          </div>
        </section>

        <section className="destinations-section section-space" id="jelajah" data-section>
          <div className="page-width">
            <div className="section-heading destinations-heading reveal">
              <div>
                <span className="eyebrow">CERITA DARI ALAM</span>
                <h2>Alam punya banyak wajah.</h2>
                <p>Jelajahi {destinations.length} kisah gunung dan bukit Indonesia, satu langkah setiap waktu.</p>
              </div>
              <a className="text-link" href="#peta">
                Lihat peta sebaran <ArrowIcon diagonal />
              </a>
            </div>

            <InfiniteDestinationCarousel
              destinations={destinations}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onNavigate={navigate}
            />
          </div>
        </section>

        <section className="conservation-section" id="konservasi" data-section>
          <div className="page-width conservation-inner reveal">
            <div className="conservation-copy">
              <span className="eyebrow eyebrow-light">ALAM ADALAH TANGGUNG JAWAB BERSAMA</span>
              <h2>Kenali alamnya. Jaga keberlanjutannya.</h2>
              <p>
                Setiap langkah kecil berarti. Rencanakan perjalanan dengan bijak,
                ikuti panduan lokal, dan tinggalkan alam tetap lestari.
              </p>
            </div>
            <a className="button button-lime" href="#peta">
              Mulai menjelajah <ArrowIcon />
            </a>
            <span className="conservation-orbit conservation-orbit-one" />
            <span className="conservation-orbit conservation-orbit-two" />
          </div>
        </section>
          </>
          </HomePage>
        ) : activePage === "/jelajah" ? (
          detailId ? (
            <PlaceDetailPage
              place={activePlace}
              onNavigate={navigate}
              isSaved={Boolean(activePlace && favorites.includes(activePlace.id))}
              onToggleFavorite={() => activePlace && toggleFavorite(activePlace.id)}
            />
          ) : (
            <ExplorePage
              onNavigate={navigate}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )
        ) : activePage === "/kontribusi" ? (
          <ContributionPage onNavigate={navigate} />
        ) : activePage === "/tentang" ? (
          <AboutPage />
        ) : (
          <ContactPage onNavigate={navigate} />
        )}
        </div>
      </main>

      </MainLayout>
      {(activePage === "/" || activePage === "/chat") && introPhase === "done" && (
        <Chatbot pageMode={activePage === "/chat"} onNavigate={navigate} />
      )}
      {introPhase === "done" && activePage !== "/chat" && <TreeScrollbar />}
      </div>
    </>
  );
}

export default App;
