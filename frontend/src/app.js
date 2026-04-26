const API_BASE = "http://localhost:4000/api";

const state = {
  user: null,
  settings: null,
  plan: null,
  watchlist: [],
  history: [],
  analysis: null,
  matches: [],
  loading: false,
  error: "",
  authMode: "login"
};

const app = document.querySelector("#app");
const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" });
const compactMoney = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

boot();

async function boot() {
  setLoading(true);
  try {
    const profile = await api("/me");
    state.user = profile.user;
    state.settings = profile.settings;
    state.plan = profile.plan;
    await Promise.all([loadWatchlist(), loadHistory()]);
  } catch {
    state.user = null;
  } finally {
    setLoading(false);
    render();
  }
}

function render() {
  app.innerHTML = state.user ? dashboardTemplate() : authTemplate();
  bindEvents();
  if (state.analysis) drawChart(state.analysis.chart);
}

function authTemplate() {
  const isLogin = state.authMode === "login";
  return `
    <main class="auth-shell">
      <section class="auth-panel">
        <div class="brand-row">
          <div class="brand-mark">RD</div>
          <div>
            <p class="eyebrow">ResearchDesk</p>
            <h1>${isLogin ? "Einloggen" : "Account erstellen"}</h1>
          </div>
        </div>
        <form id="auth-form" class="form-stack">
          ${isLogin ? "" : `<label>Name<input name="name" autocomplete="name" required minlength="2" placeholder="Paula Research" /></label>`}
          <label>E-Mail<input name="email" type="email" autocomplete="email" required placeholder="name@example.com" /></label>
          <label>Passwort<input name="password" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required minlength="8" placeholder="Mindestens 8 Zeichen" /></label>
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
          <button class="primary" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? "Bitte warten..." : isLogin ? "Login" : "Registrieren"}</button>
        </form>
        <button class="link-button" id="toggle-auth">${isLogin ? "Noch kein Account? Registrieren" : "Schon registriert? Einloggen"}</button>
      </section>
      <section class="auth-visual">
        <div class="market-strip">
          ${["Apple", "Tesla", "SAP", "NVIDIA"].map((item) => `<span>${item}</span>`).join("")}
        </div>
        <div class="hero-copy">
          <p>Aktienanalyse ohne Order-Funktion</p>
          <h2>Firmennamen eingeben, Aktie erkennen, Research-Dashboard starten.</h2>
        </div>
      </section>
    </main>
  `;
}

function dashboardTemplate() {
  const analysis = state.analysis;
  const asset = analysis?.asset;
  const plan = state.plan ?? { label: "Free", watchlistLimit: 5, historyLimit: 10 };
  return `
    <main class="app-shell">
      <aside class="sidebar">
        <div class="brand-row compact"><div class="brand-mark">RD</div><strong>ResearchDesk</strong></div>
        <nav>
          <a class="active">Research</a>
          <a>Watchlist</a>
          <a>Historie</a>
          <a>Premium</a>
        </nav>
        <section class="plan-card">
          <span>${escapeHtml(plan.label)}</span>
          <strong>${state.user.plan === "premium" ? "Alle Research-Module aktiv" : "Basis Research aktiv"}</strong>
          <small>${state.watchlist.length}/${plan.watchlistLimit} Watchlist-Plaetze</small>
        </section>
        <div class="profile-card">
          <span>${escapeHtml(initials(state.user.name))}</span>
          <div><strong>${escapeHtml(state.user.name)}</strong><small>${escapeHtml(state.user.email)}</small></div>
        </div>
        <button id="logout" class="ghost">Logout</button>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Equity Research</p>
            <h1>Aktie per Firmenname finden</h1>
          </div>
          <form id="analyze-form" class="company-search">
            <input name="query" placeholder="Apple, Tesla, SAP oder AAPL" required autocomplete="off" />
            <button class="primary" ${state.loading ? "disabled" : ""}>Analysieren</button>
          </form>
        </header>

        ${state.error ? `<p class="error banner">${escapeHtml(state.error)}</p>` : ""}
        ${state.matches.length ? matchPickerTemplate() : ""}

        <section class="hero-panel">
          ${analysis ? companyProfileTemplate(analysis) : emptyHeroTemplate()}
        </section>

        <section class="metric-grid">
          ${metricCard("Kurs", analysis ? formatCurrency(analysis.metrics.price, asset.currency) : "--", analysis ? `${formatSigned(analysis.metrics.change)} heute` : "Noch keine Aktie")}
          ${metricCard("Marktkapitalisierung", analysis ? compactMoney.format(analysis.metrics.marketCap) : "--", analysis ? asset.exchange : "Firmennamen suchen")}
          ${metricCard("KGV", analysis ? analysis.metrics.pe : "--", analysis?.premiumLocked ? "Basiskennzahl" : "Bewertung")}
          ${metricCard("Gesamt-Score", analysis ? `${analysis.score}/100` : "--", analysis?.verdict ?? "Analyse startet nach Suche")}
        </section>

        <section class="content-grid">
          <article class="panel chart-panel">
            <div class="panel-heading">
              <div><p class="eyebrow">Kursverlauf</p><h2>${escapeHtml(asset?.ticker ?? "Chart")}</h2></div>
              <button id="save-watchlist" class="secondary" ${analysis ? "" : "disabled"}>Zur Watchlist</button>
            </div>
            ${analysis ? chartTemplate(analysis) : emptyState("Nach der ersten Suche erscheint hier der Kurschart.")}
          </article>

          <article class="panel">
            <div class="panel-heading"><h2>Watchlist</h2><span>${state.watchlist.length}/${plan.watchlistLimit}</span></div>
            ${state.watchlist.length ? `<div class="list">${state.watchlist.map(watchlistItem).join("")}</div>` : emptyState("Speichere analysierte Aktien fuer spaeter.")}
          </article>

          <article class="panel history-panel">
            <div class="panel-heading"><h2>Suchverlauf</h2><span>${state.history.length}/${plan.historyLimit}</span></div>
            ${state.history.length ? `<div class="list">${state.history.map(historyItem).join("")}</div>` : emptyState("Fruehere Suchen und Analysen erscheinen hier.")}
          </article>

          <article class="panel analysis-panel">
            <div class="panel-heading"><h2>Research Urteil</h2><span>${analysis?.plan ?? plan.label}</span></div>
            ${analysis ? analysisTemplate(analysis) : emptyState("Die Analyse erklaert Wachstum, Bewertung, Trend und Risiko nachvollziehbar.")}
          </article>

          <article class="panel premium-panel">
            ${premiumTemplate(analysis, plan)}
          </article>
        </section>
      </section>
    </main>
  `;
}

