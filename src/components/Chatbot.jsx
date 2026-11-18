import { useEffect, useRef, useState } from "react";
import responses from "../data/chatbot_responses.json";
import { places } from "../services/alamService.js";
import Icon from "./ui/Icon.jsx";

function ChatIcon({ close = false }) {
  return close ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.5-3.1A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 11.5h.01m4 0h.01m4 0h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const ignoredWords = new Set([
  "ada", "apa", "atau", "bagaimana", "bagi", "buat", "dan", "dari", "di", "dong", "dengan",
  "info", "informasi", "ini", "itu", "ke", "mana", "mengenai", "menurut", "oleh", "pada",
  "saya", "seputar", "tentang", "untuk", "yang", "the", "what", "where", "with", "about",
  "tell", "me", "please", "is", "are", "the",
]);

function normalizeText(value) {
  return value
    .toLocaleLowerCase("id")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editSimilarity(left, right) {
  if (left === right) return 1;
  if (Math.min(left.length, right.length) < 4) return 0;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return 1 - previous[right.length] / Math.max(left.length, right.length);
}

function getWordVariants(word) {
  const variants = new Set([word]);
  const roots = [word];
  const suffixPattern = /(kan|nya|lah|kah|an|i)$/;
  const prefixPattern = /^(meng|meny|men|mem|me|peng|pen|pem|per|ber|ter|di|ke|se|pe)/;

  for (const root of roots) {
    const withoutSuffix = root.replace(suffixPattern, "");
    if (withoutSuffix.length >= 3 && withoutSuffix !== root) {
      variants.add(withoutSuffix);
      roots.push(withoutSuffix);
    }

    const withoutPrefix = root.replace(prefixPattern, "");
    if (withoutPrefix.length >= 3 && withoutPrefix !== root) {
      variants.add(withoutPrefix);
      roots.push(withoutPrefix);
    }
  }

  return [...variants];
}

function wordSimilarity(left, right) {
  return Math.max(
    ...getWordVariants(left).flatMap((leftVariant) =>
      getWordVariants(right).map((rightVariant) => editSimilarity(leftVariant, rightVariant)),
    ),
  );
}

function keywordSimilarity(message, keyword) {
  const normalizedMessage = normalizeText(message);
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return 0;
  if (` ${normalizedMessage} `.includes(` ${normalizedKeyword} `)) {
    const wordCount = normalizedKeyword.split(" ").length;
    return wordCount > 1 ? 0.99 : Math.min(0.82, 0.55 + normalizedKeyword.length * 0.027);
  }

  const messageWords = normalizedMessage.split(" ").filter((word) => word && !ignoredWords.has(word));
  const keywordWords = normalizedKeyword.split(" ").filter((word) => !ignoredWords.has(word));
  if (messageWords.length === 0 || keywordWords.length === 0) return 0;

  const matches = keywordWords.map((keywordWord) => Math.max(
    ...messageWords.map((messageWord) => wordSimilarity(messageWord, keywordWord)),
  ));
  const matched = matches.filter((similarity) => similarity >= 0.72);
  if (matched.length === 0) return 0;

  const averageMatch = matched.reduce((total, similarity) => total + similarity, 0) / matched.length;
  const keywordCoverage = matched.length / keywordWords.length;
  const messageCoverage = matched.length / messageWords.length;
  return averageMatch * (0.65 * keywordCoverage + 0.2 * messageCoverage);
}

function getBestMatch(message, entries) {
  return entries
    .flatMap((entry) => entry.keywords.map((keyword) => ({
      entry,
      keyword,
      score: keywordSimilarity(message, keyword),
    })))
    .sort((a, b) => b.score - a.score || b.keyword.length - a.keyword.length)[0];
}

function findPlaceMatch(message) {
  const matchingPlaces = places
    .map((place) => ({ place, score: keywordSimilarity(message, place.name) }))
    .sort((a, b) => b.score - a.score || a.place.name.length - b.place.name.length);
  return matchingPlaces[0];
}

function resolveResponse(message) {
  const placeMatch = findPlaceMatch(message);
  const intentMatch = getBestMatch(message, responses.intents);
  const normalizedMessage = normalizeText(message);
  const asksAboutPlace = /\b(lokasi|dimana|di mana|alamat|koordinat|ketinggian|tinggi|mdpl|elevasi|status|aman|bahaya|erupsi|cuaca|weather)\b/.test(normalizedMessage);

  if (placeMatch?.score >= 0.64 && (!intentMatch || placeMatch.score >= intentMatch.score || asksAboutPlace)) {
    const { place } = placeMatch;
    let response = `${place.name}: ${place.summary}`;

    if (/\b(lokasi|dimana|di mana|alamat)\b/.test(normalizedMessage)) {
      response = `${place.name} berada di ${place.location}, wilayah ${place.regionLabel}.`;
    } else if (/\b(koordinat|lintang|bujur)\b/.test(normalizedMessage)) {
      response = `Koordinat ${place.name} pada data NUSA: ${place.coordinates} (WGS84). Gunakan peta sebagai konteks lokasi, bukan alat navigasi lapangan.`;
    } else if (/\b(ketinggian|tinggi|mdpl|elevasi)\b/.test(normalizedMessage)) {
      response = place.elevation == null
        ? `Data ketinggian ${place.name} belum tersedia di dataset NUSA.`
        : `${place.name} tercatat memiliki ketinggian ${place.elevation.toLocaleString("id-ID")} mdpl.`;
    } else if (/\b(status|aman|bahaya|erupsi)\b/.test(normalizedMessage)) {
      response = `Status ${place.name} pada atlas tercatat "${place.status}" dan bukan informasi real-time. Untuk kondisi terkini, periksa MAGMA Indonesia/PVMBG dan pengelola kawasan sebelum berkunjung.`;
    } else if (/\b(cuaca|weather)\b/.test(normalizedMessage)) {
      response = `Cuaca untuk ${place.name} dapat dilihat di kartu cuaca pada halaman Jelajah. Pilih lokasi yang sesuai untuk melihat data terkini dari Open-Meteo; tetap periksa peringatan resmi sebelum beraktivitas.`;
    }

    return {
      id: `place-${place.id}`,
      response,
      suggestions: [`Tampilkan detail ${place.name}`, "Tips menjaga alam"],
    };
  }

  if (intentMatch?.score >= 0.4) return intentMatch.entry;
  return responses.fallback;
}

function Chatbot({ pageMode = false, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: responses.welcome,
      suggestions: responses.welcomeSuggestions,
    },
  ]);
  const conversationRef = useRef(null);
  const responseTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen || pageMode) conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, isTyping, messages, pageMode]);

  useEffect(() => () => window.clearTimeout(responseTimerRef.current), []);

  function sendMessage(value = draft) {
    const text = value.trim();
    if (!text || isTyping) return;

    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: "user", text }]);
    setDraft("");
    setIsTyping(true);
    responseTimerRef.current = window.setTimeout(() => {
      const answer = resolveResponse(text);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-${answer.id ?? "fallback"}`,
          role: "assistant",
          text: answer.response,
          suggestions: answer.suggestions,
        },
      ]);
      setIsTyping(false);
    }, 650);
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className={`chat-widget${pageMode ? " is-page" : ""}`}>
      {(isOpen || pageMode) && (
        <section
          className={`chat-panel${pageMode ? " is-full-page" : ""}`}
          role={pageMode ? "region" : "dialog"}
          aria-modal={pageMode ? undefined : "false"}
          aria-labelledby="chat-title"
        >
          <div className="chat-header">
            <span className="chat-avatar" aria-hidden="true"><ChatIcon /></span>
            <div>
              <h2 id="chat-title">Teman Jelajah</h2>
              <p><span className="chat-online-dot" /> Simulasi panduan NUSA</p>
            </div>
            <button
              className="chat-close"
              type="button"
              aria-label={pageMode ? "Kembali ke beranda" : "Tutup chat"}
              onClick={() => {
                if (pageMode) onNavigate("/");
                else setIsOpen(false);
              }}
            >
              {pageMode ? <Icon name="arrow-left" /> : <ChatIcon close />}
            </button>
          </div>

          <div className="chat-messages" ref={conversationRef} aria-live="polite">
            <p className="chat-date-label">PERCAKAPAN ECO-ATLAS</p>
            {messages.map((message) => (
              <div className={`chat-message-row is-${message.role}`} key={message.id}>
                <div className={`chat-message is-${message.role}`}>
                  <p>{message.text}</p>
                  {message.suggestions?.length > 0 && (
                    <div className="chat-suggestions">
                      {message.suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" disabled={isTyping} onClick={() => sendMessage(suggestion)}>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message-row is-assistant">
                <div className="chat-message is-assistant chat-typing" role="status" aria-label="Sedang menyiapkan jawaban">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="chat-input">Tulis pertanyaan</label>
            <input
              id="chat-input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tanya tentang destinasi..."
              maxLength={400}
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim() || isTyping} aria-label="Kirim pesan">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path d="m3.5 10 12-6-3.7 12-2.1-5.8L3.5 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9.7 10.2 5.8-6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <p className="chat-disclaimer">Jawaban otomatis untuk simulasi, bukan informasi real-time.</p>
        </section>
      )}
      <button
        className={`chat-launcher${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Tutup teman jelajah" : "Buka teman jelajah"}
        aria-expanded={isOpen || pageMode}
        onClick={() => {
          if (window.matchMedia("(max-width: 760px)").matches) {
            onNavigate("/chat");
            return;
          }
          setIsOpen((open) => !open);
        }}
      >
        <ChatIcon close={isOpen} />
        {!isOpen && <span>Teman Jelajah</span>}
      </button>
    </div>
  );
}

export default Chatbot;
