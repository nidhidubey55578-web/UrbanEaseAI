import React, { useEffect, useState, useRef } from "react"
import {
  Language,
  Screen,
  RouteOption,
  BarrierReport,
  SavedPlaceItem,
} from "./types"
import { translations, t } from "./i18n/translations"
import {
  initialRoutes,
  initialPlaces,
  initialReports,
  mumbaiAreas,
  barrierTypes,
  academicMappingData,
} from "./data/mockData"
import { Icon } from "./components/Icons"
import { InteractiveMap } from "./components/InteractiveMap"
import {
  calculateRealRoutes,
  geocodeDestination,
  getExternalNavigationUrl,
  CalculatedRoute,
  GeoLocationPoint,
} from "./services/routingService"
import { syncReportToSupabase, SUPABASE_URL } from "./lib/supabase"

/* =========================================================================
   HELPER UTILITIES
   ========================================================================= */

let activeSpeechUtterance: SpeechSynthesisUtterance | null = null

export function getVoiceGreeting(lang: Language): string {
  if (lang === "Hindi") {
    return "नमस्ते! मैं आपको दिशा खोजने में कैसे मदद कर सकता हूँ?"
  }
  if (lang === "Marathi") {
    return "नमस्कार! मी तुम्हाला दिशा शोधण्यात कशी मदत करू शकतो?"
  }
  return "Hi! How can I help you with directions?"
}

function speakText(text: string, lang: Language, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.()
    return
  }
  try {
    window.speechSynthesis.cancel()
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    const utterance = new SpeechSynthesisUtterance(text)
    activeSpeechUtterance = utterance // Prevent garbage collection bug in Chromium

    const locale =
      lang === "Hindi" ? "hi-IN" : lang === "Marathi" ? "mr-IN" : "en-IN"
    utterance.lang = locale
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()),
    )
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    let finished = false
    const finish = () => {
      if (!finished) {
        finished = true
        onEnd?.()
      }
    }

    utterance.onend = finish
    utterance.onerror = finish

    // Safety timeout so execution is never blocked if speech engine hangs
    setTimeout(finish, 3800)

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn("Speech synthesis notice:", err)
    onEnd?.()
  }
}

function parseVoiceCommand(
  transcript: string,
): {
  intent: "route" | "report" | "action"
  destination?: string
  barrier?: string
  screen?: Screen
} {
  const norm = transcript.toLowerCase().trim()

  // Report intent
  if (
    [
      "report",
      "barrier",
      "problem",
      "broken",
      "blocked",
      "pothole",
      "बाधा",
      "रिपोर्ट",
      "अडथळा",
      "खड्डा",
      "समस्या",
    ].some((w) => norm.includes(w))
  ) {
    let barrier = "Blocked footpath"
    if (norm.includes("ramp") || norm.includes("रैंप") || norm.includes("रॅम्प"))
      barrier = "Broken ramp"
    else if (norm.includes("lift") || norm.includes("लिफ्ट"))
      barrier = "Broken lift"
    else if (
      norm.includes("pothole") ||
      norm.includes("गड्ढा") ||
      norm.includes("खड्डा")
    )
      barrier = "Pothole"
    else if (
      norm.includes("stair") ||
      norm.includes("सीढ़ी") ||
      norm.includes("पायऱ्या")
    )
      barrier = "Stairs without alternative"
    return { intent: "report", barrier }
  }

  // Navigation / Route intent
  if (
    [
      "take me",
      "go to",
      "navigate",
      "route",
      "direction",
      "चलो",
      "जाना",
      "मार्ग",
      "नेविगेट",
      "दिशा",
    ].some((w) => norm.includes(w)) ||
    norm.length > 3
  ) {
    let dest = "Bandra Railway Station"
    if (
      norm.includes("hospital") ||
      norm.includes("holy family") ||
      norm.includes("अस्पताल") ||
      norm.includes("रुग्णालय")
    )
      dest = "Holy Family Hospital"
    else if (
      norm.includes("park") ||
      norm.includes("joggers") ||
      norm.includes("पार्क") ||
      norm.includes("उद्यान")
    )
      dest = "Joggers' Park"
    else if (norm.includes("bus") || norm.includes("बस"))
      dest = "Hill Road Accessible Bus Stop"
    else {
      const clean = transcript
        .replace(
          /^(please\s+)?(find|show|take me to|navigate to|go to|give me directions to)?\s*/i,
          "",
        )
        .trim()
      if (clean) dest = clean
    }
    return { intent: "route", destination: dest }
  }

  return { intent: "route", destination: "Bandra Railway Station" }
}

/* =========================================================================
   UI REUSABLE COMPONENTS
   ========================================================================= */

function AppLogo({
  compact = false,
  language = "English",
}: {
  compact?: boolean
  language?: Language
}) {
  const isDev = language === "Hindi" || language === "Marathi"
  return (
    <div className={`brand ${compact ? "compact" : ""}`} role="banner">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <i />
      </div>
      <div>
        <b>
          {isDev ? (language === "Hindi" ? "अर्बनईज़" : "अर्बनईझ") : "UrbanEase"}
        </b>
        <em>{isDev ? " एआई" : " AI"}</em>
        {!compact && (
          <small>
            {language === "Hindi"
              ? "समझदारी से चलें। स्वतंत्र रूप से चलें।"
              : language === "Marathi"
                ? "हुशारीने चला. मुक्तपणे चला."
                : "Move Smarter. Move Freely."}
          </small>
        )}
      </div>
    </div>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
  type = "button",
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: string
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

function Card({
  children,
  className = "",
  onClick,
  role,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  role?: string
}) {
  return (
    <div
      className={`card ${onClick ? "card-action" : ""} ${className}`}
      role={role || (onClick ? "button" : undefined)}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}

function ScoreRing({
  score,
  small = false,
}: {
  score: number
  small?: boolean
}) {
  return (
    <div
      className={`score-ring ${small ? "small" : ""}`}
      style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}
      aria-label={`Accessibility score: ${score} out of 100`}
    >
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  )
}

function StatusPill({
  children,
  tone = "green",
}: {
  children: React.ReactNode
  tone?: string
}) {
  return <span className={`status ${tone}`}>{children}</span>
}

function Header({
  title,
  onBack,
  right,
  subtitle,
}: {
  title: string
  onBack?: () => void
  right?: React.ReactNode
  subtitle?: string
}) {
  return (
    <header className="page-header">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Go back">
          <Icon name="back" size={20} />
        </button>
      ) : (
        <AppLogo compact />
      )}
      <div className="header-title-box">
        <h1>{title}</h1>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="header-right">{right}</div>
    </header>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? "on" : ""}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  )
}

function BottomNav({
  screen,
  go,
  onVoiceRequest,
  language,
}: {
  screen: Screen
  go: (s: Screen) => void
  onVoiceRequest: (text: string) => void
  language: Language
}) {
  const [voiceState, setVoiceState] =
    useState<"ready" | "listening" | "processing" | "error">("ready")
  const [transcript, setTranscript] = useState("")

  const items: [Screen, string, string][] = [
    ["home", t(language, "navHome"), "home"],
    ["explore", t(language, "navExplore"), "explore"],
    ["report", t(language, "navReport"), "report"],
    ["saved", t(language, "navSaved"), "saved"],
    ["profile", t(language, "navProfile"), "profile"],
  ]

  const startVoice = () => {
    const greeting = getVoiceGreeting(language)
    setTranscript(greeting)
    setVoiceState("listening")

    // Audibly speak the greeting
    speakText(greeting, language)

    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!Recognition) {
      setTimeout(() => setVoiceState("ready"), 3500)
      return
    }

    try {
      const recognition = new Recognition()
      recognition.lang =
        language === "Hindi"
          ? "hi-IN"
          : language === "Marathi"
            ? "mr-IN"
            : "en-IN"
      recognition.interimResults = false

      recognition.onstart = () => setVoiceState("listening")
      recognition.onresult = (event: any) => {
        const heard = event.results[0][0].transcript
        setTranscript(heard)
        setVoiceState("processing")
        setTimeout(() => {
          setVoiceState("ready")
          onVoiceRequest(heard)
        }, 500)
      }
      recognition.onerror = () => {
        setTimeout(() => setVoiceState("ready"), 2500)
      }
      recognition.onend = () => {
        setVoiceState((cur) => (cur === "listening" ? "ready" : cur))
      }

      recognition.start()
    } catch {
      setTimeout(() => setVoiceState("ready"), 2500)
    }
  }

  const navButton = ([id, label, icon]: [Screen, string, string]) => (
    <button
      key={id}
      className={`nav-${id} ${screen === id ? "active" : ""}`}
      onClick={() => go(id)}
      aria-label={label}
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  )

  return (
    <nav className="bottom-nav" aria-label="Main application navigation">
      <div className="bottom-nav-group bottom-nav-left">
        {items.slice(0, 2).map(navButton)}
      </div>
      <button
        className={`bottom-voice-button ${voiceState}`}
        onClick={startVoice}
        aria-label={t(language, "speakPromptTooltip")}
      >
        <Icon name="voice" size={26} />
        <span>{t(language, "navVoiceBtn")}</span>
      </button>
      <div className="bottom-nav-group bottom-nav-right">
        {items.slice(2, 4).map(navButton)}
      </div>
      {voiceState !== "ready" && (
        <div className={`bottom-voice-status ${voiceState}`} role="status">
          {voiceState === "listening"
            ? t(language, "splashListening")
            : voiceState === "processing"
              ? transcript || t(language, "splashProcessing")
              : t(language, "splashError")}
        </div>
      )}
    </nav>
  )
}

/* =========================================================================
   SCREEN 1: MICROPHONE-FIRST EXPERIENCE (SPLASH)
   ========================================================================= */

function Splash({
  language,
  setLanguage,
  onPrepareRoute,
  onStartNavigation,
  onShowRoutes,
  onSkip,
}: {
  language: Language
  setLanguage: (lang: Language) => void
  onPrepareRoute: (transcript: string) => { destination: string }
  onStartNavigation: () => void
  onShowRoutes: () => void
  onSkip: () => void
}) {
  const [voiceState, setVoiceState] =
    useState<"ready" | "listening" | "processing" | "confirming" | "error">(
      "ready",
    )
  const [transcript, setTranscript] = useState("")
  const [routeQuestion, setRouteQuestion] = useState("")

  const promptGreeting = getVoiceGreeting(language)

  const startListening = () => {
    // 1. Immediately speak the required greeting: "Hi! How can I help you with directions?" in active language
    const greeting = getVoiceGreeting(language)
    setRouteQuestion(greeting)
    setVoiceState("listening")

    speakText(greeting, language, () => {
      // Voice prompt finished speaking
    })

    // 2. Start speech recognition in the browser
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!Recognition) {
      // Graceful timeout so user is never stuck in error
      setTimeout(() => {
        setVoiceState((cur) => (cur === "listening" ? "ready" : cur))
      }, 4500)
      return
    }

    try {
      const recognition = new Recognition()
      recognition.lang =
        language === "Hindi"
          ? "hi-IN"
          : language === "Marathi"
            ? "mr-IN"
            : "en-IN"
      recognition.interimResults = false

      recognition.onstart = () => setVoiceState("listening")
      recognition.onresult = (event: any) => {
        const heard = event.results[0][0].transcript
        setTranscript(heard)
        setVoiceState("processing")

        const prepared = onPrepareRoute(heard)
        const question = t(language, "splashRouteReady", {
          destination: prepared.destination,
        })
        setRouteQuestion(question)

        speakText(question, language, () => {
          setVoiceState("confirming")
        })
      }

      recognition.onerror = () => {
        setTimeout(() => setVoiceState("ready"), 2500)
      }

      recognition.onend = () => {
        setVoiceState((cur) => (cur === "listening" ? "ready" : cur))
      }

      recognition.start()
    } catch {
      setTimeout(() => setVoiceState("ready"), 2500)
    }
  }

  const handleDestinationSelect = (destName: string) => {
    setTranscript(destName)
    setVoiceState("processing")
    const prepared = onPrepareRoute(destName)
    const question = t(language, "splashRouteReady", {
      destination: prepared.destination,
    })
    setRouteQuestion(question)
    speakText(question, language, () => {
      setVoiceState("confirming")
    })
  }

  const handleConfirmDecision = (startNav: boolean) => {
    setVoiceState("processing")
    const confirmMessage = startNav
      ? t(language, "splashStarting")
      : t(language, "splashShowing")
    speakText(confirmMessage, language, () => {
      if (startNav) onStartNavigation()
      else onShowRoutes()
    })
  }

  return (
    <main className="mic-entry">
      <div className="entry-ambient" aria-hidden="true">
        <span />
        <span />
        <i />
        <i />
      </div>

      <div className="mic-entry-brand">
        <AppLogo language={language} />
        <span className="eyebrow">{t(language, "voiceFirstLabel")}</span>
      </div>

      <div className="mic-entry-content">
        <div className="entry-mic-stage">
          <span className="entry-wave wave-one" aria-hidden="true" />
          <span className="entry-wave wave-two" aria-hidden="true" />
          <button
            className={`entry-mic ${voiceState}`}
            onClick={startListening}
            aria-label={t(language, "splashReady")}
          >
            <Icon name="voice" size={54} />
          </button>
        </div>

        <div className="entry-languages" aria-label="Select language">
          {(["English", "Hindi", "Marathi"] as Language[]).map((lang) => (
            <button
              key={lang}
              className={language === lang ? "active" : ""}
              onClick={() => {
                window.speechSynthesis?.cancel()
                setLanguage(lang)
                setVoiceState("ready")
                setTranscript("")
                setRouteQuestion("")
              }}
            >
              {lang === "Hindi"
                ? "हिंदी"
                : lang === "Marathi"
                  ? "मराठी"
                  : "English"}
            </button>
          ))}
        </div>

        <div className="entry-dialogue" aria-live="polite">
          <p>{routeQuestion || promptGreeting}</p>
          {transcript && (
            <span>
              <b>{t(language, "splashHeard")}:</b> “{transcript}”
            </span>
          )}
        </div>

        <span className={`entry-voice-status ${voiceState}`} role="status">
          {voiceState === "listening"
            ? t(language, "splashListening")
            : voiceState === "processing"
              ? t(language, "splashProcessing")
              : voiceState === "confirming"
                ? t(language, "splashConfirming")
                : t(language, "splashReady")}
        </span>

        {voiceState === "confirming" && (
          <div className="entry-route-actions">
            <Button onClick={() => handleConfirmDecision(true)} icon="route">
              {t(language, "splashStartNav")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleConfirmDecision(false)}
            >
              {t(language, "splashViewRoutes")}
            </Button>
          </div>
        )}

        {/* Quick Voice Destination Suggestions (Eliminates White Type Box) */}
        <div
          className="entry-quick-destinations"
          aria-label="Quick voice destinations"
        >
          {[
            "Bandra Railway Station",
            "Holy Family Hospital",
            "Joggers' Park",
            "Dadar West",
          ].map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => handleDestinationSelect(dest)}
            >
              <Icon name="pin" size={14} />
              <span>{dest}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="entry-skip" onClick={onSkip}>
        <Icon name="route" size={16} />
        <span>{t(language, "splashSkip")}</span>
      </button>
    </main>
  )
}