function emptyHeroTemplate() {
  return `
    <div>
      <p class="eyebrow">Startpunkt</p>
      <h2>Gib einen Firmennamen ein. Die App erkennt daraus die Aktie.</h2>
      <p class="muted">Beispiele: Apple, Tesla, SAP, Microsoft, Alphabet. Bei mehreren moeglichen Treffern erscheint eine Auswahl.</p>
    </div>
    <div class="search-preview">
      <span>Apple -> AAPL</span>
      <span>Tesla -> TSLA</span>
      <span>SAP -> SAP</span>
    </div>
  `;
}

function companyProfileTemplate(analysis) {
  const asset = analysis.asset;
  return `
    <div class="company-profile">
      <img src="${escapeHtml(asset.logoUrl)}" alt="${escapeHtml(asset.name)} Logo" />
      <div>
        <p class="eyebrow">${escapeHtml(asset.exchange)} / ${escapeHtml(asset.country)}</p>
        <h2>${escapeHtml(asset.name)}</h2>
        <p class="muted">${escapeHtml(asset.ticker)} · ${escapeHtml(asset.sector)} · ${escapeHtml(asset.website)}</p>
      </div>
    </div>
    <div class="price-block">
      <span>Aktueller Mock-Kurs</span>
      <strong>${formatCurrency(analysis.metrics.price, asset.currency)}</strong>
      <em class="${analysis.metrics.change >= 0 ? "positive" : "negative"}">${formatSigned(analysis.metrics.change)} heute</em>
    </div>
  `;
}

