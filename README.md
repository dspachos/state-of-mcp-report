# The State of the Model Context Protocol — White Paper

A source-verified white paper on where the Model Context Protocol (MCP) stands, where it runs, and where it is going.

Pipeline per edition: parallel research passes → synthesis → citation verification → adversarial review → typeset PDF.

## Current edition

[![Read the white paper (PDF)](https://img.shields.io/badge/Read-white_paper_PDF-1B365D?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://github.com/dspachos/state-of-mcp-report/blob/main/state-of-mcp-whitepaper.pdf)

**[Direct download (raw PDF, 780 KB)](https://raw.githubusercontent.com/dspachos/state-of-mcp-report/main/state-of-mcp-whitepaper.pdf)**

## Editions

| Edition | As-of date | Scope | PDF |
|---|---|---|---|
| **2.0** | 2026-10-09 | 27 pp · 169 cited sources | [main](https://github.com/dspachos/state-of-mcp-report/blob/main/state-of-mcp-whitepaper.pdf) |
| 1.1 | 2026-08-25 | 25 pp · 123 cited sources | [editions/](https://github.com/dspachos/state-of-mcp-report/blob/main/editions/state-of-mcp-whitepaper-v1.1-2026-08-25.pdf) |

## Edition 2 in one paragraph

Spec `2026-07-28` remains current and the project now runs on a firm six-month cadence (next release: December 15, 2026). The official MCP Registry — still labeled *preview* — holds **41,183 latest-version servers** (this census independently replicated at 41,211, same-day drift), roughly 20× growth in ten months. The Agentic AI Foundation (Linux Foundation) hosts the whole agentic stack — MCP, A2A, agentgateway, Agent Router — and launched MCPA certification. Rust and Ruby SDKs reached Tier 1; Tier-1 downloads run near half a billion a month. Security industrialized in the other sense too: 285 CVEs in 2026 with documented fix-propagation failures, LiteLLM twice on CISA's KEV, a CVSS 10.0 in mcp-atlassian, and "protocol pivoting" named as a new cross-protocol attack class. Consolidation won at the protocol core; fragmentation moved up the stack (state management, UI extension layers, Atlassian's AMP) and out to the IETF (agentproto chartering).

**Verification:** PASS WITH NOTES — 0 fatal, 4 major (all fixed). The review re-fetched ~50 sources, replicated the registry census, audited the CISA KEV feed, and parsed the adoption survey PDF.

---

*Full provenance, research notes, and verification logs live in the private research repo (`state-of-mcp`).*