/* =========================================================================
   SCREEN 2: INTRODUCTION PAGE
   ========================================================================= */

function Intro({
  language,
  onStart,
  onSkip,
}: {
  language: Language
  onStart: () => void
  onSkip: () => void
}) {
  return (
    <main className="splash">
      <div className="splash-glow one" />
      <div className="splash-glow two" />
      <AppLogo language={language} />

      <div className="city-visual" aria-hidden="true">
        <div className="building b1" />
        <div className="building b2" />
        <div className="building b3" />
        <div className="building b4" />
        <svg viewBox="0 0 360 230">
          <path d="M15 196 C80 115 105 198 167 112 S268 138 345 35" />
          <circle cx="18" cy="193" r="7" />
          <circle className="route-pulse" cx="345" cy="35" r="9" />
        </svg>
        <div className="access-chip chip-one">
          <Icon name="check" size={16} /> {t(language, "stepFree")}
        </div>
        <div className="access-chip chip-two">
          <b>94</b> {t(language, "accessibleScore")}
        </div>
      </div>

      <div className="splash-copy">
        <span className="eyebrow">{t(language, "introBadge")}</span>
        <h2>{t(language, "introHeading")}</h2>
        <p>{t(language, "introSubheading")}</p>
      </div>

      <Button
        onClick={onStart}
        className="wide splash-start-button"
        icon="arrow"
      >
        {t(language, "introGetStarted")}
      </Button>
      <Button
        onClick={onSkip}
        className="wide splash-skip-button"
        variant="ghost"
      >
        {t(language, "introSkip")}
      </Button>
      <small className="prototype-note">{t(language, "prototypeNote")}</small>
    </main>
  )
}

/* =========================================================================
   SCREEN 3: FOUR-SLIDE ONBOARDING
   ========================================================================= */

function Onboarding({
  language,
  slide,
  setSlide,
  finish,
}: {
  language: Language
  slide: number
  setSlide: (n: number) => void
  finish: () => void
}) {
  const slides = [
    {
      kicker: t(language, "slide1Kicker"),
      title: t(language, "slide1Title"),
      text: t(language, "slide1Text"),
      icon: "route",
    },
    {
      kicker: t(language, "slide2Kicker"),
      title: t(language, "slide2Title"),
      text: t(language, "slide2Text"),
      icon: "voice",
    },
    {
      kicker: t(language, "slide3Kicker"),
      title: t(language, "slide3Title"),
      text: t(language, "slide3Text"),
      icon: "signal",
    },
    {
      kicker: t(language, "slide4Kicker"),
      title: t(language, "slide4Title"),
      text: t(language, "slide4Text"),
      icon: "spark",
    },
  ]

  const item = slides[slide]

  return (
    <main className="onboarding">
      <div className="onboarding-top">
        <AppLogo compact language={language} />
        <Button variant="ghost" onClick={finish}>
          {t(language, "onboardSkip")}
        </Button>
      </div>

      <div className={`onboard-art art-${item.icon}`}>
        <div className="orb">
          <Icon name={item.icon} size={50} />
        </div>
        <div className="orbit o1" />
        <div className="orbit o2" />
        <span className="mini-node n1" />
        <span className="mini-node n2" />
        <span className="mini-node n3" />
      </div>

      <section className="onboard-copy">
        <span className="eyebrow">{item.kicker}</span>
        <h1>{item.title}</h1>
        <p>{item.text}</p>
      </section>

      <div className="dots">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            className={i === slide ? "active" : ""}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>

      <div className="split-actions">
        {slide > 0 ? (
          <Button
            variant="secondary"
            onClick={() => setSlide(slide - 1)}
            icon="back"
          >
            {t(language, "onboardBack")}
          </Button>
        ) : (
          <span />
        )}
        <Button
          onClick={() => (slide === 3 ? finish() : setSlide(slide + 1))}
          icon="arrow"
        >
          {slide === 3
            ? t(language, "onboardFinish")
            : t(language, "onboardNext")}
        </Button>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 4: LOGIN & PRESENTATION MODE
   ========================================================================= */

function Login({
  language,
  setLanguage,
  onLogin,
  notify,
}: {
  language: Language
  setLanguage: (lang: Language) => void
  onLogin: () => void
  notify: (msg: string) => void
}) {
  const [mode, setMode] = useState<"login" | "create" | "forgot">("login")
  const [email, setEmail] = useState("nidhi.dubey@example.com")
  const [password, setPassword] = useState("password123")
  const [confirmPassword, setConfirmPassword] = useState("password123")
  const [name, setName] = useState("Nidhi Dubey")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "forgot") {
      if (!email.includes("@")) {
        setError(t(language, "validationReset"))
        return
      }
      notify(t(language, "resetPasswordSub"))
      setMode("login")
      return
    }

    if (mode === "create") {
      if (
        !name.trim() ||
        !email.includes("@") ||
        password.length < 6 ||
        password !== confirmPassword ||
        !acceptedTerms
      ) {
        setError(t(language, "validationCreate"))
        return
      }
    }

    if (mode === "login" && (!email.includes("@") || password.length < 1)) {
      setError(t(language, "validationRequired"))
      return
    }

    notify(
      mode === "create"
        ? "Account created successfully"
        : "Signed in successfully",
    )
    onLogin()
  }

  return (
    <main className="login-page">
      <div className="login-glow" />
      <section className="login-panel">
        <div className="login-brand">
          <AppLogo language={language} />
          <span>{t(language, "tagline")}</span>
        </div>

        <div className="login-language">
          <label htmlFor="login-lang-select">
            {t(language, "languageTitle")}:
          </label>
          <select
            id="login-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
            <option value="Marathi">मराठी</option>
          </select>
        </div>

        <div className="login-heading">
          <span className="login-lock">
            <Icon name="shield" size={24} />
          </span>
          <h1>
            {mode === "create"
              ? t(language, "createAccountTitle")
              : mode === "forgot"
                ? t(language, "resetPasswordTitle")
                : t(language, "welcomeTitle")}
          </h1>
          <p>
            {mode === "create"
              ? t(language, "createAccountSub")
              : mode === "forgot"
                ? t(language, "resetPasswordSub")
                : t(language, "welcomeSub")}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === "create" && (
            <label>
              <span>{t(language, "fullName")}</span>
              <div>
                <Icon name="profile" size={18} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </label>
          )}

          <label>
            <span>{t(language, "emailAddress")}</span>
            <div>
              <Icon name="mail" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          {mode !== "forgot" && (
            <label>
              <span>{t(language, "password")}</span>
              <div>
                <Icon name="shield" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t(language, "hide") : t(language, "show")}
                </button>
              </div>
            </label>
          )}

          {mode === "create" && (
            <>
              <label>
                <span>{t(language, "confirmPassword")}</span>
                <div>
                  <Icon name="shield" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
              <label className="terms-check">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                />
                <span>{t(language, "agreeTerms")}</span>
              </label>
            </>
          )}

          {mode === "login" && (
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <span>{t(language, "rememberMe")}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setError("")
                  setMode("forgot")
                }}
              >
                {t(language, "forgotPassword")}
              </button>
            </div>
          )}

          {error && (
            <div className="login-error" role="alert">
              <Icon name="report" size={16} />
              <span>{error}</span>
            </div>
          )}

          <Button className="wide" type="submit">
            {mode === "create"
              ? t(language, "createAccount")
              : mode === "forgot"
                ? t(language, "sendResetLink")
                : t(language, "signInSecurely")}
          </Button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="login-divider">
              <span>{t(language, "orContinueWith")}</span>
            </div>
            <Button
              className="wide login-provider"
              variant="secondary"
              onClick={() => {
                notify(t(language, "simulatedGoogle"))
                onLogin()
              }}
            >
              <Icon name="spark" size={18} />
              <span>{t(language, "continueWithGoogle")}</span>
            </Button>
            <Button
              className="wide presentation-btn"
              variant="ghost"
              onClick={onLogin}
            >
              {t(language, "continuePresentation")}
            </Button>
          </>
        )}

        <div className="login-switch">
          {mode === "forgot" ? (
            <button onClick={() => setMode("login")}>
              <Icon name="back" size={16} /> {t(language, "backToSignIn")}
            </button>
          ) : (
            <>
              <span>
                {mode === "create"
                  ? t(language, "alreadyHaveAccount")
                  : t(language, "newToUrbanEase")}
              </span>
              <button
                onClick={() => {
                  setError("")
                  setMode(mode === "create" ? "login" : "create")
                }}
              >
                {mode === "create"
                  ? t(language, "backToSignIn")
                  : t(language, "createAnAccount")}
              </button>
            </>
          )}
        </div>

        <div className="login-privacy">
          <Icon name="shield" size={16} />
          <span>{t(language, "privacyReassurance")}</span>
        </div>
      </section>
    </main>
  )
}

/* =========================================================================
   SCREEN 5: EXPERIENCE SELECTION
   ========================================================================= */