function matchPickerTemplate() {
  return `
    <section class="match-picker">
      <div><strong>Mehrere Treffer gefunden</strong><span>Bitte waehle die passende Aktie aus.</span></div>
      <div class="match-grid">
        ${state.matches.map((match) => `
          <button class="match-card" data-ticker="${escapeHtml(match.ticker)}">
            <img src="${escapeHtml(match.logoUrl)}" alt="" />
            <span><strong>${escapeHtml(match.name)}</strong><small>${escapeHtml(match.ticker)} · ${escapeHtml(match.exchange)}</small></span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function metricCard(label, value, subline) {
  return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(subline)}</small></article>`;
}

function chartTemplate(analysis) {
  const premium = analysis.metrics.premiumMetrics;
  return `
    <div class="chart-wrap"><canvas id="price-chart" width="1000" height="360"></canvas></div>
    <div class="analysis-detail">
      <div><span>Umsatzwachstum</span><strong>${percent.format(analysis.metrics.revenueGrowth)}%</strong></div>
      <div><span>Gewinnwachstum</span><strong>${percent.format(analysis.metrics.earningsGrowth)}%</strong></div>
      <div><span>Marge</span><strong>${percent.format(analysis.metrics.margin)}%</strong></div>
      <div><span>Volatilitaet</span><strong>${percent.format(analysis.metrics.volatility)}%</strong></div>
      ${premium ? `<div><span>Free Cashflow Yield</span><strong>${percent.format(premium.freeCashFlowYield)}%</strong></div>` : lockedMetric("FCF Yield")}
      ${premium ? `<div><span>Analysten-Sentiment</span><strong>${percent.format(premium.analystSentiment)}%</strong></div>` : lockedMetric("Sentiment")}
    </div>
  `;
}

function analysisTemplate(analysis) {
  return `
    <div class="score-ring"><strong>${analysis.score}</strong><span>/100</span></div>
    <h3>${escapeHtml(analysis.verdict)}</h3>
    <div class="pillar-list">
      ${pillar("Wachstum", analysis.pillars.growth, analysis.explanations.growth)}
      ${pillar("Bewertung", analysis.pillars.valuation, analysis.explanations.valuation)}
      ${pillar("Trend", analysis.pillars.trend, analysis.explanations.trend)}
      ${pillar("Risiko / Qualitaet", analysis.pillars.risk, analysis.explanations.risk)}
    </div>
    <ul class="notes">${analysis.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
  `;
}

function premiumTemplate(analysis, plan) {
  const isPremium = state.user.plan === "premium";
  const teaser = analysis?.premiumTeaser;
  return `
    <div class="panel-heading"><h2>Premium Research</h2><span>${isPremium ? "Aktiv" : "Vorbereitet"}</span></div>
    <div class="premium-copy">
      <strong>${isPremium ? "Premium ist aktiv" : "Free-Version"}</strong>
      <p>${isPremium ? "Erweiterte Kennzahlen und groessere Limits sind freigeschaltet." : "Payment ist noch nicht integriert. Die Architektur und UI fuer Feature-Gating sind vorbereitet."}</p>
    </div>
    <div class="feature-list">
      ${(teaser?.items ?? ["50 Watchlist-Plaetze", "50 Historieneintraege", "Premium-Kennzahlen", "Detailliertere Analysen"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
    <button class="secondary" disabled>${isPremium ? "Premium aktiv" : "Upgrade vorbereiten"}</button>
  `;
}

function pillar(label, score, explanation) {
  return `
    <div class="pillar">
      <div><strong>${escapeHtml(label)}</strong><span>${score}/100</span></div>
      <progress value="${score}" max="100"></progress>
      <small>${escapeHtml(explanation)}</small>
    </div>
  `;
}

function lockedMetric(label) {
  return `<div class="locked"><span>${escapeHtml(label)}</span><strong>Premium</strong></div>`;
}

function watchlistItem(item) {
  return `
    <div class="list-item">
      <button class="text-start analyze-symbol" data-ticker="${escapeHtml(item.ticker)}"><strong>${escapeHtml(item.ticker)}</strong><span>${escapeHtml(item.name)}</span></button>
      <button class="icon-button remove-watch" aria-label="Entfernen" data-ticker="${escapeHtml(item.ticker)}">x</button>
    </div>
  `;
}

function historyItem(item) {
  return `
    <button class="list-item text-start history-open" data-index="${state.history.indexOf(item)}">
      <strong>${escapeHtml(item.ticker)}</strong>
      <span>${escapeHtml(item.companyName)}</span>
      <em>${item.score}/100</em>
    </button>
  `;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function bindEvents() {
  document.querySelector("#toggle-auth")?.addEventListener("click", () => {
    state.authMode = state.authMode === "login" ? "register" : "login";
    state.error = "";
    render();
  });

  document.querySelector("#auth-form")?.addEventListener("submit", handleAuth);
  document.querySelector("#logout")?.addEventListener("click", handleLogout);
  document.querySelector("#analyze-form")?.addEventListener("submit", handleAnalyze);
  document.querySelector("#save-watchlist")?.addEventListener("click", saveCurrentToWatchlist);
  document.querySelectorAll(".remove-watch").forEach((button) => button.addEventListener("click", removeWatchlist));
  document.querySelectorAll(".analyze-symbol").forEach((button) => button.addEventListener("click", () => runAnalysis(button.dataset.ticker)));
  document.querySelectorAll(".match-card").forEach((button) => button.addEventListener("click", () => runAnalysis(button.dataset.ticker)));
  document.querySelectorAll(".history-open").forEach((button) => button.addEventListener("click", () => {
    state.analysis = normalizeAnalysis(state.history[Number(button.dataset.index)].analysis);
    state.matches = [];
    render();
  }));
}

async function handleAuth(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  setLoading(true);
  try {
    const data = await api(`/auth/${state.authMode === "login" ? "login" : "register"}`, { method: "POST", body: payload });
    state.user = data.user;
    state.settings = data.settings;
    state.plan = data.plan;
    state.error = "";
    await Promise.all([loadWatchlist(), loadHistory()]);
  } catch (error) {
    state.error = error.message;
  } finally {
    setLoading(false);
    render();
  }
}

async function handleLogout() {
  await api("/auth/logout", { method: "POST" }).catch(() => {});
  Object.assign(state, { user: null, analysis: null, watchlist: [], history: [], matches: [], error: "" });
  render();
}

async function handleAnalyze(event) {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get("query");
  await runAnalysis(query);
}

async function runAnalysis(query) {
  setLoading(true);
  try {
    const data = await api("/analyze", { method: "POST", body: { query } });
    state.analysis = normalizeAnalysis(data.analysis);
    state.history = normalizeHistory(data.history);
    state.plan = data.plan ?? state.plan;
    state.matches = [];
    state.error = "";
  } catch (error) {
    state.error = error.message;
    state.matches = error.matches ?? [];
  } finally {
    setLoading(false);
    render();
  }
}

async function saveCurrentToWatchlist() {
  if (!state.analysis) return;
  try {
    const data = await api("/watchlist", { method: "POST", body: { ticker: state.analysis.ticker } });
    state.watchlist = data.items;
    state.plan = data.plan ?? state.plan;
    state.error = "";
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function removeWatchlist(event) {
  try {
    const ticker = event.currentTarget.dataset.ticker;
    const data = await api(`/watchlist?ticker=${encodeURIComponent(ticker)}`, { method: "DELETE" });
    state.watchlist = data.items;
  } catch (error) {
    state.error = error.message;
  }
  render();
}

async function loadWatchlist() {
  const data = await api("/watchlist");
  state.watchlist = data.items;
}

async function loadHistory() {
  const data = await api("/history");
  state.history = normalizeHistory(data.items);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error ?? "Anfrage fehlgeschlagen.");
    error.matches = data.matches;
    throw error;
  }
  return data;
}

function drawChart(points) {
  const canvas = document.querySelector("#price-chart");
  if (!canvas || !points?.length) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pad = 28;

  ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = pad + (i * (height - pad * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const fill = ctx.createLinearGradient(0, pad, 0, height - pad);
  fill.addColorStop(0, "rgba(34, 197, 94, 0.26)");
  fill.addColorStop(1, "rgba(56, 189, 248, 0.02)");
  const line = ctx.createLinearGradient(0, 0, width, 0);
  line.addColorStop(0, "#38bdf8");
  line.addColorStop(1, "#22c55e");

  const coordinates = points.map((point, index) => ({
    x: pad + (index * (width - pad * 2)) / (points.length - 1),
    y: height - pad - ((point - min) / Math.max(1, max - min)) * (height - pad * 2)
  }));

  ctx.beginPath();
  coordinates.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(pad, height - pad);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  coordinates.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
  ctx.strokeStyle = line;
  ctx.lineWidth = 4;
  ctx.stroke();
}

function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value);
}

function normalizeHistory(items = []) {
  return items.map((item) => ({ ...item, analysis: normalizeAnalysis(item.analysis) }));
}

function normalizeAnalysis(analysis) {
  if (!analysis) return analysis;
  const ticker = analysis.ticker ?? "ASSET";
  const companyName = analysis.companyName ?? `${ticker} Research Asset`;
  return {
    ...analysis,
    asset: analysis.asset ?? {
      ticker,
      name: companyName,
      exchange: "Mock Exchange",
      country: "N/A",
      currency: "USD",
      sector: "Unklassifiziert",
      website: "example.com",
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(ticker)}&background=111827&color=38bdf8&bold=true`
    },
    metrics: {
      marketCap: 0,
      ...analysis.metrics
    },
    explanations: analysis.explanations ?? {
      growth: "Basisanalyse aus frueherem Verlauf.",
      valuation: "Basisanalyse aus frueherem Verlauf.",
      trend: "Basisanalyse aus frueherem Verlauf.",
      risk: "Basisanalyse aus frueherem Verlauf."
    },
    plan: analysis.plan ?? "Free",
    premiumLocked: analysis.premiumLocked ?? true
  };
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${percent.format(value)}%`;
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function setLoading(value) {
  state.loading = value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
