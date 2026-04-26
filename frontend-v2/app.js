const app = document.querySelector("#app");
const storageKey = "researchdesk_v2_state";
const planRules = {
  free: { label: "Free", watchlistLimit: 5, historyLimit: 8, proMetrics: false },
  pro: { label: "Pro", watchlistLimit: 50, historyLimit: 30, proMetrics: true }
};

const state = {
  user: null,
  view: "login",
  query: "",
  selectedStock: null,
  suggestions: [],
  watchlist: [],
  history: [],
  loading: false,
  error: ""
};

const moneyFormatters = new Map();
const percent = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });
let autocompleteTimer;

boot();

async function boot() {
  loadLocalState();
  try {
    const session = await api("/api/me");
    if (session.authenticated) {
      state.user = session.user;
      state.view = "dashboard";
    }
  } catch {
    // The app remains usable as a demo if the cookie is not available locally.
  }
  render();
}

function render() {
  app.innerHTML = state.user && state.view === "dashboard" ? dashboardTemplate() : authTemplate();
  bindEvents();
  if (state.selectedStock) drawChart(state.selectedStock.chart);
}

function authTemplate() {
  const isRegister = state.view === "register";
  return `
    <main class="auth-page">
      <section class="auth-card">
        <div class="brand">
          <span>RD</span>
          <div>
            <p>ResearchDesk V2</p>
            <h1>${isRegister ? "Account erstellen" : "Einloggen"}</h1>
          </div>
        </div>
        <form id="auth-form" class="form">
          ${isRegister ? `<label>Name<input name="name" required minlength="2" placeholder="Dein Name" /></label>` : ""}
          <label>E-Mail<input name="email" type="email" required placeholder="paula@example.com" /></label>
          <label>Passwort<input name="password" type="password" required minlength="8" placeholder="Mindestens 8 Zeichen" /></label>
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
          <button class="primary" type="submit">${state.loading ? "Bitte warten..." : isRegister ? "Registrieren" : "Login"}</button>
        </form>
        <button id="switch-auth" class="text-button">${isRegister ? "Schon registriert? Einloggen" : "Noch kein Account? Registrieren"}</button>
      </section>
      <section class="auth-hero">
        <div class="ticker-row"><span>AAPL</span><span>TSLA</span><span>SAP</span><span>NVDA</span></div>
        <h2>Aktienresearch mit Premium-Gefuehl, ohne Orders und ohne Echtgeld.</h2>
      </section>
    </main>
  `;
}

