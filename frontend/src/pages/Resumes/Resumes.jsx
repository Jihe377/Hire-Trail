import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { resumesAPI } from "../../utils/api.js";
import "./Resumes.css";

/* ---- Modal ---- */
function ResumeModal({ resume, onSave, onClose }) {
  const [form, setForm] = useState({
    name: resume?.name || "",
    targetRole: resume?.targetRole || "",
    fileName: resume?.fileName || "",
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
          <h2>{resume ? "Edit resume" : "New resume version"}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Version name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. SWE Resume v2"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetRole">Target role type</label>
            <input
              id="targetRole"
              name="targetRole"
              type="text"
              className="form-input"
              value={form.targetRole}
              onChange={handleChange}
              placeholder="e.g. Software Engineering, Data Science"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileName">File name</label>
            <input
              id="fileName"
              name="fileName"
              type="text"
              className="form-input"
              value={form.fileName}
              onChange={handleChange}
              placeholder="e.g. resume_swe_v2.pdf"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : resume ? "Update" : "Add resume"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ResumeModal.propTypes = {
  resume: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    targetRole: PropTypes.string,
    fileName: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ResumeModal.defaultProps = {
  resume: null,
};

/* ---- Main Page ---- */
function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchResumes = useCallback(async () => {
    try {
      const data = await resumesAPI.getAll();
      setResumes(data);
    } catch (err) {
      console.error("Fetch resumes error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleSave = async (formData) => {
    if (editing) {
      await resumesAPI.update(editing._id, formData);
    } else {
      await resumesAPI.create(formData);
    }
    setModalOpen(false);
    setEditing(null);
    await fetchResumes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume version?")) return;
    await resumesAPI.delete(id);
    await fetchResumes();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Resumes</h1>
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
          Add resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M28 6H14a4 4 0 00-4 4v28a4 4 0 004 4h20a4 4 0 004-4V16l-10-10z" />
              <polyline points="28,6 28,16 38,16" />
            </svg>
            <h3>No resume versions yet</h3>
            <p>Add your resume versions to track which performs best</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add first resume
            </button>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {resumes.map((r) => (
            <div key={r._id} className="card resume-card">
              <div className="resume-card-header">
                <div className="resume-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z" />
                    <polyline points="12,2 12,7 17,7" />
                  </svg>
                </div>
                <div className="action-btns">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setEditing(r);
                      setModalOpen(true);
                    }}
                    title="Edit"
                    aria-label="Edit resume"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8.5 2.5l3 3L4.5 12.5H1.5v-3z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(r._id)}
                    title="Delete"
                    aria-label="Delete resume"
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
              <h3 className="resume-name">{r.name}</h3>
              {r.targetRole && (
                <span className="resume-role">{r.targetRole}</span>
              )}
              {r.fileName && (
                <span className="resume-file">{r.fileName}</span>
              )}
              <div className="resume-meta">
                <span>Added {formatDate(r.uploadDate)}</span>
                <span className="resume-usage">
                  {r.applicationCount} app{r.applicationCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ResumeModal
          resume={editing}
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

export default Resumes;
