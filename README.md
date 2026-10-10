# The State of the Model Context Protocol

**A source-verified white paper · October 2026 · Edition 2**

[![Read the white paper (PDF)](https://img.shields.io/badge/Read-white_paper_PDF-1B365D?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://github.com/dspachos/state-of-mcp-report/blob/main/state-of-mcp-whitepaper.pdf)

**[Direct download (raw PDF, 780 KB)](https://raw.githubusercontent.com/dspachos/state-of-mcp-report/main/state-of-mcp-whitepaper.pdf)** — or use the *Download raw file* button on the viewer page.

**27 pages · two-column · 169 cited sources** — every URL fetched and checked on 2026-10-09. Edition 1 (August 2026) remains available in git history.

> Twenty-three months in, the protocol wars are over: MCP is the settled answer at the agent-to-tools boundary. This edition covers the stateless `2026-07-28` spec on its new metronome (next release: December 15, 2026), a foundation that now hosts the whole agentic stack and certifies competence in it, a still-"preview" registry holding 41,000+ servers, SDK downloads near half a billion a month, a security picture that finally industrialized (285 CVEs, CISA KEV entries, fix-propagation failures), and the fragmentation that moved up the stack instead of away.

**How it was made:** four parallel research passes (each with a "delta since the previous edition" section), lead synthesis, a citation-verification pass (167 sources, zero orphan citations, 11 corrections), and an adversarial review that re-fetched ~50 sources, **independently replicated the registry census (41,211 vs the paper's 41,183 — same-day drift)**, audited the CISA KEV feed, and parsed the adoption survey PDF earlier editions couldn't. Verdict: **PASS WITH NOTES — 0 fatal, 4 major, all fixed** (a false "first CISA KEV entry" claim, a growth-percentage arithmetic error, a stale vendor-gateway characterization, and a survey cohort mislabel). Residual limitations are stated inline and in the provenance notes.

---

## 1. Executive Summary

Twenty-three months after Anthropic open-sourced the Model Context Protocol, MCP is no longer a promising experiment; it is the default answer to "how does an agent talk to my product" — and the center of gravity of a formalized, foundation-governed, standards-track ecosystem [6, 7].

The headline numbers, all as of 2026-10-09:

- **Specification:** `2026-07-28` remains the latest revision [1, 3]. It made the protocol stateless (no `initialize` handshake, no `Mcp-Session-Id`), added Multi Round-Trip Requests (MRTR) and `subscriptions/listen` [2, 162], deprecated Roots, Sampling, Logging, and OAuth Dynamic Client Registration, and formalized the extensions framework [2]. Nothing has shipped since; the draft changelog for the next revision is empty [3]. The maintainers have committed to a firm six-month cadence: **December 15, 2026**, then June 15 [5].
- **Governance:** MCP is hosted by the **Agentic AI Foundation (AAIF)**, a directed fund under the Linux Foundation (donated 2025-12-09 by Anthropic, co-founded with Block and OpenAI) [6, 7, 53]. AAIF now hosts six projects — MCP, goose, AGENTS.md, agentgateway, A2A, and Agent Router [8] — and launched its first certification, **MCPA**, on 2026-09-14 [9].
- **Scale:** The official MCP Registry — still labeled **preview** [100] — contains **41,183 unique latest-version servers** (40,676 active / 507 deprecated) per this edition's own same-day census of the registry API (412 pages) [10]. Independent censuses in the same week read 39,492–40,965 [11, 12, 13]. The registry passed 40,000 on 2026-10-08 [13]; September 2026 was its largest month ever [13, 11, 12]; it held "close to two thousand" entries in November 2025 [12] — roughly **20× growth in ten months**.
- **Adoption:** Tier-1 SDK downloads are running at roughly **475–545 million per month** [11, 12] (official: "close to half a billion" [4]; TypeScript ~75M/week, Python ~60.9M/week [13]). Every large AI platform now ships MCP support: Claude [14], ChatGPT [15, 16], Microsoft Copilot (consumer to US Government clouds) [17, 18, 82], Google Gemini (consumer Spark [19, 20], Workspace [21], Enterprise [22]), AWS Bedrock AgentCore [23], Cloudflare [24, 30], plus every major IDE [83, 85, 86].
- **Security:** the threat picture escalated sharply in Aug–Oct 2026: 285 CVEs against 149 open-source MCP projects in 2026 with documented fix-propagation failures [25]; MCP projects are now on CISA's Known Exploited Vulnerabilities catalog — LiteLLM alone appears twice (CVE-2026-42271, command injection, added 2026-06-08 [169]; CVE-2026-59822, improper authentication, added 2026-09-02 alongside Starlette CVE-2026-48710 [26, 169]); a CVSS 10.0 in mcp-atlassian [27]; a newly named cross-protocol attack class ("protocol pivoting") with SSRF fixes at Google, Weaviate, and two government organizations [28]; and three auth bugs in thirty days in the SDK/gateway layer [29].
- **Direction:** consolidation at the protocol core (one foundation [8], one certification [9], one packaging standard above MCP in Agent Plugins [32, 33]) while fragmentation moved up the stack (state management [166], UI extension layers like Atlassian's AMP [39, 41], OpenAI's ChatGPT-specific extensions [35]) and out to the IETF (the proposed **agentproto** working group [36, 37]). No vendor deprecation of MCP was found; the platform vendors cited above all shipped MCP-based features in this window [17, 24, 38, 123].

**The one-sentence verdict:** the protocol layer has effectively been settled in MCP's favor; the open battlegrounds are now trust (auth, identity, supply-chain integrity), operations (gateway/management planes), and the layers immediately above the protocol.

---

## 2. What Changed Since Edition 1 (2026-08-25)

For readers of the first edition, the delta in one page:

1. **No new spec revision.** `2026-07-28` remains current [1, 3]; the next release is scheduled for December 15, 2026, on a newly firm six-month cadence [5].
2. **The official registry grew ≈70%** in about six weeks (24,240 distinct servers on 2026-08-22 per a third-party census [169] → 41,183 latest-version entries on 2026-10-09 per this edition's own census [10]) and passed 40,000 on 2026-10-08 [13]. It is still in preview; no GA [100, 101].
3. **Rust and Ruby SDKs were promoted to Tier 1** [124] (both were Tier 2 at the 2026-07-28 matrix [11]); the TypeScript SDK's 2026-07-28 support ships as new v2 split packages while the v1 package (still the most-installed) targets `2025-11-25` [11, 43].
4. **Security escalation:** CISA KEV listings (LiteLLM, Starlette) [26], CVSS 10.0 (mcp-atlassian) [27], the 285-CVE propagation study [25], "protocol pivoting" as a named attack class [28], and three SDK/gateway auth bugs in 30 days [29].
5. **OpenAI DevDay 2026 (Sept 29):** Plugin Extensions, organic plugin discovery, and **MCP Events support** [45, 46, 47, 48] — a partial (webhook-only) implementation of a still-unratified draft spec [49], a shipping-ahead-of-spec first for the ecosystem.
6. **AAIF consolidation completed:** A2A joined as a hosted project [31]; agentgateway and Agent Router added [8]; MCPA certification launched (2026-09-14) [9].
7. **IETF movement:** the **agentproto** working-group-forming BoF at IETF 126 (July 23) voted 154–51 to form a WG (while rejecting the initial scope 38–124) [36]; a proposed charter was updated 2026-09-15 and is in internal chartering review [37].
8. **Google's consumer surfaces opened up:** Gemini Spark custom MCP-connected apps (US-restricted rollout) [19], built-in MCP connections (Canva, OpenTable, Instacart) [20], and Gemini-in-Workspace third-party MCP connectors (Sept 2026) [21]. The edition-1 Gemini Enterprise GA-vs-preview conflict resolves to **GA** (release-notes entry dated 2026-08-07) [22].
9. **Atlassian announced AMP** (Oct 6–7), an explicitly non-competing "human-agent collaboration" layer built on MCP + A2A [38, 39, 40] — the clearest example of consolidation moving up the stack.
10. **Market consolidation:** Arcade.dev acquired Smithery (2026-08-05) [51]; Snowflake agreed to acquire Natoma [12]; ~$211M of disclosed funding into the MCP gateway/security category [11].
11. **Cloudflare deprecated `McpAgent`** (2026-08-06) [24] — the first major vendor retirement caused directly by the stateless `2026-07-28` spec.
12. **Windsurf was renamed Devin Desktop** (June 2026, Cognition) [52]; ChatGPT's app directory became the **Plugins Directory** (2026-07-09) [15] and developer mode reached Pro/Plus self-serve [16].

---

## 3. History and Governance

### 3.1 Timeline of milestones

| Date | Milestone |
|---|---|
| 2024-11-05 | MCP launched (open-sourced by Anthropic); first spec revision [6, 7] |
| 2025-03-26 | Spec revision (transports, annotations era) [1] |
| 2025-06-18 | Spec revision (structured tool output, elicitation, auth hardening) [1] |
| 2025-09-08 | Official MCP Registry enters preview (registry.modelcontextprotocol.io) [99] |
| 2025-09-16 | GitHub MCP Registry launches (curated front-end) [59] |
| 2025-10-24 | Registry API frozen at v0.1 [102] |
| 2025-11-25 | Spec revision (icons, OIDC discovery, URL-mode elicitation, CIMD introduced, experimental tasks) [60] |
| 2025-12-09 | Anthropic donates MCP to the **Agentic AI Foundation** (Linux Foundation directed fund; co-founders Anthropic, Block, OpenAI) [6, 53, 7] |
| 2026-01-26 | **MCP Apps** (`io.modelcontextprotocol/ui`) stable — first official extension [54, 55] |
| 2026-03-12 | A2A ships v1.0.0 (production-ready) [56] |
| 2026-04-27 | Tasks extension (SEP-2663) reaches Final [57] |
| 2026-05-21 | `2026-07-28` release candidate locked [4] |
| 2026-06-18 | Enterprise-Managed Authorization promoted to stable [58] |
| 2026-06-26 | WebSocket transport SEP-1288 closed as dormant [163] |
| 2026-07-09 | ChatGPT Plugins Directory replaces the app directory [15] |
| 2026-07-23 | GitHub MCP Server ships `2026-07-28` support [61]; IETF 126 agentproto BoF votes to form a WG [36] |
| 2026-07-28 | **Spec `2026-07-28` GA** (stateless core, MRTR, subscriptions, extensions framework) [1, 2]; TypeScript SDK v2.0.0 ships a day early [43] |
| 2026-08-05/06 | Arcade.dev acquires Smithery [51]; Cloudflare deprecates `McpAgent` [24]; A2A joins AAIF (AAIF blog undated; edition-1 press date 2026-08-17) [31] |
| 2026-08-12 | Core Maintainers set a **firm six-month release cadence** (Dec 15 / Jun 15) [5] |
| 2026-08-22 | "The New MCP Roadmap" — five priority areas [65] |
| 2026-09-02 | LiteLLM MCP auth bypass (CVE-2026-59822) added to CISA KEV [26] |
| 2026-09-14 | AAIF launches **MCPA** certification (aligned to `2026-07-28`) [9] |
| 2026-09-29 | OpenAI DevDay 2026: Plugin Extensions; MCP Events support (proposed draft) [45, 46] |
| 2026-10-06/07 | Atlassian announces AMP (layer atop MCP + A2A) [38, 39] |
| 2026-10-08/09 | Official registry passes 40,000 [13]; this edition's census reads 41,183 [10] |

### 3.2 Governance model

MCP is established as "Model Context Protocol, a Series of LF Projects, LLC"; code and spec under Apache 2.0, documentation under CC BY 4.0 [62]. Technical authority is hierarchical and individual-based: **Lead Maintainers** (BDFL role) — currently **David Soria Parra and Den Delimarsky** — over **Core Maintainers** (Peter Alexander, Caitie McCaffrey, Kurtis Van Gent, Clare Liguori, Paul Carleton, Nick Cooper), Maintainers, and Contributors, with a formal Contributor Ladder [62]. Justin Spahr-Summers (co-inventor) is Lead Maintainer Emeritus [62]. Decisions flow through the SEP (Specification Enhancement Proposal) process; Working Groups triage SEPs in their own areas; the Core Maintainers meet bi-weekly, and their meeting notes are public GitHub discussions [62, 5].

The AAIF division of authority is unchanged since donation: the AAIF Governing Board handles strategic investments, budget, and approval of new projects; individual projects keep "full autonomy over their technical direction and day-to-day operations" [53]. AAIF's project roster is now six: MCP, goose, AGENTS.md, agentgateway, A2A, Agent Router [8] — note that AAIF's September 2026 certification press release describes all six as "founding projects," which is marketing shorthand; only the first three were founding projects at the December 2025 launch [9, 7].

---

## 4. The Current Specification (2026-07-28)

The TypeScript schema is the source of truth; JSON Schema is generated from it [63]. Nothing has shipped since `2026-07-28`: the releases page shows no newer tag, and the draft (next-revision) changelog is empty as of 2026-10-09 [1, 3].

### 4.1 The stateless core

The defining break of `2026-07-28`: **protocol-level sessions are gone** [2]. The `initialize`/`notifications/initialized` handshake and the `Mcp-Session-Id` header were removed; every request now carries its protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`) [2]. A new mandatory `server/discover` RPC lets clients advertise-and-probe supported versions and identity up front; a version mismatch returns `UnsupportedProtocolVersionError` [2]. Cross-call state survives only as explicit server-minted handles — and the spec's security guidance is explicit that possession of a handle must not be treated as authentication (the new "state handle hijacking" class) [64]. Ping, `logging/setLevel`, `notifications/roots/list_changed`, SSE-stream resumability (`Last-Event-ID`), and standalone GET streams were all removed; log level moved to per-request `_meta` [2].

The consequences are visible across the industry: remote MCP servers became "normal HTTP workloads" (the roadmap's words) [65] — cacheable, load-balanced, gateway-routable — and the first big casualty was Cloudflare's stateful `McpAgent` primitive, deprecated and feature-frozen on 2026-08-06 precisely because the stateless spec removed the need [24].

### 4.2 Primitives, and what got deprecated

Server primitives remain **tools, resources, and prompts** [2]. Tools carry `structuredContent`; as of this revision `inputSchema`/`outputSchema` accept full JSON Schema 2020-12 and `structuredContent` accepts any JSON value [2]. Every result now has a required `resultType` (`"complete"` / `"input_required"`), and list/read results carry `ttlMs`/`cacheScope` so clients can cache catalogs deterministically [2].

Server-initiated interaction became **MRTR** (Multi Round-Trip Requests): a server returns `InputRequiredResult` with input requests; the client retries the original request with input responses [2, 162]. This subsumes URL-mode elicitation's completion notifications and replaces server-initiated requests [2].

**Deprecated (≥12-month lifecycle window, per the new feature-lifecycle policy SEP-2596) [2]:** Roots, Sampling, and Logging as client features (SEP-2577 — with migration guidance toward tool parameters, direct LLM APIs, and stderr/OpenTelemetry respectively) [2]; the HTTP+SSE transport [2]; `includeContext` values `"thisServer"`/`"allServers"` [2]; and OAuth 2.0 Dynamic Client Registration in favor of Client ID Metadata Documents (CIMD) [2]. **Tasks moved out of core** into the official `io.modelcontextprotocol/tasks` extension (polling via `tasks/get`, mid-flight input via `tasks/update`; `tasks/list` removed) [2].

A reported conflict worth noting: the release blog narrates a ~12-month ("year-long") offramp for HTTP+SSE [4], while secondary reading of the normative deprecated-features registry gives roughly three months after the deprecation policy reaches Final [160]. We report both; the discrepancy is unresolved in primary sources.

### 4.3 Transports

Exactly two standard transports ship: **stdio** (local) and **Streamable HTTP** (remote), now hardened with required `Mcp-Method`/`Mcp-Name` routing headers (SEP-2243) plus `x-mcp-header` custom headers [2, 67]. WebSocket is **not** a standard transport and its SEP (1288) was closed dormant on 2026-06-26 after stalling — browser WebSocket auth limitations were the principal concern raised during review [163] — yet first-party opt-in support exists in the wild (Claude Code documents `type: "ws"` servers [68]; Microsoft Agent Framework Python ships `MCPWebsocketTool` [69]; LangChain removed its WebSocket class [70]). No IPC transport proposal exists (absence verified across the SEP index and roadmap, not exhaustively) [57, 66]. The roadmap's destination is **one transport**: Streamable HTTP, potentially HTTP/2, spoken over stdio for local servers [65, 66].

### 4.4 Authorization

OAuth 2.1 lineage, tightened: RFC 9207 `iss` validation is mandatory before code redemption; `application_type` is required in DCR; client credentials are issuer-bound; and DCR itself is deprecated in favor of **CIMD** (client identity published at an HTTPS `/.well-known` URL) [2]. Server-sent `WWW-Authenticate` scope challenges arrived in the SDK layer (TypeScript 2.1.0 wave, September 2026; secondary reporting) [71]. The roadmap commits to **DPoP (RFC 9449)** finalization, Workload Identity Federation (SEP-1933), ID-JAG via Enterprise-Managed Authorization, and RFC 8693 token exchange, coordinated with IETF OAuth and WIMSE [65, 66] — the "agent identity" problem is now the roadmap's third priority area [66].

### 4.5 The extensions framework

`2026-07-28` made extensions first-class (SEP-2133): an `extensions` capability field, reverse-DNS identifiers, opt-in negotiation on every request, independent evolution, and incubation in `experimental-ext-*` repositories [2, 167]. The official extensions as of 2026-10-09:

| Extension | ID | Status | Notes |
|---|---|---|---|
| MCP Apps | `io.modelcontextprotocol/ui` | Stable (2026-01-26) [54, 55] | Interactive HTML UI in `ui://` resources; supported by Claude, ChatGPT, M365 Copilot, Goose, VS Code [54, 17]; OpenAI's Apps SDK is migrating onto it [35] |
| Tasks | `io.modelcontextprotocol/tasks` | Final (SEP-2663, 2026-04-27) [57] | Server-directed async work; roadmap targets eventual core inclusion [66] |
| Enterprise-Managed Authorization | `io.modelcontextprotocol/enterprise-managed-authorization` | Stable (2026-06-18) [58] | ID-JAG via enterprise IdP; adopters: Anthropic, Microsoft, Okta (first IdP); servers Asana, Atlassian, Canva, Figma, Linear, Supabase [58] |
| OAuth Client Credentials | `io.modelcontextprotocol/oauth-client-credentials` | Official [167] | Machine-to-machine auth |
| Skills over MCP | ext-skills | Official [167] | Discover/read Agent Skills as MCP resources |

The **Skills extension SEP (2640)** is listed as Final in the SEP index (dated 2026-04-23 there) [57]; secondary reporting covered its announcement in September 2026 [72]. Also distinct and official-adjacent: **Server Cards** (SEP-2127) — static `.well-known` metadata for remote servers, separate from Registry `server.json` [73].

---

## 5. What Is Supported, and Where

### 5.1 Desktop applications

| Product | MCP support | Transports | Status |
|---|---|---|---|
| Claude (claude.ai/Desktop/Cowork/mobile) | Client — custom connectors to remote servers, brokered from Anthropic's cloud [14] | Streamable HTTP; legacy SSE via `/sse` URLs [14] | GA; connectors on Free (limit 1) through Enterprise [14] |
| Claude Desktop (local) | Client — local servers via Desktop Extensions (`.mcpb`) or config [74] | stdio | GA [74] |
| Claude Desktop on 3P | Admin-managed `managedMcpServers`, org plugins, per-tool policy; built-in M365/web-search/GitHub (beta) servers [75] | stdio + remote [75] | Documented GA [75] |
| Claude Code | Client **and** server (`claude mcp serve`) [68] | stdio, http, sse, ws (non-spec), sdk [68] | GA [68] |
| ChatGPT (apps/plugins) | Client — MCP-based apps; Plugins Directory (since 2026-07-09) [15] | Remote only (streaming HTTP + SSE) [16] | Apps GA; full-MCP developer mode self-serve for Pro/Plus [16], beta for Business/Enterprise/Edu [77] |
| M365 Copilot | Client — MCP servers as plugins with **MCP Apps widgets** [17]; OAuth 2.1 + Entra SSO [17] | Remote (Streamable) [17] | Shipped WW Feb–Mar 2026 [80, 79] |
| Copilot Studio | Client — MCP wizard, prebuilt connectors, Agents 365 BYO MCP, MCP management server (preview) [18, 81] | **Streamable only** (SSE dropped post-Aug 2025) [18] | GA; new flow + mgmt server preview [18, 81] |
| Gemini consumer (Spark) | Client — custom MCP-connected apps (US, 18+, English; configured on web, usable on mobile) [19]; built-in Canva/OpenTable/Instacart connections [20] | Remote [19] | Restricted rollout [19] |

Notes: Claude's custom connectors run through Anthropic's cloud even on desktop; users on managed Claude Desktop deployments cannot add their own servers [14, 75]. ChatGPT's developer-mode scope differs between its developer docs (Pro/Plus/Business/Enterprise/Education on web [16]) and its consumer help center (beta for Business/Enterprise/Edu, with Pro/Plus described as read-only connector access) [77] — a live doc-vs-doc discrepancy. No ChatGPT desktop-app MCP parity is documented (absence of documentation, not proof of absence) [15].

### 5.2 IDEs and editors (all GA unless noted)

| IDE | MCP support | Transports | Notes |
|---|---|---|---|
| VS Code (+ Copilot) | Client; spec `2025-11-25` support; MCP Apps; sandboxed local servers; org registries; marketplace (preview); built-in GitHub server (preview) [84] | stdio, http, sse [83] | GA since 1.102 (2025-07-14) [83]; enterprise policy off-by-default for Business/Enterprise [85] |
| Visual Studio | Client (VS 2022 17.14+/VS 2026) [85] | local + http [85] | GA [85] |
| JetBrains AI Assistant | Client **and** server (bundled, default-on; auto-configures Junie/VS Code/Claude Code/Codex/Copilot CLI) [86] | stdio + Streamable HTTP [86] | The edition-1 transport gap is resolved [86] |
| Cursor | Client across editor/CLI/Cloud Agents [87, 88]; MCP Apps; deeplinks [89] | stdio, SSE, Streamable HTTP [87] | 3.6+ defaults to Auto-review approval [89] |
| Windsurf → **Devin Desktop** | Client (Cascade); Plugin Store; team allowlists [52] | stdio, Streamable HTTP, SSE [52] | Renamed June 2026; config moved to `~/.config/devin/` [52] |
| Zed | Client — Tools + Prompts; forwards servers to ACP external agents [90] | local + remote [90] | MCP-server extensions slated for deprecation in favor of the official registry [91] |

### 5.3 Operating-system layer

**Windows** remains the only OS with first-party MCP infrastructure: the **Windows On-device Agent Registry (ODR)** — MSIX auto-registration, `.mcpb` bundles, manual `odr.exe mcp add` for remote servers [93], contained agent sessions [94], built-in File Explorer and Settings connectors, Intune management [92] — is still **public preview** (build 26220.7262+) [92, 93], with package-identity requirements unenforced in the preview [93]. No macOS or Linux OS-level equivalent exists (absence of documentation, not proof of absence); Google's macOS Gemini app has announced Spark integration with shipped status unverified [20].

### 5.4 Web apps and hosted agent platforms

- **Claude.ai:** connectors directory (734 connectors as of 2026-10-03 per a third-party count [114]) + custom connectors; auth via published CIMD identity, DCR, or pre-registered OAuth clients [95].
- **ChatGPT web:** apps/plugins [15]; hosted MCP tool in the Responses/Agents API (`connection_origin: "service"` vs `"environment"` — the latter can even run stdio servers in a session environment) [78].
- **Google:** three distinct client surfaces — Gemini Enterprise (admin-governed custom MCP data stores, **GA per release notes dated 2026-08-07**, StreamableHTTP-only, plus Agent Registry/Gateway egress governance and MCP-based federated query for Data Cloud, preview 2026-10-02 [22]); Gemini in **Workspace** (third-party MCP connectors to Asana, Atlassian Rovo, HubSpot, Mailchimp, QuickBooks, Monday, Salesforce — rolled out September 2026, on by default [21]); consumer Gemini Spark (above) [19]. Google is steering new Gemini Enterprise subscriptions from Code Assist to **Antigravity** for IDEs (2026-09-17) [22]; Antigravity's own MCP support is unverified.
- **AWS:** Bedrock AgentCore Gateway — governed remote MCP endpoint fronting Lambda/OpenAPI/Smithy targets, supporting **all four recent spec revisions** including day-one `2026-07-28` [23] ($0.005/1,000 invocations [122]).
- **Cloudflare:** both sides — client APIs (`addMcpServer`) and stateless servers (`createMcpHandler`; `McpAgent` deprecated) [30, 24]; MCP Server Portals behind Access [11]; experimental `webmcp` bridge to Chrome's `navigator.modelContext` [30].
- **Microsoft Foundry:** MCP tool GA (public + VNet endpoints); Foundry Toolboxes (preview) bundle tools behind one MCP endpoint; MCP tasks (preview) for >100s operations [165]; Government-cloud MCP agents GA June 2026 [82].

### 5.5 APIs and headless SDKs (client side)

Native MCP clients: OpenAI Agents SDK (hosted/Streamable/stdio; SSE deprecated; accepts MCP SDK v1 and v2) [96, 11], Claude Agent SDK (stdio/http/sse + in-process SDK servers; MCP tool search; 25k-token output cap with file spillover) [76], LangChain `MCPAdapter` (FastMCP-based, beta; `langchain-mcp-adapters` replaced; WebSocket dropped) [70], Microsoft Agent Framework (stdio/StreamableHTTP/WebSocket; agent-as-server in Python/.NET/Go) [69], Semantic Kernel [97], Google ADK (`McpToolset` + `to_mcp_server`) [98], Cloudflare Agents SDK [30]. "Agent as MCP server" is now a documented pattern in at least six frameworks [76, 69, 70, 97, 98] — the protocol is becoming bidirectional at the agent layer.

### 5.6 Mobile

No first-party mobile surface supports local (stdio) MCP. Remote connectors work account-wide on Claude (web/Desktop/Cowork/mobile) [14]; ChatGPT apps work across surfaces subject to plan/region [15]; consumer Gemini Spark custom apps work in the Android app (configured on web first) [19]. M365 Copilot widget availability on mobile is undocumented [17].

### 5.7 APIs as MCP servers (the supply side)

GitHub (remote GA since 2025-09-04 — a date carried from edition 1's changelog reading; local HTTP mode; `2026-07-28` support shipped 2026-07-23 [61]; governance tooling in v1.12.0, Sept 2026 [118]), Stripe (remote MCP + **agent API keys** for autonomous clients [119]), Shopify (Storefront MCP per store + a UCP-bound catalog endpoint [120]), Microsoft Learn (`learn.microsoft.com/api/mcp` [121]), Cloudflare-operated servers [30], Docker's catalog (300+ verified containerized servers [111]). The pattern is settled: the large SaaS API now ships an MCP interface as a matter of course [61, 119, 120].

### 5.8 Registry infrastructure

- **Official MCP Registry:** still **preview** — the docs banner reads "Breaking changes or data resets may occur before general availability" (fetched 2026-10-09) [100]; no GA announcement exists on any official channel [101]; the repo README's milestones remain preview (2025-09-08) and API freeze (2025-10-24), with "GA release will follow later" [102]. Software releases continue (v1.8.x, Aug 2026: v1.8.1 security fixes including rejection of `github.io` domains in namespace verification; org namespaces restricted to Owners shipped in v1.8.0) [103]. Verification is GitHub OAuth/OIDC (`io.github.*`), DNS TXT, or HTTP well-known challenge for domain namespaces [104]; package-ownership checks (npm `mcpName`, PyPI/NuGet README markers, OCI labels, MCPB hashes) [105]. **DID:web is not part of the official model** [104]. Consumers are meant to be aggregators, not end clients [100, 106].
- **Same-name traps:** JFrog MCP Registry (GA 2026-03-18 [108]), AWS Agent Registry (GA 2026-08-31 [109]), Workato's "MCP Registry" product (GA Aug 2026 [110]), and GitHub MCP Registry [59] are all *different things* from the official registry.
- **GitHub MCP Registry:** curated (~394 entries per an Oct 2026 third-party count [107], vs 44 in Oct 2025 [123]); reported to read from the official registry [107].
- **Docker MCP Catalog:** 300+ verified containerized servers [111]; Custom Catalogs & Profiles GA 2026-05-15 [112]; trust tiers Docker-built (signed, SBOM, provenance) vs community-built [113].

---

## 6. Ecosystem Scale

### 6.1 Server counts (conflicting by design — not averaged)

**Official MCP Registry** — independent full-API censuses within one week, all paging `/v0/servers` to the end at `version=latest`, deduplicating by name:

| Count | As-of | Active/deprecated | Source |
|---|---|---|---|
| 39,492 | 2026-10-05 | 39,015 / 477 | ajayk.sh (395 pages) [11] |
| 40,047 | 2026-10-06 | 39,565 / 482; 23,818 namespaces | host0.ai (401 pages) [12] |
| 40,965 | 2026-10-09 | 504 deprecated | gravity.fast daily tracker [13] |
| **41,183** | **2026-10-09** | **40,676 / 507** | **This edition's own census (412 pages, ~12 min)** [10] |

They disagree by a few percent because the registry changes hourly and dedupe rules differ [11, 12, 13]. Anchors for the growth curve: "close to two thousand" entries in Nov 2025 (maintainers, via host0.ai) [12] — though gravity.fast's own monthly series reads 927 at Nov-2025 month-end, so the measures differ [13]; "more than 10,000" at the AAIF launch (LF press, 2025-12-09) [7]; 24,240 on 2026-08-22 (jwatte.com's census) [169]; passed 40,000 on 2026-10-08 (gravity.fast changelog) [13] — i.e., **~20× in ten months**, with September 2026 the largest month ever (11,902 first-publishes per gravity.fast [13]; 14,456–14,724 latest-version publishes per host0/ajayk on a different measure [12, 11] — same story, different denominators).

Registry composition (early Oct 2026, third-party censuses): **63% of entries expose a remote endpoint** (incl. 24,242 Streamable HTTP and 1,105 deprecated-SSE per ajayk [11]; 62.8–63% per host0 and gravity.fast [12, 13]); **~41% ship an installable package** (npm ~10.7k, PyPI ~4.2–4.3k, OCI ~1.05k, `.mcpb` ~1.05–1.45k) [11, 12]; 64% under `io.github.*` namespaces [12]; the top-10 namespaces hold 18.7% of entries and a single GitHub account holds 2,365 [12]; **~27% (11,089) first published in the 30 days to 2026-10-09** [13].

**Unofficial directories (their own counters, as of early Oct 2026):**

| Directory | Count | As-of | Caveat |
|---|---|---|---|
| Glama | 96,340–97,619 | Oct 5–8 [11, 12, 107] | Indexes GitHub-repo-like things; a 221,081 sitemap-based figure counts URLs, not servers [114] |
| PulseMCP | ~21,700–21,747 | Oct 5–8 [11, 107, 115] | Blocks direct fetch (HTTP 403, same as Aug 2025); third parties report **submissions paused** [107]; roughly flat vs August while the official registry grew ≈70% since late August [10, 169] |
| Smithery | 14,161 (as-displayed, own fetch) | 2026-10-09 [116] | Homepage claims 25k+ [115, 11]; public API totals ~18.3–19.2k [115, 13, 114]; only ~190 "verified" [115, 107]; acquired by Arcade.dev 2026-08-05 [51] |
| Docker MCP Catalog | 300+ verified | Oct 9 (docs) [111] | Containerized, signed, SBOM [113] |
| GitHub MCP Registry | ~394 curated | Oct 8 (3rd-party) [107] | Curated front-end [59] |
| Claude connectors directory | 734 | Oct 3 (3rd-party) [114] | Curated |
| Crawler view (Agenstry) | 204,020 indexed / 12,579 responding | Oct 4 [13] | "Everything reachable," not listings |

Methodologies differ and the same server appears in several directories; never sum or average [11, 114]. GitHub topics as a supply signal: 34,043 repos tagged `mcp-server`; 90,629 tagged `mcp` (2026-10-09, gravity.fast) [13].

### 6.2 SDKs and developer surface

**Ten official SDKs** (SDK docs page, fetched 2026-10-09): TypeScript, Python, C#, Go, **Rust (Tier 1)**, **Ruby (Tier 1)** — both promoted since the 2026-07-28 matrix [124, 11] — plus Java (Tier 2), Swift, PHP, Kotlin (Tier 3) [124]. Ruby shipped 1.0.0 on 2026-07-24 with 100% conformance pass [125, 126]. One tension to note honestly: the Ruby 1.0 announcement (July) says the gem "meets every Tier 2 requirement" with Tier 1 development ongoing [125], while the current SDK page already lists Ruby as Tier 1 [124] — the page is the current state; the transition date is undocumented [126].

The **v1/v2 split** is the practical developer story: Python `mcp` 2.3.0 speaks `2026-07-28` [11]; the TypeScript flagship v1 package (1.32.0, still the most-installed at ~10M vs 75M weekly for the ecosystem's npm footprint [11]) still targets `2025-11-25` [43], while `2026-07-28` support lives in new v2 split packages (`@modelcontextprotocol/server`, `client`, `node`, `express`; ESM-only, Node 20+) [11, 44]. v1 gets critical fixes "for at least six months" [43]. Other observed versions: Go 1.8.0, C# 2.2.0, Rust rmcp 3.5.0 (`2026-07-28` in beta), Ruby 1.6.1, Java 2.0.1; Python 2.x renamed `FastMCP` → `MCPServer` [11].

**Downloads (treat as noisy — CI included, all sources say so [12]):** TypeScript SDK 75.0M npm downloads in the week to 2026-10-03 (+948% YoY); Python `mcp` 60.9M/week (+472% YoY); `fastmcp` 14.4M/week; MCP-vs-A2A SDK downloads ~20:1 (gravity.fast, Oct 2026) [13]. Monthly totals: ≈475M (ajayk.sh) [11]; an independent ClickHouse series peaks at 545.5M (Aug 2026) and 464M (Sept 2026), noting a single-consumer step-change on Aug 25 cut Python's daily counts ~40% (host0.ai) [12]. Official framing: "close to half-a-billion downloads a month" across Tier 1 SDKs, TypeScript and Python each past 1 billion cumulative (MCP blog, July 2026 [4]; AAIF, Sept 2026 [9]). `mcp-remote` still pulls ~716K/week fifteen months after its 2025 critical RCE [11] — an install-habit data point.

### 6.3 The management plane

Twelve named gateways/management planes now converge on three features (terminate auth + inject credentials; per-tool policy/rate limits; logs/audit) [11]: Azure API Management, AWS AgentCore Gateway, Kong AI Gateway, Cloudflare (Workers + Portals) [24, 11], **agentgateway** (Solo.io, now an AAIF-hosted project [8]; v1.6.0, 2026-10-02 [157, 11]), Docker MCP Gateway [111], Obot, Lasso MCP Gateway (stagnant since Jan 2026) [164], Zuplo, Composio, IBM ContextForge, and Microsoft MCP Gateway — originally launched as a session-aware stateful router, **since rewritten stateless for the `2026-07-28` spec** (the README now requires `2026-07-28` clients and stores no transport sessions) [158]. That rewrite, like Cloudflare's `McpAgent` deprecation (§5.4), is evidence of vendors re-platforming onto the stateless core rather than resisting it. Add ToolHive (container runtime, Cedar authorization, Kubernetes scaling) [159]. Market consolidation: **Arcade.dev acquired Smithery** (2026-08-05 [51], six weeks after a $60M Series A [117]), **Snowflake agreed to acquire Natoma** (MCP governance) [12], and ~$211M across eight disclosed rounds has flowed into the category [11].

### 6.4 Enterprise adoption

- **Survey base rate (most credible available):** Stacklok's *State of MCP in Software 2026* — **41% of all surveyed organizations report MCP servers in production** (29% limited, 12% broad); **software respondents higher still, at 45%** (26% limited, 19% broad) [143]. PDF, parsed during the review pass.
- **The debunked number:** "78% of enterprise AI teams use MCP in production" has no traceable source and was retracted by its original publisher [12, 144]; it should not be cited anywhere.
- **Named production adopters (dated):** Bloomberg (enterprise MCP + Skills powering ASKB; contributed "Variants" to the standard; 2026-07-21 [145]; the "9,500+ engineers" scale figure is secondary [146]), Cloudflare ("billions of tool calls" served by its Code Mode MCP server for its own API, 2026-08-06 [24]), Uber (Agent Registry + MCP Gateway as policy enforcement) [147], Smartsheet [148], Chronograph [149], Propel Software [150], Atlassian (see §8; its MCP server's "2M MAU / 15M daily tool calls" figures now have two independent secondary confirmations [166, 42], but remain unconfirmed on Atlassian primary pages).
- **AAIF-cited telemetry (self-reported, 2026-09-14):** ChatGPT MCP tool calls reached **98× their January level by August**; Resend passed **one million MCP calls in a single month** [9].
- **Exposure telemetry:** Censys found 12,520 internet-reachable MCP services on 8,758 IPs in 56 countries (2026-04-28), 89.4% still speaking the `2025-03-26` protocol [12]; Trend Micro's like-for-like count of unauthenticated servers nearly tripled to 1,467 in nine months [12]. A fresher than 2026-07-28 adoption-telemetry datapoint was a v1 open item; the AAIF (Sept 14 [9]) and gravity.fast (daily [13]) series above are the current best.
- Weak/secondary numbers we decline to promote: "28% of Fortune 500 operate MCP servers" (untraceable primary) [151]; Gartner's "one third of enterprise software includes agentic AI by 2028" (primary not located).

---

## 7. Security

### 7.1 Threat classes (standing)

The official Security Best Practices page (2026-07-28 docs tree, fetched 2026-10-09) documents, with mandatory mitigations [64]: **confused deputy** (static client IDs + consent-cookie bypass; per-client consent required), **token passthrough** (explicitly forbidden; audience validation), **SSRF** during OAuth metadata discovery and — new this revision — against authorization servers via CIMD, **state handle hijacking** (new with the stateless spec: a server-minted handle must never authenticate), **local MCP server compromise** (consent before one-click config, sandboxing, loopback binding), and OAuth authorization-URL validation (`javascript:` URLs → XSS → RCE via stdio) [64]. Earlier documented classes remain relevant: tool poisoning, rug pulls, line-jumping, prompt injection via MCP content, and DNS rebinding against local servers [152]. The canonical in-the-wild malicious server is still the npm `postmark-mcp` backdoor (Sept 2025; edition-1 finding, not re-verified this edition).

### 7.2 Documented incidents and the Aug–Oct 2026 escalation

1. **Fix propagation is the systemic failure (JLS Technology, published 2026-10-09):** **285 CVEs** were published Jan 1–Oct 8, 2026 against 149 open-source MCP projects [25]. 177 of 186 CVEs with observable dates were fixed *before* NVD publication (median 54 days fix-first) — advisory-driven patching is ~2 months late by design [25]. **93 of 285 (33%) have no fixed version at all** [25]. Four Docker MCP Catalog images were built from commits predating upstream fixes (covering 41 CVEs; Docker notified 2026-10-09) [25]; two official-registry entries list in-range vulnerable versions [25]; three npm mirror scopes (`@iflow-mcp`, `@mseep`, `@fastmcp-me`) systematically re-publish others' servers, 24 of 36 sampled serving vulnerable versions [25]; of 13,689 enumerated forks, 34% lack at least one fix [25]. Named listings withheld until ≥2026-10-23 [25].
2. **"Protocol pivoting" — a newly named cross-protocol class (Ars Technica, 2026-10-05; MCPCon NA presentation scheduled 2026-10-23) [28]:** initial access via one protocol (typically SSRF in a special-purpose MCP agent), then exploitation of trust assumptions *between* MCP and A2A [28]. Same-researcher SSRF fixes across five organizations: Google (CVE-2026-14540, MCP Toolbox for Databases, CVSS 8.0, fixed 1.5.0) [28, 130], Weaviate (CVSS 7.1, fixed 1.39.3) [28, 130], France's DINUM (patch merged 2026-09-04) [28, 131], Tangerang City, Indonesia (advisory 2026-09-03) [28, 130], Rapid7 (CVE-2026-97228, fixed Sept 2026) [28, 130]; a fifth case at JPMorgan Chase is claimed without a public advisory (unverified) [131].
3. **Three MCP auth bugs in 30 days, one root cause — unverified authentication input (WorkOS, 2026-10-02) [29]:** the **MCP Python SDK OAuth client** (1.9.1–1.29.1, 2.0.0–2.1.1; malicious server could capture client secret/auth code/PKCE verifier; fixed 1.30.0/2.2.0; GHSA-qx49-fqc8-xw99, CVSS 7.5, **no CVE assigned** — a scanner gap) [29]; the **MCP Rust SDK (rmcp) < 2.0.0** (unvalidated `resource` in protected-resource metadata → cross-resource token theft; CVE-2026-63127, CVSS 8.2) [29]; and **LiteLLM < 1.84.0** (fabricated `Authorization` header triggered an OAuth2-passthrough fallback skipping the key check on `/mcp/`; **CVE-2026-59822, added to CISA KEV 2026-09-02** with a 2026-09-16 federal remediation deadline [26, 127]; reported in-the-wild chained with Starlette CVE-2026-48710) [29, 26].
4. **mcp-atlassian (CVE-2026-77244, CVSS 10.0, published 2026-09-22) [27, 128, 129]:** the HTTP transport ran unauthenticated requests with the operator's own Atlassian token (permissive token verifier, OAuth proxy off by default, fallback to operator credentials on missing headers) [27]. Fixed 0.22.0 (2026-07-10), SSE-transport bypass closed 0.23.1 (2026-08-19) [27, 129]; the fix audit consolidated 37 advisories [129]. Not known exploited [27].
5. **The stdio command-injection dispute (OX Security, April 2026; carried from edition 1) [132, 133]:** researchers argue MCP's stdio spawn pattern is a systemic command-injection vector (their scale figures — 150M+ downloads, "up to 200,000 vulnerable instances" — are researcher estimates, not established fact [132, 133]). Anthropic's position: the stdio execution model is a secure default and sanitization is the developer's responsibility [132]; an updated security policy followed within a week [133]. The protocol was not changed [133].

### 7.3 Mitigations and guidance

Official: the spec's Security Best Practices [64] and a new Local Server Security page [134]; the feature-lifecycle policy forcing deprecation of risky client features (Roots/Sampling/Logging) [2]. Vendor: Anthropic (connectors directory review model — Community is automated screening; Verified is human functional testing that "isn't a security audit" [135]; pre-submission checklist covers prompt-injection patterns [136]), Microsoft ("The state of MCP security in 2026" [137]; an OWASP MCP Top 10 implementation guide for Azure, MCP01–MCP10 [138]; Entra Global Secure Access MCP firewall [139]), Docker (two-tier catalog trust model [113] — while itself subject of the stale-image findings above [25]), OpenAI (Apps SDK requires production HTTPS Streamable HTTP servers with the spec authorization flow for private data/actions) [140], OWASP MCP Security Cheat Sheet [141], and an NSA Cybersecurity Information Sheet (June 2026; PDF-only, parsing blocked) [142]. Roadmap-level: DPoP, workload identity federation, agent identity, and "human-presence attestation" are the intended structural answers to "the caller is an agent, not a person" [65, 66].

---

## 8. Where MCP Is Going

### 8.1 The maintainer roadmap (five priority areas, 2026-08-22)

1. **Agentic messaging primitives** (McCaffrey, Liguori, Alexander): server-initiated events — channels/subscriptions and webhooks via the Triggers & Events WG; a composition review; and Tasks (SEP-2663) toward eventual core inclusion [66, 65].
2. **HTTP-native transport unification and hardening** (Van Gent, Cooper): **Streamable HTTP over stdio** (possibly HTTP/2) as the single binding; ETag caching on `ttlMs`/`cacheScope`; standardized errors; capability scoping; secure server configuration [66].
3. **Agent identity and enterprise-ready security** (Carleton, Delimarsky): DPoP; Workload Identity Federation (SEP-1933); ID-JAG; RFC 8693 exchange; IETF OAuth/WIMSE coordination; human-presence attestation under discussion [66].
4. **Improved primitives** (Van Gent, Alexander, Delimarsky): redesign the `tools/call` result shape (the `content` vs `structuredContent` confusion); **progressive discovery** (learn catalogs incrementally instead of ingesting them); resolve primitive annotations (adopt or deprecate, SEP-2200) [66].
5. **Improved SDK developer experience** (Delimarsky, Soria Parra): define the extension contract; experiment with generating Tier-1 SDK artifacts from the spec + conformance suite [66].

**Cadence is now firm:** the Aug 12 Core Maintainer meeting set the next release for **December 15, 2026, "no slipping,"** with June 15 to follow [5]; the Sept 30 meeting reviewed SEP-3398 (a formalized release cycle: planning opens 8 months out, tier-1 betas 1.5 months before, hard freeze at 1 month; candidate dates end-of-March/end-of-September) and SEP-3392 (extension lifecycle), and tasked the drafting of the triggers-and-events SEP [153]. Features that miss a date roll over [5].

### 8.2 Standardization beyond the project

- **AAIF consolidation is complete fact:** A2A is hosted (joined Aug 2026 [31]); agentgateway and Agent Router round out a six-project stack spanning context (MCP), agent-to-agent communication (A2A), and operations (gateways) [8]. A2A itself shipped **v1.0.0** on 2026-03-12 [56], counts **150+ supporting organizations** (up from 50+ at launch) [154], and is integrated in Azure AI Foundry, Copilot Studio, and Bedrock AgentCore Runtime [154]. The complementary positioning is explicit: "A2A defines how agents communicate… while MCP defines how agents connect to internal tools and data sources" [154]. AAIF's **MCPA certification** (2026-09-14) institutionalizes MCP skills [9].
- **IETF:** after the non-WG-forming CATALIST BoF (IETF 125, March) [50], the **agentproto** BoF at IETF 126 (July 23, Vienna) voted 154–51 to form a working group — while rejecting its initial scope 38–124 [36]. The proposed charter ("Agent Communication Protocols (agentproto)"): a baseline **agentic dialog management protocol** plus an informational reference architecture; updated 2026-09-15, in initial chartering/IAB review [37]. This is a general agent-communication effort, **not** an MCP working group — though the charter does name MCP (and A2A) as existing protocols the baseline is designed to be usable alongside via extension points [37]; the minutes note "a PR from the MCP side" [36]. MCP's own standards posture remains: identity work through IETF OAuth and WIMSE [65, 66].

### 8.3 Consolidation signals

One foundation hosting the full agentic stack [8]; one certification [9]; **Agent Plugins 1.0.0** (2026-08-06) as a single packaging standard above MCP, with AWS, Cursor/Anysphere, Microsoft, OpenAI, and Vercel on its initial Technical Steering Committee [32, 33] (GitHub GA in VS Code, Copilot CLI, the Copilot SDK and app, Aug 12 [34]); OpenAI's Apps SDK migrating onto the cross-host MCP Apps standard ("build your UI once and run it in ChatGPT and other MCP Apps–compatible hosts") [35]; every major cloud shipping day-one `2026-07-28` support [12, 23]; SDK consolidation onto MCP v2 packages [11, 43]; A2A's IBM-ACP merger (Aug 2025) as precedent for convergence [31]. Commentary has shifted from "will MCP win?" to "what sits on top of MCP?" [166] — Atlassian's **AMP** (Oct 6–7) is the type specimen: a "diplomatic protocol" that, per its VP of AI Product, "is not a replacement for those protocols. Rather, it's a holistic layer on top of them" [40, 41].

### 8.4 Fragmentation vectors that remain real

**Shipping ahead of the spec:** ChatGPT's MCP Events support (DevDay, Sept 29 [45]) implements a webhook-only slice of a *proposed* specification whose WG has no accepted SEP [49, 155] — and the draft's subscription model has been sharply criticized (see §9). **UI extensions:** OpenAI keeps ChatGPT-specific capabilities (`window.openai`) deliberately outside the MCP Apps standard [35]. **State management:** reported as fragmented across "fourteen-plus vendors with zero shared protocols" (single-secondary; unverified count) [166]. **Packaging:** VS Code simultaneously supports Agent Plugins, Copilot, Claude, and legacy OpenPlugin formats [156]. **Transports:** non-standard WebSocket support persists in Claude Code and MS Agent Framework while the spec says stdio/Streamable-HTTP only [68, 69, 67]. **The v1/v2 SDK split** is a managed, but real, fragmentation of the installed base [43, 11]. And the registry layer has factual duplication: four-plus same-named "MCP registries" from JFrog [108], AWS [109], Workato [110], and GitHub [59], none of them the official one — which itself remains in preview [100].

---

## 9. Criticisms and Open Problems

1. **Subscriptions-as-credentials (WorkOS, Oct 2026) [49]:** the draft MCP Events spec makes an event subscription a durable credential — created under one user's token, authorizing the server to push that user's data indefinitely (re-verification is only a SHOULD; the binding tuple includes no token/scopes/expiry; `ttlMs: null` permits no expiry; subscription state lives client-side, on OpenAI's side of the wire for ChatGPT plugins) [49]. "The TTL you grant is your revocation window" [49].
2. **The stdio command-injection design dispute** (April 2026, above [132, 133]) — unresolved by design; Anthropic holds it is a secure default with developer responsibility [132].
3. **Many-tools context scaling** — the roadmap concedes it in its own words and funds "progressive discovery" [65, 66]; Anthropic engineers around it (MCP tool search; 25k-token output caps with file spillover) [76]. The quantified anchor from edition 1 (Microsoft Research's 1,470-server survey) is carried forward as previously verified, not re-fetched this edition.
4. **Server quality and enterprise gaps** — no standard granular authorization ("allow X but not Y"), inconsistent community-server quality, missing distributed observability (2026 ecosystem maps) [161].
5. **Registry immaturity** — the official registry's preview banner and the absence of GA while it carries ~41,000 entries [100, 102, 11]; discovery for quality (vs mere existence) remains unsolved; the directory layer disagrees with itself by methodology [114].
6. **Supply-chain integrity** — the JLS findings (§7.2) are the sharpest statement: fixes that exist upstream but never reach the artifacts people actually install (mirrors, forks, stale catalog images) [25].

---

## 10. Recommendations for Adopters

1. **Target the `2026-07-28` stateless revision for new remote servers** [2] — every major cloud platform now supports it [12, 23], gateways are being built around its headers and cacheability [11], and the deprecated features (sessions, SSE resumability, Roots/Sampling/Logging) are on a clock [2]. Build on SDK v2 packages where available (TypeScript, Python) [11]; pin v1 only with a migration plan (six-month critical-fix window is already running) [43].
2. **Treat local servers as supply chain, not configuration.** Require package-ownership signals (namespace verification [104], signed images [113]), prefer containerized/isolated execution (ToolHive [159], Docker Gateway [111], OS sandboxes [94]), and audit what a one-click install actually spawns. The JLS data says the vulnerable artifact is often one hop away from the fixed one [25].
3. **Assume the caller is an agent.** Deploy the enterprise patterns that now exist: Enterprise-Managed Authorization + ID-JAG via your IdP [58], per-tool policy at a gateway [11], DPoP-bound tokens as SDK support lands [65], short TTLs everywhere — and refuse unbounded event subscriptions (`ttlMs: null`) until the Triggers & Events SEP lands [49].
4. **Consume registries via aggregators; verify before install.** The official registry is preview-grade infrastructure with real scale [100]; treat its `server.json` as a claim, not a vetting [105]. Curated tiers (Docker-verified [113], Anthropic Verified [135]) are functional checks, not security audits.
5. **Plan for December 15.** The release cadence is now firm [5]; the three most likely disruptive areas are triggers/events, the tool-result shape redesign, and caching/ETag semantics [66]. SEP-3398's cycle means betas ~1.5 months before — put conformance testing in place now [153].
6. **Design UIs against MCP Apps, not vendor SDKs,** if cross-host reach matters [35] — but expect host-specific extension layers to persist and abstract for them [17].

---

## 11. Open Questions (unresolved by available evidence)

1. Will the **Triggers & Events SEP** land in the December 15 release [153], and will ChatGPT's shipped webhook slice be reconciled with the draft it preempted [49]?
2. Will the **official registry reach GA** — and when? Its scale (~41k entries [11]) has far outgrown its "breaking changes may occur" label [100].
3. Does **agentproto** charter successfully [37], and does MCP bind to it, stay parallel, or ignore it?
4. Do **AMP-style governance layers** multiply into a real fragmentation layer above MCP [39], and does Agent Plugins absorb the proprietary plugin formats [156]?
5. When do **Roots/Sampling/Logging** actually cross from deprecated to removed [2], and what replaces sampling for server-side LLM access?
6. Does the fix-propagation failure (mirrors, forks, stale images) get an ecosystem answer (registry-level "fixed-after" signals, catalog rebuild guarantees), or does it stay each-consumer's problem [25]?
7. What is the real **enterprise production number**? The best survey (Stacklok, ~41% [143]) predates the stateless-spec wave; no fresher primary exists as of this edition.

---

## 12. Conclusion

Edition 1 (August 2026) described MCP as a de facto standard consolidating under neutral governance. Edition 2's finding is that the consolidation phase is effectively over at the protocol layer — and everything interesting has moved up. The specification is stable, stateless, and on a metronome (December 15) [5]. The foundation hosts the whole agentic stack and certifies competence in it [8, 9]. The registries hold forty thousand-plus servers [10, 11, 12, 13], two thirds of them reachable without installing anything [11, 12, 13]. Every major platform — including, as of this edition, consumer Google [19, 20] — speaks MCP. Meanwhile the real risks have crystallized exactly where maturity is lowest: not in the protocol's design, but in the path a fix takes from a maintainer's commit to the artifact running in your environment [25], and in the identity of the non-human caller that the protocol was never designed to authenticate [65]. The next twelve months will be decided less by spec revisions than by whether the ecosystem industrializes trust the way it just industrialized transport.

---

## Verification Adjustments

Citation and verification pass, 2026-10-09. All parenthetical source hints were replaced with numbered citations; the consolidated Sources section below carries 167 verified entries. Roughly 95 URLs were independently re-fetched and content-matched during this pass; the remainder were fetched and recorded same-day by the edition's research passes (T1–T4) and are marked accordingly in the research files.

**Corrections made (11):**

1. **agentproto BoF location (meaning-changing):** draft said IETF 126 was in *Madrid*; the fetched BoF minutes state the meeting was held in **Vienna** on July 23, 2026. Corrected in §8.2 [36].
2. **agentproto charter scope (meaning-changing):** draft said "MCP is not named in the charter"; the fetched charter **does name MCP** (with A2A) as example protocols the baseline is designed to be usable alongside via extension points. §8.2 now reports this accurately while keeping the finding that agentproto is not an MCP working group [37].
3. **Agent Plugins signatories (claim removed):** draft said Google joined as core maintainer on day one; the Vercel and AWS announcements list the initial TSC as AWS, Cursor, Microsoft, OpenAI, and Vercel, with no Google mention. The Google clause was removed from §8.3 [32, 33, 34].
4. **Registry v1.8.x fix attribution:** the org-namespaces-restricted-to-Owners fix shipped in **v1.8.0**, not v1.8.1; v1.8.1 carries the `github.io` domain-rejection fix. §5.8 corrected per the releases page [103].
5. **Cloudflare "billions of tool calls" (scope narrowed):** the figure is reported by Cloudflare for its Code Mode MCP server for its own API, not "its MCP infrastructure" generally. §6.4 narrowed accordingly [24].
6. **Gemini Enterprise GA date pinned:** the release-notes entry declaring custom MCP server data stores GA is dated **2026-08-07** (research notes had it only as "between 2026-07-22 and 2026-08-06"). §2.8/§5.4 updated [22].
7. **Dead URL replaced:** Microsoft Learn's M365 Copilot MCP-apps page moved from `/extensibility/mcp-apps` (now 404) to **`/extensibility/plug-in-mcp-apps`** (`https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps`); content confirmed at the new slug [17].
8. **Skills SEP-2640 status strengthened:** the draft's "appears as Final per secondary reporting" is upgraded — the SEP index (primary, fetched) lists SEP-2640 as **Final (2026-04-23)**; secondary reporting is retained only for the September announcement date [57, 72].
9. **SEP-1288 closure nuance:** the issue page attributes the stall to Transports WG queue/gridlock with browser-auth limits raised in early discussion; §4.3 wording softened accordingly [163].
10. **Atlassian MCP-server scale figure:** SiliconANGLE independently repeats the "~15 million daily tool calls" figure, so it now has two secondary sources — still unconfirmed on Atlassian primary pages, and still flagged as such in §6.4 [42, 166].
11. **Carry-forwards flagged rather than silently kept:** GitHub MCP Server remote-GA date (2025-09-04) and the npm `postmark-mcp` canonical example are edition-1 findings not re-verified this edition; both are now explicitly marked in §5.7 and §7.1.

**Documented conflicts preserved (not resolved):** (a) HTTP+SSE offramp — release blog "year-long offramp" [4] vs deprecated-features registry ~3 months per secondary analysis [160]; (b) Ruby SDK Tier 1 on the current SDK page [124] vs the 1.0 announcement's "meets every Tier 2 requirement" [125]; (c) ChatGPT developer-mode scope — developer docs (Pro/Plus/Business/Enterprise/Education on web) [16] vs help center (beta for Business/Enterprise/Edu; Pro/Plus read-only) [77]; (d) Smithery 14,161 as-displayed [116] vs 25k+ homepage claims [115, 11] vs ~18.3–19.2k API totals [115, 13, 114]. All conflicting counts are reported side-by-side and none were averaged.

**URLs that could not be fetched directly (content corroborated through other channels):** help.openai.com and developers.openai.com developer-mode pages (bot-blocked 403/404 on direct fetch; full text confirmed verbatim via search extraction), NVD CVE pages (JavaScript-rendered; corroborated via CISA and Rapid7), Microsoft's techcommunity security blog (JavaScript-rendered), Bloomberg company story and Techzine (403; corroborated via Glama's case-study write-up and SiliconANGLE), OpenAI's DevDay recap (403; corroborated via ChatGPT Learn/InfoQ/MCPJam per the research notes), and PulseMCP (403, unchanged since August 2025). PDF-only sources were cited but not fetched or parsed, per house rules: the Stacklok report [143], the NSA Cybersecurity Information Sheet [142], and OX Security's 30-page paper [132]. *(Review-pass note: the Stacklok PDF was subsequently parsed during the independent review — see the post-review revisions below.)*

### Post-Review Revisions (2026-10-09)

The independent review pass (report: `outputs/.drafts/state-of-mcp-v2-verification.md`; verdict **PASS WITH NOTES** — 0 FATAL, 4 MAJOR, 4 MINOR) re-fetched ~50 sources, replicated the registry census (41,211 vs this paper's 41,183 — same-day drift), and audited the CISA KEV feed and GitHub APIs. Its findings were applied as follows:

1. **[W1·MAJOR] CISA KEV "first entries" claim removed.** The Executive Summary said MCP's "first entries" into KEV were LiteLLM CVE-2026-59822 and Starlette CVE-2026-48710 (both 2026-09-02). The KEV feed shows **LiteLLM CVE-2026-42271 was added 2026-06-08** — three months earlier. Exec Summary rewritten: LiteLLM appears twice on KEV (June and September 2026) [168].
2. **[W2·MAJOR] Growth percentage corrected and baseline source restored.** "~65% in about six weeks" was arithmetically wrong: 24,240 (jwatte.com census, 2026-08-22) → 41,183 is **+69.9%**. Now stated as ≈70% with the baseline attributed and jwatte.com added as source [169]; the §6.1 PulseMCP-row echo and the growth-anchor sentence corrected accordingly.
3. **[W3·MAJOR] Microsoft MCP Gateway characterization updated.** The repo was rewritten for the stateless spec (README, by ~2026-10-02: requires `2026-07-28` clients; no transport-session storage), so the earlier "session-aware stateful routing" tension claim was stale — the quote traced to an analyst snapshot that predated the rewrite. §6.3 now reports the rewrite as further evidence of vendors re-platforming onto the stateless core [158].
4. **[W4·MAJOR] Stacklok survey cohort corrected.** The chart's 41% (29% limited / 12% broad) is the **All-respondents** column, not "software organizations"; software respondents read 45% (26% / 19%). §6.4 restated; the PDF was parsed during review (previously "parsing blocked") [143].
5. **[W6/W7·MINOR]** §6.1 now notes gravity.fast's Nov-2025 month-end figure (927) differs in measure from the maintainers' "close to two thousand"; the Atlassian scale figure is flagged as having two independent secondary confirmations (Forkast, SiliconANGLE), still without primary confirmation [42, 166].

All four documented conflicts remain preserved side-by-side; no counts were averaged; announced-vs-shipped distinctions are unchanged.

---

## Sources

All URLs accessed 2026-10-09. Items marked below were verified by direct fetch during this pass; the rest were fetched and recorded on 2026-10-09 by the research passes (T1–T4) cited in each entry's claim map.

1. modelcontextprotocol Releases (GitHub) — https://github.com/modelcontextprotocol/modelcontextprotocol/releases
2. MCP Specification — Key Changes, 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/changelog
3. MCP Specification — draft changelog (empty as of 2026-10-09) — https://modelcontextprotocol.io/specification/draft/changelog
4. MCP Blog — "The 2026-07-28 Specification" — https://blog.modelcontextprotocol.io/posts/2026-07-28/
5. GitHub Discussion #3257 — "MCP Core Maintainer Meeting - August 12, 2026" — https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/3257
6. Anthropic — "Donating the Model Context Protocol and establishing the Agentic AI Foundation" (2025-12-09) — https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation
7. Linux Foundation press — "Announces the Formation of the Agentic AI Foundation" (2025-12-09) — https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
8. AAIF — Projects (six hosted projects) — https://aaif.io/projects
9. Linux Foundation press — "Agentic AI Foundation Launches MCPA Certification" (2026-09-14) — https://www.linuxfoundation.org/press/agentic-ai-foundation-launches-mcpa-certification-to-validate-mcp-expertise
10. Official MCP Registry API — `/v0/servers` (this edition's census: 41,183 unique latest-version servers, 40,676 active / 507 deprecated, 412 pages, run 2026-10-09) — https://registry.modelcontextprotocol.io/v0/servers
11. Ajay Kumar — "MCP in 2026: 475M SDK Downloads a Month, 39,492 Servers in a Registry Still in Preview, and 12 Gateways…" — https://www.ajayk.sh/blog/mcp-ecosystem-2026-registry-gateways-enterprise/
12. host0.ai — "State of MCP 2026: adoption, security and the stateless spec" — https://host0.ai/blog/state-of-mcp-2026
13. gravity.fast — MCP Adoption Statistics (daily tracker) — https://gravity.fast/data/mcp-adoption-statistics/
14. Claude Help Center — "Get started with custom connectors using remote MCP" — https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
15. OpenAI Help Center — "Apps in ChatGPT" (Plugins Directory migration, 2026-07-09) — https://help.openai.com/en/articles/11487775-connecting-mcp-servers-to-chatgpt (bot-blocked on direct fetch; text verified via search extraction)
16. OpenAI Developers — "ChatGPT Developer mode" — https://developers.openai.com/api/docs/guides/developer-mode (bot-blocked on direct fetch; text verified via search extraction)
17. Microsoft Learn — "MCP apps in Microsoft 365 Copilot" (URL moved from /extensibility/mcp-apps; replaced 2026-10-09) — https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps
18. Microsoft Learn — "Connect your agent to an existing MCP server" (Copilot Studio) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent
19. Google Gemini Apps Help — "Connect & manage custom apps for Gemini Spark (MCP)" — https://support.google.com/gemini/answer/17209137
20. Google blog — "The Gemini app becomes more agentic" (Spark, MCP connections, macOS app) — https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/
21. Google Workspace Updates — "Connect to more tools with Gemini in Google Workspace" (2026-09) — https://workspaceupdates.googleblog.com/2026/09/connect-to-more-tools-with-gemini-in-Google-Workspace.html
22. Google Cloud — Gemini Enterprise release notes — https://docs.cloud.google.com/gemini/enterprise/docs/release-notes
23. AWS Docs — AgentCore Gateway: using the gateway — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-using.html
24. Cloudflare blog — "The next generation of MCP" (2026-08-06) — https://blog.cloudflare.com/mcp-v2/
25. JLS Technology — "Fixed Upstream, Still Vulnerable Downstream: How MCP Security Fixes Propagate" (2026-10-09) — https://jlstech.com/mcp-remediation-propagation-2026/
26. CISA alert — "CISA Adds Seven Known Exploited Vulnerabilities to Catalog" (2026-09-02) — https://www.cisa.gov/news-events/alerts/2026/09/02/cisa-adds-seven-known-exploited-vulnerabilities-catalog
27. Rapid7 — CVE-2026-77244 (mcp-atlassian, CVSS 10.0) — https://www.rapid7.com/db/vulnerabilities/cve-2026-77244/
28. Ars Technica — "Vulnerability in agents from Google and others exposes structural flaw in MCP" (2026-10-05) — https://arstechnica.com/security/2026/10/vulnerability-in-agents-from-google-and-others-exposes-structural-flaw-in-mcp/
29. WorkOS — "Three MCP auth bugs in 30 days, one root cause" (2026-10-02) — https://workos.com/blog/mcp-auth-bugs-trusting-the-other-side
30. Cloudflare Docs — "Build: Remote MCP server" (Agents) — https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/
31. AAIF Blog — "A2A joins AAIF's open agentic stack" — https://aaif.io/blog/a2a-joins-aaif
32. Vercel Blog — "Introducing Agent Plugins" (2026-08-06) — https://vercel.com/blog/introducing-agent-plugins
33. AWS Open Source Blog — "AWS Supports Agent Plugins" (2026-08) — https://aws.amazon.com/blogs/opensource/aws-supports-agent-plugins-an-open-standard-for-portable-agent-extensions/
34. GitHub Changelog — "Agent Plugins 1.0 in VS Code, Copilot CLI, and the Copilot app" (2026-08-12) — https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/
35. OpenAI Developers — "MCP Apps compatibility in ChatGPT" (Apps SDK) — https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt
36. IETF Datatracker — agentproto BoF minutes, IETF 126 (2026-07-23, Vienna) — https://datatracker.ietf.org/meeting/126/materials/minutes-126-agentproto-202607230700-00
37. IETF Datatracker — agentproto Proposed Charter 00-01 (updated 2026-09-15) — https://datatracker.ietf.org/doc/charter-ietf-agentproto/00-01/
38. Atlassian — "The End of Single-Player AI" (Team '26 Europe founder update, 2026-10-06) — https://www.atlassian.com/blog/company-news/team26-europe-founder-update
39. Atlassian — "AMP: the Agentic Multiplayer Protocol" (platform page) — https://www.atlassian.com/platform/agentic-multiplayer-protocol
40. Diginomica — "Atlassian's Agentic Multiplayer Protocol sets the scene" (2026-10-07) — https://diginomica.com/team-26-europe-atlassian-agentic-multiplayer-protocol-agents-join-team
41. Techzine — "Atlassian AMP: how can enterprises run and govern agentic AI teams?" (2026-10-07) — https://www.techzine.eu/blogs/devops/144826/atlassian-amp-how-can-enterprises-run-and-govern-agentic-ai-teams/ (bot-blocked 403; corroborated by [42])
42. SiliconANGLE — "Atlassian lays groundwork for humans and AI agents to work side by side" (2026-10-07) — https://siliconangle.com/2026/10/07/atlassian-lays-the-groundwork-for-humans-and-ai-agents-to-work-side-by-side/
43. modelcontextprotocol/typescript-sdk — ROADMAP.md — https://github.com/modelcontextprotocol/typescript-sdk/blob/main/ROADMAP.md
44. MCP Blog — "SDK betas for the 2026-07-28 specification" — https://blog.modelcontextprotocol.io/posts/sdk-betas-2026-07-28/
45. OpenAI — "DevDay 2026 Recap" — https://openai.com/index/devday-2026-recap/ (403 on direct fetch; corroborated by [46–48])
46. ChatGPT Learn — "DevDay 2026" (2026-09-29) — https://learn.chatgpt.com/docs/whats-new/devday-2026
47. MCPJam — "OpenAI DevDay 2026: what matters for plugin builders" (2026-09-30) — https://www.mcpjam.com/blog/openai-devday-2026
48. InfoQ — "OpenAI DevDay 2026 Recap for Developers" (Oct 2026) — https://www.infoq.com/news/2026/10/openai-devday-2026/
49. WorkOS — "MCP Events in ChatGPT: Why an event subscription is a credential" (Oct 2026) — https://workos.com/blog/mcp-events-chatgpt-subscription-revocation
50. IETF Datatracker — CATALIST group (BOF Concluded, not chartered) — https://datatracker.ietf.org/group/catalist/about/
51. Arcade.dev — "Smithery Is Now Part of Arcade.dev" (2026-08-05) — https://www.arcade.dev/blog/smithery-joins-arcade/
52. Devin/Windsurf Docs — "Cascade MCP Integration" — https://docs.devin.ai/windsurf/plugins/cascade/mcp
53. MCP Blog — "MCP joins the Agentic AI Foundation" (2025-12-09) — https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/
54. MCP Blog — "MCP Apps — Bringing UI Capabilities To MCP Clients" (2026-01-26) — https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
55. SEP-1865 MCP Apps spec (ext-apps repo, 2026-01-26 Stable) — https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx
56. A2A — "A2A Protocol Ships v1.0" (2026-03-12) — https://a2a-protocol.org/latest/blog/2026/03/12/a2a-protocol-ships-v10-production-ready-standard-for-agent-to-agent-communication/
57. MCP docs — SEPs index (SEP-2663 Final 2026-04-27; SEP-2640 Final 2026-04-23; SEP-2243, SEP-2575, SEP-2596 Final) — https://modelcontextprotocol.io/seps
58. MCP Blog — "Enterprise-Managed Authorization: Zero-touch OAuth for MCP" (2026-06-18) — https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/
59. GitHub Changelog — "GitHub MCP Registry: the fastest way to discover AI tools" (2025-09-16) — https://github.blog/changelog/2025-09-16-github-mcp-registry-the-fastest-way-to-discover-ai-tools/
60. MCP Specification — Key Changes, 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/changelog
61. GitHub Changelog — "GitHub MCP Server supports the next MCP specification" (2026-07-23) — https://github.blog/changelog/2026-07-23-github-mcp-server-supports-the-next-mcp-specification/
62. MCP docs — Governance and Stewardship — https://modelcontextprotocol.io/community/governance
63. MCP Specification — landing, 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28
64. MCP docs — Security Best Practices (2026-07-28 docs tree) — https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices
65. MCP Blog — "The New MCP Roadmap" (2026-08-22) — https://blog.modelcontextprotocol.io/posts/mcp-roadmap/
66. MCP docs — Roadmap (five priority areas) — https://modelcontextprotocol.io/development/roadmap
67. MCP Specification — Transports, 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/basic/transports
68. Claude Code Docs — "Connect Claude Code to tools via MCP" — https://code.claude.com/docs/en/mcp
69. Microsoft Learn — "Using MCP Tools" (Agent Framework) — https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools
70. LangChain Docs — "Model Context Protocol (MCP)" / MCPAdapter — https://docs.langchain.com/oss/python/langchain/mcp
71. library.mikesailab.com — MCP Protocol News roundup (2026-09-25; secondary) — https://library.mikesailab.com/news/ai-news/mcp-news/september-2026/2026-09-25/
72. BestHub — "MCP Protocol Gets Skills" (SEP-2640; secondary) — https://www.besthub.dev/articles/mcp-protocol-gets-skills-standardized-agent-workflows-now-built-in-1e52d682b57f
73. MCP docs — SEP-2127: MCP Server Cards — https://modelcontextprotocol.io/seps/2127-mcp-server-cards
74. Claude Help Center — "Getting started with local MCP servers on Claude Desktop" — https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop
75. Claude Docs — "Claude Desktop on 3P: MCP, plugins, skills, and hooks" — https://claude.com/docs/third-party/claude-desktop/extensions
76. Claude Docs — "Connect to external tools with MCP" (Agent SDK) — https://code.claude.com/docs/en/agent-sdk/mcp
77. OpenAI Help Center — "Developer mode and MCP apps in ChatGPT" — https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt (bot-blocked on direct fetch; text verified via search extraction)
78. OpenAI Developers — "Agents API: MCP connections" — https://developers.openai.com/api/docs/guides/agents-api/tools/mcp
79. Microsoft 365 Developer Blog — "MCP Apps now available in Copilot chat" (2026-04-07) — https://devblogs.microsoft.com/microsoft365dev/mcp-apps-now-available-in-copilot-chat/
80. Microsoft 365 Message Center archive — MC1227627 (MCP widgets WW rollout, 2026-02/03) — https://mc.merill.net/message/MC1227627
81. Microsoft Learn — "Microsoft MCP management MCP server reference" (preview) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-management
82. Microsoft 365 Message Center archive — RM564607 (Gov-cloud MCP agents GA June CY2026) — https://mc.merill.net/message/RM564607
83. GitHub Changelog — "MCP support in VS Code is generally available" (2025-07-14) — https://github.blog/changelog/2025-07-14-model-context-protocol-mcp-support-in-vs-code-is-generally-available/
84. microsoft/vscode — Copilot extension CHANGELOG — https://github.com/microsoft/vscode/blob/main/extensions/copilot/CHANGELOG.md
85. GitHub Docs — "Extending GitHub Copilot Chat with MCP servers" — https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-chat-with-mcp
86. JetBrains — "MCP | AI Assistant Documentation" (2026.2) — https://www.jetbrains.com/help/ai-assistant/mcp.html
87. Cursor Docs — "Model Context Protocol (MCP)" — https://cursor.com/docs/mcp
88. Cursor Docs — "Cloud Agent MCP capabilities" — https://cursor.com/docs/cloud-agent/capabilities
89. Cursor Help — "MCP integrations" — https://cursor.com/help/customization/mcp
90. Zed Docs — "Model Context Protocol" — https://zed.dev/docs/ai/mcp
91. Zed Docs — "MCP Server Extensions" (deprecation note) — https://zed.dev/docs/extensions/mcp-extensions
92. Microsoft Learn — "MCP on Windows overview" — https://learn.microsoft.com/en-us/windows/ai/mcp/overview
93. Microsoft Learn — "Manually register remote and local MCP servers (ODR)" — https://learn.microsoft.com/en-us/windows/ai/mcp/servers/mcp-manual
94. Microsoft Learn — "Securely containing MCP servers on Windows" — https://learn.microsoft.com/en-us/windows/ai/mcp/servers/mcp-containment
95. Claude Docs — "Build an MCP server for Claude" (connectors) — https://claude.com/docs/connectors/building
96. OpenAI Agents SDK (Python) — "Model context protocol (MCP)" — https://openai.github.io/openai-agents-python/mcp/
97. Microsoft Learn — "Semantic Kernel: adding MCP plugins" (carried from edition 1) — https://learn.microsoft.com/en-us/semantic-kernel/concepts/plugins/adding-mcp-plugins
98. Google ADK Docs — "Model Context Protocol tools" — https://adk.dev/tools-custom/mcp-tools/
99. MCP Blog — "Introducing the MCP Registry" (2025-09-08) — https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
100. MCP docs — The MCP Registry (About; preview banner) — https://modelcontextprotocol.io/registry/about
101. MCP Blog index (post ordering; no registry GA announcement) — https://blog.modelcontextprotocol.io/
102. modelcontextprotocol/registry — README (preview 2025-09-08; API freeze 2025-10-24; "GA release will follow later") — https://github.com/modelcontextprotocol/registry
103. modelcontextprotocol/registry — Releases (v1.8.0/v1.8.1, Aug 2026) — https://github.com/modelcontextprotocol/registry/releases
104. MCP docs — Registry authentication — https://modelcontextprotocol.io/registry/authentication
105. Official Registry server.json requirements — https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/official-registry-requirements.md
106. MCP docs — Registry FAQ — https://modelcontextprotocol.io/registry/faq
107. mcpstepbystep — "MCP Registry Guide: Where to Find MCP Servers (2026)" — https://mcpstepbystep.com/learn/finding-servers/
108. JFrog blog — "The JFrog MCP Registry is GA" (2026-03-18) — https://jfrog.com/blog/announcing-general-availability-of-the-jfrog-mcp-registry/
109. AWS — "AWS Agent Registry … now generally available" (2026-08-31) — https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/
110. Workato — "MCP Registry — Now Generally Available" (Aug 2026) — https://www.workato.com/product-hub/changelog/mcp-registry-now-generally-available/
111. Docker Docs — "Docker MCP Catalog and Toolkit" — https://docs.docker.com/ai/mcp-catalog-and-toolkit/
112. Docker Blog — "Custom MCP Catalogs and Profiles" (GA, 2026-05-15) — https://www.docker.com/blog/create-custom-mcp-catalogs-and-profiles/
113. Docker Blog — "Docker MCP Catalog: a secure way to discover and run MCP servers" (trust tiers) — https://www.docker.com/blog/docker-mcp-catalog-secure-way-to-discover-and-run-mcp-servers/
114. gaintage — "How Many MCP Servers Are There? (Oct 2026 Count)" — https://gaintage.com/blog/mcp-server-statistics
115. popmcp — "MCP Server Directory Comparison: 7 Places to Look (2026)" — https://www.popmcp.com/blog/mcp-server-directory-comparison/
116. Smithery — servers page ("14,161 servers found", own fetch 2026-10-09) — https://smithery.ai/servers
117. Forbes — "Arcade Acquires Smithery To Own The Agent Tool Supply Chain" (2026-08-10) — https://www.forbes.com/sites/janakirammsv/2026/08/10/arcade-acquires-smithery-to-own-the-agent-tool-supply-chain/
118. github/github-mcp-server — Releases (v1.12.0, Sept 2026) — https://github.com/github/github-mcp-server/releases
119. Stripe Docs — "Model Context Protocol (MCP)" — https://docs.stripe.com/mcp
120. Shopify Docs — "Storefront MCP server" (incl. UCP catalog endpoint) — https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront
121. Microsoft Learn — "Get started with Learn MCP Server in Copilot Studio" — https://learn.microsoft.com/en-us/training/support/mcp-get-started-copilot-studio
122. AWS — Amazon Bedrock AgentCore pricing — https://aws.amazon.com/bedrock/agentcore/pricing/
123. GitHub Blog — "How to find, install, and manage MCP servers with the GitHub MCP Registry" (44 servers, 2025-10-24) — https://github.blog/ai-and-ml/generative-ai/how-to-find-install-and-manage-mcp-servers-with-the-github-mcp-registry/
124. MCP docs — SDKs (ten SDKs and tiers, fetched 2026-10-09) — https://modelcontextprotocol.io/docs/2026-07-28/sdk
125. MCP Blog — "The Official Ruby SDK for MCP Reaches 1.0" (2026-07-27) — https://blog.modelcontextprotocol.io/posts/ruby-sdk-1-0/
126. Ruby SDK Tier 2 Assessment (GitHub issue #3127) — https://github.com/modelcontextprotocol/modelcontextprotocol/issues/3127
127. NVD — CVE-2026-59822 (LiteLLM) — https://nvd.nist.gov/vuln/detail/CVE-2026-59822 (JavaScript-rendered on direct fetch; corroborated by [26, 29])
128. NVD — CVE-2026-77244 (mcp-atlassian) — https://nvd.nist.gov/vuln/detail/CVE-2026-77244 (JavaScript-rendered on direct fetch; corroborated by [27])
129. GHSA-wrhw-j3f9-8vc6 — mcp-atlassian security advisory — https://github.com/sooperset/mcp-atlassian/security/advisories/GHSA-wrhw-j3f9-8vc6
130. TNW — "Google, JPMorgan and two governments fixed the same MCP flaw" (Oct 2026) — https://thenextweb.com/news/mcp-flaw-ssrf-google-jpmorgan-dinum-protocol-pivoting
131. Data Phoenix — "Four public records show recurring MCP SSRF fixes — and a fifth claim" (2026-10-05) — https://dataphoenix.info/news/mcp-ssrf-fixes-four-public-records-fifth-claim
132. OX Security — "MCP STDIO Command Injection: Full Vulnerability Advisory" (2026-04-15; 30-page paper is PDF-only, parsing blocked) — https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/
133. The Register — "Anthropic won't own MCP 'design flaw' putting 200K servers at risk" (2026-04-16) — https://www.theregister.com/security/2026/04/16/mcp-design-flaw-puts-200k-servers-at-risk-researcher/5222022
134. MCP docs — Local Server Security (2026-07-28 docs tree) — https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/local-server-security
135. Anthropic — Connector verification (Community vs Verified) — https://claude.com/docs/connectors/verification
136. Anthropic — Connector pre-submission checklist — https://claude.com/docs/connectors/pre-submission-checklist
137. Microsoft Security Blog — "The state of MCP security in 2026" — https://techcommunity.microsoft.com/blog/microsoft-security-blog/the-state-of-mcp-security-in-2026/4531327 (JavaScript-rendered on direct fetch; recorded by research pass T3)
138. Microsoft — "OWASP MCP Top 10" Azure implementation guide (MCP01–MCP10) — https://microsoft.github.io/mcp-azure-security-guide/
139. Microsoft Learn — Entra Global Secure Access: MCP firewall — https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-configure-mcp-firewall
140. OpenAI Developers — "MCP server" (Apps SDK concepts) — https://developers.openai.com/apps-sdk/concepts/mcp-server
141. OWASP — MCP Security Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
142. NSA Cybersecurity Information Sheet — MCP security (June 2026; PDF-only, parsing blocked) — https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF
143. Stacklok — "State of MCP in Software 2026" (PDF, parsed during review; 41% production All-respondents, 45% Software-respondents) — https://stacklok.com/wp-content/uploads/2026/01/State-of-MCP-in-Software-2026_FINAL.pdf
144. Digital Applied — "MCP adoption statistics" (publisher of the retracted 78% figure) — https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol
145. Bloomberg — "What We Learned Building Enterprise MCP at Bloomberg" (2026-07-21) — https://www.bloomberg.com/company/stories/what-we-learned-building-enterprise-mcp-at-bloomberg/ (403 on direct fetch; corroborated by [146])
146. Glama — "Scaling enterprise GenAI with MCP: Bloomberg case study" (9,500+ engineers; secondary) — https://glama.ai/blog/2025-07-19-scaling-enterprise-gen-ai-with-mcp-bloomberg-case-study
147. Uber — "Solving the agent identity crisis" — https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/
148. AWS Blog — "How Smartsheet built a remote MCP server on AWS" — https://aws.amazon.com/blogs/machine-learning/how-smartsheet-built-a-remote-mcp-server-on-aws/
149. Anthropic — Chronograph customer story — https://claude.com/customers/chronograph
150. Propel Software — "First to launch production MCP for PLM" (2026-06-25) — https://www.propelsoftware.com/news/first-to-launch-production-mcp-for-plm
151. bex.co — "MCP state-of-play" (source of the untraceable "28% of Fortune 500" figure; secondary) — https://bex.co/blog/2026/09/24/mcp-transition-technology-infrastructure-first-deploy-api
152. ACM — "Model Context Protocol (MCP): Landscape, Security Threats…" (Sept 2025 survey) — https://dl.acm.org/doi/10.1145/3796519
153. GitHub Discussion #3407 — "MCP Core Maintainer Meeting - September 30, 2026" (SEP-3398, SEP-3392, triggers-and-events SEP task) — https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/3407
154. Linux Foundation press — "A2A Protocol Surpasses 150 Organizations…" (2026-04-09) — https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year
155. modelcontextprotocol/experimental-ext-triggers-events — WG incubation repo (no accepted SEP) — https://github.com/modelcontextprotocol/experimental-ext-triggers-events
156. VS Code docs — "Agent plugins in VS Code" — https://code.visualstudio.com/docs/agent-customization/agent-plugins
157. agentgateway/agentgateway — repository (Linux Foundation project) — https://github.com/agentgateway/agentgateway
158. microsoft/mcp-gateway — repository (stateless rewrite; requires `2026-07-28` clients; no transport-session storage) — https://github.com/microsoft/mcp-gateway
159. stacklok/toolhive — repository — https://github.com/stacklok/toolhive
160. jacar.es — "MCP specification 2026-07-28 and what it breaks" (2026-09-07; secondary; deprecated-features registry reading) — https://jacar.es/en/mcp-specification-2026-07-28/
161. jacar.es — "Consolidated MCP ecosystem: a quick map for 2026" — https://jacar.es/en/consolidated-mcp-ecosystem-a-quick-map-for-2026/
162. MCP Specification — Subscriptions, 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/subscriptions
163. SEP-1288: WebSocket Transport (GitHub issue #1288; closed dormant 2026-06-26) — https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1288
164. lasso-security/mcp-gateway — repository (last commit 2026-01-22) — https://github.com/lasso-security/mcp-gateway
165. Microsoft Learn — "Connect agents to MCP server endpoints" (Foundry) — https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/model-context-protocol
166. Forkast — "The Open-Source Enterprise Agent Offensive" (secondary; source of the "fourteen-plus vendors" state-management count and Atlassian MCP usage figures) — https://forkast.news/the-open-source-enterprise-agent-offensive-how-open-models-protocols-and-governance-are-winning-the-standards-war/
167. MCP docs — Extensions Overview — https://modelcontextprotocol.io/extensions/overview
168. CISA — Known Exploited Vulnerabilities catalog (feed version 2026.10.08; KEV rows for CVE-2026-42271 added 2026-06-08, CVE-2026-59822 and CVE-2026-48710 added 2026-09-02) — https://www.cisa.gov/known-exploited-vulnerabilities-catalog
169. Jan Wildeboer (jwatte.com) — MCP registry census (24,240 distinct servers, 2026-08-22; baseline for the growth delta in §2) — https://jwatte.com/blog/mcp-servers-for-small-business/
