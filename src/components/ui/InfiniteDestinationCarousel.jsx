import { useEffect, useMemo, useRef, useState } from "react";
import FavoriteButton from "../FavoriteButton.jsx";
import PhotoCredit from "./PhotoCredit.jsx";

const cardGap = 16;
const loopClones = 4;

function ArrowIcon({ direction = "right" }) {
  const path = direction === "left" ? "M16 10H4m5 5-5-5 5-5" : "M4 10h12m-5-5 5 5-5 5";
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DestinationCard({ destination, favorites, onToggleFavorite, onNavigate, index, cardRef }) {
  return (
    <article className="destination-slide-card" ref={cardRef} aria-roledescription="slide">
      <div className="destination-slide-image">
        <img src={destination.image} alt={destination.alt} loading={index < 3 ? "eager" : "lazy"} />
        <span className="destination-slide-label">{destination.label} · {destination.regionLabel}</span>
        <FavoriteButton
          className="destination-slide-favorite"
          placeName={destination.title}
          isSaved={favorites.includes(destination.id)}
          onToggle={() => onToggleFavorite(destination.id)}
        />
      </div>
      <div className="destination-slide-copy">
        <span className="eyebrow">{destination.subtitle}</span>
        <h3>{destination.title}</h3>
        <p>{destination.description}</p>
        <PhotoCredit attribution={destination.imageCredit} />
        <button
          className="button button-forest destination-slide-open"
          type="button"
          onClick={() => onNavigate(`/jelajah/${destination.id}`)}
        >
          Detail destinasi <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

export default function InfiniteDestinationCarousel({ destinations, favorites, onToggleFavorite, onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepWidth, setStepWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const trackRef = useRef(null);
  const firstCardRef = useRef(null);
  const regions = useMemo(
    () => [...new Map(destinations.map((destination) => [destination.region, {
      id: destination.region,
      label: destination.regionLabel,
      firstIndex: destinations.findIndex((item) => item.region === destination.region),
    }])).values()],
    [destinations],
  );
  const currentDestination = destinations[activeIndex % destinations.length];
  const extendedDestinations = [...destinations, ...destinations.slice(0, loopClones)];

  useEffect(() => {
    const measure = () => {
      const cardWidth = firstCardRef.current?.getBoundingClientRect().width ?? 0;
      setStepWidth(cardWidth + cardGap);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (firstCardRef.current) observer.observe(firstCardRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (isPaused || destinations.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => index + 1);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [destinations.length, isPaused]);

  function handleTransitionEnd(event) {
    if (event.target !== trackRef.current || activeIndex < destinations.length) return;
    setTransitionEnabled(false);
    setActiveIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }

  function jumpTo(index) {
    setTransitionEnabled(false);
    setActiveIndex(index);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }

  function movePrevious() {
    if (activeIndex === 0) {
      jumpTo(destinations.length - 1);
      return;
    }
    setActiveIndex((index) => index - 1);
  }

  if (!currentDestination) return null;

  return (
    <section
      className="infinite-destination-carousel reveal"
      aria-label="Gunung dan bukit Indonesia"
      aria-roledescription="carousel"
    >
      <div className="destination-carousel-toolbar">
        <span className="destination-carousel-position">
          <strong>{String((activeIndex % destinations.length) + 1).padStart(3, "0")}</strong>
          <span>/ {destinations.length} · {currentDestination.regionLabel}</span>
        </span>
        <div className="destination-carousel-controls">
          <button type="button" aria-label="Destinasi sebelumnya" onClick={movePrevious}>
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label={isPaused ? "Lanjutkan putar otomatis" : "Jeda putar otomatis"}
            aria-pressed={isPaused}
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused ? "▶" : "Ⅱ"}
          </button>
          <button type="button" aria-label="Destinasi berikutnya" onClick={() => setActiveIndex((index) => index + 1)}>
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="destination-carousel-window">
        <div
          className={`destination-carousel-track${transitionEnabled ? "" : " is-resetting"}`}
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{ transform: `translate3d(-${activeIndex * stepWidth}px, 0, 0)` }}
        >
          {extendedDestinations.map((destination, index) => (
            <DestinationCard
              key={`${destination.id}-${index}`}
              destination={destination}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onNavigate={onNavigate}
              index={index}
              cardRef={index === 0 ? firstCardRef : undefined}
            />
          ))}
        </div>
      </div>

      <div className="destination-carousel-pagination" role="group" aria-label="Pilih wilayah tujuan">
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            className={currentDestination.region === region.id ? "is-active" : ""}
            aria-label={`Tampilkan destinasi di wilayah ${region.label}`}
            aria-current={currentDestination.region === region.id ? "true" : undefined}
            onClick={() => jumpTo(region.firstIndex)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
