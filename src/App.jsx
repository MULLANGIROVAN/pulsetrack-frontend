import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  MousePointer2,
  Eye,
  Users,
  RefreshCw,
  ArrowUpRight,
  Clock3,
  AlertCircle,
  ExternalLink,
  Zap,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  getAnalyticsSummary,
  getAllSessions,
  getSessionTimeline,
  getClickHeatmap,
} from "./services/api";

import "./App.css";

function formatTime(value) {
  if (!value) return "Unknown time";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Keep marker centers away from the edges so the entire dot remains visible.
function getMarkerPosition(coordinate, maxCoordinate) {
  const markerRadiusPercent = 1.5;
  const percentage = (Number(coordinate) / maxCoordinate) * 100;

  if (!Number.isFinite(percentage)) {
    return 50;
  }

  return Math.max(
    markerRadiusPercent,
    Math.min(100 - markerRadiusPercent, percentage)
  );
}

function App() {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [pageUrl, setPageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResult, sessionsResult] = await Promise.all([
        getAnalyticsSummary(),
        getAllSessions(),
      ]);

      setSummary(summaryResult.data);
      setSessions(sessionsResult.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        "Couldn't load dashboard data. Make sure your Node.js server is running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleSessionClick(sessionId) {
    if (selectedSession === sessionId) {
      setSelectedSession("");
      setTimeline([]);
      setTimelineLoading(false);
      setError("");
      return;
    }

    setSelectedSession(sessionId);
    setTimeline([]);
    setTimelineLoading(true);
    setError("");

    try {
      const result = await getSessionTimeline(sessionId);
      setTimeline(result.data || []);
    } catch (err) {
      setError("Failed to load the selected session timeline.");
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  }

  async function loadSession() {
    if (!selectedSession.trim()) {
      setError("Select a session to view its timeline.");
      return;
    }

    setTimelineLoading(true);
    setError("");

    try {
      const result = await getSessionTimeline(selectedSession.trim());
      setTimeline(result.data || []);
    } catch (err) {
      setError("Failed to load the session timeline.");
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  }

  async function loadHeatmap() {
    if (!pageUrl.trim()) {
      setError("Enter the exact URL of the tracked page.");
      return;
    }

    setHeatmapLoading(true);
    setHeatmap([]);
    setError("");

    try {
      const result = await getClickHeatmap(pageUrl.trim());
      setHeatmap(result.data || []);

      if (!result.data || result.data.length === 0) {
        setError("No click events were found for this page URL.");
      }
    } catch (err) {
      setError("Failed to load click data for this page.");
      console.error(err);
    } finally {
      setHeatmapLoading(false);
    }
  }

  const chartData = [
    { name: "Page views", value: summary?.pageViews || 0 },
    { name: "Clicks", value: summary?.clicks || 0 },
  ];

  const metrics = [
    {
      label: "Total events",
      value: summary?.totalEvents ?? "—",
      icon: Activity,
      color: "violet",
      detail: "All recorded activity",
    },
    {
      label: "Page views",
      value: summary?.pageViews ?? "—",
      icon: Eye,
      color: "blue",
      detail: "Page load events",
    },
    {
      label: "Total clicks",
      value: summary?.clicks ?? "—",
      icon: MousePointer2,
      color: "orange",
      detail: "Tracked interactions",
    },
    {
      label: "Unique sessions",
      value: summary?.totalSessions ?? "—",
      icon: Users,
      color: "green",
      detail: "Distinct session IDs",
    },
  ];

  // Infer a consistent coordinate range for the preview.
  // This keeps existing events usable even though they don't store viewport size.
  const maxX = Math.max(
    1,
    ...heatmap.map((click) => Number(click.coordinates?.x) || 0)
  );

  const maxY = Math.max(
    1,
    ...heatmap.map((click) => Number(click.coordinates?.y) || 0)
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          <span>
            <strong>pulse</strong>track
            <small>WEB ANALYTICS</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <a className="nav-item active" href="#overview">
          <Activity size={18} />
          Overview
        </a>

        <a className="nav-item" href="#sessions">
          <Users size={18} />
          Sessions
        </a>

        <a className="nav-item" href="#heatmap">
          <MousePointer2 size={18} />
          Click analytics
        </a>

        <div className="sidebar-bottom">
          <div className="status-indicator">
            <span className="status-dot" />
            <div>
              <strong>PulseTrack API</strong>
              <small>
                {error ? "Check connection or request" : "Connection status"}
              </small>
            </div>
          </div>

          <p>Built for understanding user behavior.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>

          <button
            className="refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh data
          </button>
        </header>

        <section className="page-heading" id="overview">
          <div>
            <div className="eyebrow">
              <Zap size={14} />
              REAL-TIME BEHAVIOR ANALYTICS
            </div>

            <h1>Analytics overview</h1>

            <p>Understand how visitors interact with your website.</p>
          </div>

          <div className="updated-label">
            <span className="status-dot" />
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for data"}
          </div>
        </section>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="metrics-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="metric-card" key={metric.label}>
                <div className="metric-top">
                  <span>{metric.label}</span>
                  <span className={`metric-icon ${metric.color}`}>
                    <Icon size={19} />
                  </span>
                </div>

                <div className="metric-value">
                  {loading ? "..." : metric.value}
                </div>

                <div className="metric-detail">{metric.detail}</div>
              </article>
            );
          })}
        </section>

        <section className="content-grid">
          <article className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <h2>Event activity</h2>
                <p>Current totals from your event database</p>
              </div>

              <span className="panel-badge">
                <span className="status-dot" />
                All time
              </span>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot page-dot" /> Page views
              </span>
              <span>
                <i className="legend-dot click-dot" /> Clicks
              </span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="pageGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#818cf8"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#818cf8"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#252b3b"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#8992a8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#8992a8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#171c2a",
                      border: "1px solid #30384b",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#818cf8"
                    strokeWidth={3}
                    fill="url(#pageGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="chart-note">
              This chart compares aggregate totals, not activity over time.
              A timestamped activity chart can be added with a time-series API.
            </p>
          </article>

          <article className="panel insight-panel">
            <div className="panel-heading">
              <div>
                <h2>Tracking summary</h2>
                <p>Your current collection status</p>
              </div>
              <Activity size={19} className="muted-icon" />
            </div>

            <div className="insight-row">
              <span className="insight-icon blue">
                <Eye size={18} />
              </span>
              <div className="insight-copy">
                <strong>Page views</strong>
                <small>Visits recorded by the tracker</small>
              </div>
              <b>{summary?.pageViews ?? "—"}</b>
            </div>

            <div className="insight-row">
              <span className="insight-icon orange">
                <MousePointer2 size={18} />
              </span>
              <div className="insight-copy">
                <strong>Interactions</strong>
                <small>Clicks recorded by the tracker</small>
              </div>
              <b>{summary?.clicks ?? "—"}</b>
            </div>

            <div className="insight-row">
              <span className="insight-icon green">
                <Users size={18} />
              </span>
              <div className="insight-copy">
                <strong>Visitors</strong>
                <small>Unique session identifiers</small>
              </div>
              <b>{summary?.totalSessions ?? "—"}</b>
            </div>

            <div className="insight-footer">
              <Clock3 size={15} />
              Metrics are fetched directly from MongoDB through your API.
            </div>
          </article>
        </section>

        <section className="panel sessions-panel" id="sessions">
          <div className="panel-heading">
            <div>
              <h2>Session explorer</h2>
              <p>
                Select a session to inspect its chronological event history
              </p>
            </div>
            <Users size={20} className="muted-icon" />
          </div>

          {sessions.length > 0 ? (
            <div className="session-list">
              {sessions.map((session) => (
                <button
                  type="button"
                  key={session.sessionId}
                  className={`session-card ${
                    selectedSession === session.sessionId ? "selected" : ""
                  }`}
                  onClick={() => handleSessionClick(session.sessionId)}
                >
                  <span className="session-card-info">
                    <strong>{session.sessionId}</strong>
                    <small>
                      Last activity: {formatTime(session.lastSeen)}
                    </small>
                  </span>

                  <span className="session-card-actions">
                    <span className="session-event-count">
                      {session.totalEvents} events
                    </span>

                    <span className="session-toggle">
                      {selectedSession === session.sessionId
                        ? "Hide details ▲"
                        : "View details ▼"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <Users size={24} />
              <strong>
                {loading ? "Loading sessions..." : "No sessions found"}
              </strong>
              <span>
                {loading
                  ? "Fetching recorded sessions."
                  : "Visit your demo website to generate tracking events."}
              </span>
            </div>
          )}

          {timelineLoading && (
            <div className="empty-state compact-empty">
              Loading session timeline...
            </div>
          )}

          {!timelineLoading && timeline.length > 0 && (
            <div className="timeline">
              <h3>Session timeline</h3>

              {timeline.map((event, index) => (
                <div className="timeline-item" key={event._id || index}>
                  <div className={`timeline-marker ${event.event_type}`} />

                  <div className="timeline-body">
                    <div className="timeline-title">
                      <strong>{event.event_type.replace("_", " ")}</strong>
                      <time>{formatTime(event.timestamp)}</time>
                    </div>

                    <p className="event-url">{event.page_url}</p>

                    {event.coordinates && (
                      <p className="coordinate-text">
                        Click position: X {event.coordinates.x}, Y{" "}
                        {event.coordinates.y}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel heatmap-panel" id="heatmap">
          <div className="panel-heading">
            <div>
              <h2>Click analytics</h2>
              <p>Explore recorded click coordinates for a page</p>
            </div>
            <MousePointer2 size={20} className="muted-icon" />
          </div>

          <form
            className="lookup-form"
            onSubmit={(event) => {
              event.preventDefault();
              loadHeatmap();
            }}
          >
            <label htmlFor="pageUrl">Page URL</label>

            <div className="input-row">
              <input
                id="pageUrl"
                type="url"
                value={pageUrl}
                onChange={(event) => setPageUrl(event.target.value)}
                placeholder="http://localhost:5174/"
              />

              <button type="submit" disabled={heatmapLoading}>
                {heatmapLoading ? "Loading..." : "Load click data"}
                {!heatmapLoading && <ArrowUpRight size={16} />}
              </button>
            </div>
          </form>

          {heatmap.length > 0 ? (
            <>
              <div className="heatmap-stage">
                <div className="heatmap-page-label">
                  <ExternalLink size={14} />
                  {pageUrl}
                </div>

                <div className="heatmap-canvas">
                  {heatmap.map((click, index) => {
                    const x = Number(click.coordinates?.x);
                    const y = Number(click.coordinates?.y);

                    if (
                      !click.coordinates ||
                      !Number.isFinite(x) ||
                      !Number.isFinite(y)
                    ) {
                      return null;
                    }

                    return (
                      <span
                        key={click._id || `${click.session_id}-${index}`}
                        className="heat-point"
                        style={{
                          left: `${getMarkerPosition(x, maxX)}%`,
                          top: `${getMarkerPosition(y, maxY)}%`,
                        }}
                        title={`X: ${x}, Y: ${y}`}
                      />
                    );
                  })}
                </div>

                <p className="chart-note">
                  Markers are scaled proportionally using the coordinates in
                  the loaded click events. This is an illustrative preview,
                  not a screenshot of the original webpage.
                </p>
              </div>

              <div className="click-list">
                {heatmap.map((click, index) => (
                  <div
                    className="click-row"
                    key={click._id || `${click.session_id}-${index}`}
                  >
                    <span>Click {index + 1}</span>
                    <span>
                      X: {click.coordinates?.x ?? "—"}, Y:{" "}
                      {click.coordinates?.y ?? "—"}
                    </span>
                    <span>{formatTime(click.timestamp)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <MousePointer2 size={26} />
              <strong>
                {heatmapLoading
                  ? "Loading click data..."
                  : "No click data loaded"}
              </strong>
              <span>
                {heatmapLoading
                  ? "Fetching recorded click coordinates."
                  : "Enter the exact URL of a tracked page and load its clicks."}
              </span>
            </div>
          )}
        </section>

        <footer className="footer">
          <span>PulseTrack Analytics</span>
          <span>Node.js · Express · MongoDB · React</span>
        </footer>
      </main>
    </div>
  );
}

export default App;