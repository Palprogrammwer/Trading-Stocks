const app = document.querySelector("#app");
const storageKey = "researchdesk_v2_state";
const planRules = {
  free: { label: "Free", watchlistLimit: 5, historyLimit: 8, proMetrics: false },
  pro: { label: "Pro", watchlistLimit: 50, historyLimit: 30, proMetrics: true }
};

const TIMEFRAMES = ["1W", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

const state = {
  user: null,
  view: "login",
  query: "",
  selectedStock: null,
  suggestions: [],
  watchlist: [],
  history: [],
  loading: false,
  error: "",
  chartTimeframe: "1M"
};

const moneyFormatters = new Map();
const percent = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const compact = new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 });
let autocompleteTimer;
let outsideClickBound = false;

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
    // Demo-Modus ohne Cookie
  }
  render();
}

function render() {
  app.innerHTML = state.user && state.view === "dashboard" ? dashboardTemplate() : authTemplate();
  bindEvents();
  if (state.selectedStock) drawChart(state.selectedStock.chart);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── Dashboard ────────────────────────────────────────────────────────────────

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
            <h1>Aktienanalyse per Name oder Ticker</h1>
          </div>
          <form id="search-form" class="search" autocomplete="off">
            <div class="search-box">
              <input
                id="stock-query"
                name="query"
                value="${escapeHtml(state.query)}"
                placeholder="Apple, Tesla, SAP, NVDA, Bayer..."
              />
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
          ${metric("Kurs", stock ? formatMoney(stock.price, stock.currency) : "--", stock ? formatSigned(stock.change) + " heute" : "Autocomplete aktiv")}
          ${metric("Market Cap", stock ? compact.format(stock.marketCap) : "--", stock ? stock.exchange + " · " + stock.country : "Mock-Daten")}
          ${metric("KGV", stock ? String(stock.pe) : "--", stock ? peLabel(stock.pe) : "Bewertung")}
          ${metric("Research Score", stock ? stock.analysis.score + "/100" : "--", stock ? stock.analysis.verdict : "Gesamturteil")}
        </section>
        <section class="grid">
          <article class="panel chart-panel">
            <div class="panel-head">
              <div><p class="eyebrow">Kursverlauf (Mock)</p><h2>${escapeHtml(stock ? stock.ticker : "Chart")}</h2></div>
              <div class="chart-controls">
                ${TIMEFRAMES.map((tf) => `<button type="button" class="timeframe-btn${state.chartTimeframe === tf ? " active" : ""}" data-tf="${tf}"${stock ? "" : " disabled"}>${tf}</button>`).join("")}
                <button id="add-watchlist" class="secondary"${stock ? "" : " disabled"}>+ Watchlist</button>
              </div>
            </div>
            ${stock ? `<div class="chart-shell"><canvas id="chart"></canvas></div>` : emptyState("Nach einer Suche erscheint hier ein automatisch skalierter Chart.")}
          </article>
          <article class="panel analysis-panel">
            <div class="panel-head"><h2>Analyse</h2><span class="verdict-badge ${stock ? verdictClass(stock.analysis.score) : ""}">${stock ? stock.analysis.verdict : "Noch offen"}</span></div>
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
            <div class="panel-head"><h2>Pro Research</h2><span class="${state.user.plan === "pro" ? "pro-active" : "pro-locked"}">${state.user.plan === "pro" ? "Aktiv" : "Gesperrt"}</span></div>
            ${stock ? proTemplate(stock) : proEmptyTemplate()}
          </article>
        </section>
      </section>
    </main>
  `;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function suggestionsTemplate() {
  const historyTickers = new Set(state.history.map((h) => h.ticker));
  return `
    <div class="suggestions">
      ${state.suggestions.map((s) => `
        <button type="button" class="suggestion" data-ticker="${escapeHtml(s.ticker)}">
          ${logoImg(s, 34)}
          <span>
            <strong>${escapeHtml(s.name)}</strong>
            <small>${escapeHtml(s.ticker)} · ${escapeHtml(s.exchange)} · ${escapeHtml(s.country)}${historyTickers.has(s.ticker) ? " · <em class=\"history-hint\">Verlauf</em>" : ""}</small>
          </span>
          <em class="sector-chip">${escapeHtml(s.sector)}</em>
        </button>
      `).join("")}
    </div>
  `;
}

function companyTemplate(stock) {
  return `
    <div class="company">
      ${logoImg(stock, 72)}
      <div>
        <p class="eyebrow">${escapeHtml(stock.exchange)} · ${escapeHtml(stock.country)}</p>
        <h2>${escapeHtml(stock.name)}</h2>
        <p class="company-sub">${escapeHtml(stock.ticker)} · ${escapeHtml(stock.sector)} · ${escapeHtml(stock.industry)}</p>
        <p class="description-text">${escapeHtml(stock.description)}</p>
      </div>
    </div>
    <div class="price">
      <span>Mock-Kurs</span>
      <strong>${formatMoney(stock.price, stock.currency)}</strong>
      <em class="${stock.change >= 0 ? "positive" : "negative"}">${formatSigned(stock.change)} heute</em>
      <small>Mkt Cap: ${compact.format(stock.marketCap)}</small>
    </div>
  `;
}

function logoImg(stock, size) {
  const initial = stock.ticker ? stock.ticker[0] : "?";
  const src = escapeHtml(stock.logo || "");
  return `<img
    src="${src}"
    alt=""
    width="${size}" height="${size}"
    class="stock-logo"
    onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
  /><span class="logo-fallback" style="display:none;width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;">${escapeHtml(initial)}</span>`;
}

function emptyCompanyTemplate() {
  return `
    <div>
      <p class="eyebrow">Start</p>
      <h2>Tippe einen Namen oder Ticker ein.</h2>
      <p>Beim Tippen erscheinen Vorschlaege. Probiere: Apple, Tesla, SAP, NVDA, Bayer, BMW, Palantir, Shopify.</p>
    </div>
  `;
}

function analysisTemplate(stock) {
  const a = stock.analysis;
  const signals = buildSignals(stock);
  return `
    <div class="analysis-header">
      <div class="score ${verdictClass(a.score)}"><strong>${a.score}</strong><span>/100</span></div>
      <div class="signal-list">
        ${signals.map((s) => `<div class="signal signal-${escapeHtml(s.type)}"><span>${s.icon}</span>${escapeHtml(s.text)}</div>`).join("")}
      </div>
    </div>
    <div class="pillars">
      ${pillar("Wachstum", a.pillars.growth, "Umsatz & Gewinn")}
      ${pillar("Bewertung", a.pillars.valuation, "KGV, FCF")}
      ${pillar("Trend", a.pillars.trend, "Kurs-Momentum")}
      ${pillar("Risiko", a.pillars.risk, "Volatilitaet")}
    </div>
    <ul class="analysis-summary">
      ${a.summary.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
    </ul>
  `;
}

function buildSignals(stock) {
  const signals = [];
  const a = stock.analysis;
  if (a.score >= 76)       signals.push({ type: "positive", icon: "✦", text: "Premium Research-Profil" });
  else if (a.score >= 60)  signals.push({ type: "neutral",  icon: "◈", text: "Solide Watchlist-Kandidatin" });
  else                     signals.push({ type: "negative", icon: "▲", text: "Gemischtes Profil – pruefen" });

  if (stock.change >= 2)        signals.push({ type: "positive", icon: "↑", text: "+" + percent.format(stock.change) + "% Tagesperformance" });
  else if (stock.change <= -2)  signals.push({ type: "negative", icon: "↓", text: percent.format(stock.change) + "% Tagesperformance" });

  if (a.pillars.valuation >= 70)      signals.push({ type: "positive", icon: "◎", text: "Attraktive Bewertung" });
  else if (a.pillars.valuation <= 35) signals.push({ type: "negative", icon: "◎", text: "Hohe Bewertung (KGV)" });

  if (a.pillars.risk >= 65)      signals.push({ type: "positive", icon: "⊕", text: "Niedriges Risikoprofil" });
  else if (a.pillars.risk <= 30) signals.push({ type: "negative", icon: "⊕", text: "Hohes Risikoprofil" });

  return signals.slice(0, 4);
}

function proTemplate(stock) {
  if (state.user.plan !== "pro") {
    return `
      <p class="muted">Free-Nutzer sehen Basisdaten. Pro schaltet erweiterte Kennzahlen, groessere Watchlist und detailliertere Signale frei.</p>
      <div class="locked-grid">
        <span>Gross Margin</span><span>FCF Yield</span><span>Beta</span><span>Debt / Equity</span>
        <span>Analyst Score</span><span>Dividende</span>
      </div>
    `;
  }
  const m = stock.grossMargin;
  return `
    <div class="pro-grid">
      ${proMetric("Gross Margin", percent.format(m) + "%", m >= 50 ? "pro-good" : m < 30 ? "pro-warn" : "", m >= 50 ? "stark" : m < 30 ? "schwach" : "")}
      ${proMetric("FCF Yield",    percent.format(stock.fcfYield) + "%",    stock.fcfYield >= 4 ? "pro-good" : "", "")}
      ${proMetric("Beta",         String(stock.beta),                      stock.beta <= 1.1 ? "pro-good" : stock.beta >= 1.6 ? "pro-warn" : "", stock.beta <= 1.1 ? "defensiv" : stock.beta >= 1.6 ? "volatil" : "marktnahe")}
      ${proMetric("Analyst Score",percent.format(stock.analystScore) + "%",stock.analystScore >= 75 ? "pro-good" : "", "")}
      ${proMetric("Dividende",    percent.format(stock.dividendYield) + "%","", "")}
      ${proMetric("Debt / Equity",String(stock.debtToEquity),              stock.debtToEquity <= 0.5 ? "pro-good" : stock.debtToEquity >= 2 ? "pro-warn" : "", "")}
    </div>
    <div class="pro-context">
      <span class="eyebrow">Sektor</span><strong>${escapeHtml(stock.sector)}</strong>
      <span class="eyebrow" style="margin-top:6px">Branche</span><strong>${escapeHtml(stock.industry)}</strong>
    </div>
  `;
}

function proEmptyTemplate() {
  return `<p class="muted">Dein Account ist automatisch Pro. Suche eine Aktie, um alle Pro-Kennzahlen zu sehen.</p>`;
}

function metric(label, value, hint) {
  return `<article class="metric">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value))}</strong>
    <small>${escapeHtml(String(hint))}</small>
  </article>`;
}

function proMetric(label, value, cssClass, badge) {
  return `<div class="pro-metric-cell ${cssClass}">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value))}</strong>
    ${badge ? `<em class="pro-badge">${escapeHtml(badge)}</em>` : ""}
  </div>`;
}

function pillar(label, value, hint) {
  const cls = value >= 70 ? "pillar-high" : value >= 45 ? "pillar-mid" : "pillar-low";
  return `
    <div class="pillar">
      <div class="pillar-head">
        <span>${escapeHtml(label)}<small>${escapeHtml(hint)}</small></span>
        <strong class="${cls}">${value}/100</strong>
      </div>
      <progress value="${value}" max="100" class="${cls}"></progress>
    </div>
  `;
}

function listItem(stock) {
  return `<button class="list-item stock-open" data-ticker="${escapeHtml(stock.ticker)}">
    <strong>${escapeHtml(stock.ticker)}</strong>
    <span>${escapeHtml(stock.name)}</span>
  </button>`;
}

function historyItem(item) {
  return `<button class="list-item stock-open" data-ticker="${escapeHtml(item.ticker)}">
    <strong>${escapeHtml(item.query)}</strong>
    <span>${escapeHtml(item.name)}</span>
  </button>`;
}

function emptyState(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function verdictClass(score) {
  return score >= 76 ? "verdict-premium" : score >= 60 ? "verdict-solid" : "verdict-mixed";
}

function peLabel(pe) {
  if (pe <= 15) return "Guenstig bewertet";
  if (pe <= 25) return "Fair bewertet";
  if (pe <= 40) return "Wachstumspremium";
  return "Hoch bewertet";
}

// ─── Events ───────────────────────────────────────────────────────────────────

function bindEvents() {
  document.querySelector("#switch-auth")?.addEventListener("click", () => {
    state.view = state.view === "register" ? "login" : "register";
    state.error = "";
    render();
  });

  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document.querySelector("#logout")?.addEventListener("click", logout);

  // Search form — prevent page reload, call searchStock with input value
  document.querySelector("#search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.querySelector("#stock-query")?.value?.trim();
    if (q) searchStock(q);
  });

  const input = document.querySelector("#stock-query");
  if (input) {
    input.addEventListener("input", handleAutocomplete);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { state.suggestions = []; render(); }
    });
  }

  document.querySelector("#add-watchlist")?.addEventListener("click", addWatchlist);

  // Suggestion clicks — use mousedown so it fires before input blur
  document.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault(); // prevent input blur that would close dropdown first
      chooseSuggestion(btn.dataset.ticker);
    });
  });

  // Watchlist & history item clicks
  document.querySelectorAll(".stock-open").forEach((btn) => {
    btn.addEventListener("click", () => searchStock(btn.dataset.ticker));
  });

  // Chart timeframe buttons
  document.querySelectorAll(".timeframe-btn").forEach((btn) => {
    btn.addEventListener("click", () => changeTimeframe(btn.dataset.tf));
  });

  // Close suggestions on outside click — persistent, not once
  if (!outsideClickBound) {
    outsideClickBound = true;
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box") && state.suggestions.length) {
        state.suggestions = [];
        render();
      }
    });
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

async function logout() {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  state.user = null;
  state.view = "login";
  state.selectedStock = null;
  state.suggestions = [];
  state.error = "";
  outsideClickBound = false;
  saveLocalState();
  render();
}

// ─── Search ───────────────────────────────────────────────────────────────────

function handleAutocomplete(event) {
  const value = event.currentTarget.value.trim();
  state.query = value;
  clearTimeout(autocompleteTimer);
  if (value.length < 1) { state.suggestions = []; render(); return; }

  autocompleteTimer = setTimeout(async () => {
    try {
      const data = await api("/api/search?q=" + encodeURIComponent(value));
      // Boost history items to top
      const historyTickers = new Set(state.history.map((h) => h.ticker));
      const results = data.results || [];
      state.suggestions = [
        ...results.filter((s) => historyTickers.has(s.ticker)),
        ...results.filter((s) => !historyTickers.has(s.ticker))
      ];
      render();
      // Restore focus without re-triggering input event
      const input = document.querySelector("#stock-query");
      if (input && document.activeElement !== input) {
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    } catch {
      state.suggestions = [];
      render();
    }
  }, 180);
}

async function searchStock(query) {
  if (!query || !query.trim()) return;
  state.loading = true;
  state.error = "";
  state.query = query.trim();
  state.suggestions = [];
  render();
  try {
    const data = await api("/api/search?q=" + encodeURIComponent(state.query) + "&tf=" + state.chartTimeframe);
    const results = data.results || [];
    if (results.length === 0) {
      state.error = "Keine Aktie gefunden. Probiere einen anderen Namen oder Ticker.";
      state.selectedStock = null;
    } else {
      state.selectedStock = results[0];
      addHistory(state.query, results[0]);
      saveLocalState();
    }
  } catch (error) {
    state.selectedStock = null;
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function chooseSuggestion(ticker) {
  const stock = state.suggestions.find((s) => s.ticker === ticker);
  if (!stock) return;
  state.query = stock.ticker;
  state.selectedStock = stock;
  state.suggestions = [];
  addHistory(stock.ticker, stock);
  saveLocalState();
  render();
}

async function changeTimeframe(tf) {
  if (state.chartTimeframe === tf) return;
  state.chartTimeframe = tf;
  if (!state.selectedStock) { render(); return; }
  try {
    const data = await api("/api/search?q=" + encodeURIComponent(state.selectedStock.ticker) + "&tf=" + tf);
    const results = data.results || [];
    if (results.length > 0) state.selectedStock = results[0];
  } catch { /* keep current stock */ }
  render();
}

function addWatchlist() {
  if (!state.selectedStock) return;
  if (state.watchlist.some((s) => s.ticker === state.selectedStock.ticker)) return;
  const plan = currentPlan();
  if (state.watchlist.length >= plan.watchlistLimit) {
    state.error = "Limit erreicht: maximal " + plan.watchlistLimit + " Watchlist-Eintraege.";
    render();
    return;
  }
  state.watchlist.unshift(state.selectedStock);
  saveLocalState();
  render();
}

// ─── API ──────────────────────────────────────────────────────────────────────

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

// ─── Chart ────────────────────────────────────────────────────────────────────

function drawChart(points) {
  const canvas = document.querySelector("#chart");
  const shell = document.querySelector(".chart-shell");
  if (!canvas || !shell || !points || !points.length) return;

  const rect = shell.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = Math.max(320, rect.width);
  const cssHeight = Math.max(260, rect.height);
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const w = cssWidth, h = cssHeight;
  const pad = { top: 24, right: 20, bottom: 38, left: 62 };
  const min = Math.min.apply(null, points);
  const max = Math.max.apply(null, points);
  const range = Math.max(1, max - min);

  ctx.fillStyle = "#0d131c";
  ctx.fillRect(0, 0, w, h);

  // Grid + Y-labels
  ctx.strokeStyle = "rgba(148,163,184,.12)";
  ctx.fillStyle = "rgba(148,163,184,.65)";
  ctx.font = "11px Inter, system-ui, sans-serif";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i * (h - pad.top - pad.bottom)) / 4;
    const val = max - (i * range) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(val > 100 ? val.toFixed(0) : val.toFixed(1), 6, y + 4);
  }

  // X-axis labels
  const xLabels = {
    "1W": ["Mo","Di","Mi","Do","Fr","Sa","So"],
    "1M": ["W1","W2","W3","W4"],
    "3M": ["M1","M2","M3"],
    "6M": ["M1","M2","M3","M4","M5","M6"],
    "1Y": ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
    "5Y": ["Y1","Y2","Y3","Y4","Y5"],
    "MAX": ["2019","2020","2021","2022","2023","2024","2025"]
  };
  const labels = xLabels[state.chartTimeframe];
  if (labels) {
    ctx.fillStyle = "rgba(148,163,184,.5)";
    ctx.font = "10px Inter, system-ui, sans-serif";
    labels.forEach((lbl, i) => {
      const x = pad.left + (i / (labels.length - 1)) * (w - pad.left - pad.right);
      ctx.fillText(lbl, x - 8, h - 10);
    });
  }

  const coords = points.map((p, i) => ({
    x: pad.left + i * (w - pad.left - pad.right) / (points.length - 1),
    y: h - pad.bottom - ((p - min) / range) * (h - pad.top - pad.bottom)
  }));

  const isUp = points[points.length - 1] >= points[0];
  const colorA = isUp ? "#22c55e" : "#fb7185";
  const colorB = isUp ? "#38bdf8" : "#f59e0b";

  // Area fill
  const area = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  area.addColorStop(0, isUp ? "rgba(34,197,94,.2)" : "rgba(251,113,133,.16)");
  area.addColorStop(1, "rgba(13,19,28,.01)");
  ctx.beginPath();
  coords.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(w - pad.right, h - pad.bottom);
  ctx.lineTo(pad.left, h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  // Line
  const line = ctx.createLinearGradient(pad.left, 0, w - pad.right, 0);
  line.addColorStop(0, colorB);
  line.addColorStop(1, colorA);
  ctx.beginPath();
  coords.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Last dot
  const last = coords[coords.length - 1];
  ctx.fillStyle = colorA;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d131c";
  ctx.beginPath();
  ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// ─── State helpers ────────────────────────────────────────────────────────────

function addHistory(query, stock) {
  if (!stock) return;
  const limit = currentPlan().historyLimit;
  state.history = [
    { query, ticker: stock.ticker, name: stock.name },
    ...state.history.filter((h) => h.ticker !== stock.ticker)
  ].slice(0, limit);
}

function currentPlan() {
  return planRules[state.user && state.user.plan === "pro" ? "pro" : "free"];
}

function loadLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    Object.assign(state, {
      user: saved.user || null,
      view: saved.user ? "dashboard" : "login",
      watchlist: saved.watchlist || [],
      history: saved.history || [],
      chartTimeframe: saved.chartTimeframe || "1M"
    });
  } catch { /* ignore */ }
}

function saveLocalState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      user: state.user,
      watchlist: state.watchlist,
      history: state.history,
      chartTimeframe: state.chartTimeframe
    }));
  } catch { /* ignore */ }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatMoney(value, currency) {
  if (!moneyFormatters.has(currency)) {
    moneyFormatters.set(currency, new Intl.NumberFormat("de-DE", { style: "currency", currency }));
  }
  return moneyFormatters.get(currency).format(value);
}

function formatSigned(value) {
  return (value >= 0 ? "+" : "") + percent.format(value) + "%";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
