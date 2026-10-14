const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function fetchAPI(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

export function getAnalyticsSummary() {
    return fetchAPI("/api/analytics/summary");
}

export function getAllSessions() {
    return fetchAPI("/api/analytics/sessions");
}

export function getSessionTimeline(sessionId) {
    return fetchAPI(
        `/api/analytics/sessions/${encodeURIComponent(sessionId)}`
    );
}

export function getClickHeatmap(pageUrl) {
    return fetchAPI(
        `/api/analytics/heatmap?pageUrl=${encodeURIComponent(pageUrl)}`
    );
}