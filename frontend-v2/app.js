const app = document.querySelector("#app");
const storageKey = "researchdesk_v2_state";

const state = {
  user: null,
  view: "login",
  query: "",
  selectedStock: null,
  results: [],
  watchlist: [],
  history: [],
  loading: false,
  error: ""
};

const moneyFormatters = new Map();
const percent = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });

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
    // Demo fallback: local state keeps the prototype usable without a database.
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
          <label>E-Mail<input name="email" type="email" required placeholder="name@example.com" /></label>
          <label>Passwort<input name="password" type="password" required minlength="8" placeholder="Mindestens 8 Zeichen" /></label>
          ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
          <button class="primary" type="submit">${state.loading ? "Bitte warten..." : isRegister ? "Registrieren" : "Login"}</button>
        </form>
        <button id="switch-auth" class="text-button">${isRegister ? "Schon registriert? Einloggen" : "Noch kein Account? Registrieren"}</button>
      </section>
      <section class="auth-hero">
        <div class="ticker-row">
          <span>AAPL</span><span>TSLA</span><span>SAP</span><span>NVDA</span>
        </div>
        <h2>Moderne Aktienanalyse ohne Brokerage, Orders oder Echtgeld.</h2>
      </section>
    </main>
  `;
}

function dashboardTemplate() {
  const stock = state.selectedStock;
  return `
    <main class="shell">
      <aside class="sidebar">
        <div class="brand compact"><span>RD</span><strong>ResearchDesk</strong></div>
        <nav>
          <a class="active">Dashboard</a>
          <a>Watchlist</a>
          <a>Verlauf</a>
          <a>Premium</a>
        </nav>
        <section class="plan-card">
          <span>Free</span>
          <strong>Prototype Plan</strong>
          <small>5 Watchlist-Plätze · Basisanalyse</small>
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
            <p class="eyebrow">Equity Research</p>
            <h1>Aktienanalyse per Firmenname</h1>
          </div>
          <form id="search-form" class="search">
            <input name="query" value="${escapeHtml(state.query)}" placeholder="Apple, Tesla, SAP oder NVIDIA" autocomplete="off" />
            <button class="primary" type="submit">${state.loading ? "Suche..." : "Suchen"}</button>
          </form>
        </header>
        ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
        ${state.results.length > 1 ? resultsTemplate() : ""}
        <section class="company-panel">
          ${stock ? companyTemplate(stock) : emptyCompanyTemplate()}
        </section>
        <section class="metrics">
          ${metric("Kurs", stock ? formatMoney(stock.price, stock.currency) : "--", stock ? `${formatSigned(stock.change)} heute` : "Noch keine Suche")}
          ${metric("Marktkapitalisierung", stock ? compact.format(stock.marketCap) : "--", stock ? stock.exchange : "Mock-Daten")}
          ${metric("KGV", stock ? stock.pe : "--", "Bewertung")}
          ${metric("Score", stock ? `${stock.analysis.score}/100` : "--", stock?.analysis.verdict || "Analyse")}
        </section>
        <section class="grid">
          <article class="panel chart-panel">
            <div class="panel-head">
              <div><p class="eyebrow">Chart</p><h2>${escapeHtml(stock?.ticker || "Kursverlauf")}</h2></div>
              <button id="add-watchlist" class="secondary" ${stock ? "" : "disabled"}>Watchlist</button>
            </div>
            ${stock ? `<canvas id="chart" width="900" height="320"></canvas>` : emptyState("Nach einer Suche erscheint hier der Chart.")}
          </article>
          <article class="panel analysis-panel">
            <div class="panel-head"><h2>Analyse</h2><span>${stock?.analysis.verdict || "Noch offen"}</span></div>
            ${stock ? analysisTemplate(stock) : emptyState("Die Analyse bewertet Wachstum, Bewertung, Trend und Risiko.")}
          </article>
          <article class="panel">
            <div class="panel-head"><h2>Watchlist</h2><span>${state.watchlist.length}/5</span></div>
            ${state.watchlist.length ? `<div class="list">${state.watchlist.map(listItem).join("")}</div>` : emptyState("Noch keine Aktien gespeichert.")}
          </article>
          <article class="panel">
            <div class="panel-head"><h2>Verlauf</h2><span>${state.history.length}</span></div>
            ${state.history.length ? `<div class="list">${state.history.map(historyItem).join("")}</div>` : emptyState("Deine letzten Suchen erscheinen hier.")}
          </article>
          <article class="panel premium">
            <div class="panel-head"><h2>Premium</h2><span>Vorbereitet</span></div>
            <p>Payment ist bewusst nicht aktiv. Die UI ist vorbereitet für mehr Watchlist-Plätze, mehr Kennzahlen, längere Historie und bessere Charts.</p>
            <div class="chips"><span>Mehr Kennzahlen</span><span>50 Watchlist-Plätze</span><span>Export</span></div>
          </article>
        </section>
      </section>
    </main>
  `;
}

function companyTemplate(stock) {
  return `
    <div class="company">
      <img src="${escapeHtml(stock.logo)}" alt="${escapeHtml(stock.name)} Logo" />
      <div>
        <p class="eyebrow">${escapeHtml(stock.exchange)} · ${escapeHtml(stock.country)}</p>
        <h2>${escapeHtml(stock.name)}</h2>
        <p>${escapeHtml(stock.ticker)} · ${escapeHtml(stock.sector)}</p>
      </div>
    </div>
    <div class="price">
      <span>Aktueller Mock-Kurs</span>
      <strong>${formatMoney(stock.price, stock.currency)}</strong>
      <em class="${stock.change >= 0 ? "positive" : "negative"}">${formatSigned(stock.change)}</em>
    </div>
  `;
}

function emptyCompanyTemplate() {
  return `
    <div>
      <p class="eyebrow">Start</p>
      <h2>Suche nach einem Firmennamen oder Ticker.</h2>
      <p>Beispiele: Apple, Tesla, SAP, NVIDIA. Alle Daten sind Mock-Daten mit sauberer API-Struktur.</p>
    </div>
  `;
}

function resultsTemplate() {
  return `
    <section class="results">
      <strong>Mehrere Treffer gefunden</strong>
      <div>
        ${state.results.map((stock) => `
          <button class="result" data-ticker="${escapeHtml(stock.ticker)}">
            <img src="${escapeHtml(stock.logo)}" alt="" />
            <span>${escapeHtml(stock.name)}<small>${escapeHtml(stock.ticker)} · ${escapeHtml(stock.exchange)}</small></span>
          </button>
        `).join("")}
      </div>
    </section>
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