function dashboardTemplate() {
  const stock = state.selectedStock;
  const plan = currentPlan();
  return `
    <main class="shell">
      <aside class="sidebar">
        <div class="brand compact"><span>RD</span><strong>ResearchDesk</strong></div>
        <nav>
          <a class="active">Dashboard</a>
          <a>Watchlist</a>
          <a>Verlauf</a>
          <a>Pro</a>
        </nav>
        <section class="plan-card ${state.user.plan === "pro" ? "is-pro" : ""}">
          <span>${plan.label}</span>
          <strong>${state.user.plan === "pro" ? "Alle Research-Module aktiv" : "Basis Research aktiv"}</strong>
          <small>${state.watchlist.length}/${plan.watchlistLimit} Watchlist-Plaetze</small>
        </section>
        <section class="user-card">
          <strong>${escapeHtml(state.user.name)}</strong>
          <small>${escapeHtml(state.user.email)}</small>
        </section>
        <button id="logout" class="ghost">Logout</button>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Equity Research Terminal</p>
            <h1>Aktienanalyse per Firmenname oder Ticker</h1>
          </div>
          <form id="search-form" class="search" autocomplete="off">
            <div class="search-box">
              <input id="stock-query" name="query" value="${escapeHtml(state.query)}" placeholder="Apple, Tesla, SAP, NVDA..." />
              ${state.suggestions.length ? suggestionsTemplate() : ""}
            </div>
            <button class="primary" type="submit">${state.loading ? "Suche..." : "Analysieren"}</button>
          </form>
        </header>
        ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
        <section class="company-panel">
          ${stock ? companyTemplate(stock) : emptyCompanyTemplate()}
        </section>
        <section class="metrics">
          ${metric("Kurs", stock ? formatMoney(stock.price, stock.currency) : "--", stock ? `${formatSigned(stock.change)} heute` : "Autocomplete aktiv")}
          ${metric("Market Cap", stock ? compact.format(stock.marketCap) : "--", stock ? `${stock.exchange} / ${stock.country}` : "Mock-Daten")}
          ${metric("KGV", stock ? stock.pe : "--", "Bewertung")}
          ${metric("Research Score", stock ? `${stock.analysis.score}/100` : "--", stock?.analysis.verdict || "Gesamturteil")}
        </section>
        <section class="grid">
          <article class="panel chart-panel">
            <div class="panel-head">
              <div><p class="eyebrow">Adaptive Chart</p><h2>${escapeHtml(stock?.ticker || "Kursverlauf")}</h2></div>
              <button id="add-watchlist" class="secondary" ${stock ? "" : "disabled"}>Watchlist</button>
            </div>
            ${stock ? `<div class="chart-shell"><canvas id="chart"></canvas></div>` : emptyState("Nach einer Suche erscheint hier ein automatisch skalierter Chart.")}
          </article>
          <article class="panel analysis-panel">
            <div class="panel-head"><h2>Analyse</h2><span>${stock?.analysis.verdict || "Noch offen"}</span></div>
            ${stock ? analysisTemplate(stock) : emptyState("Die Analyse bewertet Wachstum, Bewertung, Trend und Risiko.")}
          </article>
          <article class="panel">
            <div class="panel-head"><h2>Watchlist</h2><span>${state.watchlist.length}/${plan.watchlistLimit}</span></div>
            ${state.watchlist.length ? `<div class="list">${state.watchlist.map(listItem).join("")}</div>` : emptyState("Noch keine Aktien gespeichert.")}
          </article>
          <article class="panel">
            <div class="panel-head"><h2>Verlauf</h2><span>${state.history.length}/${plan.historyLimit}</span></div>
            ${state.history.length ? `<div class="list">${state.history.map(historyItem).join("")}</div>` : emptyState("Deine letzten Suchen erscheinen hier.")}
          </article>
          <article class="panel pro-panel">
            <div class="panel-head"><h2>Pro Research</h2><span>${state.user.plan === "pro" ? "Aktiv" : "Gesperrt"}</span></div>
            ${stock ? proTemplate(stock) : proEmptyTemplate()}
          </article>
        </section>
      </section>
    </main>
  `;
}

function suggestionsTemplate() {
  return `
    <div class="suggestions">
      ${state.suggestions.map((stock) => `
        <button type="button" class="suggestion" data-ticker="${escapeHtml(stock.ticker)}">
          <img src="${escapeHtml(stock.logo)}" alt="" />
          <span><strong>${escapeHtml(stock.name)}</strong><small>${escapeHtml(stock.ticker)} · ${escapeHtml(stock.exchange)}</small></span>
        </button>
      `).join("")}
    </div>
  `;
}

function companyTemplate(stock) {
  return `
    <div class="company">
      <img src="${escapeHtml(stock.logo)}" alt="${escapeHtml(stock.name)} Logo" />
      <div>
        <p class="eyebrow">${escapeHtml(stock.exchange)} · ${escapeHtml(stock.country)}</p>
        <h2>${escapeHtml(stock.name)}</h2>
        <p>${escapeHtml(stock.ticker)} · ${escapeHtml(stock.sector)} · ${escapeHtml(stock.industry)}</p>
      </div>
    </div>
    <div class="price">
      <span>Aktueller Mock-Kurs</span>
      <strong>${formatMoney(stock.price, stock.currency)}</strong>
      <em class="${stock.change >= 0 ? "positive" : "negative"}">${formatSigned(stock.change)} heute</em>
    </div>
  `;
}

function emptyCompanyTemplate() {
  return `
    <div>
      <p class="eyebrow">Start</p>
      <h2>Tippe einen Namen oder Ticker ein.</h2>
      <p>Beim Tippen erscheinen Vorschlaege. Beispiele: Apple, Tesla, SAP, NVIDIA, Microsoft.</p>
    </div>
  `;
}

