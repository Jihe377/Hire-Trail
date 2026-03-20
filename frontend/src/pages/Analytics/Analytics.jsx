import { useState, useEffect } from "react";
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
import { analyticsAPI, resumesAPI } from "../../utils/api.js";
import "./Analytics.css";

const STAGE_ORDER = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const STAGE_COLORS = {
  Applied: "#378ADD",
  OA: "#EF9F27",
  Interview: "#534AB7",
  Offer: "#1D9E75",
  Rejected: "#E24B4A",
};

function Analytics() {
  const [data, setData] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsData, resumesData] = await Promise.all([
          analyticsAPI.get(),
          resumesAPI.getAll(),
        ]);
        setData(analyticsData);
        setResumes(resumesData);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!data || data.total === 0) {
    return (
      <div>
        <div className="page-header">
          <h1>Analytics</h1>
        </div>
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <line x1="12" y1="38" x2="12" y2="22" />
              <line x1="24" y1="38" x2="24" y2="10" />
              <line x1="36" y1="38" x2="36" y2="18" />
            </svg>
            <h3>No data to analyze yet</h3>
            <p>Add some applications to see your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const { funnel, total, resumePerformance, weeklyTrend } = data;

  // Funnel chart data
  const funnelData = STAGE_ORDER.filter((s) => s !== "Rejected").map((s) => ({
    stage: s,
    count: funnel[s] || 0,
  }));

  // Conversion rates
  const activeTotal = total - (funnel.Rejected || 0);
  const conversionData = [];
  const funnelStages = ["Applied", "OA", "Interview", "Offer"];
  for (let i = 1; i < funnelStages.length; i++) {
    const prev = funnel[funnelStages[i - 1]] || 0;
    const curr = funnel[funnelStages[i]] || 0;
    const rate = prev > 0 ? Math.round((curr / prev) * 100) : 0;
    conversionData.push({
      from: funnelStages[i - 1],
      to: funnelStages[i],
      rate,
      count: curr,
      prevCount: prev,
    });
  }

  // Resume performance — enriched with names
  const resumeData = resumePerformance.map((rp) => {
    const resume = resumes.find((r) => r._id === rp._id);
    const rate = rp.total > 0 ? Math.round((rp.responses / rp.total) * 100) : 0;
    return {
      name: resume ? resume.name : "Unknown",
      total: rp.total,
      responses: rp.responses,
      rate,
    };
  });

  // Weekly trend — format for chart
  const trendData = weeklyTrend.map((w) => ({
    week: new Date(w.firstDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: w.count,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      {/* Top stats */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Total applications</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Response rate</div>
          <div className="stat-value">
            {total > 0
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
            {total > 0 ? Math.round(((funnel.Offer || 0) / total) * 100) : 0}%
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
      </div>

      <div className="analytics-grid">
        {/* Application funnel */}
        <div className="card">
          <h2 className="analytics-section-title">Application funnel</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
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
          <h2 className="analytics-section-title">Stage conversion rates</h2>
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
            <h2 className="analytics-section-title">Applications over time</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
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
            <h2 className="analytics-section-title">Resume performance</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Resume version</th>
                    <th>Applications</th>
                    <th>Responses</th>
                    <th>Response rate</th>
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
                              style={{ width: `${Math.min(r.rate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="resume-rate-value">{r.rate}%</span>
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
    </div>
  );
}

export default Analytics;
