
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Code2,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
  Zap,
  BrainCircuit,
  Palette,
  Rocket,
  LoaderCircle
} from "lucide-react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const themes = [
  { className: "coral", icon: Code2, label: "BUILD SOMETHING" },
  { className: "blue", icon: BrainCircuit, label: "THINK DIFFERENT" },
  { className: "purple", icon: Palette, label: "GET CREATIVE" },
  { className: "green", icon: Rocket, label: "MAKE IT HAPPEN" }
];

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  async function loadEvents() {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Couldn't load workshops");
      }

      setEvents(data.events || []);
    } catch (error) {
      setPageError(
        "We couldn't reach the workshops right now. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) =>
      [
        event.title,
        event.description,
        event.location
      ].some((value) => value?.toLowerCase().includes(term))
    );
  }, [events, search]);

  function openRegistration(event) {
    setSelectedEvent(event);
    setForm({ name: "", email: "" });
    setFormError("");
    setSuccess(false);
  }

  function closeRegistration() {
    if (submitting) return;
    setSelectedEvent(null);
    setSuccess(false);
    setFormError("");
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(
        `${API_URL}/registrations/${selectedEvent._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
      await loadEvents();
    } catch (error) {
      setFormError(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="EventEase home">
          <span className="brand-mark">
            <CalendarDays size={21} strokeWidth={2.5} />
          </span>
          <span>event<span className="brand-light">ease</span><i>.</i></span>
        </a>

        <nav className="nav-links">
          <a className="nav-active" href="#explore">Explore</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <a className="nav-cta" href="#explore">
          Find an event <ArrowUpRight size={16} />
        </a>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />

          <div className="hero-content">
            <div className="eyebrow hero-eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT BIG IDEA STARTS HERE
            </div>

            <h1>
              Find your
              <br />
              next <span className="hero-highlight">thing.</span>
            </h1>

            <p className="hero-description">
              Good people. Interesting ideas. Skills worth learning.
              Find a workshop that gets you out of your comfort zone.
            </p>

            <a className="hero-button" href="#explore">
              Explore workshops <ArrowDownRight size={18} />
            </a>

            <div className="hero-proof">
              <div className="proof-icon"><Users size={17} /></div>
              <span>Small rooms. Big ideas. Real skills.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Workshop highlights">
            <div className="floating-note note-top">
              <Sparkles size={15} />
              <span>Learn by doing</span>
            </div>

            <div className="art-card art-card-back">
              <div className="art-decoration"><BrainCircuit size={66} /></div>
              <span className="art-label">IDEAS IN MOTION</span>
              <div className="art-back-lines">
                <span /><span /><span />
              </div>
            </div>

            <div className="art-card art-card-front">
              <div className="art-card-top">
                <span className="art-chip">THE CREATIVE CLUB</span>
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="art-big-type">MAKE<br />SOME<br /><span>NOISE.</span></div>
              <div className="art-card-bottom">
                <span>LEARN SOMETHING NEW</span>
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="floating-note note-bottom">
              <span className="live-dot" />
              <span>Ideas welcome here</span>
            </div>
          </div>

          <div className="hero-bottom">
            <span>SCROLL TO DISCOVER</span>
            <div className="scroll-line" />
            <span>01 / EXPLORE</span>
          </div>
        </section>

        <section className="explore-section" id="explore">
          <div className="section-topline">
            <span className="section-kicker">THE GOOD STUFF</span>
            <span className="section-count">
              {events.length.toString().padStart(2, "0")} WORKSHOPS
            </span>
          </div>

          <div className="section-heading-row">
            <div>
              <h2>Find your <span>people.</span></h2>
              <p className="section-description">
                Less scrolling. More doing. Pick something that sparks your curiosity.
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find your next thing..."
                aria-label="Search workshops"
              />
              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="status-panel">
              <LoaderCircle className="spin" size={28} />
              <p>Finding the good stuff...</p>
            </div>
          ) : pageError ? (
            <div className="status-panel error-panel">
              <p>{pageError}</p>
              <button className="outline-button" onClick={loadEvents}>
                Try again <ArrowRight size={16} />
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="status-panel">
              <Compass size={32} />
              <h3>{search ? "No matches this time." : "The stage is being set."}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "No workshops have been published yet. Check back soon."}
              </p>
            </div>
          ) : (
            <div className="event-grid">
              {filteredEvents.map((event, index) => {
                const theme = themes[index % themes.length];
                const Icon = theme.icon;
                const capacity = Number(event.capacity) || 0;
                const registered = Number(event.registeredCount) || 0;
                const available = Math.max(0, capacity - registered);
                const full = available === 0;

                return (
                  <article className="event-card" key={event._id}>
                    <div className={`event-visual ${theme.className}`}>
                      <div className="event-visual-top">
                        <span className="visual-category">
                          {theme.label}
                        </span>
                        <span className="visual-number">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      </div>

                      <Icon className="event-illustration" size={78} strokeWidth={1.2} />

                      <div className="visual-bottom">
                        <span>EVENTEASE / WORKSHOPS</span>
                        <ArrowUpRight size={19} />
                      </div>
                    </div>

                    <div className="event-content">
                      <div className="event-date">
                        <CalendarDays size={15} />
                        {formatDate(event.date)}
                      </div>

                      <h3>{event.title}</h3>

                      <p className="event-description">
                        {event.description}
                      </p>

                      <div className="event-meta">
                        <span><MapPin size={15} />{event.location}</span>
                        <span><Clock3 size={15} />Workshop</span>
                      </div>

                      <div className="seat-row">
                        <div className="seat-info">
                          <span className="seat-dot" />
                          {full ? "Fully booked" : `${available} seats left`}
                        </div>
                        <span>{registered}/{capacity} joined</span>
                      </div>

                      <div className="seat-track">
                        <div
                          className="seat-fill"
                          style={{
                            width: `${capacity > 0 ? Math.min(100, (registered / capacity) * 100) : 0}%`
                          }}
                        />
                      </div>

                      <button
                        className={`event-button ${full ? "event-button-disabled" : ""}`}
                        onClick={() => !full && openRegistration(event)}
                        disabled={full}
                      >
                        {full ? "Fully booked" : "Save my seat"}
                        {!full && <ArrowUpRight size={17} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="manifesto" id="how-it-works">
          <div className="manifesto-symbol"><Sparkles size={27} /></div>
          <div className="manifesto-copy">
            <span className="section-kicker">A LITTLE REMINDER</span>
            <h2>
              You don't have to
              <br />
              <span>know it all.</span> Just show up.
            </h2>
            <p>
              Come curious. Leave with a new skill, a new connection,
              or at least a good story.
            </p>
          </div>
          <a href="#explore" className="manifesto-link">
            Find your next workshop <ArrowUpRight size={18} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark"><CalendarDays size={18} /></span>
          <span>event<span className="brand-light">ease</span><i>.</i></span>
        </a>
        <span>MADE FOR THE CURIOUS.</span>
        <a href="#home" className="back-top">Back to top ↑</a>
      </footer>

      {selectedEvent && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeRegistration();
          }}
        >
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <button
              className="modal-close"
              onClick={closeRegistration}
              disabled={submitting}
              aria-label="Close registration"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="success-state">
                <div className="success-icon"><Check size={34} /></div>
                <span className="section-kicker">YOU'RE ON THE LIST</span>
                <h2>Seat <span>saved.</span></h2>
                <p>
                  You're registered for {selectedEvent.title}.
                  Keep an eye on your inbox for event updates.
                </p>
                <button
                  className="hero-button modal-submit"
                  onClick={closeRegistration}
                >
                  Back to workshops <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <span className="section-kicker">MAKE IT HAPPEN</span>
                <h2 id="registration-title">Save your <span>seat.</span></h2>
                <p className="modal-event-name">{selectedEvent.title}</p>
                <p className="modal-date">
                  <CalendarDays size={15} />
                  {formatDate(selectedEvent.date)}
                  <span>·</span>
                  <MapPin size={15} />
                  {selectedEvent.location}
                </p>

                <form className="registration-form" onSubmit={handleRegister}>
                  <label htmlFor="participant-name">Your name</label>
                  <input
                    id="participant-name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    required
                    placeholder="What should we call you?"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <label htmlFor="participant-email">Email address</label>
                  <input
                    id="participant-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />

                  {formError && (
                    <div className="form-error" role="alert">{formError}</div>
                  )}

                  <button
                    className="hero-button modal-submit"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>Saving your seat <LoaderCircle className="spin" size={17} /></>
                    ) : (
                      <>Confirm registration <ArrowRight size={17} /></>
                    )}
                  </button>
                  <p className="privacy-note">
                    Your details are used to manage your workshop registration.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