function metric(label, value, hint) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(hint)}</small></article>`;
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
  document.querySelector("#add-watchlist")?.addEventListener("click", addWatchlist);
  document.querySelectorAll(".result").forEach((button) => button.addEventListener("click", () => selectStock(button.dataset.ticker)));
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
    state.results = data.results;
    state.selectedStock = data.results[0];
    addHistory(query, data.results[0]);
    saveLocalState();
  } catch (error) {
    state.results = [];
    state.selectedStock = null;
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function selectStock(ticker) {
  const stock = state.results.find((item) => item.ticker === ticker);
  if (!stock) return;
  state.selectedStock = stock;
  addHistory(ticker, stock);
  saveLocalState();
  render();
}

function addWatchlist() {
  if (!state.selectedStock) return;
  if (state.watchlist.some((item) => item.ticker === state.selectedStock.ticker)) return;
  if (state.watchlist.length >= 5) {
    state.error = "Free-Limit erreicht: maximal 5 Watchlist-Einträge.";
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
  if (!canvas || !points?.length) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pad = 24;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(148,163,184,.18)";
  for (let i = 0; i < 5; i++) {
    const y = pad + (i * (height - pad * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#38bdf8");
  gradient.addColorStop(1, "#22c55e");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = pad + index * (width - pad * 2) / (points.length - 1);
    const y = height - pad - ((point - min) / Math.max(1, max - min)) * (height - pad * 2);
    index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function addHistory(query, stock) {
  state.history = [{ query, ticker: stock.ticker, name: stock.name }, ...state.history.filter((item) => item.ticker !== stock.ticker)].slice(0, 8);
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
