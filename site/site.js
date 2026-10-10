/* State of MCP report site — data + rendering. Vanilla JS, no dependencies.
   To publish a new edition: add an entry at the TOP of EDITIONS and drop the
   PDF link in. Everything else (index cards, report pages) renders from here. */

const EDITIONS = [
  {
    id: "edition-2",
    version: "2.0",
    title: "The State of the Model Context Protocol — Edition 2",
    short: "Edition 2",
    asOf: "2026-10-09",
    dateLabel: "October 9, 2026",
    pages: 27,
    sources: 169,
    status: "current",
    gradWord: "measured.",
    lead:
      "Twenty-three months in, the protocol layer has settled — and everything interesting moved up the stack. The stateless 2026-07-28 spec holds on a firm six-month cadence; the registry crossed 41,000 servers while still labeled preview; one foundation now hosts the whole agentic stack; and security finally got measured the way production software gets measured.",
    summary:
      "MCP is the default answer at the agent-to-tools boundary. The 2026-07-28 stateless specification remains the latest revision, with the next release locked for December 15, 2026. The official MCP Registry — still carrying its preview banner — holds 41,183 latest-version servers per this edition's own census (40,676 active / 507 deprecated), roughly 20× growth in ten months, with September 2026 the largest month ever. The Agentic AI Foundation under the Linux Foundation hosts six projects — MCP, goose, AGENTS.md, agentgateway, A2A, and Agent Router — and launched the MCPA certification. Rust and Ruby SDKs were promoted to Tier 1 (ten official SDKs in all), with Tier-1 downloads near half a billion a month. Consumer Google opened up (Spark custom MCP apps, Workspace connectors, Gemini Enterprise GA), OpenAI shipped MCP Events support ahead of ratification, and Atlassian's AMP layers governance on top of MCP + A2A. The IETF moved toward chartering agent-protocol work (agentproto).",
    highlights: [
      ["41,183-server registry", "own census of the official API (412 pages), independently replicated during review at 41,211 — same-day drift; still no GA"],
      ["Firm release cadence", "December 15, 2026 next, \u201cno slipping\u201d; SEP-3398 formalizes the cycle (end-of-March / end-of-September thereafter)"],
      ["Foundation consolidation", "AAIF hosts MCP + A2A + agentgateway + Agent Router; MCPA certification launched 2026-09-14"],
      ["Security industrialized", "285 CVEs against 149 projects in 2026; LiteLLM twice on CISA KEV; CVSS 10.0 in mcp-atlassian; \u201cprotocol pivoting\u201d named as a new attack class"],
      ["Rust + Ruby reach Tier 1", "ten official SDKs; TS v2 split packages carry 2026-07-28 support while v1 remains the installed base"],
      ["The frontier moved up", "OpenAI shipped MCP Events ahead of the SEP; Atlassian's AMP layers governance atop MCP + A2A; IETF agentproto chartering"],
    ],
    verification: [
      "Adversarial review re-fetched ~50 sources and independently replicated the registry census: 41,211 (40,704 active / 507 deprecated, 413 pages) vs the paper's 41,183 — same-day drift, methodology matched.",
      "CISA KEV feed, GitHub release metadata, and the official changelog audited directly.",
      "Verdict: PASS WITH NOTES — 0 fatal, 4 major, all fixed (a false \u201cfirst KEV entry\u201d claim, a growth-percentage error, a stale vendor-gateway characterization, a survey cohort mislabel).",
    ],
    pdf: "https://raw.githubusercontent.com/dspachos/state-of-mcp-report/main/state-of-mcp-whitepaper.pdf",
    pdfFile: "state-of-mcp-whitepaper.pdf",
  },
  {
    id: "edition-1",
    version: "1.1",
    title: "The State of the Model Context Protocol — Edition 1",
    short: "Edition 1.1",
    asOf: "2026-08-25",
    dateLabel: "August 25, 2026",
    pages: 25,
    sources: 123,
    status: "superseded",
    gradWord: "explained.",
    lead:
      "The first assessment: MCP after its first twenty-one months, from promising standard to load-bearing infrastructure — the backward-incompatible stateless rewrite, the handover to the Linux Foundation, and the full map of who actually supports it.",
    summary:
      "A source-verified white paper covering the 2026-07-28 stateless rewrite (no initialization handshake, no session IDs), the donation of MCP to the Agentic AI Foundation, the complete support matrix across desktop apps, IDEs, the OS layer, web apps, APIs, and headless SDKs, ecosystem numbers that disagree by methodology (reported side by side, never averaged), and a security posture that depends on implementation discipline more than on the spec.",
    highlights: [
      ["Stateless core", "the 2026-07-28 rewrite removes sessions and the handshake; MRTR and subscriptions/listen replace server-initiated requests"],
      ["Foundation handover", "donated to the Agentic AI Foundation (Linux Foundation) on 2025-12-09 by Anthropic, with Block and OpenAI as co-founders"],
      ["Support matrix", "native MCP across desktop, IDEs, Windows OS layer (preview), web platforms, APIs, and SDKs"],
      ["Ecosystem counts", "directory totals conflict by methodology — reported side by side, never averaged"],
    ],
    verification: [
      "Adversarial review independently re-fetched 30 of 123 sources; all load-bearing claims matched.",
      "12 corrections applied and itemized in the paper's verification-adjustments section.",
      "Superseded by Edition 2 (2026-10-09); retained for reference.",
    ],
    pdf: "https://raw.githubusercontent.com/dspachos/state-of-mcp-report/main/editions/state-of-mcp-whitepaper-v1.1-2026-08-25.pdf",
    pdfFile: "state-of-mcp-whitepaper-v1.1-2026-08-25.pdf",
  },
];