function analysisTemplate(stock) {
  return `
    <div class="score"><strong>${stock.analysis.score}</strong><span>/100</span></div>
    ${pillar("Wachstum", stock.analysis.pillars.growth)}
    ${pillar("Bewertung", stock.analysis.pillars.valuation)}
    ${pillar("Trend", stock.analysis.pillars.trend)}
    ${pillar("Risiko", stock.analysis.pillars.risk)}
    <ul>${stock.analysis.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
  `;
}

function proTemplate(stock) {
  if (state.user.plan !== "pro") {
    return `
      <p class="muted">Free-Nutzer sehen Basisdaten. Pro schaltet erweiterte Kennzahlen, groessere Watchlist und detailliertere Signale frei.</p>
      <div class="locked-grid">
        <span>Gross Margin</span><span>FCF Yield</span><span>Beta</span><span>Debt / Equity</span>
      </div>
    `;
  }

  return `
    <div class="pro-grid">
      ${proMetric("Gross Margin", `${percent.format(stock.grossMargin)}%`)}
      ${proMetric("FCF Yield", `${percent.format(stock.fcfYield)}%`)}
      ${proMetric("Beta", stock.beta)}
      ${proMetric("Analyst Score", `${percent.format(stock.analystScore)}%`)}
      ${proMetric("Dividende", `${percent.format(stock.dividendYield)}%`)}
      ${proMetric("Debt / Equity", stock.debtToEquity)}
    </div>
    <p class="muted">${escapeHtml(stock.description)}</p>
  `;
}

function proEmptyTemplate() {
  return `<p class="muted">Dein Paula-Account ist automatisch Pro. Suche eine Aktie, um alle Pro-Kennzahlen zu sehen.</p>`;
}

function metric(label, value, hint) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(hint)}</small></article>`;
}

function proMetric(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function pillar(label, value) {
  return `<div class="pillar"><div><span>${escapeHtml(label)}</span><strong>${value}/100</strong></div><progress value="${value}" max="100"></progress></div>`;
}

function listItem(stock) {
  return `<button class="list-item stock-open" data-ticker="${escapeHtml(stock.ticker)}"><strong>${escapeHtml(stock.ticker)}</strong><span>${escapeHtml(stock.name)}</span></button>`;
}

function historyItem(item) {
  return `<button class="list-item stock-open" data-ticker="${escapeHtml(item.ticker)}"><strong>${escapeHtml(item.query)}</strong><span>${escapeHtml(item.name)}</span></button>`;
}

function emptyState(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function bindEvents() {
  document.querySelector("#switch-auth")?.addEventListener("click", () => {
    state.view = state.view === "register" ? "login" : "register";
    state.error = "";
    render();
  });
  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document.querySelector("#logout")?.addEventListener("click", logout);
  document.querySelector("#search-form")?.addEventListener("submit", submitSearch);
  document.querySelector("#stock-query")?.addEventListener("input", handleAutocomplete);
  document.querySelector("#add-watchlist")?.addEventListener("click", addWatchlist);
  document.querySelectorAll(".suggestion").forEach((button) => button.addEventListener("click", () => chooseSuggestion(button.dataset.ticker)));
  document.querySelectorAll(".stock-open").forEach((button) => button.addEventListener("click", () => searchStock(button.dataset.ticker)));
}

async function submitAuth(event) {
  event.preventDefault();
  const endpoint = state.view === "register" ? "/api/register" : "/api/login";
  const body = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.loading = true;
  state.error = "";
  render();
  try {
    const data = await api(endpoint, { method: "POST", body });
    state.user = data.user;
    state.view = "dashboard";
    saveLocalState();
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function handleAutocomplete(event) {
  const value = event.currentTarget.value.trim();
  state.query = value;
  clearTimeout(autocompleteTimer);
  if (value.length < 1) {
    state.suggestions = [];
    render();
    return;
  }

  autocompleteTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/search?q=${encodeURIComponent(value)}`);
      state.suggestions = data.results;
      render();
      const input = document.querySelector("#stock-query");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    } catch {
      state.suggestions = [];
      render();
    }
  }, 160);
}

