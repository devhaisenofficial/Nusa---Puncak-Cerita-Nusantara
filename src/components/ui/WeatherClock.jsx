import { useEffect, useMemo, useState } from "react";

const weatherDescriptions = {
  0: "Cerah",
  1: "Cerah berawan",
  2: "Berawan sebagian",
  3: "Berawan",
  45: "Berkabut",
  48: "Kabut tebal",
  51: "Gerimis ringan",
  53: "Gerimis",
  55: "Gerimis lebat",
  56: "Gerimis beku ringan",
  57: "Gerimis beku lebat",
  61: "Hujan ringan",
  63: "Hujan",
  65: "Hujan lebat",
  66: "Hujan beku ringan",
  67: "Hujan beku lebat",
  71: "Salju ringan",
  73: "Hujan es",
  75: "Salju lebat",
  77: "Butiran salju",
  80: "Hujan lokal ringan",
  81: "Hujan lokal",
  82: "Hujan lokal lebat",
  85: "Hujan salju lokal",
  86: "Hujan salju lebat",
  95: "Badai petir",
  96: "Badai petir dan hujan es",
  99: "Badai petir dan hujan es lebat",
};

function isValidLocation(place) {
  if (place.latitude == null || place.longitude == null || place.latitude === "" || place.longitude === "") {
    return false;
  }
  return Number.isFinite(Number(place.latitude))
    && Number.isFinite(Number(place.longitude))
    && Math.abs(Number(place.latitude)) <= 90
    && Math.abs(Number(place.longitude)) <= 180;
}

function formatNumber(value, unit) {
  return Number.isFinite(value) ? `${Math.round(value)}${unit}` : "—";
}

export default function WeatherClock({ places, place: fixedPlace = null, compact = false }) {
  const [selectedId, setSelectedId] = useState(fixedPlace?.id ?? places.find(isValidLocation)?.id ?? "");
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const availablePlaces = useMemo(() => places.filter(isValidLocation), [places]);
  const place = fixedPlace ?? availablePlaces.find((item) => item.id === selectedId);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!place || !isValidLocation(place)) {
      setWeather(null);
      setIsLoading(false);
      setErrorMessage("Koordinat destinasi tidak tersedia untuk prakiraan cuaca.");
      return undefined;
    }

    const controller = new AbortController();
    const parameters = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      timezone: "auto",
    });

    async function loadWeather() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Layanan cuaca mengembalikan HTTP ${response.status}.`);
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!data.current || !Number.isFinite(data.current.temperature_2m)) {
          throw new Error("Layanan cuaca tidak mengirimkan data terkini yang valid.");
        }
        setWeather({
          temperature: data.current.temperature_2m,
          apparent: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          code: data.current.weather_code,
          observedAt: data.current.time,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error(`Cuaca terkini untuk ${place.name} tidak dapat dimuat.`, error);
        setWeather(null);
        setErrorMessage("Cuaca terkini belum dapat dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadWeather();
    const refresh = window.setInterval(loadWeather, 600_000);
    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, [place]);

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      aria-label="Jam Indonesia dan cuaca terkini"
      className={`weather-clock page-width${compact ? " is-compact" : ""}`}
    >
      <div className="weather-clock-time">
        <span className="weather-eyebrow">WAKTU INDONESIA BARAT · WIB</span>
        <time className="weather-time" dateTime={now.toISOString()}>
          {timeFormatter.format(now)}
        </time>
        <span className="weather-date">{dateFormatter.format(now)}</span>
      </div>

      <div aria-live="polite" className="weather-current">
        <div className="weather-current-heading">
          <div>
            <span className="weather-eyebrow">CUACA TERKINI</span>
            {fixedPlace ? (
              <strong className="weather-place-name">{place?.name ?? "Lokasi destinasi"}</strong>
            ) : (
              <label className="weather-place-select">
                <span>PILIH LOKASI CUACA</span>
                <select value={place?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>
                  {availablePlaces.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} · {item.regionLabel}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <span className={`weather-status${isLoading ? " is-loading" : ""}`} aria-hidden="true">
            {isLoading ? "…" : "●"}
          </span>
        </div>
        {errorMessage ? (
          <p className="weather-error">{errorMessage}</p>
        ) : weather ? (
          <>
            <div className="weather-reading">
              <strong>{formatNumber(weather.temperature, "°")}</strong>
              <span>{weatherDescriptions[weather.code] ?? "Kondisi cuaca tercatat"}</span>
            </div>
            <p className="weather-details">
              <span>Terasa <strong>{formatNumber(weather.apparent, "°")}</strong></span>
              <span>Kelembapan <strong>{formatNumber(weather.humidity, "%")}</strong></span>
              <span>Angin <strong>{formatNumber(weather.wind, " km/j")}</strong></span>
            </p>
          </>
        ) : (
          <p className="weather-error">{isLoading ? "Mengambil kondisi cuaca terkini…" : "Data cuaca belum tersedia."}</p>
        )}
        <a
          className="weather-source"
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo · prakiraan tidak menggantikan peringatan resmi
        </a>
        {weather?.observedAt && (
          <time className="weather-observed" dateTime={weather.observedAt}>
            Pembaruan observasi: {weather.observedAt.replace("T", " ")}
          </time>
        )}
      </div>
    </section>
  );
}