/* ── helpers ─────────────────────────────────────────────── */

function el(id) {
  return document.getElementById(id);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function statusChip(status) {
  if (status === "current") return '<span class="chip chip-current">● current edition</span>';
  return '<span class="chip">○ superseded</span>';
}

function currentEdition() {
  return EDITIONS.find((e) => e.status === "current") || EDITIONS[0];
}

/* ── index page ──────────────────────────────────────────── */

function renderIndex() {
  const cur = currentEdition();

  el("hero-badge").innerHTML = `<b>EDITION ${esc(cur.version)}</b> ${esc(cur.dateLabel)} →`;
  el("hero-badge").href = "report.html?id=" + cur.id;
  el("hero-read").href = "report.html?id=" + cur.id;
  el("hero-lead").textContent = cur.lead;
  el("hero-facts").innerHTML = [
    `${cur.sources} sources (edition ${cur.version})`,
    "every URL checked",
    "numbers independently replicated",
    "adversarial review per edition",
  ]
    .map((f) => `<span>${esc(f)}</span>`)
    .join("");

  el("reports").innerHTML = EDITIONS.map(
    (e) => `
    <article class="report-card ${e.status === "current" ? "current" : ""}">
      <div class="flex flex-wrap items-center gap-2.5 mb-4">
        <code class="!bg-transparent !border-0 !p-0 text-[var(--brand)]">v${esc(e.version)}</code>
        ${statusChip(e.status)}
        <span class="chip">${esc(e.dateLabel)}</span>
        <span class="chip">${e.pages} pages</span>
        <span class="chip">${e.sources} sources</span>
      </div>
      <h3 class="text-lg mb-2.5"><a class="!text-[var(--text)]" href="report.html?id=${esc(e.id)}">${esc(e.title)}</a></h3>
      <p class="text-[13.5px] mb-6">${esc(e.lead)}</p>
      <div class="flex flex-wrap gap-3">
        <a class="btn btn-sm btn-primary" href="report.html?id=${esc(e.id)}">Report page</a>
        <a class="btn btn-sm" href="${esc(e.pdf)}">PDF ↓</a>
      </div>
    </article>`
  ).join("");
}

/* ── report page ─────────────────────────────────────────── */

function renderReport() {
  const id = new URLSearchParams(location.search).get("id");
  const e = EDITIONS.find((x) => x.id === id);

  if (!e) {
    el("page-main").innerHTML = `
      <div class="wrap py-24 text-center">
        <span class="kicker">// 404</span>
        <h1 class="text-4xl mb-4">No such report.</h1>
        <p class="mb-8">The id in the URL does not match any edition.</p>
        <a class="btn btn-primary" href="index.html">All editions</a>
      </div>`;
    return;
  }

  document.title = e.title;
  el("rep-version").textContent = "v" + e.version;
  el("rep-title").textContent = e.title;
  el("rep-meta").innerHTML = [
    statusChip(e.status),
    `<span class="chip">as of ${esc(e.asOf)}</span>`,
    `<span class="chip">${e.pages} pages · A4 · two-column</span>`,
    `<span class="chip">${e.sources} cited sources</span>`,
  ].join("");
  el("rep-lead").textContent = e.lead;
  el("rep-summary").textContent = e.summary;
  el("rep-highlights").innerHTML = e.highlights
    .map(
      ([h, d]) => `
      <article class="report-card">
        <code class="!bg-transparent !border-0 !p-0 text-[var(--brand)] block mb-3.5">${esc(h)}</code>
        <p class="text-[13.5px]">${esc(d)}</p>
      </article>`
    )
    .join("");
  el("rep-verification").innerHTML = e.verification
    .map((v) => `<li>${esc(v)}</li>`)
    .join("");
  el("rep-pdf").href = e.pdf;
  el("rep-url").textContent = e.pdf;
  const c = el("rep-copy");
  c.dataset.copy = e.pdf;
  el("rep-status-note").innerHTML =
    e.status === "superseded"
      ? `<span class="chip">superseded by edition 2</span> <a href="report.html?id=edition-2">read the current edition →</a>`
      : `<span class="chip chip-ok">■ latest verified edition</span>`;
}

/* ── copy buttons ────────────────────────────────────────── */

function wireCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = btn.dataset.copy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const old = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("done");
      }, 1200);
    });
  });
}
