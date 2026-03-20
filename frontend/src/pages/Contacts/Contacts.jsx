import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { contactsAPI } from "../../utils/api.js";
import "./Contacts.css";

const CONNECTION_SOURCES = [
  "Cold email",
  "Referral",
  "Career fair",
  "LinkedIn",
  "Professor intro",
  "Alumni network",
  "Other",
];

/* ---- Modal ---- */
function ContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState({
    name: contact?.name || "",
    company: contact?.company || "",
    role: contact?.role || "",
    linkedinUrl: contact?.linkedinUrl || "",
    connectionSource: contact?.connectionSource || "",
    notes: contact?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact ? "Edit contact" : "New contact"}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="company">Company *</label>
              <input
                id="company"
                name="company"
                type="text"
                className="form-input"
                value={form.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="role">Role</label>
              <input
                id="role"
                name="role"
                type="text"
                className="form-input"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Recruiter, Hiring Manager"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="connectionSource">How connected</label>
              <select
                id="connectionSource"
                name="connectionSource"
                className="form-select"
                value={form.connectionSource}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {CONNECTION_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="linkedinUrl">LinkedIn URL</label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              className="form-input"
              value={form.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={form.notes}
              onChange={handleChange}
              placeholder="Conversation history, key details..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : contact ? "Update" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ContactModal.propTypes = {
  contact: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    company: PropTypes.string,
    role: PropTypes.string,
    linkedinUrl: PropTypes.string,
    connectionSource: PropTypes.string,
    notes: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ContactModal.defaultProps = {
  contact: null,
};

/* ---- Main Page ---- */
function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      const data = await contactsAPI.getAll();
      setContacts(data);
    } catch (err) {
      console.error("Fetch contacts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSave = async (formData) => {
    if (editing) {
      await contactsAPI.update(editing._id, formData);
    } else {
      await contactsAPI.create(formData);
    }
    setModalOpen(false);
    setEditing(null);
    await fetchContacts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    await contactsAPI.delete(id);
    await fetchContacts();
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const filtered = contacts.filter(
    (c) =>
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Contacts</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Add contact
        </button>
      </div>

      {contacts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <circle cx="24" cy="16" r="7" />
              <path d="M12 40v-3a8 8 0 018-8h8a8 8 0 018 8v3" />
            </svg>
            <h3>No contacts yet</h3>
            <p>Track recruiters, referrals, and hiring managers</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add first contact
            </button>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((c) => (
            <div key={c._id} className="card contact-card">
              <div className="contact-card-header">
                <div className="contact-avatar">{getInitials(c.name)}</div>
                <div className="contact-info">
                  <h3 className="contact-name">{c.name}</h3>
                  <p className="contact-company">
                    {c.role ? `${c.role} at ` : ""}
                    {c.company}
                  </p>
                </div>
                <div className="action-btns">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditing(c);
                      setModalOpen(true);
                    }}
                    title="Edit"
                    aria-label="Edit contact"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8.5 2.5l3 3L4.5 12.5H1.5v-3z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(c._id)}
                    title="Delete"
                    aria-label="Delete contact"
                    style={{ color: "var(--danger)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="2,4 12,4" />
                      <path d="M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4" />
                      <path d="M3 4l.75 8.5a1 1 0 001 .5h4.5a1 1 0 001-.5L11 4" />
                    </svg>
                  </button>
                </div>
              </div>

              {c.connectionSource && (
                <span className="contact-source">{c.connectionSource}</span>
              )}

              {c.linkedinUrl && (
                <a
                  href={c.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-linkedin"
                >
                  LinkedIn profile
                </a>
              )}

              {c.notes && <p className="contact-notes">{c.notes}</p>}

              <div className="contact-meta">
                Last contact: {formatDate(c.lastContactDate)}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ContactModal
          contact={editing}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export default Contacts;
