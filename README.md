# The State of the Model Context Protocol

**A source-verified white paper · August 2026**

[![Download the white paper (PDF)](https://img.shields.io/badge/Download-white_paper_PDF-1B365D?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://github.com/dspachos/state-of-mcp-report/raw/main/state-of-mcp-whitepaper.pdf)

**25 pages · two-column · 4 figures · 123 cited sources** — every URL fetched and checked on 2026-08-25.

> Twenty-one months in, MCP isn't a promising standard anymore — it's load-bearing infrastructure. This paper covers the backward-incompatible stateless rewrite (2026-07-28), the handover to the Linux Foundation, who actually supports it across desktop / IDE / OS / web / API surfaces, ecosystem numbers that disagree by 3×–11×, and why security posture depends on implementation discipline more than the spec.

**How it was made:** four parallel research passes, lead synthesis, an independent citation-verification pass, and an adversarial review (30 of 123 sources independently re-fetched; all load-bearing claims matched; no fatal findings; 12 corrections applied and itemized below). Residual limitations are stated inline.

---

## 1. Executive Summary

The Model Context Protocol (MCP) is an open, JSON-RPC-based protocol that standardizes how AI applications ("hosts"/"clients") connect to external tools, data, and prompts exposed by "servers" [1, 5]. Twenty-one months after Anthropic introduced it (November 2024) [1, 9], MCP has become the de facto integration standard at the agent-to-tools/data boundary — a placement reflected in analyst framing that now treats MCP as an "Early Majority" technology [105] — and it has changed institutional hands in the process [15].

**Where it is now:**

- **Specification:** The current GA specification is dated **2026-07-28** — the fifth published version of the protocol, following 2024-11-05, 2025-03-26, 2025-06-18, and 2025-11-25 [3, 6, 7, 8]. It is a radical, backward-incompatible simplification: a *stateless core* (no initialization handshake, no session IDs) [2, 3], a formal *extensions framework* (Tasks, MCP Apps, Enterprise-Managed Authorization) [2, 3], hardened OAuth (RFC 8707 resource indicators, RFC 9207 issuer validation, Client ID Metadata Documents replacing Dynamic Client Registration) [3, 2], and the formal deprecation of Roots, Sampling, Logging, the legacy HTTP+SSE transport, and DCR, each with a minimum twelve-month offramp [3, 12].
- **Governance:** MCP is **no longer Anthropic-owned**. On **2025-12-09** it was donated to the **Agentic AI Foundation (AAIF)**, a Linux Foundation directed fund co-founded by Anthropic, Block, and OpenAI, with support from Google, Microsoft, AWS, Cloudflare, and Bloomberg [15, 16, 17]. Technical governance (maintainers + SEP process) is unchanged by the move [16, 14].
- **Support:** MCP runs natively across **desktop apps** (Claude Desktop [30]; ChatGPT apps with caveats [34, 35]), **IDEs** (VS Code [46], Visual Studio [47], JetBrains [48, 49], Cursor [50], Windsurf [51], Zed [52]), **the OS layer** (Windows On-Device Registry, public preview) [53, 54], **web apps and agent platforms** (Claude connectors [31], Copilot Studio [41], Gemini Enterprise [43], Microsoft Foundry [55], AWS Bedrock AgentCore [56], Cloudflare [58]), **APIs and headless SDKs** (OpenAI Responses API [37] and Agents SDK [38], Anthropic Messages API MCP connector [33], Claude Agent SDK / Claude Code [32], LangChain/LangGraph [60, 61], Microsoft Agent Framework [62], Google ADK [64]), and **first-party API servers** (GitHub [65, 66, 67], Stripe [68], Shopify [69], Microsoft Learn [70]). No first-party local stdio MCP support is documented on any mobile platform; see §5.6 for the hedged mobile picture [31, 34].
- **Ecosystem scale:** Directory counts conflict by methodology — **24,240** distinct servers in the official Registry per a third-party census (2026-08-22) [73], **77,817** listings in Glama (2026-08-25) [74], **22,070** in PulseMCP (2026-08-14) [75], **6,798** in Smithery (2026-08-25) [76], and **300+** Docker-verified [71]; an independent verified catalog counts only **8,433** servers and describes that figure as a floor [75]. Ten official SDKs exist; maintainers cited "close to half-a-billion downloads a month" across Tier 1 SDKs at the GA release [26, 2].
- **Security:** A documented attack surface (tool poisoning [86], rug pulls [87], prompt injection [86, 96], token passthrough [27, 28], DNS rebinding [29], malicious packages — including what Koi Security characterized as the first real-world malicious MCP server seen in the wild (September 2025) [90, 91]) is being met by spec-level OAuth hardening [3, 27] and vendor guidance [94, 96], but remains the top enterprise risk.

**Where it is going:** The maintainer roadmap (August 2026) prioritizes five areas: agentic messaging primitives (webhooks/channels; Tasks maturing toward core), HTTP-native transport unification (Streamable HTTP over stdio; ETag caching), agent identity and enterprise security (DPoP, workload identity, token exchange), improved primitives (a single tool-result contract, progressive discovery for large catalogs), and SDK/conformance tooling [22]. Google's A2A protocol — officially complementary to MCP, agent-to-agent — is joining the same foundation, consolidating the two protocols under one neutral home [115, 116]. OpenAI's Apps SDK [117, 36] and the cross-vendor Agent Plugins 1.0 standard [119, 120] both build *on top of* MCP rather than replacing it; no major vendor has been verified to deprecate MCP support (absence of evidence, not proof).

**Bottom line:** MCP has crossed from "promising standard" to "load-bearing infrastructure" for the agent ecosystem, with the credibility risks that entails: a breaking 2026-07-28 rewrite now in its migration window [3, 110], a registry still in preview [18, 19], unverified adoption claims from directories [73, 74, 75, 76], and unresolved scaling problems at the many-tools frontier [106].

---

## 2. What MCP Is (Primer)

MCP follows the Language Server Protocol (LSP) playbook: the specification itself states that MCP "takes some inspiration from the Language Server Protocol," standardizing a small, capability-negotiated JSON-RPC contract [5]. A compliant client interoperates with any compliant server, replacing N×M bespoke integrations with N+M. An MCP **server** exposes primitives — **tools** (model-invocable functions), **resources** (readable data), and **prompts** (templated interactions) — plus optional capabilities; a **host** embeds one or more **clients**, each connecting to one server over a transport [5]. MCP is transport-agnostic in principle; in the 2026-07-28 specification exactly two transports are standard: **stdio** (newline-delimited JSON-RPC over a client-launched subprocess) and **Streamable HTTP** (every request is an HTTP POST returning JSON or a request-scoped SSE stream) [4].

---

## 3. History and Governance

### 3.1 Timeline of milestones

| Date | Event | Status |
|---|---|---|
| 2024-11-25 | Anthropic announces MCP; the initial spec snapshot is dated 2024-11-05 [1, 5, 9] | Shipped |
| 2025-03-26 | Spec adds OAuth 2.1, Streamable HTTP, JSON-RPC batching, tool annotations [6]; OpenAI begins adopting MCP in its developer platform (Agents SDK MCP support [38]; see also the March 2025 community anticipation of MCP in Responses [118]) | Shipped |
| 2025-05-19 | Microsoft Build: broad first-party MCP support across GitHub, Copilot Studio, Dynamics 365, Azure AI Foundry, Semantic Kernel, and Windows 11; Microsoft/GitHub join the MCP Steering Committee [112] | Announced, rolled out over following months |
| 2025-06-18 | Spec: structured tool output; servers as OAuth resource servers (RFC 8707); elicitation; resource links; batching removed [7] | Shipped |
| 2025-06-23 | Google donates A2A to the Linux Foundation [113] | Shipped |
| 2025-07-31 | MCP governance formalized (maintainer structure; SEP process) [14] | Shipped |
| 2025-09-08 | Official MCP Registry opens in preview [18] | Preview |
| 2025-11-25 | "One Year of MCP" spec: OIDC discovery, icons, Client ID Metadata Documents, experimental tasks, governance SEPs [8, 9] | Shipped |
| 2025-12-09 | MCP donated to the Agentic AI Foundation (Linux Foundation) [15, 16, 17] | Shipped |
| 2026-01-26 | MCP Apps official extension announced [24] | Shipped |
| 2026-03 | First published maintainer roadmap (four priority areas: transport evolution/scalability, agent communication, governance maturation, enterprise readiness) [23] | Shipped (document) |
| 2026-07-28 | Stateless-core specification GA (backward-incompatible); formal deprecation policy [2, 3] | Shipped |
| 2026-08 (late) | Updated roadmap (five priority areas) [22] | Shipped (document) |
| 2026-08-17 | A2A announced to join AAIF [116] | Announced, in progress |

### 3.2 Governance model

- **Stewardship:** AAIF (Linux Foundation directed fund), co-founded by Anthropic, Block, and OpenAI; founding projects MCP, goose, AGENTS.md; platinum members include AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, and OpenAI [15, 16, 17].
- **Technical direction:** unchanged — maintainers decide, guided by the SEP (Specification Enhancement Proposal) process introduced 2025-07-31 [14], Working/Interest Groups formalized in the 2025-11-25 revision (SEP-1302) [8], and a formal feature-lifecycle/deprecation policy with minimum twelve-month deprecation windows adopted with 2026-07-28 [3, 12].
- **Standards bodies:** No IETF working group for MCP as of 2026-08-25. The CATALIST BoF request at IETF 125 is marked "Not WG Forming" on Datatracker — no working group was chartered [111]. MCP maintainers instead engage IETF OAuth and WIMSE on building blocks (DPoP, token exchange, workload identity) [22].

---

## 4. The Current Specification (2026-07-28)

### 4.1 The stateless core

The defining change of the current spec: MCP removed the initialization handshake (`initialize`/`notifications/initialized`) and protocol-level sessions (`Mcp-Session-Id`) [2, 3]. Every request is self-describing — protocol version, client identity, and capabilities ride in `_meta` on each call; servers identify themselves via `serverInfo` in results [3]. A new `server/discover` RPC (MUST be implemented by servers; optional for clients) lets clients probe versions/capabilities/identity before connecting, including as a backward-compatibility probe on stdio [3]. Cross-call state moves to explicit, server-minted handles passed as tool arguments [2, 3].

Supporting changes:

- **Multi Round-Trip Requests (MRTR)** replace all server-initiated requests (elicitation, sampling, roots): the server returns `resultType: "input_required"` with `inputRequests`, and the client retries with `inputResponses`; all results now carry a required `resultType` [3].
- **Cacheable list results:** `tools/list`, `prompts/list`, `resources/*` return `ttlMs` and `cacheScope` (`public`/`private`), plus deterministic tool ordering for prompt-cache stability [3].
- **`subscriptions/listen`:** one opt-in POST-response stream for change notifications, replacing the GET stream and `resources/subscribe` [3].
- Removed: `ping`, `logging/setLevel`, SSE resumability (`Last-Event-ID`). Log level becomes per-request `_meta` [3].
- **Operational alignment:** `Mcp-Method`/`Mcp-Name` headers are required on Streamable HTTP POSTs so intermediaries (gateways, CDNs) can route without parsing bodies; OpenTelemetry trace-context conventions for `_meta` are documented [2, 3].

### 4.2 Primitives, and what got deprecated

Server primitives today: **tools** (with `structuredContent` output since 2025-06-18 [7], resource links [7], icons since 2025-11-25 [8], annotations since 2025-03-26 [6]), **resources**, and **prompts** [5]. Client/agent-facing features **Roots, Sampling, and Logging are formally deprecated** (SEP-2577) — still functional during the deprecation window, but new implementations should pass context via tool parameters/config, call model APIs directly, and use stderr/OpenTelemetry respectively [3, 2]. The experimental `tasks` capability from 2025-11-25 was moved out of core into the official **`io.modelcontextprotocol/tasks` extension**: the redesign replaces the blocking `tasks/result` with polling via `tasks/get`, adds `tasks/update` (plus `tasks/cancel`), removes `tasks/list`, and allows servers to return task handles unsolicited (SEP-2663) [3, 10].

### 4.3 Transports

- **Standard:** stdio and Streamable HTTP only [4].
- **Deprecated:** the 2024-11-05 HTTP+SSE dual-endpoint transport — replaced by Streamable HTTP in 2025-03-26 [6], formally classified Deprecated under the lifecycle policy in 2026-07-28 with a year-long offramp [3].
- **WebSocket:** not a standard transport. The spec permits custom transports that preserve JSON-RPC message patterns and the per-request metadata model [4]; the WebSocket SEP (issue #1288) remains an unaccepted proposal — its GitHub status is "in-review" as of 2026-08-25, not adopted into the spec [13].
- **Roadmap direction:** Streamable HTTP as the single binding, "spoken over" stdio for local servers, with HTTP/2 over stdio explored for multiplexing [22].

### 4.4 Authorization

OAuth 2.1 lineage, hardened across revisions: OAuth 2.1 framework since 2025-03-26 [6]; RFC 8707 resource indicators and resource-server classification since 2025-06-18 [7]; OIDC discovery and incremental consent since 2025-11-25 [8]; RFC 9728 Protected Resource Metadata alignment [8]. In 2026-07-28: RFC 9207 `iss` validation (clients MUST validate before code redemption — closing authorization-server mix-up), client credentials bound to the issuing AS, and **Dynamic Client Registration deprecated in favor of Client ID Metadata Documents (CIMD)** [3, 2]. An **Enterprise-Managed Authorization (EMA)** extension adds enterprise identity flows built on the ID-JAG grant (Identity Assertion JWT Authorization Grant) [25].

### 4.5 Extensions framework

Formalized in 2026-07-28: optional, additive, independently versionable extensions negotiated via an `extensions` capability field; experimentation in `experimental-ext-*` repositories pre-SEP (SEP-2133) [3, 11]. Official extensions today: **Tasks** [3, 10], **MCP Apps** (interactive UI surfaces for MCP-hosted apps, announced 2026-01-26) [24], and **Enterprise-Managed Authorization** [25].

---

## 5. What Is Supported, and Where

This is the support landscape as of 2026-08-25, verified against official vendor documentation. Caveats are stated inline; cells that could not be verified are marked UNVERIFIED.

### 5.1 Desktop applications

| Product | MCP support | Notes |
|---|---|---|
| Claude Desktop (Win/macOS) | GA — local stdio servers; recommended path is Desktop Extensions (`.mcpb`) [30] | The original MCP reference client [1] |
| ChatGPT desktop | Partial — built-in **apps** (MCP-based) run across surfaces; custom MCP apps are registered via Developer Mode (admin-enabled for Business/Enterprise/Edu), and full MCP including modify/write actions is "rolling out in beta" on those plans [34, 35, 36] | Registration is managed through web workspace settings [36]; no desktop-side custom-MCP registration flow is documented |
| Gemini for Mac / Google app (Windows) | None documented — the Gemini for Mac support page does not mention MCP at all [42] | UNVERIFIED whether any exists |
| JetBrains IDEs | GA — MCP **client** in AI Assistant (since 2025.1) [48]; the IDE is also an MCP **server** (bundled plugin since 2025.2, enabled by default, consumable by Claude Code, Codex, VS Code, Junie, and others) [49] | Client transport list UNVERIFIED in this pass |

### 5.2 IDEs and editors (all GA unless noted)

- **VS Code / GitHub Copilot:** native MCP support; stdio + Streamable HTTP with SSE fallback; automatic OAuth; configuration forwarded to the Agent Host [46].
- **Visual Studio 2022 (17.14+) / VS 2026:** local command-based and remote HTTP/stdio servers; organization allowlists via GitHub policy [47].
- **Cursor:** stdio, SSE, Streamable HTTP; OAuth via an `auth` object [50].
- **Windsurf (Cascade):** stdio, Streamable HTTP, SSE; OAuth per transport; 100-tool enablement cap; docs now sit under Devin Desktop [51].
- **Zed:** tools + prompts; local (command) and remote (URL) servers; standard MCP OAuth; per-tool permission keys [52].

### 5.3 Operating-system layer

- **Windows 11:** the MCP server registry is now the **Windows On-Device Registry (ODR)** — "native support for the Model Context Protocol" with agents discovering and connecting tools "via a secure, manageable Windows on-device registry," connectors contained "in a secure environment with their own identity and audit trail." **Public preview** (Insider Dev/Beta builds from 26220.7344, 2025-12-05) [53]; `odr.exe` registers local and remote MCP servers [54]. No comparable OS-level MCP integration from another major OS vendor is documented as of this writing.
- **macOS / Linux:** no equivalent OS-level registry documented (none found).

### 5.4 Web apps and hosted agent platforms

- **Claude.ai:** Connectors are remote MCP servers reached from Anthropic's cloud infrastructure with OAuth; Pro/Max configure them individually, Team/Enterprise through admin pre-approval; local-only stdio servers remain a separate Claude Desktop mechanism [31].
- **ChatGPT:** apps (the integrations formerly called "connectors") built on MCP; as of July 9, 2026 the app directory has migrated into a Plugin directory, with apps remaining the integrations that connect ChatGPT or Codex to external data and actions [35]. Developer Mode supports full MCP connectors; full write actions are beta for Business/Enterprise/Edu [34].
- **Google Gemini Enterprise:** custom MCP server connectors are described as generally available but turned off by default pending organization-policy changes (release notes, 2026-08-07) [43]; the Business-edition help page frames the same capability under Pre-GA terms and StreamableHTTP-only transport [44] — a genuine **status conflict**; resolve before relying on it. The Agent Platform also *serves* a remote MCP server endpoint usable by Gemini CLI, ChatGPT, Claude, and custom apps [45].
- **Microsoft:** Copilot Studio connects agents to external MCP servers (tools and resources) [41]; M365 Copilot **federated connectors** use an MCP model to fetch data in real time without indexing [39]; Agent Builder builds declarative agents and directs advanced integration needs to Copilot Studio — it is not an MCP configuration surface [40].
- **Microsoft Foundry:** agents consume MCP tools, and Foundry toolboxes expose an MCP-compatible endpoint authenticated with Microsoft Entra ID and RBAC; long-running MCP operations are in preview and require the MCP tasks capability [55].
- **AWS Bedrock AgentCore:** the Gateway fronts MCP servers/REST/Lambda as governed MCP endpoints with first-class MCP tools/prompts/resources, dynamic per-user listing, Streamable HTTP sessions, elicitation, and OAuth on-behalf-of token exchange (2026 expansion) [56]; the Runtime gained a stateful MCP client with elicitation, sampling, and progress notifications (2026) [57].
- **Cloudflare:** build and deploy remote MCP servers on Cloudflare over Streamable HTTP with OAuth [58]; MCP server portals aggregate internal and SaaS MCP servers behind a single Access-gated endpoint [59].

### 5.5 APIs and headless SDKs (client side)

- **OpenAI:** Responses API hosted `mcp` tool type for remote MCP servers plus OpenAI-maintained connectors (`connector_id`) [37]; Agents SDK (Python/JS) supports hosted MCP, Streamable HTTP, SSE (deprecated legacy), and stdio [38].
- **Anthropic:** Messages API MCP connector (remote MCP servers as tools in the API) [33]; Claude Agent SDK / Claude Code — MCP client over stdio, Streamable HTTP, legacy SSE, and WebSocket remote servers [32].
- **LangChain/LangGraph:** `langchain-mcp-adapters` (Python/JS) over stdio and Streamable HTTP [60]; the LangGraph Agent Server also *exposes* agents as MCP tools over Streamable HTTP [61].
- **Microsoft Agent Framework / Semantic Kernel:** Agent Framework connects to MCP servers via stdio, Streamable HTTP, and WebSocket (Python `mcp[ws]`) [62]; Semantic Kernel loads MCP servers as plugins (stdio and Streamable HTTP/SSE) [63].
- **Google ADK:** ADK agents consume external MCP servers, and ADK documents building an MCP server that wraps ADK tools; supported in the Python, TypeScript, Go, and Java kits [64].

Consistent pattern: **hosted/API clients are remote-only** (the Responses API takes a public `server_url` [37]; Claude connectors must be reachable from Anthropic's cloud [31]); stdio remains the universal local mechanism for IDEs and CLI agents [38, 32, 46].

### 5.6 Mobile

Remote-connector only. Claude mobile apps use the same claude.ai connectors brokered from Anthropic's cloud [31]; ChatGPT's built-in apps run across surfaces while Developer Mode registration remains an admin/web-settings flow [34, 36]; Gemini Enterprise mobile coverage was not verified in this pass. **No first-party local stdio MCP support is documented on any mobile platform** (absence of documentation, not confirmed absence).

### 5.7 APIs as MCP servers (the supply side)

First-party production MCP servers include **GitHub** (open-source local Go server announced 2025-04-04 [66]; remote server GA 2025-09-04 [67]; support for the "next MCP specification" announced 2026-07-23 — ahead of the official stateless release, including removal of Redis-backed sessions [65]), **Stripe** (`https://mcp.stripe.com`, OAuth) [68], **Shopify** (MCP servers for storefront commerce data) [69], **Microsoft Learn** (`https://learn.microsoft.com/api/mcp`, free, no-auth) [70], and Docker's catalog of packaged servers [71]. The **Docker MCP Catalog** packages 300+ verified containerized servers, launched in beta May 2025 with 100+ servers and named partners including Stripe, Elastic, Heroku, Pulumi, Grafana Labs, Kong, Neo4j, New Relic, and Continue.dev [71, 72]. API-management vendors expose existing REST APIs as MCP tool surfaces (Azure API Management/API Center [85]; Kong's MCP plugin [82]).

### 5.8 Registry infrastructure

The **official MCP Registry** (registry.modelcontextprotocol.io) is a metadata-only directory (`server.json`, reverse-DNS namespaces bound to verified GitHub accounts or domains via OAuth/DNS/HTTP challenges) intended as an upstream source for downstream aggregators — not a marketplace or runtime, and not designed for self-hosting as a service [20] (the repository README nonetheless documents local development/deployment workflows for contributors, which is a different thing from operating a production mirror of the official registry) [19]. It opened in **preview 2025-09-08** with explicit warnings that "breaking changes or data resets could occur" before general availability [18], and announced an **API freeze at v0.1 on 2025-10-24** [19]. As of 2026-08-25 **no GA milestone has been published** — the README still frames GA as something that "will follow later," and code releases of the registry software are not service-GA announcements [18, 19]. Unpublishing is not yet supported (open issue #104), and version metadata is immutable once published [21]. Enterprise alternatives: JFrog MCP Registry (GA announced 2026) [78], the open-source AWS MCP Gateway & Registry [79], and the Docker catalog [71].

---

## 6. Ecosystem Scale

### 6.1 Server counts (conflicting by design — not averaged)

| Directory | Count | As-of | Methodology |
|---|---|---|---|
| Official MCP Registry | 24,240 distinct servers | 2026-08-22 | Third-party census: two full paginations of the official API (794 pages; 79,341 version records deduplicated to 24,240 distinct servers); the author cautions to "treat any count you read, including mine, as a photograph rather than a fact" [73] |
| Glama | 77,817 (+14,547 hosted connectors) | 2026-08-25 | Homepage counter; includes wrappers/mirrors [74] |
| PulseMCP | 22,070 | 2026-08-14 | Directory API total as reported by a contemporaneous census [75] |
| Smithery | 6,798 | 2026-08-25 | Directory counter [76] |
| Docker MCP Catalog | 300+ verified | 2026-08-25 (docs) | Curated, container-packaged, Docker-verified subset [71] |
| Skillselion (independent catalog) | 8,433 servers (5,392 publishers) | 2026-08-14 | Verified ingestion catalog; its authors call the figure "a floor," not a cross-directory deduplication estimate [75] |

Growth signal: listings attributed to PulseMCP grew from ~12,770 (March 2026, per SettleGrid [77]) to 22,070 (2026-08-14, per Skillselion [75]) — ≈ +73% in ~5 months, though these two snapshots come from different secondary reports of PulseMCP taken by different observers five months apart, and are therefore not guaranteed like-for-like; part of the delta may be methodology drift rather than new servers. PulseMCP's own statistics pages returned HTTP 403 during verification, so no PulseMCP-published figure is asserted here, and no client count is claimed. These are listing counts, not verified active deployments; treat all headline numbers as directional [73, 75].

### 6.2 SDKs and developer surface

The current SDK documentation lists **ten official SDKs** — TypeScript, Python, C#, Go, Rust, Java, Ruby, Swift, PHP, Kotlin — with TypeScript, Python, C#, Go, and Rust currently badged Tier 1 [26]. At the 2026-07-28 release the maintainers named TypeScript, Python, Go, and C# as the four Tier 1 SDKs updated to the new spec, with the Rust SDK supporting it in beta [2]. Maintainer-stated scale at GA: "close to half-a-billion downloads a month" across Tier 1 SDKs, with TypeScript and Python each past 1 billion cumulative downloads [2]; at donation time (December 2025) Anthropic cited 97M+ monthly downloads across Python and TypeScript [15]. FastMCP (Prefect) is the dominant third-party Python framework; FastMCP 1.0 was incorporated into the official MCP Python SDK in 2024 and the standalone package continues [80, 81].

### 6.3 Management plane

Gateways/management tooling has commercialized: Docker MCP Gateway (invite-only under Docker AI Governance) [71], Kong AI Gateway's MCP plugin (proxies/aggregates MCP servers; converts APIs into MCP tool definitions) [82], Cloudflare MCP server portals [59], Azure API Management/API Center [85], Higress (AI gateway with MCP proxying/protocol conversion) [83], the open-source AWS MCP Gateway & Registry [79], and Composio's MCP Gateway [84].

### 6.4 Enterprise adoption

Named production adopters with dated sources: **Uber** (internal agent platform with MCP support across a microservices stack of "thousands of services," with an Agent Registry, Security Token Service, and MCP Gateway as a policy enforcement point [98]; headline execution numbers — ~60,000 agent executions/week, 1,500+ monthly active agents, 5,000+ engineers using AI tooling — come from secondary AAIF reporting, not Uber's own post [99]), **Smartsheet** (production remote MCP server on AWS) [100], **Chronograph** (client-facing MCP server connecting PE portfolio data to Claude) [101], **Propel** (vendor-reported first production MCP for PLM, June 2026) [104], **Fullcast** (August 2025) [103], **Moody's** (partner-reported via MarsBased) [102]. Analyst framing: InfoQ's 2026 trends report promotes MCP into the "Early Majority" category [105].

---

## 7. Security

### 7.1 Threat classes

| Threat | Description | First documented |
|---|---|---|
| Tool poisoning | Malicious instructions hidden in tool descriptions that the model obeys; demonstrated with data-exfiltration PoCs against Cursor | Invariant Labs, April 2025 [86] |
| Rug pull | Benign-at-approval server silently swaps tool definitions after consent | Invariant Labs, April 2025 [87] |
| "Line jumping" | Poisoned descriptions influence the model before any tool call ("MCP servers can manipulate model behavior without ever being invoked") | Trail of Bits, 2025-04-21 [89] |
| Prompt injection via MCP content | Poisoned tool output/external content induces unwanted model actions; a standing guidance topic | Invariant Labs (April 2025 demos) [86]; OWASP cheat sheet [96] |
| Token passthrough / confused deputy | Forwarding tokens not minted for the receiving server; explicitly forbidden by the spec | Spec security considerations; "token passthrough is explicitly forbidden" [27, 28] |
| DNS rebinding on local servers | Browser-originated requests hitting loopback servers; servers MUST validate `Origin` and bind to localhost | Spec transports security warning since 2025-03-26 [29] |
| OAuth discovery SSRF | Server/client-supplied metadata and AS URLs treated as untrusted input; HTTPS-only, block private/loopback/metadata IPs, revalidate redirects | Official best-practices guidance [28] |

### 7.2 Documented incidents

- **`postmark-mcp` npm backdoor (September 2025)** — same-name npm impersonation of Postmark's legitimate repository whose version 1.0.16 "quietly cop[ied] every email to the developer's personal server"; characterized by Koi Security as "the world's first sighting of a real world malicious MCP server" [90]; Postmark's own disclosure confirms the fake package and BCC behavior [91].
- **`@lanyer640/mcp-runcommand-server` (2025-09-30)** — legitimate-looking command-execution MCP server weaponized via a malicious update with reverse-shell `preinstall` hooks [92].
- **Cursor CVE-2025-54136** — modifying an already-trusted MCP configuration (e.g., in a shared repo) yielded persistent RCE in versions ≤1.2.4; fixed in 1.3 [93].
- Implementation-level flaws continue to surface: composition attacks combining individually plausible tools (Anthropic's Git MCP server flaws, fixed after Cyata's report) [108]; database MCP servers with SQL injection and missing authentication, with one vendor declining to patch as of 2026-05 [109].

### 7.3 Mitigations and guidance

Spec-level: RFC 8707 audience binding and resource-server obligations [7, 27], RFC 9207 `iss` validation, CIMD replacing DCR [3], and an explicit prohibition of token passthrough [27, 28]. Ecosystem: tool-definition pinning/hashing (MCP-Scan's built-in Tool Pinning verifies tool integrity via hashing [88]; OWASP recommends inspecting/pinning tool schemas with cryptographic hashes [96]), curated/verified catalogs (Docker) [71], and MCP-aware firewalls (Microsoft Entra Global Secure Access MCP firewall, preview) [95]. Guidance: official MCP security best practices (never pass tokens through; SSRF-harden OAuth discovery) [28], Microsoft's zero-trust MCP guidance [94], the OWASP MCP Security Cheat Sheet [96], and an NSA Cybersecurity Information Sheet on MCP security (June 2026; PDF-only — full text not parsed in this research) [97].

**Inference:** the spec is hardening faster than the installed base is adopting the hardening; the practical security posture of most deployments depends on client and gateway implementation quality, not the spec.

---

## 8. Where MCP Is Going

### 8.1 The maintainer roadmap (August 2026, five priority areas) [22]

1. **Agentic messaging primitives** — server-initiated events via webhooks and channels (Triggers & Events WG); cross-WG composition of Tasks/Triggers/transports; continued Tasks work "toward eventual inclusion of the extension in the core protocol."
2. **HTTP-native transport unification** — Streamable HTTP as the single binding spoken over stdio (HTTP/2 over stdio for multiplexing); caching extended to ETags; standardized error handling; capability scoping for tool lists.
3. **Agent identity and enterprise security** — DPoP finalization and adoption; Workload Identity Federation (SEP-1933), ID-JAG (used by Enterprise-Managed Authorization), and RFC 8693 token exchange, coordinated with IETF OAuth and WIMSE.
4. **Improved primitives** — one clear `tools/call` result contract (today `content` vs `structuredContent` "has confused server and client authors alike"); **progressive discovery** so clients "learn a server's tools and resources as they need them instead of ingesting the full catalog up front"; File Uploads WG continues.
5. **SDK developer experience** — the extension contract; a generated-artifacts experiment (generate a Tier 1 SDK from the spec and validate against the conformance test suite).

### 8.2 Consolidation signals

- **A2A joining AAIF** (announced August 2026, reported dated 2026-08-17 by press coverage; the AAIF page itself was fetched without a visible publish date: "Agent2Agent (A2A), the open standard for inter-agent communication, is joining the Agentic AI Foundation (AAIF) as a hosted project") puts both protocols under one neutral home [116]. A2A reported 150+ supporting organizations as of 2026-04-09, with production use in supply chain, financial services, insurance, and IT operations, and integration into Azure AI Foundry/Copilot Studio and Amazon Bedrock AgentCore Runtime [114]. A2A and MCP are officially complementary: "MCP is for agent-to-tool communication… A2A is for agent-to-agent communication… They are complementary" [115].
- **OpenAI** built the Apps SDK explicitly on MCP — "an open standard built on the Model Context Protocol (MCP)… It extends MCP so developers can design both the logic and interface of their apps" — open-sourced so apps "can run anywhere that adopts this standard" (DevDay, October 2025) [117]; the current help center describes the app/plugin directory and Developer Mode full MCP connectors [35, 34, 36].
- **Agent Plugins 1.0** (spec published 2026-08-06 with AWS, Anysphere, Microsoft, OpenAI, and Vercel, with Google joining as core maintainer the same day) is "an open standard that packages agent skills and MCP servers into one installable plugin that is governed independently of any single vendor" — a packaging layer above MCP, GA in VS Code, Copilot CLI, the GitHub Copilot SDK, and the GitHub Copilot app [119, 120].
- **Anthropic** donated the protocol [15] and is platformizing around it: Tool Search and Programmatic Tool Calling, built explicitly "to help optimize production-scale MCP deployments, handling thousands of tools efficiently" [15, 121]; Xcode 26.3 ships a native Claude Agent SDK integration [122].
- **No verified case of a major vendor deprecating MCP** was found. The pattern is layers on top, not replacement — Cursor's plugin system itself now "package[s] skills, subagents, MCP servers, hooks, and rules, into a single install" [123]. (Absence of evidence, not proof.)

### 8.3 Fragmentation vectors that remain real

Optional-extension skew across implementations [22]; the registry still preview with deliberately limited moderation and delegated curation [18, 19, 20, 21]; parallel proprietary plugin formats (Cursor) [123]; adjacent protocols overlapping at the edges (A2A, UCP, AP2, A2UI and others) [107]. The Register's "alphabet soup" critique and UTCP's argument that wrapping plain APIs in MCP adds overhead and attack surface without necessity remain the strongest skeptical voices [107].

---

## 9. Criticisms and Open Problems

1. **Many-tools scaling.** The best-quantified criticism: Microsoft Research's survey of 1,470 MCP servers found most expose ≤4 tools, but the largest exposes 256 and GitHub's server exposes 91; across 2,443 tool calls the median output was 98 tokens versus a mean of 4,431, and the single worst tool averaged 557,766 tokens; tool-calling performance drops as tool count rises (up to 85% for some models — a figure MSR attributes to an external study, arXiv:2505.10570, not independently verified here) [106]. Progressive discovery (roadmap) [22] and Tool Search (Anthropic) [121] are the responses in flight.
2. **Migration burden from the stateless rewrite.** The 2026-07-28 spec is backward-incompatible; custom implementations must rework session/state handling, MRTR, and auth flows during the ≥12-month deprecation windows [3, 12]. Early adoption is visible (GitHub MCP Server, 2026-07-23, including removal of Redis-backed sessions) [65], and the maintainers acknowledge the "uplift" for home-grown implementations [110], but broad ecosystem compliance is unmeasured.
3. **Directory-count inflation and unverifiable scale claims.** Headline server counts vary roughly 3× to 11× depending on the pair (the extreme pair being Glama 77,817 vs Smithery 6,798); the one independent verified catalog suggests the underlying reality is far smaller than listing counts [73, 74, 75, 76].
4. **Registry immaturity.** Preview status with possible data resets [18], no self-published totals [73], no unpublish support, immutable published versions [21], limited moderation with curation delegated to aggregators [20].
5. **Security adoption lag.** Attacks target implementations and the supply chain, not just the spec; guidance exists [28, 94, 96] but adoption is uneven [90, 109].
6. **Web/desktop/mobile asymmetry.** ChatGPT custom MCP remains an admin/web-settings flow [34, 36]; consumer Gemini desktop has nothing documented [42]; mobile is remote-connector-only [31]; OS-level integration exists only on Windows (preview) [53].

---

## 10. Recommendations for Adopters

1. **Build servers remote-first on Streamable HTTP**, OAuth 2.1 with RFC 8707 audience binding, and CIMD [3, 4, 27]; target the 2026-07-28 spec but keep a compatibility story for handshake-era clients during the migration window [3, 12].
2. **Do not adopt newly deprecated features** (Roots, Sampling, Logging, HTTP+SSE, DCR); migrate existing uses within the twelve-month windows [3, 12].
3. **Treat every third-party MCP server as untrusted code**: pin/hash tool definitions [88, 96], scan descriptions [88], scope credentials narrowly, and never pass tokens through [27, 28]. Prefer curated/verified catalogs (Docker, enterprise registries) over open directories [71, 78, 79].
4. **Gate MCP traffic** through a gateway or management plane (Docker, Kong, Cloudflare, Azure APIM, AWS, Composio) for auth, allowlisting, and observability [71, 82, 59, 85, 79, 84].
5. **Design for progressive discovery** and small tool surfaces; avoid exposing large flat tool lists to models [106, 22].
6. **Track the Tasks extension and webhooks/channels workstream** if you need long-running operations today [10, 22].

*(These recommendations synthesize the cited guidance and roadmap; they are inferences, not vendor-endorsed doctrine.)*

---

## 11. Open Questions (unresolved by available evidence)

- When does the **official Registry** reach GA, and will it publish authoritative counts? (No GA milestone as of 2026-08-25 [18, 19].)
- **Gemini Enterprise MCP connector status** — GA or Public Preview? (Conflicting official pages [43, 44].)
- How quickly does the **installed base adopt 2026-07-28**? No published compliance telemetry exists yet.
- Does the A2A→AAIF move produce real **MCP/A2A interop patterns**, or coexistence only? [115, 116]
- Will **WebSocket** ever become standard, or does "HTTP over stdio" fully absorb the use cases? (SEP-1288 still in review [13]; roadmap says HTTP-native [22].)
- Actual **unique active server count** — no methodology-verified number exists [73, 75].
- MCP registry counts and client counts are moving targets; all figures in this paper carry their as-of dates.

---

## 12. Conclusion

MCP in August 2026 is a young protocol that has already been through a standard's-worth of history: invented by one vendor [1], adopted by its competitors [9, 112], neutralized into a Linux Foundation home [15, 17], and rewritten for stateless, HTTP-native operation at enterprise scale [2, 3]. Its support surface now spans desktop apps, IDEs, an OS layer, web platforms, headless APIs, and first-party API servers from major SaaS vendors (§5). The trajectory — tasks toward core, webhooks, agent identity, progressive discovery, conformance tooling [22] — reads like deliberate maturation toward production infrastructure. The honest counterweights are a breaking migration in progress [3, 110], a supply chain still dominated by unverified directories [73, 74, 75, 76], quantified scaling problems [106], and security that depends more on implementation discipline than on the spec [90, 109, 28]. For adopters, MCP is now the rational default at the agent-to-tools boundary — approached with gateway governance, narrow trust, and an eye on the deprecation clock.

---

---

<details>
<summary><strong>Verification log — corrections made during citation and review passes</strong></summary>

## Removed Unsupported Claims and Verification Adjustments

The following changes were made during citation verification (all source URLs fetched 2026-08-25):

1. **Updated directory counts.** Glama's live counter read 77,817 servers / 14,547 connectors (was 77,243/14,397 in the draft) [74]; Smithery's directory read 6,798 servers (was 6,551) [76]. Both are moving counters.
2. **Recharacterized the "8,433 unique servers" claim.** The source presents 8,433 as Skillselion's own verified-catalog total and explicitly "a floor," not a cross-directory deduplication estimate; the draft's "independent deduplication census estimates only ~8,400 unique servers" framing was corrected accordingly [75].
3. **Removed "PulseMCP lists 555 MCP-capable clients."** PulseMCP's statistics/client pages returned HTTP 403 and the figure could not be verified.
4. **Corrected SEP-1288 status.** The draft said the WebSocket SEP was "closed as dormant"; the live GitHub issue shows status "in-review" (sponsored), i.e., still an unaccepted proposal [13]. The substantive claim (WebSocket is not a standard transport) is carried by the spec itself [4].
5. **Removed the VS Code caveat** that the built-in local Copilot agent harness "reaches only local, no-auth servers." The cited agent-harnesses URL is 404, and the replacement page documents no such authentication limitation [46].
6. **Removed "Claude Code can run as an MCP server."** Not present in the current Claude Code MCP reference; the row now lists its verified client transports (stdio, Streamable HTTP, SSE, WebSocket) [32].
7. **Removed the Anthropic "Managed Agents" mention.** The platform documentation page could not be content-verified during this pass.
8. **Removed "Anthropic Messages API connector: no stdio."** The connector's existence is kept [33]; the no-stdio parenthetical could not be verified against the page content.
9. **Softened "OpenAI renamed connectors to apps (2025-12-17)."** The current help page no longer displays that dated note; it now describes a July 9, 2026 migration of the app directory into a Plugin directory [35]. The DevDay origin of apps (October 2025, built on MCP) is cited instead [117].
10. **Removed the ChatGPT "March 2025 coming soon for desktop MCP" note** and replaced the "Developer Mode is web-only" assertion with what the help pages verify: registration is an admin/web workspace-settings flow, with full write actions in beta for Business/Enterprise/Edu [34, 36].
11. **Removed unverified vendor-feature details:** Visual Studio's "built-in Microsoft Learn MCP server" (not on the VS page; the server itself is cited separately [70]); Semantic Kernel Python "can expose an MCP server"; Agent Framework "hosted MCP"; ADK "experimental agent-as-MCP-server export" (generalized to what the ADK docs state [64]); Shopify's "Dev MCP / Customer Accounts MCP" names (generalized [69]); Stripe's local `npx @stripe/mcp` CLI (not on the page [68]); Kong "Enterprise, Gateway 3.12+" (not on the page [82]); Higress "CNCF sandbox" (not on the page [83]); Cloudflare "stateless recommended," "2026-07-28 supported," and "operates managed MCP servers" (not on the cited page [58]).
12. **Softened date precision where pages don't print dates:** AWS AgentCore Gateway expansion and Runtime stateful MCP client now cited as "2026" (the 2026-06-01 / 2026-04-09 dates were not printed on the pages) [56, 57]; JFrog MCP Registry GA cited without a day-precision date [78]; Invariant's tool-poisoning disclosure cited as "April 2025" rather than 2025-04-01 [86]; CATALIST BoF described by its Datatracker status ("Not WG Forming") rather than "concluded" [111]; IETF 125 / 2026-06-11 status details dropped as unverifiable from the fetched page.
13. **Removed GA/preview labels not printed on cited pages** (Copilot Studio "GA"; Foundry consumption "GA" — replaced with the page's own framing, including "long-running MCP operations are in preview" [55]; Gemini Enterprise Agent Platform endpoint kept as "serves a remote MCP server" [45]).
14. **Replaced dead/forbidden source URLs:** support.anthropic.com remote-MCP article (HTTP 404) → support.claude.com custom connectors article [31]; Axios A2A→AAIF report (HTTP 403) → AAIF blog announcement [116]; google-a2a.github.io A2A-and-MCP topic (HTTP 404) → a2a-protocol.org page [115]; plan.modelcontextprotocol.io matrix (unextractable) dropped in favor of the SDK docs and GA post [26, 2].
15. **Aligned quotes with source wording:** UTCP's critique rephrased to "overhead and attack surface" per The Register's wording [107]; M365 federated connectors' "[Web]" release-note tag removed (unverified), keeping the MCP real-time-fetch fact [39].
16. **Miscellaneous:** "fifth revision" corrected to "fifth published version" (the version chain is initial + four revisions) [3, 6, 7, 8]; Uber's headline execution numbers explicitly attributed to AAIF secondary reporting [98, 99]; the roadmap's "updated 2026-08-22" date metadata dropped as unverified.

### Post-Review Revisions (round 2, applied 2026-08-25)

An independent review pass (30 of 123 sources re-fetched; all sampled load-bearing claims matched) returned no fatal findings, two major, and ten minor. All were addressed:

1. **(W1)** Executive Summary no longer states "the first documented malicious MCP server" as fact; the primacy characterization is now attributed to Koi Security in both places it appears.
2. **(W2)** The +73% growth figure is now labeled as cross-source (two different secondary observers of PulseMCP, five months apart) and flagged as not guaranteed like-for-like.
3. **(W3)** "This is the first OS-level MCP integration from a major OS vendor" replaced with the hedge "No comparable OS-level MCP integration from another major OS vendor is documented as of this writing."
4. **(W4)** The postmark-mcp attack is described as same-name npm impersonation (Koi's own characterization), not typosquatting.
5. **(W5)** The 2025-03-26 timeline row no longer presents a community forum thread as evidence of OpenAI's adoption; the Agents SDK documentation carries the fact and the thread is marked as supplementary color.
6. **(W6)** "~10×" replaced with "roughly 3× to 11× depending on the pair."
7. **(W7)** The 24,240 census method note now matches the source's described method (794-page pagination, 79,341 version records deduplicated) instead of an unverified `version=latest` parameter detail.
8. **(W8)** The registry "not designed for self-hosting" claim is reconciled with the README's contributor workflows.
9. **(W9)** Propel's "first production MCP for PLM" is marked vendor-reported.
10. **(W10)** The 85% degradation figure is attributed to the external study MSR cites (arXiv:2505.10570), with a not-independently-verified note.
11. **(W11)** The header no longer claims blanket re-verification of all URLs; limitations are pointed to.
12. **(W12)** The A2A→AAIF announcement date is presented as August 2026 (press-dated 2026-08-17), with the AAIF page's missing publish date disclosed.

---

</details>

<details>
<summary><strong>Sources (123)</strong></summary>

## Sources

All URLs fetched and verified 2026-08-25. Directory counters are point-in-time values and move continuously.

1. Anthropic — Introducing the Model Context Protocol (November 2024). https://www.anthropic.com/news/model-context-protocol
2. MCP Blog — "The 2026-07-28 Specification" (GA release post). https://blog.modelcontextprotocol.io/posts/2026-07-28/
3. MCP Specification — Key Changes, 2026-07-28. https://modelcontextprotocol.io/specification/2026-07-28/changelog
4. MCP Specification — Transports Overview, 2026-07-28. https://modelcontextprotocol.io/specification/2026-07-28/basic/transports
5. MCP Specification — Index, 2024-11-05 (architecture, primitives, LSP inspiration). https://modelcontextprotocol.io/specification/2024-11-05/index
6. MCP Specification — Key Changes, 2025-03-26. https://modelcontextprotocol.io/specification/2025-03-26/changelog
7. MCP Specification — Key Changes, 2025-06-18. https://modelcontextprotocol.io/specification/2025-06-18/changelog
8. MCP Specification — Key Changes, 2025-11-25. https://modelcontextprotocol.io/specification/2025-11-25/changelog
9. MCP Blog — "One Year of MCP" (2025-11-25). https://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
10. SEP-2663 — Tasks Extension (Final). https://modelcontextprotocol.io/seps/2663-tasks-extension
11. SEP-2133 — Extensions (Final). https://modelcontextprotocol.io/seps/2133-extensions
12. MCP Community — Feature Lifecycle and Deprecation Policy. https://modelcontextprotocol.io/community/feature-lifecycle
13. GitHub Issue #1288 — SEP-1288: WebSocket Transport for MCP (status: in-review). https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1288
14. MCP Blog — "Governance for MCP" (2025-07-31). https://blog.modelcontextprotocol.io/posts/2025-07-31-governance-for-mcp/
15. Anthropic — "Donating the Model Context Protocol and establishing of the Agentic AI Foundation" (2025-12-09). https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation
16. MCP Blog — "MCP joins the Agentic AI Foundation" (2025-12-09). https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/
17. Linux Foundation — "Linux Foundation Announces the Formation of the Agentic AI Foundation" (2025-12-09). https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
18. MCP Blog — "Introducing the MCP Registry" (preview, 2025-09-08). https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
19. GitHub — MCP Registry README (API freeze v0.1, 2025-10-24). https://github.com/modelcontextprotocol/registry
20. MCP Registry — About. https://modelcontextprotocol.io/registry/about
21. MCP Registry — FAQ (no unpublish; immutable versions). https://modelcontextprotocol.io/registry/faq
22. MCP — Development Roadmap (August 2026, five priority areas). https://modelcontextprotocol.io/development/roadmap
23. MCP Blog — MCP Roadmap 2026 (four priority areas). https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
24. MCP Blog — "MCP Apps are now live as an official MCP extension" (2026-01-26). https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/
25. MCP Blog — "Enterprise-Managed Authorization" (stable extension; ID-JAG). https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/
26. MCP Docs — SDKs (2026-07-28; ten SDKs and tiers). https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/sdk.mdx
27. MCP Spec (repo) — Authorization Security Considerations, 2026-07-28. https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx
28. MCP Docs (repo) — Security Best Practices tutorial, 2026-07-28. https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx
29. MCP Spec (repo) — Transports, 2025-03-26 (DNS rebinding warning). https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-03-26/basic/transports.mdx
30. Claude Support — Getting Started with Local MCP Servers on Claude Desktop (Desktop Extensions, `.mcpb`). https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop
31. Claude Support — Get started with custom connectors using remote MCP. https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
32. Claude Code Docs — MCP reference. https://code.claude.com/docs/en/mcp
33. Anthropic Docs — MCP connector (Messages API). https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector
34. OpenAI Help — Developer mode and full MCP connectors in ChatGPT. https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt
35. OpenAI Help — Apps (connectors) in ChatGPT (plugin directory migration, July 9, 2026). https://help.openai.com/en/articles/11487775-connectors-in
36. OpenAI Help — Build with the Apps SDK. https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk
37. OpenAI Platform — Remote MCP tools in the Responses API. https://platform.openai.com/docs/guides/tools-remote-mcp
38. OpenAI Agents SDK (Python) — MCP. https://openai.github.io/openai-agents-python/mcp/
39. Microsoft Learn — Microsoft 365 Copilot connectors overview (federated connectors use MCP). https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/overview
40. Microsoft Learn — Agent Builder in Microsoft 365 Copilot. https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder
41. Microsoft Learn — Copilot Studio: extend agents with MCP. https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp
42. Google Support — Gemini app for Mac (no MCP mentioned). https://support.google.com/gemini/answer/17011627
43. Google Cloud — Gemini Enterprise release notes (custom MCP server connectors GA, disabled by default; 2026-08-07). https://docs.cloud.google.com/gemini/enterprise/docs/release-notes
44. Google Support — Gemini Enterprise Business: custom MCP servers (Pre-GA terms; StreamableHTTP only). https://support.google.com/g/answer/17106276
45. Google Cloud — Gemini Enterprise Agent Platform remote MCP server. https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/use-agent-platform-mcp
46. VS Code Docs — MCP configuration reference. https://code.visualstudio.com/docs/agents/reference/mcp-configuration
47. Microsoft Learn — Use MCP servers in Visual Studio 2022 17.14+ / Visual Studio 2026. https://learn.microsoft.com/en-us/visualstudio/ide/mcp-servers?view=visualstudio
48. JetBrains Blog — IntelliJ IDEA 2025.1: Model Context Protocol support. https://blog.jetbrains.com/idea/2025/05/intellij-idea-2025-1-model-context-protocol/
49. JetBrains Help — IntelliJ IDEA MCP Server (bundled plugin, 2025.2). https://www.jetbrains.com/help/idea/mcp-server.html
50. Cursor Docs — MCP. https://prod.cursor.com/docs/mcp
51. Windsurf Docs — MCP servers in Cascade (Devin Desktop). https://docs.windsurf.com/windsurf/cascade/mcp
52. Zed Docs — MCP. https://zed.dev/docs/ai/mcp
53. Windows Insider Blog — Build 26220.7344 (Windows on-device registry for MCP, preview). https://blogs.windows.com/windows-insider/2025/12/05/announcing-windows-11-insider-preview-build-26220-7344-dev-beta-channels/
54. Microsoft Learn — Register MCP servers with the Windows On-Device Registry (`odr.exe`). https://learn.microsoft.com/en-us/windows/ai/mcp/servers/mcp-manual
55. Microsoft Learn — Microsoft Foundry agents: Model Context Protocol tools. https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol
56. AWS ML Blog — Extending MCP support for Amazon Bedrock AgentCore Gateway. https://aws.amazon.com/blogs/machine-learning/extending-mcp-support-for-amazon-bedrock-agentcore-gateway-2/
57. AWS ML Blog — Introducing stateful MCP client capabilities on Amazon Bedrock AgentCore Runtime. https://aws.amazon.com/blogs/machine-learning/introducing-stateful-mcp-client-capabilities-on-amazon-bedrock-agentcore-runtime/
58. Cloudflare Docs — Agents: Model Context Protocol. https://developers.cloudflare.com/agents/model-context-protocol/
59. Cloudflare Docs — MCP server portals (Cloudflare One). https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/
60. LangChain Docs — MCP (langchain-mcp-adapters). https://github.com/langchain-ai/docs/blob/main/src/oss/langchain/mcp.mdx
61. LangSmith Docs — LangGraph Agent Server MCP. https://docs.langchain.com/langsmith/server-mcp
62. Microsoft Learn — Agent Framework: local MCP tools. https://learn.microsoft.com/en-us/agent-framework/agents/tools/local-mcp-tools
63. Microsoft Learn — Semantic Kernel: adding MCP plugins. https://learn.microsoft.com/en-us/semantic-kernel/concepts/plugins/adding-mcp-plugins
64. Google ADK Docs — MCP (client use and exposing ADK tools via MCP). https://github.com/google/adk-docs/blob/main/docs/mcp/index.md
65. GitHub Blog — GitHub MCP Server supports the next MCP specification (2026-07-23). https://github.blog/changelog/2026-07-23-github-mcp-server-supports-the-next-mcp-specification/
66. GitHub Blog — GitHub MCP Server public preview (2025-04-04). https://github.blog/changelog/2025-04-04-github-mcp-server-public-preview/
67. GitHub Blog — Remote GitHub MCP Server is now generally available (2025-09-04). https://github.blog/changelog/2025-09-04-remote-github-mcp-server-is-now-generally-available/
68. Stripe Docs — MCP (hosted `https://mcp.stripe.com`, OAuth). https://docs.stripe.com/mcp
69. Shopify Dev — Storefront MCP. https://shopify.dev/docs/apps/build/storefront-mcp/index
70. GitHub — Microsoft Learn MCP Server. https://github.com/microsoftdocs/mcp
71. Docker Docs — Docker MCP Catalog & Toolkit (300+ verified servers; invite-only MCP Gateway). https://docs.docker.com/ai/mcp-catalog-and-toolkit/
72. Docker Blog — Announcing Docker MCP Catalog and Toolkit beta (May 2025). https://www.docker.com/blog/announcing-docker-mcp-catalog-and-toolkit-beta/
73. Jan Wildeboer (jwatte.com) — MCP registry census (24,240 servers, 2026-08-22). https://jwatte.com/blog/mcp-servers-for-small-business/
74. Glama — MCP server directory (77,817 servers / 14,547 connectors, 2026-08-25). https://glama.ai/
75. Skillselion — "The MCP Server Census: 8,433 Servers" (2026-08-14; also reports PulseMCP's 22,070). https://skillselion.com/research/mcp-server-census-2026-08
76. Smithery — MCP servers directory (6,798 servers, 2026-08-25). https://smithery.ai/servers
77. SettleGrid — State of MCP 2026 (PulseMCP ~12,770 listings, March 2026). https://settlegrid.ai/learn/state-of-mcp-2026
78. JFrog — General Availability of the JFrog MCP Registry. https://jfrog.com/blog/announcing-general-availability-of-the-jfrog-mcp-registry/
79. AWS Open Source Blog — Governing AI assets at scale with MCP Gateway and Registry. https://aws.amazon.com/blogs/opensource/governing-ai-assets-at-scale-with-mcp-gateway-and-registry/
80. GitHub — FastMCP (Prefect). https://github.com/PrefectHQ/fastmcp
81. FastMCP Docs — Welcome (FastMCP 1.0 incorporated into the official SDK). https://gofastmcp.com/v2/getting-started/welcome
82. Kong — AI MCP (AI MCP Proxy plugin). https://developer.konghq.com/mcp/
83. Higress — AI gateway (MCP proxying / protocol conversion). https://higress.ai/
84. Composio — MCP Gateway. https://composio.dev/mcp-gateway
85. Microsoft Learn — Azure API Management MCP server overview (REST API as MCP server; API Center). https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview
86. Invariant Labs — MCP Security Notification: Tool Poisoning Attacks (April 2025). https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks
87. Invariant Labs — MCP Security Notification (rug pulls). https://invariantlabs.ai/blog/mcp-security-notification
88. Invariant Labs — Introducing MCP-Scan (tool pinning/hashing). https://invariantlabs.ai/blog/introducing-mcp-scan
89. Trail of Bits — "Jumping the Line: How MCP servers can attack you before you ever use them" (2025-04-21). https://blog.trailofbits.com/2025/04/21/jumping-the-line-how-mcp-servers-can-attack-you-before-you-ever-use-them/
90. Koi Security — "postmark-mcp" npm malicious backdoor ("world's first sighting of a real world malicious MCP server"). https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft
91. Postmark — Information regarding the malicious postmark-mcp package. https://postmarkapp.com/blog/information-regarding-malicious-postmark-mcp-package
92. Koi Security — "MCP malware wave continues: a remote shell in backdoor" (@lanyer640/mcp-runcommand-server, 2025-09-30). https://www.koi.ai/blog/mcp-malware-wave-continues-a-remote-shell-in-backdoor
93. NVD — CVE-2025-54136 (Cursor trusted-config RCE; fixed in 1.3). https://nvd.nist.gov/vuln/detail/CVE-2025-54136
94. Microsoft Security Blog — Understanding and mitigating security risks in MCP implementations. https://techcommunity.microsoft.com/blog/microsoft-security-blog/understanding-and-mitigating-security-risks-in-mcp-implementations/4404667
95. Microsoft Learn — Configure the MCP firewall in Global Secure Access (preview). https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-configure-mcp-firewall
96. OWASP — MCP Security Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
97. NSA — Cybersecurity Information Sheet: MCP Security (PDF; June 2026; full text not parsed). https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF
98. Uber Engineering — Solving the agent identity crisis. https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/
99. AAIF — How Uber runs 60,000 AI agent tasks per week with MCP. https://aaif.io/blog/how-uber-runs-60000-ai-agent-tasks-per-week-with-mcp
100. AWS ML Blog — How Smartsheet built a remote MCP server on AWS. https://aws.amazon.com/blogs/machine-learning/how-smartsheet-built-a-remote-mcp-server-on-aws/
101. Anthropic — Chronograph customer story (client-facing MCP server). https://claude.com/customers/chronograph
102. MarsBased — Moody's AI (production MCP server; partner-reported). https://marsbased.com/work/moodys-ai
103. Lean Innovation Labs — Fullcast case study (production launch, August 2025). https://www.leaninnovationlabs.com/case-studies/fullcast
104. Propel — First to launch production MCP for PLM (June 2026). https://www.propelsoftware.com/news/first-to-launch-production-mcp-for-plm
105. InfoQ — Cloud & DevOps Trends Report 2026 (MCP in "Early Majority"). https://www.infoq.com/articles/cloud-devops-trends-2026/
106. Microsoft Research — "Tool-space interference in the MCP era" (1,470-server survey; token and tool-count statistics). https://www.microsoft.com/en-us/research/blog/tool-space-interference-in-the-mcp-era-designing-for-agent-compatibility-at-scale/
107. The Register — "Deciphering the alphabet soup of agentic AI protocols" (2026-01-30; UTCP critique). https://www.theregister.com/special-features/2026/01/30/deciphering-the-alphabet-soup-of-agentic-ai-protocols/4802548
108. The Register — Anthropic quietly fixed flaws in its Git MCP server (composition attacks; 2026-01-20). https://www.theregister.com/security/2026/01/20/anthropic-quietly-fixed-flaws-in-its-git-mcp-server/4676059
109. The Register — Bug hunter tracks down three serious MCP database flaws, one left unpatched (2026-05-13). https://www.theregister.com/security/2026/05/13/bug-hunter-tracks-down-three-serious-mcp-database-flaws-one-left-unpatched/5238916
110. The Register — "Model Context Protocol prepares to break with its stateful past" (2026-07-23). https://www.theregister.com/devops/2026/07/23/model-context-protocol-prepares-to-break-with-its-stateful-past/5276722
111. IETF Datatracker — BoF Request: CATALIST (status "Not WG Forming"). https://datatracker.ietf.org/doc/bofreq-farrel-coordinating-agent-to-agent-list-of-efforts-catalist/00/
112. Microsoft — Build 2025: "The age of AI agents and building the open agentic web" (2025-05-19). https://blogs.microsoft.com/blog/2025/05/19/microsoft-build-2025-the-age-of-ai-agents-and-building-the-open-agentic-web/
113. Linux Foundation — A2A Protocol project launch (2025-06-23). https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents
114. Linux Foundation — "A2A protocol surpasses 150 organizations…" (2026-04-09). https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year
115. A2A Protocol — "A2A and MCP" (complementary; not a replacement). https://a2a-protocol.org/latest/
116. AAIF — "A2A joins AAIF." https://aaif.io/blog/a2a-joins-aaif
117. OpenAI — "Introducing apps in ChatGPT" (DevDay, October 2025). https://openai.com/index/introducing-apps-in-chatgpt/
118. OpenAI Community — "Preparing for MCP in Responses" (opened 2025-03-27). https://community.openai.com/t/preparing-for-mcp-in-responses/1152972
119. GitHub Blog — Agent Plugins 1.0 in VS Code, Copilot CLI, and the Copilot app (2026-08-12). https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/
120. GitHub — Agent Plugins specification. https://github.com/agentplugins/agent-plugins-spec
121. Anthropic — Engineering: advanced tool use (Tool Search; Programmatic Tool Calling). https://www.anthropic.com/engineering/advanced-tool-use
122. Anthropic — Apple Xcode + Claude Agent SDK. https://www.anthropic.com/news/apple-xcode-claude-agent-sdk
123. Cursor — Changelog 2.5 (plugins package skills, subagents, MCP servers, hooks, and rules). https://cursor.com/changelog/2-5

---

*(Cited version. Every inline `[N]` resolves to the numbered Sources list above; every source is cited at least once. Claims that could not be anchored to a verifiable source were removed or softened and are itemized in "Removed Unsupported Claims and Verification Adjustments.")*

</details>