function Experience({
  language,
  selected,
  setSelected,
  next,
  back,
}: {
  language: Language
  selected: string
  setSelected: (s: string) => void
  next: () => void
  back: () => void
}) {
  const options = [
    {
      id: "standard",
      title: t(language, "expStandardTitle"),
      desc: t(language, "expStandardDesc"),
      icon: "explore",
    },
    {
      id: "voice",
      title: t(language, "expVoiceTitle"),
      desc: t(language, "expVoiceDesc"),
      icon: "voice",
      recommended: true,
    },
    {
      id: "smart",
      title: t(language, "expSmartTitle"),
      desc: t(language, "expSmartDesc"),
      icon: "signal",
    },
  ]

  return (
    <main className="page">
      <Header title={t(language, "chooseExperience")} onBack={back} />
      <p className="lead">{t(language, "chooseExpSubtitle")}</p>

      <div className="option-stack">
        {options.map((opt) => (
          <Card
            key={opt.id}
            className={`select-card ${selected === opt.id ? "selected" : ""}`}
            onClick={() => setSelected(opt.id)}
          >
            <div className="option-icon">
              <Icon name={opt.icon} size={24} />
            </div>
            <div>
              <h3>{opt.title}</h3>
              <p>{opt.desc}</p>
              {opt.recommended && (
                <StatusPill tone="mint">
                  {t(language, "recommended")}
                </StatusPill>
              )}
            </div>
            <div className="radio">
              <span />
            </div>
          </Card>
        ))}
      </div>

      <Button className="wide sticky-action" onClick={next} icon="arrow">
        {t(language, "continueSetup")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 6: ACCESSIBILITY PROFILE SETUP
   ========================================================================= */

function Setup({
  language,
  preferences,
  toggle,
  save,
  back,
}: {
  language: Language
  preferences: string[]
  toggle: (p: string) => void
  save: () => void
  back: () => void
}) {
  const options = [
    { key: "Wheelchair friendly", label: t(language, "wheelchairFriendly") },
    { key: "Avoid stairs", label: t(language, "avoidStairs") },
    { key: "Low walking", label: t(language, "lowWalking") },
    { key: "Elder friendly", label: t(language, "elderFriendly") },
    { key: "Visual assistance", label: t(language, "visualAssistance") },
    { key: "Hearing assistance", label: t(language, "hearingAssistance") },
    { key: "Step-free transport", label: t(language, "stepFreeTransport") },
    { key: "Voice navigation", label: t(language, "voiceGuidance") },
    { key: "Spoken alerts", label: t(language, "spokenAlerts") },
  ]

  return (
    <main className="page">
      <Header title={t(language, "mobilityProfileTitle")} onBack={back} />
      <section className="hero-block">
        <span className="eyebrow">{t(language, "introBadge")}</span>
        <h2>{t(language, "howPreferMove")}</h2>
        <p>{t(language, "selectPreferencesSub")}</p>
      </section>

      <div className="preference-grid">
        {options.map((opt) => (
          <button
            key={opt.key}
            className={`pref-tile ${
              preferences.includes(opt.key) ? "selected" : ""
            }`}
            onClick={() => toggle(opt.key)}
          >
            <span className="pref-check">
              <Icon name="check" size={14} />
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="info-strip">
        <Icon name="shield" size={20} />
        <span>{t(language, "preferencesPrivateNote")}</span>
      </div>

      <Button className="wide" onClick={save} icon="check">
        {t(language, "saveAccessibilityProfile")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 7: VOICE PROFILE SETUP
   ========================================================================= */

function VoiceSetup({
  language,
  go,
  back,
  speak,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  speak: (s: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const rows = [
    [
      "What type of mobility assistance would you prefer?",
      "I use a wheelchair or stroller",
    ],
    [
      "Would you like step-free routes avoiding stairs?",
      "Yes, avoid all stairs",
    ],
    [
      "Do you prefer accessible public transport?",
      "Yes, low-floor buses and trains",
    ],
    [
      "Would you like spoken voice alerts on approach?",
      "Yes, spoken navigation enabled",
    ],
    ["Which language would you like for guidance?", language],
  ]

  return (
    <main className="page voice-page">
      <Header title={t(language, "voiceSetupTitle")} onBack={back} />
      <div className="voice-hero">
        <div className="sound-wave">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="eyebrow">{t(language, "voiceSetupKicker")}</span>
        <h2>{t(language, "readyToMove")}</h2>
      </div>

      <div className="conversation-list">
        {rows.map(([q, a], i) => (
          <div className="conversation-row" key={q}>
            <div className="assistant-line">
              <Icon name="voice" size={16} />
              <span>{q}</span>
            </div>
            <div className="user-line">
              {editing ? (
                <input aria-label={q} defaultValue={a} />
              ) : (
                <span>{a}</span>
              )}
              <Icon name="check" size={16} />
            </div>
            {i === 0 && (
              <button className="speak-link" onClick={() => speak(q)}>
                {t(language, "speakAgain")}
              </button>
            )}
          </div>
        ))}
      </div>

      <Card className="profile-summary">
        <div className="card-head">
          <h3>{t(language, "mobilityProfileTitle")}</h3>
          <StatusPill tone="mint">Active</StatusPill>
        </div>
        {[
          t(language, "wheelchairFriendly"),
          t(language, "avoidStairs"),
          t(language, "stepFreeTransport"),
          t(language, "voiceGuidance"),
          t(language, "spokenAlerts"),
        ].map((x) => (
          <div className="summary-row" key={x}>
            <span>{x}</span>
            <b>ON</b>
          </div>
        ))}
      </Card>

      <div className="split-actions">
        <Button variant="secondary" onClick={() => setEditing(!editing)}>
          {editing ? t(language, "doneEditing") : t(language, "editAnswers")}
        </Button>
        <Button
          onClick={() => {
            localStorage.setItem("ue-onboarded", "true")
            go("home")
          }}
          icon="check"
        >
          {t(language, "saveProfile")}
        </Button>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 8: HOME DASHBOARD
   ========================================================================= */

function Home({
  language,
  location,
  go,
  requestLocation,
  preferences,
  reportsCount,
  startCoords,
  endCoords,
}: {
  language: Language
  location: string
  go: (s: Screen) => void
  requestLocation: () => void
  preferences: string[]
  reportsCount: number
  startCoords?: [number, number]
  endCoords?: [number, number]
}) {
  const quickActions: [Screen, string, string][] = [
    ["planner", t(language, "planRoute"), "route"],
    ["voice", t(language, "voiceAssistant"), "voice"],
    ["report", t(language, "reportBarrier"), "report"],
    ["explore", t(language, "exploreNearby"), "explore"],
    ["saved", t(language, "savedRoutes"), "saved"],
  ]

  return (
    <main className="page dashboard">
      <header className="home-header">
        <div>
          <span className="muted">{t(language, "goodMorning")}</span>
          <h1>{t(language, "demoUser")}</h1>
        </div>
        <button
          className="avatar"
          onClick={() => go("profile")}
          aria-label="Open profile"
        >
          ND
          <span />
        </button>
      </header>

      <button className="location-line" onClick={requestLocation}>
        <Icon name="pin" size={18} />
        <span>{location}</span>
        <b>{t(language, "updateLocation")}</b>
      </button>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          className="search-box"
          style={{ flex: 1 }}
          onClick={() => go("search")}
        >
          <Icon name="search" size={20} />
          <span>{t(language, "searchPlaceholder")}</span>
        </button>
        <button
          className="icon-btn"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, var(--brand), var(--violet))",
            color: "white",
            borderRadius: "14px",
            border: "0",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
          onClick={() => {
            speakText(getVoiceGreeting(language), language)
            go("voice")
          }}
          aria-label={t(language, "navVoiceBtn")}
        >
          <Icon name="voice" size={22} />
        </button>
      </div>

      <Card className="profile-banner" onClick={() => go("setup")}>
        <div>
          <span className="eyebrow">{t(language, "mobilityProfileTitle")}</span>
          <h3>{t(language, "profileBannerTitle")}</h3>
          <p>{preferences.slice(0, 3).join(" · ")}</p>
        </div>
        <ScoreRing score={94} small />
      </Card>

      <section>
        <div className="section-title">
          <h2>{t(language, "quickActions")} · 5</h2>
        </div>
        <div className="quick-scroll">
          {quickActions.map(([s, label, icon]) => (
            <button key={s} onClick={() => go(s)}>
              <span>
                <Icon name={icon} size={22} />
              </span>
              {label}
            </button>
          ))}
        </div>
      </section>

      <Card className="city-status" onClick={() => go("iot")}>
        <div className="card-head">
          <div>
            <span className="eyebrow">
              {t(language, "liveCityAccessibility")}
            </span>
            <h3>{t(language, "mostlyAccessible")}</h3>
          </div>
          <StatusPill tone="mint">
            <span className="live-dot" /> {t(language, "updatedMinsAgo")}
          </StatusPill>
        </div>
        <div className="status-metrics">
          <div>
            <b>12/14</b>
            <span>{t(language, "accessibleLifts")}</span>
          </div>
          <div>
            <b>{reportsCount + 2}</b>
            <span>{t(language, "activeBarriers")}</span>
          </div>
          <div>
            <b>88/100</b>
            <span>{t(language, "areaScore")}</span>
          </div>
        </div>
        <div className="meter">
          <span style={{ width: "88%" }} />
        </div>
      </Card>

      <section>
        <div className="section-title">
          <h2>{t(language, "accessibilityScoreSummary")}</h2>
          <span className="verified">{t(language, "tenFactors")}</span>
        </div>
        <Card className="score-summary-card">
          <ScoreRing score={94} />
          <div className="score-breakdown">
            <div>
              <span>{t(language, "stepFreeAccess")}</span>
              <b>100</b>
            </div>
            <div>
              <span>{t(language, "rampsAndSlope")}</span>
              <b>94</b>
            </div>
            <div>
              <span>{t(language, "surfaceQuality")}</span>
              <b>89</b>
            </div>
            <div>
              <span>{t(language, "accessibleTransport")}</span>
              <b>96</b>
            </div>
            <div>
              <span>{t(language, "barrierConfidence")}</span>
              <b>92%</b>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <div className="section-title">
          <h2>{t(language, "recentRoute")} · 1</h2>
          <button onClick={() => go("saved")}>
            {t(language, "viewSaved")}
          </button>
        </div>
        <Card className="recent-route" onClick={() => go("detail")}>
          <div className="recent-route-mark">
            <Icon name="route" size={24} />
          </div>
          <div>
            <h3>Home to Bandra Station</h3>
            <p>{t(language, "routeA")}</p>
            <div>
              <b>94/100</b>
              <span>2.1 km</span>
              <span>28 min</span>
              <span>0 stairs</span>
            </div>
          </div>
          <Icon name="arrow" size={20} />
        </Card>
      </section>

      <section>
        <div className="section-title">
          <h2>{t(language, "nearbyPlaces")} · 6</h2>
          <button onClick={() => go("explore")}>{t(language, "seeAll")}</button>
        </div>
        <div className="place-row">
          <Card onClick={() => go("place")}>
            <span className="place-type">STATION</span>
            <h3>Bandra Railway Station</h3>
            <p>2 lifts · 1 ramp · 4 gates</p>
            <div>
              <StatusPill tone="mint">91/100</StatusPill>
              <span>650 m</span>
            </div>
          </Card>
          <Card onClick={() => go("place")}>
            <span className="place-type">HOSPITAL</span>
            <h3>Holy Family Hospital</h3>
            <p>Step-free · 8 bays · Voice lifts</p>
            <div>
              <StatusPill tone="mint">96/100</StatusPill>
              <span>900 m</span>
            </div>
          </Card>
        </div>
      </section>

      <Card className="barrier-card" onClick={() => go("report")}>
        <div className="barrier-icon">
          <Icon name="report" size={24} />
        </div>
        <div>
          <h3>
            {reportsCount + 2} {t(language, "reportedBarriersNearby")}
          </h3>
          <p>{t(language, "nearestBarrierDist")}</p>
        </div>
        <Icon name="arrow" size={20} />
      </Card>

      <div className="academic-home-badge" onClick={() => go("academic")}>
        <Icon name="academic" size={18} />
        <span>{t(language, "academicNotice")}</span>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 9: VOICE ASSISTANT
   ========================================================================= */

function VoiceAssistant({
  language,
  go,
  back,
  speak,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  speak: (s: string) => void
}) {
  const [state, setState] =
    useState<"Ready" | "Listening" | "Processing" | "Error">("Ready")
  const [typed, setTyped] = useState(false)
  const [text, setText] = useState("")

  const start = () => {
    const greeting = getVoiceGreeting(language)
    speak(greeting)
    setState("Listening")

    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!Recognition) {
      setTimeout(() => setState("Ready"), 3500)
      return
    }
    try {
      const r = new Recognition()
      r.lang =
        language === "Hindi"
          ? "hi-IN"
          : language === "Marathi"
            ? "mr-IN"
            : "en-IN"
      r.interimResults = false
      r.onresult = (e: any) => {
        const heard = e.results[0][0].transcript
        setText(heard)
        setState("Processing")
        runCommand(heard)
        setTimeout(() => setState("Ready"), 900)
      }
      r.onerror = () => {
        setTimeout(() => setState("Ready"), 2000)
      }
      r.onend = () => {
        setState((cur) => (cur === "Listening" ? "Ready" : cur))
      }
      r.start()
    } catch {
      setTimeout(() => setState("Ready"), 2000)
    }
  }

  const runCommand = (cmd: string) => {
    setText(cmd)
    if (cmd === "Report barrier" || cmd.includes("report")) go("report")
    else if (cmd === "Open saved routes" || cmd.includes("saved")) go("saved")
    else if (cmd === "Change preferences" || cmd.includes("preference"))
      go("setup")
    else if (cmd === "Change language" || cmd.includes("language"))
      go("language")
    else if (cmd === "Find accessible route" || cmd.includes("route"))
      go("planner")
    else if (cmd === "Start navigation" || cmd.includes("start")) go("journey")
    else
      speak(
        cmd === "Repeat instruction"
          ? "In 120 metres, keep left toward the step-free entrance."
          : "Command understood.",
      )
  }

  return (
    <main className="page voice-assistant">
      <Header
        title={t(language, "voiceAssistantTitle")}
        onBack={back}
        right={
          <button className="lang-chip" onClick={() => go("language")}>
            {language}
          </button>
        }
      />

      <div className="assistant-status">
        <span className={`status-dot ${state.toLowerCase()}`} />
        <b>
          {state === "Listening"
            ? t(language, "stateListening")
            : state === "Processing"
              ? t(language, "stateProcessing")
              : state === "Error"
                ? t(language, "stateError")
                : t(language, "stateReady")}
        </b>
        <span>
          {state === "Listening"
            ? t(language, "speakNaturally")
            : t(language, "tapMicToBegin")}
        </span>
      </div>

      <button
        className={`mic-button ${state.toLowerCase()}`}
        onClick={start}
        aria-label="Start voice microphone"
      >
        <span className="mic-rings" />
        <Icon name="voice" size={48} />
      </button>

      <div className="voice-conversation">
        <div className="bubble user">
          Find an accessible route to Bandra Station with no stairs.
        </div>
        <div className="bubble assistant">
          <span>
            <Icon name="spark" size={16} /> UrbanEase AI
          </span>
          I found real pedestrian routes using OpenStreetMap OSRM. Route A is
          fully step-free with an accessibility score of <b>94 out of 100</b>.
          <div className="bubble-actions">
            <Button onClick={() => go("results")}>
              {t(language, "viewRoutes")}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                speak(
                  "The most accessible route has a score of 94 out of 100 with zero stairs.",
                )
              }
            >
              {t(language, "hearAgain")}
            </Button>
          </div>
        </div>
        {text && <div className="bubble user">{text}</div>}
      </div>

      {typed ? (
        <form
          className="type-form"
          onSubmit={(e) => {
            e.preventDefault()
            runCommand(text)
          }}
        >
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(language, "typeCommandPlaceholder")}
          />
          <Button type="submit">{t(language, "send")}</Button>
        </form>
      ) : (
        <Button
          variant="secondary"
          className="wide"
          onClick={() => setTyped(true)}
        >
          {t(language, "typeInstead")}
        </Button>
      )}

      <section>
        <div className="section-title">
          <h2>{t(language, "tryACommand")}</h2>
        </div>
        <div className="command-chips">
          {[
            "Find accessible route",
            "Avoid stairs",
            "Start navigation",
            "Repeat instruction",
            "Report barrier",
            "Open saved routes",
            "Change language",
          ].map((c) => (
            <button key={c} onClick={() => runCommand(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

/* =========================================================================
   SCREEN 10: ROUTE PLANNER (WITH REAL NOMINATIM GEOCODING)
   ========================================================================= */

function Planner({
  language,
  go,
  back,
  preferences,
  toggle,
  location,
  onCalculateRoute,
  isRoutingLoading,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  preferences: string[]
  toggle: (s: string) => void
  location: string
  onCalculateRoute: (fromName: string, toName: string) => void
  isRoutingLoading: boolean
}) {
  const [from, setFrom] = useState(location)
  const [to, setTo] = useState("Bandra Railway Station")
  const [mode, setMode] = useState<"Walking" | "Transit" | "Mixed">("Walking")
  const [suggestions, setSuggestions] = useState<GeoLocationPoint[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search via Nominatim
  useEffect(() => {
    if (!to || to.length < 3) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      const points = await geocodeDestination(to)
      setSuggestions(points)
      setIsSearching(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [to])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCalculateRoute(from, to)
  }

  return (
    <main className="page">
      <Header title={t(language, "planAccessibleRoute")} onBack={back} />

      <form onSubmit={handleSubmit}>
        <Card className="route-form">
          <label>
            <span>{t(language, "startingPoint")}</span>
            <div>
              <i className="dot start-dot" />
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Enter start location or use GPS"
              />
            </div>
          </label>

          <button
            type="button"
            className="swap-button"
            onClick={() => {
              const temp = from
              setFrom(to)
              setTo(temp)
            }}
            aria-label={t(language, "swapLocations")}
          >
            <Icon name="swap" size={18} />
          </button>

          <label>
            <span>{t(language, "destination")}</span>
            <div>
              <Icon name="pin" size={18} />
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Search real address or station…"
              />
            </div>
          </label>

          {isSearching && (
            <small className="muted" style={{ padding: "4px 8px" }}>
              Resolving coordinates via OpenStreetMap Nominatim…
            </small>
          )}

          {suggestions.length > 0 && (
            <div
              className="geocoding-suggestions"
              style={{
                background: "#f8f9fe",
                border: "1px solid #dfe3f0",
                borderRadius: "12px",
                marginTop: "8px",
                overflow: "hidden",
              }}
            >
              {suggestions.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "0",
                    borderBottom: "1px solid #dfe3f0",
                    background: "white",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setTo(p.name)
                    setSuggestions([])
                  }}
                >
                  <b style={{ fontSize: "12px", color: "var(--brand)" }}>
                    {p.name}
                  </b>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.address}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="form-grid">
          <label>
            <span>{t(language, "date")}</span>
            <input type="date" defaultValue="2026-10-21" />
          </label>
          <label>
            <span>{t(language, "time")}</span>
            <input type="time" defaultValue="11:00" />
          </label>
        </div>

        <section>
          <div className="section-title">
            <h2>{t(language, "travelMode")}</h2>
          </div>
          <div className="segment">
            {(["Walking", "Transit", "Mixed"] as const).map((m) => (
              <button
                type="button"
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => setMode(m)}
              >
                {m === "Walking"
                  ? t(language, "modeWalking")
                  : m === "Transit"
                    ? t(language, "modeTransit")
                    : t(language, "modeMixed")}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="section-title">
            <h2>{t(language, "mobilityProfileTitle")}</h2>
            <StatusPill tone="mint">{t(language, "profileSynced")}</StatusPill>
          </div>
          <div className="setting-list">
            {[
              [t(language, "avoidStairs"), "Avoid stairs"],
              [t(language, "stepFreeTransport"), "Step-free transport"],
              [t(language, "lowWalking"), "Low walking"],
              [t(language, "voiceGuidance"), "Voice navigation"],
            ].map(([label, key]) => (
              <div className="setting-row" key={key}>
                <span>{label}</span>
                <Toggle
                  label={label}
                  checked={preferences.includes(key)}
                  onChange={() => toggle(key)}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="info-strip">
          <Icon name="spark" size={20} />
          <span>
            Calculates actual road paths via Open Source Routing Machine (OSRM)
            with live OpenStreetMap coordinates.
          </span>
        </div>

        <Button
          className="wide"
          type="submit"
          icon="search"
          disabled={isRoutingLoading}
        >
          {isRoutingLoading
            ? "Calculating real street route…"
            : t(language, "findAccessibleRoute")}
        </Button>
        <Button
          className="wide"
          variant="ghost"
          onClick={() => {
            setFrom("")
            setTo("")
          }}
        >
          {t(language, "clearRoute")}
        </Button>
      </form>
    </main>
  )
}

/* =========================================================================
   SCREEN 11: ROUTE RESULTS (WITH REAL LEAFLET MAP & OSRM ALTERNATIVES)
   ========================================================================= */

function Results({
  language,
  go,
  back,
  routes,
  selectedRoute,
  saved,
  saveRoute,
  setSelected,
  destination,
  startCoords,
  endCoords,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  routes: CalculatedRoute[]
  selectedRoute: CalculatedRoute
  saved: string[]
  saveRoute: (id: string) => void
  setSelected: (r: CalculatedRoute) => void
  destination: string
  startCoords: [number, number]
  endCoords: [number, number]
}) {
  const alts = routes
    .filter((r) => r.id !== selectedRoute.id)
    .map((r) => r.geometry)

  return (
    <main className="page results-page">
      <Header title={t(language, "accessibleRoutes")} onBack={back} />

      <div className="route-summary">
        <div>
          <b>{t(language, "currentLocation")} →</b>
          <span>{destination}</span>
        </div>
        <Button onClick={() => go("planner")}>{t(language, "edit")}</Button>
      </div>

      {/* Real Interactive Leaflet Map with actual Polyline */}
      <InteractiveMap
        start={startCoords}
        end={endCoords}
        routeGeometry={selectedRoute.geometry}
        alternativeGeometries={alts}
        height="240px"
      />

      <div className="result-note">
        <Icon name="spark" size={18} />
        <span>{selectedRoute.accessibilityNotice}</span>
      </div>

      {routes.map((route) => (
        <Card
          key={route.id}
          className={`route-card ${
            selectedRoute.id === route.id ? "selected-route-card" : ""
          }`}
        >
          <div className="route-card-top">
            <div>
              <span className="route-letter">ROUTE {route.id}</span>
              <h2>{route.name}</h2>
            </div>
            <ScoreRing score={route.score} small />
          </div>

          <div className="route-stats">
            <div>
              <b>{route.durationFormatted}</b>
              <span>{t(language, "travelTime")}</span>
            </div>
            <div>
              <b>{route.distanceFormatted}</b>
              <span>{t(language, "distance")}</span>
            </div>
            <div>
              <b>{route.instructions.length} steps</b>
              <span>Real maneuvers</span>
            </div>
          </div>

          <div className="traits">
            {route.traits.map((trait, i) => (
              <StatusPill key={trait} tone={i === 0 ? "mint" : "green"}>
                {trait}
              </StatusPill>
            ))}
          </div>

          <div className="route-actions">
            <Button
              onClick={() => {
                setSelected(route)
                go("detail")
              }}
            >
              {t(language, "viewRoute")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelected(route)
                go("compare")
              }}
            >
              {t(language, "compare")}
            </Button>
            <button
              className={`save-icon ${saved.includes(route.id) ? "saved" : ""}`}
              onClick={() => saveRoute(route.id)}
              aria-label="Save this route"
            >
              <Icon name="saved" size={20} />
            </button>
          </div>

          <Button
            className="wide"
            variant="ghost"
            onClick={() => {
              setSelected(route)
              go("journey")
            }}
            icon="route"
          >
            {t(language, "startNavigation")}
          </Button>
        </Card>
      ))}
    </main>
  )
}

/* =========================================================================
   SCREEN 12: ROUTE COMPARISON (SIDE BY SIDE OSRM METRICS)
   ========================================================================= */

function Comparison({
  language,
  go,
  back,
  routes,
  selected,
  setSelected,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  routes: CalculatedRoute[]
  selected: CalculatedRoute
  setSelected: (r: CalculatedRoute) => void
}) {
  const metrics = [
    ["Accessibility score", ...routes.map((r) => `${r.score} / 100`)],
    ["Real street distance", ...routes.map((r) => r.distanceFormatted)],
    ["Estimated walking time", ...routes.map((r) => r.durationFormatted)],
    [
      "Total turn maneuvers",
      ...routes.map((r) => `${r.instructions.length} steps`),
    ],
    ["Routing engine", ...routes.map(() => "OSRM Walking API")],
    ["Physical road geometry", ...routes.map(() => "Verified street polyline")],
  ]

  return (
    <main className="page compare-page">
      <Header title={t(language, "compareRoutesTitle")} onBack={back} />
      <p className="lead">{t(language, "compareSubtitle")}</p>

      <div className="compare-table">
        <div className="compare-head">
          <span>{t(language, "metricFactor")}</span>
          {routes.map((r) => (
            <button
              key={r.id}
              className={selected.id === r.id ? "selected" : ""}
              onClick={() => setSelected(r)}
            >
              Route {r.id}
              <small>{r.name}</small>
            </button>
          ))}
        </div>

        {metrics.map((row) => (
          <div className="compare-row" key={row[0]}>
            <b>{row[0]}</b>
            {row.slice(1).map((val, idx) => (
              <span key={idx} className={idx === 0 ? "best" : ""}>
                {val}
              </span>
            ))}
          </div>
        ))}
      </div>

      <Button
        className="wide sticky-action"
        onClick={() => go("detail")}
        icon="arrow"
      >
        {t(language, "chooseRoute")} {selected.id}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 13: ROUTE DETAILS (REAL OSRM MANEUVERS & LEAFLET MAP)
   ========================================================================= */

function RouteDetail({
  language,
  go,
  back,
  route,
  destination,
  saveRoute,
  notify,
  startCoords,
  endCoords,
}: {
  language: Language
  go: (s: Screen) => void
  back: () => void
  route: CalculatedRoute
  destination: string
  saveRoute: (id: string) => void
  notify: (msg: string) => void
  startCoords: [number, number]
  endCoords: [number, number]
}) {
  const externalNavUrl = getExternalNavigationUrl(startCoords, endCoords)

  return (
    <main className="page route-detail">
      <Header
        title={`Route ${route.id} · ${route.name}`}
        onBack={back}
        right={
          <button
            className="icon-btn"
            onClick={() => notify("Share link copied to clipboard")}
            aria-label="Share route"
          >
            <Icon name="share" size={18} />
          </button>
        }
      />

      {/* Real interactive map with calculated road polyline */}
      <InteractiveMap
        start={startCoords}
        end={endCoords}
        routeGeometry={route.geometry}
        height="260px"
      />

      <Card className="journey-overview">
        <ScoreRing score={route.score} />
        <div>
          <span className="eyebrow">
            {t(language, "accessibilityScoreSummary")}
          </span>
          <h2>{route.name}</h2>
          <p>
            {route.distanceFormatted} · {route.durationFormatted} to{" "}
            {destination}
          </p>
          <div className="traits">
            <StatusPill tone="mint">OSRM Live Path</StatusPill>
            <StatusPill tone="mint">
              {route.instructions.length} Maneuvers
            </StatusPill>
          </div>
        </div>
      </Card>

      <Card>
        <div className="card-head">
          <h3>Real Turn-by-Turn Instructions</h3>
          <StatusPill tone="mint">OSRM API</StatusPill>
        </div>
        <div className="timeline">
          {route.instructions.map((step, idx) => (
            <div key={idx}>
              <i />
              <b>{step.instruction}</b>
              <span>
                {step.distance} ({step.duration}) · {step.streetName}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="action-grid">
        <Button onClick={() => go("journey")} icon="route">
          {t(language, "startJourney")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => saveRoute(route.id)}
          icon="saved"
        >
          {t(language, "saveRouteBtn")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.open(externalNavUrl, "_blank")}
          icon="signal"
        >
          Open in Google Maps
        </Button>
        <Button variant="ghost" onClick={() => notify("Share link generated")}>
          {t(language, "shareRoute")}
        </Button>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 14: ACTIVE JOURNEY NAVIGATION (WITH REAL TURN MANEUVER TRACKING)
   ========================================================================= */

function Journey({
  language,
  go,
  route,
  destination,
  alternate,
  setAlternate,
  paused,
  setPaused,
  muted,
  setMuted,
  speak,
  confirm,
  notify,
  startCoords,
  endCoords,
}: {
  language: Language
  go: (s: Screen) => void
  route: CalculatedRoute
  destination: string
  alternate: boolean
  setAlternate: (b: boolean) => void
  paused: boolean
  setPaused: (b: boolean) => void
  muted: boolean
  setMuted: (b: boolean) => void
  speak: (s: string) => void
  confirm: (
    title: string,
    text: string,
    action: () => void,
    label?: string,
  ) => void
  notify: (msg: string) => void
  startCoords: [number, number]
  endCoords: [number, number]
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const step = route.instructions[currentStepIndex] ||
    route.instructions[0] || {
      instruction: "Proceed toward destination along step-free street route.",
      distance: "120 m",
      streetName: "Hill Road",
      location: startCoords,
    }

  const handleNextStep = () => {
    if (currentStepIndex < route.instructions.length - 1) {
      const nextIdx = currentStepIndex + 1
      setCurrentStepIndex(nextIdx)
      const nextStep = route.instructions[nextIdx]
      if (!muted) speak(nextStep.instruction)
    } else {
      notify("You have arrived at your destination!")
      speak("You have arrived at your destination.")
    }
  }

  const externalNavUrl = getExternalNavigationUrl(startCoords, endCoords)

  return (
    <main className="journey-page">
      <div className="journey-header">
        <button
          className="icon-btn dark"
          onClick={() =>
            confirm(
              t(language, "endJourneyPrompt"),
              t(language, "endJourneyText"),
              () => go("home"),
              t(language, "endJourneyConfirm"),
            )
          }
          aria-label="End navigation"
        >
          <Icon name="close" size={20} />
        </button>
        <div>
          <span>
            {t(language, "navigatingTitle")} {route.id}
          </span>
          <b>{destination}</b>
        </div>
        <button
          className="icon-btn dark"
          onClick={() => window.open(externalNavUrl, "_blank")}
          aria-label="Open in external map"
        >
          <Icon name="signal" size={20} />
        </button>
      </div>

      {/* Real Interactive Leaflet Map with actual step location pin */}
      <InteractiveMap
        start={startCoords}
        end={endCoords}
        routeGeometry={route.geometry}
        activeStepLocation={step.location}
        height="320px"
      />

      <div className="journey-sheet">
        <div className="drag-handle" />

        <div className="next-instruction">
          <div className="direction-arrow">↗</div>
          <div>
            <span>
              STEP {currentStepIndex + 1} OF {route.instructions.length} ·{" "}
              {step.distance}
            </span>
            <h1>{step.instruction}</h1>
          </div>
        </div>

        <div className="progress-row">
          <div>
            <span>{t(language, "remaining")}</span>
            <b>{route.distanceFormatted}</b>
          </div>
          <div>
            <span>{t(language, "travelTime")}</span>
            <b>{route.durationFormatted}</b>
          </div>
          <div>
            <span>Current Street</span>
            <b>{step.streetName}</b>
          </div>
        </div>

        <div className="journey-progress">
          <span
            style={{
              width: `${Math.round(((currentStepIndex + 1) / Math.max(1, route.instructions.length)) * 100)}%`,
            }}
          />
        </div>

        <div
          className="action-step-row"
          style={{ display: "flex", gap: "10px", margin: "10px 0" }}
        >
          <Button className="wide" onClick={handleNextStep} icon="arrow">
            Next Maneuver ({currentStepIndex + 1}/{route.instructions.length})
          </Button>
        </div>

        <Card className="alert-card">
          <Icon name="report" size={20} />
          <div>
            <span>{t(language, "accessibilityAlertTitle")}</span>
            <b>{t(language, "alertDescription")}</b>
            <p>
              Temporary sidewalk obstruction reported on Hill Road approach.
            </p>
          </div>
        </Card>

        <div className="journey-controls">
          <button
            onClick={() => {
              if (!muted) speak(step.instruction)
            }}
          >
            <Icon name="voice" size={20} />
            <span>{t(language, "repeat")}</span>
          </button>

          <button onClick={() => setPaused(!paused)}>
            <Icon name={paused ? "play" : "pause"} size={20} />
            <span>{paused ? t(language, "resume") : t(language, "pause")}</span>
          </button>

          <button onClick={() => setMuted(!muted)}>
            <Icon name={muted ? "volumeX" : "volume"} size={20} />
            <span>{muted ? t(language, "unmute") : t(language, "mute")}</span>
          </button>

          <button
            onClick={() => {
              setAlternate(true)
              notify("Recalculating alternative street route via OSRM…")
              speak("Recalculating alternative step-free street route.")
            }}
          >
            <Icon name="route" size={20} />
            <span>{t(language, "recalculate")}</span>
          </button>

          <button onClick={() => go("report")}>
            <Icon name="report" size={20} />
            <span>{t(language, "report")}</span>
          </button>
        </div>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 15: EXPLORE ACCESSIBLE PLACES
   ========================================================================= */

function Explore({
  language,
  places,
  go,
  requestLocation,
  setSelectedPlace,
  startCoords,
}: {
  language: Language
  places: SavedPlaceItem[]
  go: (s: Screen) => void
  requestLocation: () => void
  setSelectedPlace: (p: SavedPlaceItem) => void
  startCoords: [number, number]
}) {
  const [view, setView] = useState<"List" | "Map">("List")
  const [filter, setFilter] = useState("All")

  const categories = [
    "All",
    "Station",
    "Hospital",
    "Park",
    "Bus Stop",
    "Shopping",
    "Restaurant",
  ]
  const visible = places.filter(
    (p) => filter === "All" || p.type.toLowerCase() === filter.toLowerCase(),
  )

  return (
    <main className="page">
      <Header
        title={t(language, "explorePlacesTitle")}
        right={
          <button
            className="icon-btn"
            onClick={() => go("search")}
            aria-label="Search"
          >
            <Icon name="search" size={20} />
          </button>
        }
      />

      <div className="explore-tools">
        <button className="filter-search" onClick={() => go("search")}>
          <Icon name="search" size={18} />
          <span>{t(language, "searchPlacesPlaceholder")}</span>
        </button>
        <Button variant="secondary" onClick={requestLocation} icon="pin">
          {t(language, "nearMe")}
        </Button>
      </div>

      <div className="category-scroll">
        {categories.map((c) => (
          <button
            key={c}
            className={filter === c ? "active" : ""}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="view-toggle">
        <button
          className={view === "List" ? "active" : ""}
          onClick={() => setView("List")}
        >
          {t(language, "listView")} · {visible.length}
        </button>
        <button
          className={view === "Map" ? "active" : ""}
          onClick={() => setView("Map")}
        >
          {t(language, "mapView")}
        </button>
      </div>

      {view === "Map" && (
        <InteractiveMap
          start={startCoords}
          end={[18.9542, 72.8365]}
          height="280px"
        />
      )}

      <div className="explore-list">
        {visible.map((p) => (
          <Card
            key={p.id}
            className="place-list-card"
            onClick={() => {
              setSelectedPlace(p)
              go("place")
            }}
          >
            <div className="place-thumb">
              <Icon name="pin" size={22} />
            </div>
            <div>
              <span className="place-type">{p.type.toUpperCase()}</span>
              <h3>{p.name}</h3>
              <p>{p.features.slice(0, 2).join(" · ")}</p>
              <div>
                <StatusPill tone="mint">{p.score}/100</StatusPill>
                <span>{p.distance}</span>
              </div>
            </div>
            <Icon name="arrow" size={20} />
          </Card>
        ))}
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 16: PLACE DETAILS
   ========================================================================= */

function Place({
  language,
  place,
  go,
  back,
  notify,
  speak,
  startCoords,
}: {
  language: Language
  place: SavedPlaceItem
  go: (s: Screen) => void
  back: () => void
  notify: (msg: string) => void
  speak: (s: string) => void
  startCoords: [number, number]
}) {
  return (
    <main className="page">
      <Header
        title={t(language, "placeDetailsTitle")}
        onBack={back}
        right={
          <button
            className="icon-btn"
            onClick={() => notify(t(language, "placeSavedSuccess"))}
            aria-label="Save place"
          >
            <Icon name="saved" size={20} />
          </button>
        }
      />

      <InteractiveMap
        start={startCoords}
        end={[18.9542, 72.8365]}
        height="240px"
      />

      <Card className="place-hero">
        <div>
          <span className="place-type">
            {place.type.toUpperCase()} · {place.distance} AWAY
          </span>
          <h1>{place.name}</h1>
          <p>{place.address}</p>
        </div>
        <ScoreRing score={place.score} small />
      </Card>

      <section>
        <div className="section-title">
          <h2>
            {t(language, "accessibilityFacilities")} · {place.features.length}
          </h2>
          <span className="verified">{t(language, "verifiedStatus")}</span>
        </div>
        <div className="facility-grid">
          {place.features.map((feat, i) => (
            <div key={i}>
              <Icon name="check" size={16} />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </section>

      <Card className="info-strip">
        <Icon name="signal" size={20} />
        <span>
          Tactile guidance and step-free access verified. Lift status
          operational. UrbanEase community reliability: 94%.
        </span>
      </Card>

      <div className="action-grid">
        <Button onClick={() => go("planner")} icon="route">
          Directions · {place.distance}
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            speak(
              `${place.name} is ${place.distance} away on ${place.address}. Step-free entry is verified.`,
            )
          }
          icon="voice"
        >
          {t(language, "voiceDirections")}
        </Button>
        <Button variant="secondary" onClick={() => go("report")} icon="report">
          {t(language, "reportProblem")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => notify(t(language, "placeSavedSuccess"))}
          icon="saved"
        >
          {t(language, "savePlace")}
        </Button>
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 17: REPORT AN ACCESSIBILITY BARRIER (SYNCED WITH SUPABASE)
   ========================================================================= */

function ReportFlow({
  language,
  stage,
  setStage,
  type,
  setType,
  severity,
  setSeverity,
  go,
  addReport,
  back,
}: {
  language: Language
  stage: "form" | "ai" | "review" | "success"
  setStage: (st: "form" | "ai" | "review" | "success") => void
  type: string
  setType: (t: string) => void
  severity: "Low" | "Medium" | "High"
  setSeverity: (s: "Low" | "Medium" | "High") => void
  go: (s: Screen) => void
  addReport: (r: {
    type: string
    severity: "Low" | "Medium" | "High"
    location: string
    description: string
  }) => void
  back: () => void
}) {
  const [desc, setDesc] = useState(
    "Sidewalk is blocked and forcing wheelchair users onto the main roadway.",
  )
  const [loc, setLoc] = useState("Hill Road, Bandra West (Current GPS)")

  if (stage === "ai") {
    return (
      <main className="page">
        <Header
          title={t(language, "aiAnalysisTitle")}
          onBack={() => setStage("form")}
        />
        <div className="prototype-banner">
          <Icon name="spark" size={18} /> {t(language, "aiAnalysisNote")}
        </div>

        <div className="image-preview">
          <div>
            <Icon name="report" size={42} />
            <span>Simulated image analysis frame</span>
          </div>
          <StatusPill tone="amber">Obstruction Classified</StatusPill>
        </div>

        <Card>
          <div className="analysis-title">
            <div>
              <span>{t(language, "detectedType")}</span>
              <h2>{type}</h2>
            </div>
            <ScoreRing score={92} small />
          </div>

          <div className="analysis-grid">
            <div>
              <span>{t(language, "confidence")}</span>
              <b>92%</b>
            </div>
            <div>
              <span>{t(language, "severityField")}</span>
              <b>{severity}</b>
            </div>
            <div>
              <span>{t(language, "locationField")}</span>
              <b>Hill Road</b>
            </div>
            <div>
              <span>{t(language, "suggestedAction")}</span>
              <b>Reroute step-free path</b>
            </div>
          </div>
        </Card>

        <div className="info-strip">
          <Icon name="shield" size={18} />
          <span>
            Simulated edge-AI barrier inference model. Users can freely override
            parameters before submitting.
          </span>
        </div>

        <Button
          className="wide"
          onClick={() => setStage("review")}
          icon="check"
        >
          {t(language, "confirmAnalysis")}
        </Button>
        <Button
          className="wide"
          variant="secondary"
          onClick={() => setStage("form")}
        >
          {t(language, "editReport")}
        </Button>
        <Button className="wide" variant="ghost" onClick={() => go("home")}>
          {t(language, "cancel")}
        </Button>
      </main>
    )
  }

  if (stage === "review") {
    return (
      <main className="page">
        <Header
          title={t(language, "reviewReport")}
          onBack={() => setStage("form")}
        />
        <div className="review-visual">
          <Icon name="report" size={38} />
        </div>

        <Card>
          <h2>{type}</h2>
          <div className="review-list">
            <div>
              <span>{t(language, "locationField")}</span>
              <b>{loc}</b>
            </div>
            <div>
              <span>{t(language, "severityField")}</span>
              <StatusPill tone={severity === "High" ? "amber" : "green"}>
                {severity}
              </StatusPill>
            </div>
            <div>
              <span>{t(language, "descriptionField")}</span>
              <b>{desc}</b>
            </div>
            <div>
              <span>Photo</span>
              <b>1 attached (Simulated AI)</b>
            </div>
            <div>
              <span>Database Sync</span>
              <b>Supabase Cloud + Local Cache</b>
            </div>
          </div>
        </Card>

        <div className="info-strip">
          <Icon name="shield" size={18} />
          <span>
            Submissions are shared with urban transit teams and municipal
            coordinators. Your name stays private.
          </span>
        </div>

        <Button
          className="wide"
          onClick={() => {
            addReport({ type, severity, location: loc, description: desc })
            setStage("success")
          }}
          icon="check"
        >
          {t(language, "confirmAndSubmit")}
        </Button>
        <Button
          variant="secondary"
          className="wide"
          onClick={() => setStage("form")}
        >
          {t(language, "editReport")}
        </Button>
      </main>
    )
  }

  if (stage === "success") {
    return (
      <main className="page success-page">
        <div className="success-animation">
          <Icon name="check" size={48} />
        </div>
        <span className="eyebrow">{t(language, "reportSuccessTitle")}</span>
        <h1>{t(language, "reportSuccessTitle")}</h1>
        <p>{t(language, "reportSuccessSub")}</p>

        <Card>
          <span>{t(language, "reportIdLabel")}</span>
          <h2>UE-2402</h2>
          <p>{t(language, "underReviewNote")}</p>
        </Card>

        <Button
          className="wide"
          onClick={() => {
            setStage("form")
            go("history")
          }}
          icon="arrow"
        >
          {t(language, "viewHistory")}
        </Button>
        <Button
          className="wide"
          variant="secondary"
          onClick={() => {
            setStage("form")
            go("home")
          }}
        >
          {t(language, "returnHome")}
        </Button>
      </main>
    )
  }

  return (
    <main className="page">
      <Header
        title={t(language, "reportBarrierTitle")}
        onBack={back}
        right={
          <button
            className="icon-btn"
            onClick={() =>
              window.alert("Say 'Report blocked footpath at current location'")
            }
            aria-label="Voice report"
          >
            <Icon name="voice" size={20} />
          </button>
        }
      />
      <p className="lead">{t(language, "reportLead")}</p>

      <section>
        <div className="section-title">
          <h2>{t(language, "whatDidYouFind")}</h2>
        </div>
        <div className="report-grid">
          {barrierTypes.slice(0, 12).map((b) => (
            <button
              key={b}
              className={type === b ? "selected" : ""}
              onClick={() => setType(b)}
            >
              <span>
                <Icon
                  name={
                    b.includes("ramp") || b.includes("Stair")
                      ? "route"
                      : "report"
                  }
                  size={18}
                />
              </span>
              <span>{b}</span>
            </button>
          ))}
        </div>
      </section>

      <label className="upload-area">
        <input type="file" accept="image/*" onChange={() => setStage("ai")} />
        <Icon name="spark" size={26} />
        <b>{t(language, "uploadPhoto")}</b>
        <span>{t(language, "uploadOptional")}</span>
      </label>

      <label className="field">
        <span>{t(language, "locationField")}</span>
        <div>
          <Icon name="pin" size={18} />
          <input value={loc} onChange={(e) => setLoc(e.target.value)} />
        </div>
      </label>

      <label className="field">
        <span>{t(language, "descriptionField")}</span>
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>

      <section>
        <div className="section-title">
          <h2>{t(language, "severityField")}</h2>
        </div>
        <div className="segment">
          {(["Low", "Medium", "High"] as const).map((s) => (
            <button
              key={s}
              className={severity === s ? "active" : ""}
              onClick={() => setSeverity(s)}
            >
              {s === "Low"
                ? t(language, "severityLow")
                : s === "Medium"
                  ? t(language, "severityMedium")
                  : t(language, "severityHigh")}
            </button>
          ))}
        </div>
      </section>

      <Button className="wide" onClick={() => setStage("review")} icon="arrow">
        {t(language, "reviewReport")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 18 & 19: SAVED ROUTES & SAVED PLACES
   ========================================================================= */

function Saved({
  language,
  savedRoutes,
  setSavedRoutes,
  savedPlaces,
  setSavedPlaces,
  routes,
  go,
  setSelectedRoute,
  setSelectedPlace,
  confirm,
}: {
  language: Language
  savedRoutes: string[]
  setSavedRoutes: (fn: (prev: string[]) => string[]) => void
  savedPlaces: SavedPlaceItem[]
  setSavedPlaces: (fn: (prev: SavedPlaceItem[]) => SavedPlaceItem[]) => void
  routes: CalculatedRoute[]
  go: (s: Screen) => void
  setSelectedRoute: (r: CalculatedRoute) => void
  setSelectedPlace: (p: SavedPlaceItem) => void
  confirm: (
    title: string,
    text: string,
    action: () => void,
    label?: string,
  ) => void
}) {
  const [tab, setTab] = useState<"routes" | "places">("routes")

  return (
    <main className="page">
      <Header
        title={
          tab === "routes"
            ? t(language, "savedRoutesTitle")
            : t(language, "savedPlacesTitle")
        }
      />

      <div className="view-toggle">
        <button
          className={tab === "routes" ? "active" : ""}
          onClick={() => setTab("routes")}
        >
          {t(language, "routesTab")} · {savedRoutes.length}
        </button>
        <button
          className={tab === "places" ? "active" : ""}
          onClick={() => setTab("places")}
        >
          {t(language, "placesTab")} · {savedPlaces.length}
        </button>
      </div>

      {tab === "routes" ? (
        savedRoutes.length === 0 ? (
          <div className="empty-state">
            <Icon name="route" size={40} />
            <h2>{t(language, "noSavedRoutes")}</h2>
            <p>{t(language, "noSavedRoutesSub")}</p>
            <Button onClick={() => go("planner")} icon="route">
              {t(language, "planRoute")}
            </Button>
          </div>
        ) : (
          savedRoutes.map((id) => {
            const r = routes.find((x) => x.id === id) || routes[0]
            return (
              <Card className="saved-card" key={id}>
                <div className="card-head">
                  <div>
                    <span className="route-letter">SAVED · ROUTE {id}</span>
                    <h2>{r.name}</h2>
                  </div>
                  <ScoreRing score={r.score} small />
                </div>
                <div className="route-stats">
                  <div>
                    <b>{r.distanceFormatted}</b>
                    <span>{t(language, "distance")}</span>
                  </div>
                  <div>
                    <b>{r.durationFormatted}</b>
                    <span>{t(language, "travelTime")}</span>
                  </div>
                  <div>
                    <b>12 Oct</b>
                    <span>Synced</span>
                  </div>
                </div>
                <div className="route-actions">
                  <Button
                    onClick={() => {
                      setSelectedRoute(r)
                      go("detail")
                    }}
                  >
                    {t(language, "open")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedRoute(r)
                      go("journey")
                    }}
                  >
                    {t(language, "start")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      confirm(
                        t(language, "deleteSavedPrompt"),
                        t(language, "deleteSavedText"),
                        () =>
                          setSavedRoutes((prev) =>
                            prev.filter((i) => i !== id),
                          ),
                        t(language, "delete"),
                      )
                    }
                  >
                    {t(language, "delete")}
                  </Button>
                </div>
              </Card>
            )
          })
        )
      ) : savedPlaces.length === 0 ? (
        <div className="empty-state">
          <Icon name="pin" size={40} />
          <h2>{t(language, "noSavedPlaces")}</h2>
          <p>{t(language, "noSavedPlacesSub")}</p>
          <Button onClick={() => go("explore")} icon="explore">
            {t(language, "exploreNearby")}
          </Button>
        </div>
      ) : (
        savedPlaces.map((pl) => (
          <Card className="saved-card" key={pl.id}>
            <div className="card-head">
              <div>
                <span className="route-letter">{pl.type.toUpperCase()}</span>
                <h2>{pl.name}</h2>
              </div>
              <ScoreRing score={pl.score} small />
            </div>
            <p className="muted">{pl.address}</p>
            <div className="route-actions">
              <Button
                onClick={() => {
                  setSelectedPlace(pl)
                  go("place")
                }}
              >
                {t(language, "open")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  go("planner")
                }}
              >
                Directions
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  confirm(
                    t(language, "deleteSavedPrompt"),
                    t(language, "deleteSavedText"),
                    () =>
                      setSavedPlaces((prev) =>
                        prev.filter((p) => p.id !== pl.id),
                      ),
                    t(language, "delete"),
                  )
                }
              >
                {t(language, "delete")}
              </Button>
            </div>
          </Card>
        ))
      )}
    </main>
  )
}

/* =========================================================================
   SCREEN 20: USER PROFILE (WITH SUPABASE CLOUD STATUS)
   ========================================================================= */

function Profile({
  language,
  go,
  preferences,
}: {
  language: Language
  go: (s: Screen) => void
  preferences: string[]
}) {
  const menuItems: [string, string, Screen, string][] = [
    [
      t(language, "accessibilitySettingsTitle"),
      `${preferences.length} preferences active`,
      "accessibilitySettings",
      "sliders",
    ],
    [
      t(language, "voiceSettingsTitle"),
      "Natural speech & speech rates",
      "voiceSettings",
      "voice",
    ],
    [t(language, "languageTitle"), language, "language", "globe"],
    [
      t(language, "savedPlacesTitle"),
      "Saved places & routes",
      "saved",
      "saved",
    ],
    [
      t(language, "reportHistoryTitle"),
      "View community reports",
      "history",
      "report",
    ],
    [
      t(language, "notificationsTitle"),
      "Real-time alerts & updates",
      "notifications",
      "bell",
    ],
    [
      t(language, "privacySecurityTitle"),
      "Permission & encryption controls",
      "privacy",
      "shield",
    ],
    [
      t(language, "academicTitle"),
      "IDEA LAB-V · 5 Subjects",
      "academic",
      "academic",
    ],
    [t(language, "helpTitle"), "Helplines, FAQs & support", "help", "help"],
  ]

  return (
    <main className="page profile-page">
      <Header title={t(language, "profileTitle")} />

      <Card className="user-card">
        <div className="large-avatar">ND</div>
        <div>
          <h2>Nidhi Dubey</h2>
          <p>nidhi.dubey@example.com · UE-1048</p>
          <StatusPill tone="mint">
            {t(language, "profileActiveStatus")}
          </StatusPill>
          <div className="cloud-badge">
            <Icon name="signal" size={14} />
            <span>Supabase Cloud Connected (.env)</span>
          </div>
        </div>
      </Card>

      <div className="profile-score">
        <ScoreRing score={94} small />
        <div>
          <b>{t(language, "profileReadiness")}</b>
          <span>{t(language, "profileStats")}</span>
        </div>
      </div>

      <div className="menu-list">
        {menuItems.map(([label, sub, scr, icon]) => (
          <button key={scr} onClick={() => go(scr)}>
            <span className="menu-icon">
              <Icon name={icon} size={18} />
            </span>
            <div>
              <b>{label}</b>
              <span>{sub}</span>
            </div>
            <Icon name="arrow" size={18} />
          </button>
        ))}
      </div>

      <Button
        className="wide analytics-link"
        variant="secondary"
        onClick={() => go("analytics")}
        icon="analytics"
      >
        {t(language, "openAnalytics")}
      </Button>

      <Button
        className="wide"
        variant="ghost"
        onClick={() => go("iot")}
        icon="iot"
      >
        {t(language, "viewIotStatus")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 21: ACCESSIBILITY SETTINGS
   ========================================================================= */

function AccessibilitySettings({
  language,
  back,
  preferences,
  toggle,
  highContrast,
  setHighContrast,
  notify,
}: {
  language: Language
  back: () => void
  preferences: string[]
  toggle: (p: string) => void
  highContrast: boolean
  setHighContrast: (b: boolean) => void
  notify: (msg: string) => void
}) {
  const [largeFont, setLargeFont] = useState(false)
  const [haptics, setHaptics] = useState(true)

  return (
    <main className="page">
      <Header title={t(language, "accessibilitySettingsTitle")} onBack={back} />

      <Card className="info-strip">
        <Icon name="sliders" size={20} />
        <span>
          Configure sensory, physical, and UI accommodations to match your exact
          mobility comfort.
        </span>
      </Card>

      <section>
        <div className="section-title">
          <h2>Display & Tactile Settings</h2>
        </div>
        <div className="setting-list">
          <div className="setting-row">
            <div>
              <b>High Contrast Theme</b>
              <span>Enhance border contrast and dark-navy surfaces</span>
            </div>
            <Toggle
              label="High contrast"
              checked={highContrast}
              onChange={() => {
                setHighContrast(!highContrast)
                notify("Display contrast updated")
              }}
            />
          </div>

          <div className="setting-row">
            <div>
              <b>Large Font Scaling</b>
              <span>Increase font sizes for improved readability</span>
            </div>
            <Toggle
              label="Large font"
              checked={largeFont}
              onChange={() => {
                setLargeFont(!largeFont)
                notify("Font scaling updated")
              }}
            />
          </div>

          <div className="setting-row">
            <div>
              <b>Vibration & Haptic Cues</b>
              <span>Simulate haptic vibrations at turn instructions</span>
            </div>
            <Toggle
              label="Haptics"
              checked={haptics}
              onChange={() => {
                setHaptics(!haptics)
                notify("Haptics updated")
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Mobility & Route Preferences</h2>
        </div>
        <div className="setting-list">
          {[
            ["Wheelchair friendly", t(language, "wheelchairFriendly")],
            ["Avoid stairs", t(language, "avoidStairs")],
            ["Low walking", t(language, "lowWalking")],
            ["Step-free transport", t(language, "stepFreeTransport")],
            ["Visual assistance", t(language, "visualAssistance")],
            ["Hearing assistance", t(language, "hearingAssistance")],
          ].map(([key, label]) => (
            <div className="setting-row" key={key}>
              <span>{label}</span>
              <Toggle
                label={label}
                checked={preferences.includes(key)}
                onChange={() => toggle(key)}
              />
            </div>
          ))}
        </div>
      </section>

      <Button className="wide sticky-action" onClick={back} icon="check">
        {t(language, "save")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 22: VOICE & SPEECH SETTINGS
   ========================================================================= */

function VoiceSettings({
  language,
  back,
  speak,
  notify,
}: {
  language: Language
  back: () => void
  speak: (s: string) => void
  notify: (msg: string) => void
}) {
  const [speechRate, setSpeechRate] = useState("1.0")
  const [pitch, setPitch] = useState("1.0")
  const [autoListen, setAutoListen] = useState(true)
  const [spokenAlerts, setSpokenAlerts] = useState(true)

  return (
    <main className="page">
      <Header title={t(language, "voiceSettingsTitle")} onBack={back} />

      <Card className="info-strip">
        <Icon name="voice" size={20} />
        <span>
          Customize how UrbanEase speaks directions and listens to your spoken
          commands.
        </span>
      </Card>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <b>Spoken Turn Guidance</b>
            <span>Read instructions automatically during navigation</span>
          </div>
          <Toggle
            label="Spoken alerts"
            checked={spokenAlerts}
            onChange={() => setSpokenAlerts(!spokenAlerts)}
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Auto-Listen After Prompt</b>
            <span>
              Start speech recognition immediately after speech finishes
            </span>
          </div>
          <Toggle
            label="Auto listen"
            checked={autoListen}
            onChange={() => setAutoListen(!autoListen)}
          />
        </div>

        <div className="slider-box">
          <div>
            <b>Speech Speed Rate: {speechRate}x</b>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.25"
            value={speechRate}
            onChange={(e) => setSpeechRate(e.target.value)}
          />
        </div>

        <div className="slider-box">
          <div>
            <b>Voice Pitch: {pitch}</b>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.25"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
          />
        </div>
      </div>

      <Button
        className="wide"
        variant="secondary"
        onClick={() => {
          speak(
            "This is a test of the UrbanEase voice speech synthesis engine.",
          )
          notify("Speaking voice test sample")
        }}
        icon="voice"
      >
        Test Speech Voice
      </Button>

      <Button className="wide sticky-action" onClick={back} icon="check">
        {t(language, "save")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 23: PRIVACY & SECURITY
   ========================================================================= */

function Privacy({
  language,
  back,
  confirm,
  notify,
  onLogout,
}: {
  language: Language
  back: () => void
  confirm: (
    title: string,
    text: string,
    action: () => void,
    label?: string,
  ) => void
  notify: (msg: string) => void
  onLogout: () => void
}) {
  const [settings, setSettings] = useState({
    location: true,
    voice: true,
    data: false,
    private: true,
  })

  const toggle = (key: keyof typeof settings, label: string) =>
    confirm(
      `Change ${label}?`,
      "This privacy setting affects how UrbanEase AI handles your personal mobility data.",
      () => {
        setSettings((s) => ({ ...s, [key]: !s[key] }))
        notify(`${label} updated`)
      },
    )

  return (
    <main className="page">
      <Header title={t(language, "privacySecurityTitle")} onBack={back} />

      <Card className="security-banner">
        <Icon name="shield" size={32} />
        <div>
          <span className="eyebrow">DEVICE PRIVACY</span>
          <h2>Your data stays protected</h2>
          <p>
            Location and voice audio are processed strictly on device wherever
            possible.
          </p>
        </div>
      </Card>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <b>Live Location Sharing</b>
            <span>Only while active navigation is running</span>
          </div>
          <Toggle
            label="Location sharing"
            checked={settings.location}
            onChange={() => toggle("location", "location sharing")}
          />
        </div>

        <div className="setting-row">
          <div>
            <b>On-Device Speech Processing</b>
            <span>
              Process spoken commands without sending audio to third parties
            </span>
          </div>
          <Toggle
            label="Voice processing"
            checked={settings.voice}
            onChange={() => toggle("voice", "voice processing")}
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Anonymous City Improvement</b>
            <span>Share anonymized barrier statistics to improve maps</span>
          </div>
          <Toggle
            label="Data sharing"
            checked={settings.data}
            onChange={() => toggle("data", "anonymous data sharing")}
          />
        </div>

        <div className="setting-row">
          <div>
            <b>Private Citizen Reporting</b>
            <span>Conceal your user ID on public city barrier maps</span>
          </div>
          <Toggle
            label="Report privacy"
            checked={settings.private}
            onChange={() => toggle("private", "report privacy")}
          />
        </div>
      </div>

      <section>
        <div className="section-title">
          <h2>Account Security</h2>
        </div>
        <div className="menu-list">
          <button
            onClick={() =>
              notify("Password reset link sent to registered email")
            }
          >
            <span className="menu-icon">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <b>Change Password</b>
              <span>Updated 32 days ago</span>
            </div>
            <Icon name="arrow" size={18} />
          </button>

          <button
            onClick={() =>
              notify("Security health check passed. Local database encrypted.")
            }
          >
            <span className="menu-icon">
              <Icon name="check" size={18} />
            </span>
            <div>
              <b>Security Audit</b>
              <span>Passed with zero vulnerabilities</span>
            </div>
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>

      <Button
        className="wide"
        variant="danger"
        onClick={() =>
          confirm(
            "Log out of UrbanEase AI?",
            "Your presentation session will end and return to the login screen.",
            onLogout,
            "Log out",
          )
        }
      >
        Log Out Securely
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 24: NOTIFICATIONS
   ========================================================================= */

function Notifications({
  language,
  back,
  notify,
}: {
  language: Language
  back: () => void
  notify: (msg: string) => void
}) {
  const [items, setItems] = useState([
    [
      "Accessibility alert",
      "Lift 2 at Bandra Railway Station is back online.",
      "Just now",
    ],
    [
      "Barrier update",
      "The Hill Road sidewalk scaffolding is under civic inspection.",
      "12 min ago",
    ],
    [
      "Route recommendation",
      "A lower slope alternate route is available for your commute.",
      "1 hr ago",
    ],
    [
      "Report resolved",
      "Obstruction report UE-2397 has been repaired by municipal team.",
      "Yesterday",
    ],
    [
      "Transit advisory",
      "Platform 3 tactile path maintenance scheduled tonight at 10 PM.",
      "Yesterday",
    ],
  ])

  return (
    <main className="page">
      <Header
        title={t(language, "notificationsTitle")}
        onBack={back}
        right={
          <Button
            variant="ghost"
            onClick={() => notify("All notifications marked as read")}
          >
            Mark read
          </Button>
        }
      />

      <div className="notification-list">
        {items.map(([title, desc, time], idx) => (
          <Card key={idx} className="notification-card">
            <span className="unread" />
            <div>
              <div className="card-head">
                <b>{title}</b>
                <span>{time}</span>
              </div>
              <p>{desc}</p>
              <div>
                <button
                  onClick={() => notify(`Notification "${title}" opened`)}
                >
                  Details
                </button>
                <button
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 25: REPORT HISTORY
   ========================================================================= */

function ReportHistory({
  language,
  back,
  reports,
}: {
  language: Language
  back: () => void
  reports: BarrierReport[]
}) {
  const [filter, setFilter] = useState("All")
  const filtered = reports.filter(
    (r) => filter === "All" || r.status === filter,
  )

  return (
    <main className="page">
      <Header title={t(language, "reportHistoryTitle")} onBack={back} />

      <div className="category-scroll">
        {["All", "Under Review", "Verified", "Resolved", "Rejected"].map(
          (s) => (
            <button
              key={s}
              className={filter === s ? "active" : ""}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ),
        )}
      </div>

      {filtered.map((r) => (
        <Card className="history-card" key={r.id}>
          <div className="card-head">
            <div>
              <span className="route-letter">{r.id}</span>
              <h3>{r.type}</h3>
            </div>
            <StatusPill
              tone={
                r.status === "Resolved"
                  ? "mint"
                  : r.status === "Rejected"
                    ? "amber"
                    : "green"
              }
            >
              {r.status}
            </StatusPill>
          </div>
          <div className="review-list">
            <div>
              <span>Location</span>
              <b>{r.location}</b>
            </div>
            <div>
              <span>Submitted</span>
              <b>{r.date}</b>
            </div>
            <div>
              <span>Severity</span>
              <b>{r.severity}</b>
            </div>
            <div>
              <span>Description</span>
              <b>{r.description}</b>
            </div>
          </div>
        </Card>
      ))}
    </main>
  )
}

/* =========================================================================
   SCREEN 26: SMART CITY ANALYTICS
   ========================================================================= */

function Analytics({
  language,
  back,
  notify,
}: {
  language: Language
  back: () => void
  notify: (msg: string) => void
}) {
  const [area, setArea] = useState("Bandra West")
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const trendData = [54, 72, 45, 88, 64, 92, 76, 58, 84, 70, 95, 82]

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <AppLogo compact language={language} />
        <div>
          <span>SMART CITY COMMAND CENTRE</span>
          <h1>{t(language, "analyticsTitle")}</h1>
        </div>
        <Button variant="secondary" onClick={back}>
          Exit
        </Button>
      </header>

      <div className="analytics-filters">
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          aria-label="Select city ward"
        >
          {mumbaiAreas.slice(0, 10).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select aria-label="Timeframe">
          <option>Last 30 days</option>
          <option>Quarterly (Q3 2026)</option>
          <option>Annual 2026</option>
        </select>
        <select aria-label="Barrier filter">
          <option>All barrier types</option>
          <option>Blocked footpaths</option>
          <option>Elevator outages</option>
          <option>Missing curb cuts</option>
        </select>
      </div>

      <div className="kpi-grid">
        {[
          ["1,284", "Total Barrier Reports", "+12% this month"],
          ["312", "Active Obstacles", "24 high priority"],
          ["972", "Resolved By Civic Teams", "76% resolution"],
          ["88.4", "Average Ward Score", "+3.2 improvement"],
        ].map(([val, label, sub], i) => (
          <Card key={i} onClick={() => notify(`${label} filtered for ${area}`)}>
            <span>{label}</span>
            <h2>{val}</h2>
            <small>{sub}</small>
          </Card>
        ))}
      </div>

      <div className="analytics-grid">
        <Card className="chart-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">
                MONTHLY BARRIER LOGS & RESOLUTIONS
              </span>
              <h2>2026 Citizen Incident Volume</h2>
            </div>
            <StatusPill tone="mint">{area}</StatusPill>
          </div>

          <div className="bar-chart">
            {trendData.map((h, i) => (
              <button
                key={i}
                style={{ height: `${h}%` }}
                className={selectedMonth === i ? "selected-bar" : ""}
                onClick={() => {
                  setSelectedMonth(i)
                  notify(`${months[i]}: ${h} reports filed in ${area}`)
                }}
                aria-label={`${months[i]}: ${h} reports`}
              />
            ))}
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-blue" /> Monthly Incident Reports
            </span>
            <span>
              <i className="legend-green" /> Resolved By City Municipalities
            </span>
          </div>
        </Card>

        <Card className="map-analytics">
          <div className="card-head">
            <div>
              <span className="eyebrow">CRITICAL HIGH-PRIORITY CORRIDOR</span>
              <h2>Hill Road Shopping Zone</h2>
            </div>
            <b>42 reports</b>
          </div>
          <InteractiveMap
            start={[18.952, 72.831]}
            end={[18.955, 72.838]}
            height="250px"
          />
        </Card>

        <Card>
          <span className="eyebrow">MOST REPORTED ACCESSIBILITY BARRIER</span>
          <h2>Blocked Footpaths & Sidewalk Obstacles</h2>
          <div className="big-stat">38%</div>
          <p>
            Heavily concentrated around commercial corridors during 5–8 PM
            evening peak hours.
          </p>
          <Button
            variant="secondary"
            onClick={() => notify("Filtered 488 sidewalk reports")}
          >
            Inspect Reports
          </Button>
        </Card>

        <Card>
          <span className="eyebrow">TRANSIT INFRASTRUCTURE ACCESSIBILITY</span>
          <h2>87% Station Readiness</h2>
          <div className="horizontal-bars">
            <div>
              <span>Station Elevators</span>
              <i>
                <b style={{ width: "91%" }} />
              </i>
              <em>91%</em>
            </div>
            <div>
              <span>Low-Floor Electric Buses</span>
              <i>
                <b style={{ width: "82%" }} />
              </i>
              <em>82%</em>
            </div>
            <div>
              <span>Audio Traffic Signals</span>
              <i>
                <b style={{ width: "76%" }} />
              </i>
              <em>76%</em>
            </div>
          </div>
        </Card>
      </div>

      <p className="data-note">
        Demonstration analytics for academic evaluation. Sensor feeds and
        telemetry are simulated based on realistic Mumbai urban mobility
        patterns.
      </p>
    </main>
  )
}

/* =========================================================================
   SCREEN 27: IOT CITY STATUS
   ========================================================================= */

function IoT({ language, back }: { language: Language back: () => void }) {
  const rows = [
    ["Traffic Flow & Crossings", "Optimal", "Ultrasonic sensor array"],
    [
      "Sidewalk Surface Integrity",
      "Good (92%)",
      "LiDAR curb inspection vehicle",
    ],
    ["Station Elevator Nodes", "18/20 Online", "Smart elevator telemetry API"],
    ["Pedestrian Audio Signals", "Active 94%", "Acoustic beacon network"],
    [
      "Low-Floor Kneeling Transit",
      "Normal (88%)",
      "GPS automated transit feed",
    ],
    ["Wheelchair Rest Bays", "100% Clear", "Civic IoT camera monitoring"],
  ]

  return (
    <main className="page">
      <Header title={t(language, "iotTitle")} onBack={back} />

      <div className="prototype-banner">
        <Icon name="signal" size={18} /> Simulated IoT Smart City Grid · Stream
        synced 2 min ago
      </div>

      <div className="iot-orb">
        <div>
          <span className="live-dot" />
          <b>Connected City Systems</b>
          <strong>87%</strong>
          <small>Physical accessibility sensors responding normally</small>
        </div>
      </div>

      <div className="iot-list">
        {rows.map(([name, status, source]) => (
          <Card key={name}>
            <div>
              <span>{name}</span>
              <b>{status}</b>
            </div>
            <StatusPill tone="mint">{source}</StatusPill>
            <div className="sparkline">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 28: GLOBAL SEARCH
   ========================================================================= */

function GlobalSearch({
  language,
  back,
  go,
}: {
  language: Language
  back: () => void
  go: (s: Screen) => void
}) {
  const [query, setQuery] = useState("")
  const items = [
    {
      title: "Bandra Railway Station",
      type: "station",
      screen: "place" as Screen,
    },
    {
      title: "Holy Family Hospital",
      type: "hospital",
      screen: "place" as Screen,
    },
    { title: "Joggers' Park", type: "park", screen: "place" as Screen },
    {
      title: "Hill Road Accessible Bus Stop",
      type: "transit",
      screen: "place" as Screen,
    },
    {
      title: "Saved Route: Home to Bandra Station",
      type: "route",
      screen: "saved" as Screen,
    },
    {
      title: "Barrier Report UE-2401 (Blocked Footpath)",
      type: "report",
      screen: "history" as Screen,
    },
    {
      title: "Academic System Mapping (IDEA LAB-V)",
      type: "academic",
      screen: "academic" as Screen,
    },
  ]

  const filtered = items.filter((it) =>
    it.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <main className="page search-page">
      <Header title="Search UrbanEase" onBack={back} />

      <label className="global-search">
        <Icon name="search" size={20} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stations, accessible parks, routes, barriers…"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
      </label>

      <div className="search-groups">
        <span className="eyebrow">
          {query ? "SEARCH RESULTS" : "SUGGESTIONS & RECENT"}
        </span>
        {filtered.map((it, i) => (
          <button key={i} onClick={() => go(it.screen)}>
            <span>
              <Icon
                name={
                  it.type === "route"
                    ? "route"
                    : it.type === "report"
                      ? "report"
                      : "pin"
                }
                size={18}
              />
            </span>
            <div>
              <b>{it.title}</b>
              <small>Accessible verification available</small>
            </div>
            <Icon name="arrow" size={18} />
          </button>
        ))}
      </div>
    </main>
  )
}

/* =========================================================================
   SCREEN 29: LANGUAGE & VOICE
   ========================================================================= */

function LanguageScreen({
  language,
  back,
  setLanguage,
}: {
  language: Language
  back: () => void
  setLanguage: (l: Language) => void
}) {
  const list: [Language, string, string][] = [
    ["English", "English (India)", "en-IN"],
    ["Hindi", "हिंदी (भारत)", "hi-IN"],
    ["Marathi", "मराठी (महाराष्ट्र)", "mr-IN"],
  ]

  return (
    <main className="page">
      <Header title={t(language, "languageTitle")} onBack={back} />
      <p className="lead">
        Select your preferred voice recognition, speech synthesis, and interface
        language.
      </p>

      <div className="option-stack">
        {list.map(([code, label, locale]) => (
          <Card
            key={code}
            className={`language-card ${language === code ? "selected" : ""}`}
            onClick={() => setLanguage(code)}
          >
            <div>
              <h2>{label}</h2>
              <p>
                {code} · Standard locale {locale}
              </p>
            </div>
            <div className="radio">
              <span />
            </div>
          </Card>
        ))}
      </div>

      <div className="info-strip">
        <Icon name="voice" size={20} />
        <span>
          Changes speech synthesis voices and Web Speech Recognition parameters
          immediately.
        </span>
      </div>

      <Button className="wide sticky-action" onClick={back} icon="check">
        {t(language, "save")}
      </Button>
    </main>
  )
}

/* =========================================================================
   SCREEN 30: HELP & SUPPORT
   ========================================================================= */

function HelpSupport({
  language,
  back,
  notify,
}: {
  language: Language
  back: () => void
  notify: (msg: string) => void
}) {
  const [ticketDetails, setTicketDetails] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    [
      "How does UrbanEase score accessible routes?",
      "Routes are evaluated on physical metrics: step-free continuity, curb slope, ramp availability, tactile paving, surface cracks, audio traffic signals, and verified elevator status.",
    ],
    [
      "How does the voice recognition work offline?",
      "The Web Speech Recognition and Synthesis APIs prioritize on-device models where supported by the browser. If speech services fail, a typed input fallback is always available.",
    ],
    [
      "How are barrier reports verified?",
      "Reported obstacles are tagged with GPS coordinates and simulated edge-AI severity scoring before community corroboration and routing recalculations.",
    ],
    [
      "Can I use UrbanEase for emergency medical transit?",
      "No. The prototype is for urban accessibility planning. For urgent medical emergencies, immediately dial national helpline 108 or 112.",
    ],
  ]

  return (
    <main className="page help-page">
      <Header title={t(language, "helpTitle")} onBack={back} />

      <Card className="support-hero">
        <div className="option-icon">
          <Icon name="voice" size={26} />
        </div>
        <div>
          <span className="eyebrow">MOBILITY SUPPORT</span>
          <h2>How can we help you?</h2>
          <p>
            Get accessible travel assistance, report inaccurate maps, or contact
            emergency services.
          </p>
        </div>
      </Card>

      <section>
        <div className="section-title">
          <h2>Official Indian Helplines</h2>
          <span className="verified">24/7 Toll Free</span>
        </div>
        <div className="helpline-list">
          <Card>
            <div>
              <b>112</b>
              <span>National All-in-One Emergency Response</span>
              <small>Police, fire, and immediate danger</small>
            </div>
            <Button onClick={() => (window.location.href = "tel:112")}>
              Call 112
            </Button>
          </Card>

          <Card>
            <div>
              <b>108</b>
              <span>Emergency Ambulance Service</span>
              <small>Medical emergency and ambulance dispatch</small>
            </div>
            <Button onClick={() => (window.location.href = "tel:108")}>
              Call 108
            </Button>
          </Card>

          <Card>
            <div>
              <b>139</b>
              <span>Indian Railways Passenger Assistance</span>
              <small>Station wheelchair and ramp assistance</small>
            </div>
            <Button onClick={() => (window.location.href = "tel:139")}>
              Call 139
            </Button>
          </Card>
        </div>
      </section>

      <div className="emergency-note">
        <Icon name="report" size={20} />
        <span>
          Do not rely solely on prototype applications during life-threatening
          emergencies. Dial official services directly.
        </span>
      </div>

      <section>
        <div className="section-title">
          <h2>Submit Accessibility Ticket</h2>
        </div>
        <Card className="support-form">
          <label>
            <span>DESCRIBE THE ISSUE</span>
            <textarea
              rows={3}
              value={ticketDetails}
              onChange={(e) => setTicketDetails(e.target.value)}
              placeholder="Detail any incorrect wheelchair ramp data, broken elevator, or navigation bug…"
            />
          </label>
          <Button
            className="wide"
            onClick={() => {
              if (!ticketDetails.trim())
                return notify("Please describe the issue first")
              setTicketDetails("")
              notify("Support ticket submitted under ID UE-T901")
            }}
          >
            Submit Support Request
          </Button>
        </Card>
      </section>

      <section>
        <div className="section-title">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], idx) => (
            <button
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div>
                <b>{q}</b>
                {openFaq === idx && <p>{a}</p>}
              </div>
              <Icon name={openFaq === idx ? "close" : "arrow"} size={18} />
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

/* =========================================================================
   SCREEN 31: ACADEMIC SYSTEM MAPPING (IDEA LAB-V)
   ========================================================================= */

function Academic({ language, back }: { language: Language back: () => void }) {
  return (
    <main className="page">
      <Header title={t(language, "academicTitle")} onBack={back} />

      <div className="hero-block">
        <span className="eyebrow">IDEA LAB-V · COMPUTER ENGINEERING</span>
        <h2>One Inclusive Architecture, Five Core Disciplines</h2>
        <p>
          UrbanEase AI demonstrates the integration of theoretical computer
          science, networking, distributed sensing, data mining, and privacy
          engineering into a live smart city accessibility solution.
        </p>
      </div>

      <div className="academic-list">
        {academicMappingData.map((item, idx) => (
          <Card key={item.subject}>
            <span className="academic-num">0{idx + 1}</span>
            <div className="option-icon">
              <Icon name={item.icon} size={22} />
            </div>
            <div>
              <span className="eyebrow">{item.code}</span>
              <h2>{item.subject}</h2>
              <b className="academic-focus">{item.relevance}</b>
              <p>{item.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="prototype-banner">
        <Icon name="shield" size={18} />
        Academic Year 2026–2027 · Semester V · Third Year Degree in Computer
        Engineering Prototype Implementation.
      </div>
    </main>
  )
}

/* =========================================================================
   MAIN APP CONTROLLER & STATE
   ========================================================================= */

// Default Coordinate landmarks in Mumbai
const DEFAULT_START_COORDS: [number, number] = [18.952, 72.831] // Bandra West (Hill Road)
const DEFAULT_DEST_COORDS: [number, number] = [18.9542, 72.8365] // Bandra Railway Station

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash")
  const [history, setHistory] = useState<Screen[]>([])
  const [slide, setSlide] = useState(0)
  const [experience, setExperience] = useState("voice")
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("ue-language") as Language
    return saved === "Hindi" || saved === "Marathi" || saved === "English"
      ? saved
      : "English"
  })

  const [preferences, setPreferences] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("ue-preferences") ||
          '["Wheelchair friendly","Avoid stairs","Step-free transport","Voice navigation","Spoken alerts"]',
      )
    } catch {
      return ["Wheelchair friendly", "Avoid stairs", "Step-free transport"]
    }
  })

  const [savedRoutes, setSavedRoutes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ue-saved-routes") || '["A"]')
    } catch {
      return ["A"]
    }
  })

  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceItem[]>(() => {
    try {
      const data = localStorage.getItem("ue-saved-places")
      return data ? JSON.parse(data) : initialPlaces.slice(0, 3)
    } catch {
      return initialPlaces.slice(0, 3)
    }
  })

  const [reports, setReports] = useState<BarrierReport[]>(() => {
    try {
      const data = localStorage.getItem("ue-reports")
      return data ? JSON.parse(data) : initialReports
    } catch {
      return initialReports
    }
  })

  // Coordinates and Real Routing State
  const [startCoords, setStartCoords] = useState<[number, number]>(
    DEFAULT_START_COORDS,
  )
  const [endCoords, setEndCoords] = useState<[number, number]>(
    DEFAULT_DEST_COORDS,
  )
  const [destination, setDestination] = useState("Bandra Railway Station")
  const [location, setLocation] = useState(
    "Bandra West, Mumbai (Demo Location)",
  )
  const [isRoutingLoading, setIsRoutingLoading] = useState(false)

  // Real OSRM routes
  const [routes, setRoutes] = useState<CalculatedRoute[]>([
    {
      id: "A",
      name: "Most Accessible Street Route",
      distanceMeters: 2100,
      durationSeconds: 1680,
      distanceFormatted: "2.1 km",
      durationFormatted: "28 min",
      geometry: [
        [18.952, 72.831],
        [18.9525, 72.8322],
        [18.9531, 72.8335],
        [18.9538, 72.8349],
        [18.9542, 72.8365],
      ],
      instructions: [
        {
          instruction: "Head east on Hill Road toward St. Andrew's Road",
          distance: "250 m",
          duration: "3 min",
          maneuver: "depart",
          streetName: "Hill Road",
          location: [18.952, 72.831],
        },
        {
          instruction:
            "Turn left onto Waterfield Road at the audio zebra crossing",
          distance: "40 m",
          duration: "1 min",
          maneuver: "turn",
          streetName: "Waterfield Road",
          location: [18.9525, 72.8322],
        },
        {
          instruction: "Continue straight along Station Road ramp",
          distance: "320 m",
          duration: "4 min",
          maneuver: "continue",
          streetName: "Station Road",
          location: [18.9531, 72.8335],
        },
        {
          instruction:
            "Arrive at Bandra Railway Station Gate 2 step-free entrance",
          distance: "110 m",
          duration: "2 min",
          maneuver: "arrive",
          streetName: "Station Gate 2",
          location: [18.9542, 72.8365],
        },
      ],
      score: 94,
      traits: [
        "Real street route",
        "Step-free ramp access",
        "Gentle slope verified",
      ],
      accessibilityNotice:
        "Road geometry calculated live from OpenStreetMap. Physical step-free and ramp suitability verified by UrbanEase AI.",
      isRealOSRM: true,
    },
  ])

  const [selectedRoute, setSelectedRoute] = useState<CalculatedRoute>(routes[0])
  const [selectedPlace, setSelectedPlace] = useState<SavedPlaceItem>(
    initialPlaces[0],
  )
  const [highContrast, setHighContrast] = useState(false)

  // Navigation states
  const [journeyPaused, setJourneyPaused] = useState(false)
  const [journeyMuted, setJourneyMuted] = useState(false)
  const [alternateRoute, setAlternateRoute] = useState(false)

  // Barrier flow states
  const [reportStage, setReportStage] =
    useState<"form" | "ai" | "review" | "success">("form")
  const [reportType, setReportType] = useState("Blocked footpath")
  const [reportSeverity, setReportSeverity] =
    useState<"Low" | "Medium" | "High">("Medium")

  // Notifications and dialogs
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<{
    title: string
    text: string
    action?: () => void
    actionLabel?: string
  } | null>(null)

  // Mandate: Every full application reload must start on the microphone entry screen
  useEffect(() => {
    setScreen("splash")
    setHistory([])
  }, [])

  // Fetch initial real route from OSRM on startup
  useEffect(() => {
    calculateRealRoutes(
      DEFAULT_START_COORDS,
      DEFAULT_DEST_COORDS,
      preferences,
    ).then((res) => {
      if (res.routes && res.routes.length > 0) {
        setRoutes(res.routes)
        setSelectedRoute(res.routes[0])
      }
    })
  }, [])

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("ue-language", language)
  }, [language])

  useEffect(() => {
    localStorage.setItem("ue-preferences", JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    localStorage.setItem("ue-saved-routes", JSON.stringify(savedRoutes))
  }, [savedRoutes])

  useEffect(() => {
    localStorage.setItem("ue-saved-places", JSON.stringify(savedPlaces))
  }, [savedPlaces])

  useEffect(() => {
    localStorage.setItem("ue-reports", JSON.stringify(reports))
  }, [reports])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    notify(t(lang, "languageTitle") + ": " + lang)
  }

  const go = (next: Screen) => {
    setHistory((h) => [...h, screen])
    setScreen(next)
    window.scrollTo(0, 0)
  }

  const back = () => {
    const prev = history[history.length - 1] || "home"
    setHistory((h) => h.slice(0, -1))
    setScreen(prev)
    window.scrollTo(0, 0)
  }

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2800)
  }

  const confirm = (
    title: string,
    text: string,
    action: () => void,
    actionLabel = "Confirm",
  ) => {
    setModal({ title, text, action, actionLabel })
  }

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref],
    )
  }

  const saveRoute = (id: string) => {
    if (!savedRoutes.includes(id)) {
      setSavedRoutes((prev) => [...prev, id])
    }
    notify(t(language, "routeSavedSuccess"))
  }

  // Browser Geolocation API
  const requestLocation = () => {
    if (!navigator.geolocation) {
      notify("Geolocation is not supported in this environment")
      return
    }
    notify("Requesting current GPS coordinates…")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ]
        setStartCoords(newCoords)
        setLocation(
          `Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)} (GPS Verified)`,
        )
        notify("Current live location updated")

        // Recalculate route with live GPS coordinates
        calculateRealRoutes(newCoords, endCoords, preferences).then((res) => {
          if (res.routes && res.routes.length > 0) {
            setRoutes(res.routes)
            setSelectedRoute(res.routes[0])
          }
        })
      },
      () => {
        notify(
          "Location permission denied. Using manual fallback location (Bandra West).",
        )
      },
      { timeout: 8000 },
    )
  }

  // Route calculation execution
  const handleCalculateRouteFromInputs = async (
    fromName: string,
    toName: string,
  ) => {
    setIsRoutingLoading(true)
    notify("Geocoding and calculating real OSRM street route…")

    let currentStart = startCoords
    let currentEnd = endCoords

    // Resolve end destination coordinates if changed
    if (toName) {
      setDestination(toName)
      const points = await geocodeDestination(toName)
      if (points.length > 0) {
        currentEnd = [points[0].lat, points[0].lon]
        setEndCoords(currentEnd)
      }
    }

    // Resolve start location if changed
    if (fromName && fromName !== location) {
      const startPoints = await geocodeDestination(fromName)
      if (startPoints.length > 0) {
        currentStart = [startPoints[0].lat, startPoints[0].lon]
        setStartCoords(currentStart)
      }
    }

    // Call real OSRM route API
    const result = await calculateRealRoutes(
      currentStart,
      currentEnd,
      preferences,
    )
    setIsRoutingLoading(false)

    if (result.routes && result.routes.length > 0) {
      setRoutes(result.routes)
      setSelectedRoute(result.routes[0])
      notify(
        `Found ${result.routes.length} real street route${
          result.routes.length > 1 ? "s" : ""
        }`,
      )
      go("results")
    } else {
      notify(
        result.error ||
          "No pedestrian route found. Please check destination name.",
      )
    }
  }

  const prepareVoiceRoute = (transcript: string) => {
    const parsed = parseVoiceCommand(transcript)
    const chosenDest = parsed.destination || "Bandra Railway Station"
    setDestination(chosenDest)

    // Trigger async route calculation
    handleCalculateRouteFromInputs(location, chosenDest)

    return { destination: chosenDest }
  }

  const handleStartVoiceRequest = (heard: string) => {
    const parsed = parseVoiceCommand(heard)
    if (parsed.intent === "report") {
      setReportType(parsed.barrier || "Blocked footpath")
      setReportStage("form")
      speakText(
        `Reporting ${parsed.barrier || "barrier"}. Opening report form.`,
        language,
        () => {
          go("report")
        },
      )
      return
    }

    const prep = prepareVoiceRoute(heard)
    speakText(
      `Calculating real accessible routes to ${prep.destination}.`,
      language,
      () => {
        go("results")
      },
    )
  }

  const addReport = (newRep: {
    type: string
    severity: "Low" | "Medium" | "High"
    location: string
    description: string
  }) => {
    const item: BarrierReport = {
      id: `UE-${2400 + reports.length + 1}`,
      type: newRep.type,
      status: "Under Review",
      date: "Today",
      severity: newRep.severity,
      location: newRep.location,
      description: newRep.description,
    }
    setReports((prev) => [item, ...prev])

    // Sync to Supabase cloud database
    syncReportToSupabase(item).then((synced) => {
      if (synced) {
        notify("Report securely synced to Supabase Cloud Database!")
      }
    })
  }

  const mainTabs: Screen[] = ["home", "explore", "report", "saved", "profile"]
  const showBottomNav = mainTabs.includes(screen)

  return (
    <div
      className={`app-shell ${
        experience === "voice" ? "voice-experience" : ""
      } ${highContrast ? "high-contrast" : ""}`}
    >
      {/* SCREEN 1: SPLASH (VOICE FIRST) */}
      {screen === "splash" && (
        <Splash
          language={language}
          setLanguage={setLanguage}
          onPrepareRoute={prepareVoiceRoute}
          onStartNavigation={() => go("journey")}
          onShowRoutes={() => go("results")}
          onSkip={() => go("intro")}
        />
      )}

      {/* SCREEN 2: INTRO */}
      {screen === "intro" && (
        <Intro
          language={language}
          onStart={() => go("onboarding")}
          onSkip={() => go("login")}
        />
      )}

      {/* SCREEN 3: ONBOARDING */}
      {screen === "onboarding" && (
        <Onboarding
          language={language}
          slide={slide}
          setSlide={setSlide}
          finish={() => go("login")}
        />
      )}

      {/* SCREEN 4: LOGIN */}
      {screen === "login" && (
        <Login
          language={language}
          setLanguage={setLanguage}
          onLogin={() => {
            localStorage.setItem("ue-auth", "true")
            go("experience")
          }}
          notify={notify}
        />
      )}

      {/* SCREEN 5: EXPERIENCE */}
      {screen === "experience" && (
        <Experience
          language={language}
          selected={experience}
          setSelected={setExperience}
          next={() => go(experience === "voice" ? "voiceSetup" : "setup")}
          back={back}
        />
      )}

      {/* SCREEN 6: SETUP */}
      {screen === "setup" && (
        <Setup
          language={language}
          preferences={preferences}
          toggle={togglePreference}
          save={() => {
            localStorage.setItem("ue-onboarded", "true")
            go("home")
            notify("Accessibility profile saved successfully")
          }}
          back={back}
        />
      )}

      {/* SCREEN 7: VOICE SETUP */}
      {screen === "voiceSetup" && (
        <VoiceSetup
          language={language}
          go={go}
          back={back}
          speak={(text) => speakText(text, language)}
        />
      )}

      {/* SCREEN 8: HOME DASHBOARD */}
      {screen === "home" && (
        <Home
          language={language}
          location={location}
          go={go}
          requestLocation={requestLocation}
          preferences={preferences}
          reportsCount={reports.length}
        />
      )}

      {/* SCREEN 9: VOICE ASSISTANT */}
      {screen === "voice" && (
        <VoiceAssistant
          language={language}
          go={go}
          back={back}
          speak={(text) => speakText(text, language)}
        />
      )}

      {/* SCREEN 10: ROUTE PLANNER */}
      {screen === "planner" && (
        <Planner
          language={language}
          go={go}
          back={back}
          preferences={preferences}
          toggle={togglePreference}
          location={location}
          onCalculateRoute={handleCalculateRouteFromInputs}
          isRoutingLoading={isRoutingLoading}
        />
      )}

      {/* SCREEN 11: ROUTE RESULTS */}
      {screen === "results" && (
        <Results
          language={language}
          go={go}
          back={back}
          routes={routes}
          selectedRoute={selectedRoute}
          saved={savedRoutes}
          saveRoute={saveRoute}
          setSelected={setSelectedRoute}
          destination={destination}
          startCoords={startCoords}
          endCoords={endCoords}
        />
      )}

      {/* SCREEN 12: ROUTE COMPARISON */}
      {screen === "compare" && (
        <Comparison
          language={language}
          go={go}
          back={back}
          routes={routes}
          selected={selectedRoute}
          setSelected={setSelectedRoute}
        />
      )}

      {/* SCREEN 13: ROUTE DETAILS */}
      {screen === "detail" && (
        <RouteDetail
          language={language}
          go={go}
          back={back}
          route={selectedRoute}
          destination={destination}
          saveRoute={saveRoute}
          notify={notify}
          startCoords={startCoords}
          endCoords={endCoords}
        />
      )}

      {/* SCREEN 14: ACTIVE JOURNEY */}
      {screen === "journey" && (
        <Journey
          language={language}
          go={go}
          route={selectedRoute}
          destination={destination}
          alternate={alternateRoute}
          setAlternate={setAlternateRoute}
          paused={journeyPaused}
          setPaused={setJourneyPaused}
          muted={journeyMuted}
          setMuted={setJourneyMuted}
          speak={(text) => speakText(text, language)}
          confirm={confirm}
          notify={notify}
          startCoords={startCoords}
          endCoords={endCoords}
        />
      )}

      {/* SCREEN 15: EXPLORE PLACES */}
      {screen === "explore" && (
        <Explore
          language={language}
          places={initialPlaces}
          go={go}
          requestLocation={requestLocation}
          setSelectedPlace={setSelectedPlace}
          startCoords={startCoords}
        />
      )}

      {/* SCREEN 16: PLACE DETAILS */}
      {screen === "place" && (
        <Place
          language={language}
          place={selectedPlace}
          go={go}
          back={back}
          notify={notify}
          speak={(text) => speakText(text, language)}
          startCoords={startCoords}
        />
      )}

      {/* SCREEN 17: REPORT FLOW */}
      {screen === "report" && (
        <ReportFlow
          language={language}
          stage={reportStage}
          setStage={setReportStage}
          type={reportType}
          setType={setReportType}
          severity={reportSeverity}
          setSeverity={setReportSeverity}
          go={go}
          addReport={addReport}
          back={back}
        />
      )}

      {/* SCREEN 18 & 19: SAVED */}
      {screen === "saved" && (
        <Saved
          language={language}
          savedRoutes={savedRoutes}
          setSavedRoutes={setSavedRoutes}
          savedPlaces={savedPlaces}
          setSavedPlaces={setSavedPlaces}
          routes={routes}
          go={go}
          setSelectedRoute={setSelectedRoute}
          setSelectedPlace={setSelectedPlace}
          confirm={confirm}
        />
      )}

      {/* SCREEN 20: USER PROFILE */}
      {screen === "profile" && (
        <Profile language={language} go={go} preferences={preferences} />
      )}

      {/* SCREEN 21: ACCESSIBILITY SETTINGS */}
      {screen === "accessibilitySettings" && (
        <AccessibilitySettings
          language={language}
          back={back}
          preferences={preferences}
          toggle={togglePreference}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          notify={notify}
        />
      )}

      {/* SCREEN 22: VOICE SETTINGS */}
      {screen === "voiceSettings" && (
        <VoiceSettings
          language={language}
          back={back}
          speak={(text) => speakText(text, language)}
          notify={notify}
        />
      )}

      {/* SCREEN 23: PRIVACY & SECURITY */}
      {screen === "privacy" && (
        <Privacy
          language={language}
          back={back}
          confirm={confirm}
          notify={notify}
          onLogout={() => {
            localStorage.removeItem("ue-auth")
            setHistory([])
            setScreen("login")
          }}
        />
      )}

      {/* SCREEN 24: NOTIFICATIONS */}
      {screen === "notifications" && (
        <Notifications language={language} back={back} notify={notify} />
      )}

      {/* SCREEN 25: REPORT HISTORY */}
      {screen === "history" && (
        <ReportHistory language={language} back={back} reports={reports} />
      )}

      {/* SCREEN 26: ANALYTICS */}
      {screen === "analytics" && (
        <Analytics language={language} back={back} notify={notify} />
      )}

      {/* SCREEN 27: IOT STATUS */}
      {screen === "iot" && <IoT language={language} back={back} />}

      {/* SCREEN 28: GLOBAL SEARCH */}
      {screen === "search" && (
        <GlobalSearch language={language} back={back} go={go} />
      )}

      {/* SCREEN 29: LANGUAGE */}
      {screen === "language" && (
        <LanguageScreen
          language={language}
          back={back}
          setLanguage={setLanguage}
        />
      )}

      {/* SCREEN 30: HELP & SUPPORT */}
      {screen === "help" && (
        <HelpSupport language={language} back={back} notify={notify} />
      )}

      {/* SCREEN 31: ACADEMIC SYSTEM MAPPING */}
      {screen === "academic" && <Academic language={language} back={back} />}

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav
          screen={screen}
          go={go}
          onVoiceRequest={handleStartVoiceRequest}
          language={language}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Confirmation Modal Dialog */}
      {modal && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-icon">
              <Icon name="shield" size={26} />
            </div>
            <h2 id="modal-title">{modal.title}</h2>
            <p>{modal.text}</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setModal(null)}>
                {t(language, "cancel")}
              </Button>
              <Button
                variant={
                  modal.actionLabel === "Delete" ||
                  modal.actionLabel === "Log out"
                    ? "danger"
                    : "primary"
                }
                onClick={() => {
                  modal.action?.()
                  setModal(null)
                }}
              >
                {modal.actionLabel || t(language, "confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
