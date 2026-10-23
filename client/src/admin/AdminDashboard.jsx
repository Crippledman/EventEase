
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Ticket,
  Plus,
  LogOut,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  X,
  Eye,
  RefreshCw
} from "lucide-react";
import "./Admin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  capacity: "50"
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendeeEvent, setAttendeeEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);

  const token = localStorage.getItem("eventease_admin_token");
  const admin = JSON.parse(
    localStorage.getItem("eventease_admin") || "null"
  );

  const apiRequest = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem("eventease_admin_token");
      localStorage.removeItem("eventease_admin");
      navigate("/admin/login", { replace: true });
      throw new Error("Your session expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }, [token, navigate]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load events");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadEvents();
  }, [token, navigate, loadEvents]);

  const logout = () => {
    localStorage.removeItem("eventease_admin_token");
    localStorage.removeItem("eventease_admin");
    navigate("/admin/login", { replace: true });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNotice("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      capacity: String(event.capacity)
    });
    setNotice("");
    setError("");
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      capacity: Number(form.capacity)
    };

    try {
      await apiRequest(
        editingId ? `/events/${editingId}` : "/events",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setNotice(editingId ? "Event updated successfully." : "Event created successfully.");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/events/${event._id}`, {
        method: "DELETE"
      });

      setNotice("Event deleted successfully.");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewAttendees = async (event) => {
    setAttendeeEvent(event);
    setAttendees([]);
    setAttendeeLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/registrations/${event._id}`);
      setAttendees(data.attendees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const totalRegistrations = events.reduce(
    (sum, event) => sum + (event.registeredCount || 0),
    0
  );

  const totalCapacity = events.reduce(
    (sum, event) => sum + (event.capacity || 0),
    0
  );

  const availableSeats = Math.max(0, totalCapacity - totalRegistrations);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">EventEase<span>.</span></div>
        <p className="admin-sidebar-label">WORKSPACE</p>

        <button
          className="admin-nav-item active"
          onClick={() => {
            setAttendeeEvent(null);
            setShowForm(false);
          }}
        >
          <CalendarDays size={18} />
          Events overview
        </button>

        <button
          className="admin-nav-item"
          onClick={() => navigate("/")}
        >
          <Eye size={18} />
          Public website
        </button>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <div className="admin-avatar">
              {(admin?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <strong>Administrator</strong>
              <span>{admin?.email || "Admin account"}</span>
            </div>
          </div>

          <button className="admin-logout" onClick={logout}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">EVENT MANAGEMENT</p>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">
              Manage your events and keep track of registrations.
            </p>
          </div>

          <button className="admin-primary-button" onClick={openCreateForm}>
            <Plus size={18} /> Create event
          </button>
        </header>

        {error && <div className="admin-alert error">{error}</div>}
        {notice && <div className="admin-alert success">{notice}</div>}

        <section className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon purple"><CalendarDays /></div>
            <span>Total events</span>
            <strong>{events.length}</strong>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon coral"><Users /></div>
            <span>Total registrations</span>
            <strong>{totalRegistrations}</strong>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon blue"><Ticket /></div>
            <span>Available seats</span>
            <strong>{availableSeats}</strong>
          </div>
        </section>

        {showForm && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>{editingId ? "Edit event" : "Create an event"}</h2>
                <p>Enter the details below.</p>
              </div>
              <button
                className="admin-icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <form className="admin-event-form" onSubmit={handleSaveEvent}>
              <label>
                Event title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  maxLength={120}
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  rows={3}
                />
              </label>

              <div className="admin-form-grid">
                <label>
                  Date and time
                  <input
                    name="date"
                    type="datetime-local"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label>
                  Seat capacity
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.capacity}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
                </button>
              </div>
            </form>
          </section>
        )}

        {attendeeEvent && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Attendees: {attendeeEvent.title}</h2>
                <p>Registered participants for this event.</p>
              </div>
              <button
                className="admin-icon-button"
                onClick={() => setAttendeeEvent(null)}
                aria-label="Close attendees"
              >
                <X size={19} />
              </button>
            </div>

            {attendeeLoading ? (
              <p className="admin-empty">Loading attendees...</p>
            ) : attendees.length === 0 ? (
              <p className="admin-empty">No attendees found for this event.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((attendee) => (
                      <tr key={attendee._id}>
                        <td>{attendee.name}</td>
                        <td>{attendee.email}</td>
                        <td>
                          {attendee.createdAt
                            ? new Date(attendee.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Your events</h2>
              <p>Review capacity, registrations, and event details.</p>
            </div>
            <button
              className="admin-icon-button"
              onClick={loadEvents}
              title="Refresh events"
              aria-label="Refresh events"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {loading ? (
            <p className="admin-empty">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="admin-empty">
              <CalendarDays size={30} />
              <p>No events yet. Create your first event above.</p>
            </div>
          ) : (
            <div className="admin-event-list">
              {events.map((event) => {
                const registered = event.registeredCount || 0;
                const capacity = event.capacity || 0;
                const percent = capacity
                  ? Math.min(100, (registered / capacity) * 100)
                  : 0;

                return (
                  <article className="admin-event-row" key={event._id}>
                    <div className="admin-event-date">
                      <span>
                        {new Date(event.date).toLocaleDateString("en", {
                          month: "short"
                        })}
                      </span>
                      <strong>
                        {new Date(event.date).getDate()}
                      </strong>
                    </div>

                    <div className="admin-event-info">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      <div className="admin-event-meta">
                        <span><MapPin size={14} /> {event.location}</span>
                        <span>
                          <Clock size={14} />
                          {new Date(event.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <div className="admin-capacity">
                        <div className="admin-capacity-label">
                          <span>{registered} registered</span>
                          <span>{Math.max(0, capacity - registered)} seats left</span>
                        </div>
                        <div className="admin-progress">
                          <div style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="admin-event-actions">
                      <button
                        className="admin-secondary-button"
                        onClick={() => viewAttendees(event)}
                      >
                        <Users size={15} /> Attendees
                      </button>
                      <button
                        className="admin-icon-button"
                        onClick={() => openEditForm(event)}
                        title="Edit event"
                        aria-label={`Edit ${event.title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="admin-icon-button danger"
                        onClick={() => handleDeleteEvent(event)}
                        title="Delete event"
                        aria-label={`Delete ${event.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
