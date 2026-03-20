import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  analyticsAPI,
  applicationsAPI,
  deadlinesAPI,
  resumesAPI,
} from "../../utils/api.js";
import "./Dashboard.css";

const STAGE_ORDER = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const FUNNEL_STAGES = ["Applied", "OA", "Interview", "Offer"];
const STAGE_COLORS = {
  Applied: "#378ADD",
  OA: "#EF9F27",
  Interview: "#534AB7",
  Offer: "#1D9E75",
  Rejected: "#E24B4A",
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, appsData, deadlinesData, resumesData] =
          await Promise.all([
            analyticsAPI.get(),
            applicationsAPI.getAll(),
            deadlinesAPI.getAll(),
            resumesAPI.getAll(),
          ]);

        setStats(analyticsData);
        setRecentApps(appsData.slice(0, 5));
        setResumes(resumesData);

        const now = new Date();
        const upcoming = deadlinesData
          .filter((d) => !d.completed && new Date(d.dueDate) >= now)
          .slice(0, 5);
        setUpcomingDeadlines(upcoming);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getBadgeClass = (stage) => {
    const map = {
      Applied: "badge-applied",
      OA: "badge-oa",
      Interview: "badge-interview",
      Offer: "badge-offer",
      Rejected: "badge-rejected",
    };
    return map[stage] || "badge-applied";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const daysUntil = (dateStr) => {
    const diff = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const funnel = stats?.funnel || {};
  const total = stats?.total || 0;
  const resumePerformance = stats?.resumePerformance || [];
  const weeklyTrend = stats?.weeklyTrend || [];

  // Analytics derived data
  const funnelData = FUNNEL_STAGES.map((s) => ({
    stage: s,
    count: funnel[s] || 0,
  }));

  const conversionData = [];
  for (let i = 1; i < FUNNEL_STAGES.length; i++) {
    const prev = funnel[FUNNEL_STAGES[i - 1]] || 0;
    const curr = funnel[FUNNEL_STAGES[i]] || 0;
    const rate = prev > 0 ? Math.round((curr / prev) * 100) : 0;
    conversionData.push({
      from: FUNNEL_STAGES[i - 1],
      to: FUNNEL_STAGES[i],
      rate,
      count: curr,
      prevCount: prev,
    });
  }

  const resumeData = resumePerformance.map((rp) => {
    const resume = resumes.find((r) => r._id === rp._id);
    const rate =
      rp.total > 0 ? Math.round((rp.responses / rp.total) * 100) : 0;
    return {
      name: resume ? resume.name : "Unknown",
      total: rp.total,
      responses: rp.responses,
      rate,
    };
  });

  const trendData = weeklyTrend.map((w) => ({
    week: new Date(w.firstDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: w.count,
  }));

  const activeTotal = total - (funnel.Rejected || 0);

  return (
    <div>
      {/* ==============================
          DASHBOARD SECTION
          ============================== */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/applications" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          New application
        </Link>
      </div>

      {/* Stats row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Total applications</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In progress</div>
          <div className="stat-value">
            {(funnel.OA || 0) + (funnel.Interview || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Offers</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {funnel.Offer || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rejected</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>
            {funnel.Rejected || 0}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent applications */}
        <div className="card">
          <div className="card-section-header">
            <h2>Recent applications</h2>
            <Link to="/applications" className="card-section-link">
              View all
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="empty-state">
              <h3>No applications yet</h3>
              <p>Start tracking your job search</p>
              <Link to="/applications" className="btn btn-primary btn-sm">
                Add your first application
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Stage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 500 }}>{app.company}</td>
                      <td>{app.role}</td>
                      <td>
                        <span className={`badge ${getBadgeClass(app.stage)}`}>
                          {app.stage}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {formatDate(app.applicationDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="card">
          <div className="card-section-header">
            <h2>Upcoming deadlines</h2>
            <Link to="/deadlines" className="card-section-link">
              View all
            </Link>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="empty-state">
              <h3>No upcoming deadlines</h3>
              <p>You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="deadline-list">
              {upcomingDeadlines.map((d) => (
                <div key={d._id} className="deadline-item">
                  <div className="deadline-info">
                    <span className="deadline-type">{d.type}</span>
                    {d.notes && (
                      <span className="deadline-notes">{d.notes}</span>
                    )}
                  </div>
                  <span className="deadline-due">{daysUntil(d.dueDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==============================
          ANALYTICS SECTION
          ============================== */}
      {total > 0 && (
        <>
          <div className="section-divider">
            <h1>Analytics</h1>
            <Link to="/analytics" className="card-section-link">
              Full analytics
            </Link>
          </div>

          {/* Analytics stat row */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Response rate</div>
              <div className="stat-value">
                {activeTotal > 0
                  ? Math.round(
                      (((funnel.OA || 0) +
                        (funnel.Interview || 0) +
                        (funnel.Offer || 0)) /
                        activeTotal) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Offer rate</div>
              <div className="stat-value" style={{ color: "var(--success)" }}>
                {total > 0
                  ? Math.round(((funnel.Offer || 0) / total) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rejection rate</div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>
                {total > 0
                  ? Math.round(((funnel.Rejected || 0) / total) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resume versions</div>
              <div className="stat-value">{resumes.length}</div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Funnel */}
            <div className="card">
              <h2 className="analytics-section-title">Application funnel</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={funnelData} barSize={40}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e5ea"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 13, fill: "#5a6170" }}
                      axisLine={{ stroke: "#e2e5ea" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#8c919e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e5ea",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {funnelData.map((entry) => (
                        <Cell
                          key={entry.stage}
                          fill={STAGE_COLORS[entry.stage] || "#378ADD"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conversion rates */}
            <div className="card">
              <h2 className="analytics-section-title">
                Stage conversion rates
              </h2>
              <div className="conversion-list">
                {conversionData.map((c) => (
                  <div key={c.to} className="conversion-item">
                    <div className="conversion-label">
                      {c.from} → {c.to}
                    </div>
                    <div className="conversion-bar-track">
                      <div
                        className="conversion-bar-fill"
                        style={{ width: `${Math.min(c.rate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="conversion-stats">
                      <span className="conversion-rate">{c.rate}%</span>
                      <span className="conversion-counts">
                        {c.count}/{c.prevCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly trend */}
            {trendData.length > 1 && (
              <div className="card">
                <h2 className="analytics-section-title">
                  Applications over time
                </h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e5ea"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 12, fill: "#8c919e" }}
                        axisLine={{ stroke: "#e2e5ea" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#8c919e" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e5ea",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#378ADD"
                        strokeWidth={2}
                        dot={{ fill: "#378ADD", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Resume performance */}
            {resumeData.length > 0 && (
              <div className="card">
                <h2 className="analytics-section-title">
                  Resume performance
                </h2>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Resume version</th>
                        <th>Apps</th>
                        <th>Responses</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumeData.map((r) => (
                        <tr key={r.name}>
                          <td style={{ fontWeight: 500 }}>{r.name}</td>
                          <td>{r.total}</td>
                          <td>{r.responses}</td>
                          <td>
                            <div className="resume-rate">
                              <div className="resume-rate-bar-track">
                                <div
                                  className="resume-rate-bar-fill"
                                  style={{
                                    width: `${Math.min(r.rate, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="resume-rate-value">
                                {r.rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;