async function submitSearch(event) {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get("query");
  await searchStock(query);
}

async function searchStock(query) {
  state.loading = true;
  state.error = "";
  state.query = query;
  render();
  try {
    const data = await api(`/api/search?q=${encodeURIComponent(query)}`);
    state.suggestions = [];
    state.selectedStock = data.results[0];
    addHistory(query, data.results[0]);
    saveLocalState();
  } catch (error) {
    state.suggestions = [];
    state.selectedStock = null;
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function chooseSuggestion(ticker) {
  const stock = state.suggestions.find((item) => item.ticker === ticker);
  if (!stock) return;
  state.query = stock.ticker;
  state.selectedStock = stock;
  state.suggestions = [];
  addHistory(stock.ticker, stock);
  saveLocalState();
  render();
}

function addWatchlist() {
  if (!state.selectedStock) return;
  if (state.watchlist.some((item) => item.ticker === state.selectedStock.ticker)) return;
  const plan = currentPlan();
  if (state.watchlist.length >= plan.watchlistLimit) {
    state.error = `Free-Limit erreicht: maximal ${plan.watchlistLimit} Watchlist-Eintraege.`;
    render();
    return;
  }
  state.watchlist.unshift(state.selectedStock);
  saveLocalState();
  render();
}

async function logout() {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  state.user = null;
  state.view = "login";
  state.selectedStock = null;
  state.suggestions = [];
  state.error = "";
  saveLocalState();
  render();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Anfrage fehlgeschlagen.");
  return data;
}

function drawChart(points) {
  const canvas = document.querySelector("#chart");
  const shell = document.querySelector(".chart-shell");
  if (!canvas || !shell || !points?.length) return;

  const rect = shell.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = Math.max(320, rect.width);
  const cssHeight = Math.max(280, rect.height);
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = cssWidth;
  const height = cssHeight;
  const pad = { top: 20, right: 18, bottom: 34, left: 56 };
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#0d131c";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(148,163,184,.16)";
  ctx.fillStyle = "rgba(148,163,184,.78)";
  ctx.font = "12px Inter, system-ui, sans-serif";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i * (height - pad.top - pad.bottom)) / 4;
    const value = max - (i * range) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(value.toFixed(0), 12, y + 4);
  }

  const coords = points.map((point, index) => ({
    x: pad.left + index * (width - pad.left - pad.right) / (points.length - 1),
    y: height - pad.bottom - ((point - min) / range) * (height - pad.top - pad.bottom)
  }));

  const area = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  area.addColorStop(0, "rgba(34,197,94,.26)");
  area.addColorStop(1, "rgba(56,189,248,.02)");
  ctx.beginPath();
  coords.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
  ctx.lineTo(width - pad.right, height - pad.bottom);
  ctx.lineTo(pad.left, height - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  const line = ctx.createLinearGradient(pad.left, 0, width - pad.right, 0);
  line.addColorStop(0, "#38bdf8");
  line.addColorStop(1, "#22c55e");
  ctx.beginPath();
  coords.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
  ctx.strokeStyle = line;
  ctx.lineWidth = 3;
  ctx.stroke();

  const last = coords.at(-1);
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function addHistory(query, stock) {
  const limit = currentPlan().historyLimit;
  state.history = [{ query, ticker: stock.ticker, name: stock.name }, ...state.history.filter((item) => item.ticker !== stock.ticker)].slice(0, limit);
}

function currentPlan() {
  return planRules[state.user?.plan === "pro" ? "pro" : "free"];
}

function loadLocalState() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  Object.assign(state, {
    user: saved.user || null,
    view: saved.user ? "dashboard" : "login",
    watchlist: saved.watchlist || [],
    history: saved.history || []
  });
}

function saveLocalState() {
  localStorage.setItem(storageKey, JSON.stringify({
    user: state.user,
    watchlist: state.watchlist,
    history: state.history
  }));
}

function formatMoney(value, currency) {
  if (!moneyFormatters.has(currency)) {
    moneyFormatters.set(currency, new Intl.NumberFormat("de-DE", { style: "currency", currency }));
  }
  return moneyFormatters.get(currency).format(value);
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${percent.format(value)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
