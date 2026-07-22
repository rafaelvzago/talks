# Talks

Presentations and talk material by **Rafael Zago** (Senior Software Automation Engineer, Red Hat).

**Live:** [talks.rafaelvzago.com](https://talks.rafaelvzago.com)

## What's inside

| Path | Content |
|------|---------|
| `/` | Talks catalog (PT/EN) |
| `/ai/claude-code/` | Claude Code for open source — HTML slides (PT-BR + EN) |
| `/tdc/2026/acm-ossm/` | OSSM multi-cluster interactive flow (Next.js) |
| `/tdc/2026/painel-cloud/` | TDC Floripa 2026 panel runbook (Next.js) |

## Run locally

## Assemble (Pages artifact)

```bash
node scripts/assemble-site.mjs _site
# or SKIP_BUILD=1 if both apps already have out/
```


```bash
git clone git@github.com:rafaelvzago/talks.git
cd talks
python3 -m http.server 8080
# open http://localhost:8080
```

For TDC Next apps:

```bash
cd tdc/2026/acm-ossm && npm ci && npm run dev
# or
cd tdc/2026/painel-cloud && npm ci && npm run dev
```

## Repository structure

```
talks/
├── index.html                 # catalog
├── CNAME                      # talks.rafaelvzago.com
├── ai/claude-code/            # Claude Code slides + talk PRD
├── tdc/2026/acm-ossm/         # OSSM flow (Next)
├── tdc/2026/painel-cloud/     # Panel runbook (Next)
├── docs/agents/               # issue tracker binding
├── CLAUDE.md / AGENTS.md
└── LICENSE                    # Apache 2.0
```

## License

Apache 2.0
