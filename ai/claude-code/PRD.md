# PRD: Claude Code for Open Source Development — Presentation

## Overview

Self-contained HTML slide deck used by Rafael Zago (Senior Software Automation Engineer, Red Hat) in talks about using Claude Code for open source development. The presentation itself is built with the same practices it teaches: CLAUDE.md, AGENTS.md, skills, commands, and hooks.

**Live site:** [talks.rafaelvzago.com/ai/claude-code](https://talks.rafaelvzago.com/ai/claude-code)
**License:** Apache 2.0

## Problem

Engineers adopting AI coding tools often skip the foundational work — defining specs, planning before coding, setting up guardrails — and end up with fragile, unreviewed code. There is no concise, practical reference that walks through a complete workflow from PRD to PR using Claude Code in an open source context.

## Goals

1. Provide a ready-to-present slide deck covering Claude Code best practices for open source
2. Serve as a living example of what it teaches (the repo structure mirrors the recommended setup)
3. Support PT-BR and EN audiences with synchronized content
4. Work offline, without build tools, and load instantly from GitHub Pages

## Non-goals

- Interactive demos or live coding environments
- Video hosting (YouTube links are external)
- Mobile-optimized presentation (functional, but optimized for 16:9 projector/screen)
- Framework-based slide system (Reveal.js, Slidev, etc.)

## Target audience

- Software engineers exploring AI-assisted development workflows
- Open source contributors looking to integrate Claude Code into their projects
- Engineering leads evaluating agentic workflows for their teams
- Conference and meetup attendees (PT-BR and EN)

## Technical decisions

| Decision | Rationale |
|----------|-----------|
| Pure HTML, no framework | Zero dependencies, instant load, works offline, no build step |
| CSS embedded in each file | Each HTML file is fully self-contained |
| Catppuccin Macchiato palette | Terminal-native aesthetic via 26 CSS variables (`--ctp-*`) |
| JetBrains Mono via Google Fonts | Monospace font reinforcing terminal look, with `monospace` fallback |
| Two separate HTML files | PT-BR and EN are independent — no i18n runtime, works offline |
| GitHub Pages + CNAME | Served at custom domain with zero infra management |

## Content structure (33 slides per language)

### Part 1 — Fundamentals (slides 3-12)
- Code is cheap — the engineering bottleneck has shifted
- What is Claude Code — terminal-first agentic tool
- Configuring the environment — CLAUDE.md (local vs project)
- Repository structure — shared context for agents and engineers
- AGENTS.md example — the README for agents (60K+ projects, Linux Foundation)
- Skill example — TDD skill with frontmatter and workflow
- Command example — `/review-pr` orchestrating multiple agents
- Skills, Commands, and Agents hierarchy

### Part 2 — Development Flow (slides 13-22)
- Spec Driven Development — define the spec, agent executes
- PRD with AI — co-create the requirements document
- PRD + Spec example — the contract between you and the agent
- The Plan is Everything — approve before coding
- TDD with AI — tests first, fail, implement, iterate
- PR Review with AI — 4 parallel subagents, human reviews first
- Responding to reviews — read, evaluate, resolve
- Organizing with MCP — connecting to external tools
- Most-used MCPs — Context7, GitHub, Brave Search, PostgreSQL, etc.

### Part 3 — Best Practices (slides 23-26)
- Day-to-day tips — `/compact`, `/rewind`, verification tools, 15-min chunks
- Security and guardrails — hooks, CLAUDE.md rules, human-on-the-loop
- Working in parallel — git worktrees for multi-agent workflows

### Part 4 — The Consequence (slides 27-31)
- From individual to team — scaling mature workflows
- Agentic workflows in CI/CD — GitHub Actions, code-reviewer, GitHub Next
- Next steps — actionable checklist for getting started

### Closing (slides 32-33)
- Q&A
- References

## Repository structure

```
claude-ai-slides/
├── CLAUDE.md                        # Project conventions (auto-read by agent)
├── AGENTS.md                        # Agent-specific rules and pre-commit checks
├── CONTRIBUTING.md                  # How to contribute (humans + agents)
├── README.md                        # Project overview
├── index.html                       # Landing page with language selector
├── claude-code-open-source.html     # Slides PT-BR (33 slides)
├── claude-code-open-source-en.html  # Slides EN (33 slides)
├── docs/
│   ├── architecture.md              # Technical decisions
│   └── PRD.md                       # This file
├── .claude/
│   ├── settings.json                # Permissions + hooks (protects CNAME, LICENSE)
│   ├── commands/
│   │   └── review-slides.md         # /review-slides command
│   └── skills/
│       ├── update-slides/
│       │   └── SKILL.md             # Skill for adding/removing/moving slides
│       └── translate/
│           └── SKILL.md             # Skill for syncing PT-BR ↔ EN
├── CNAME                            # GitHub Pages domain (protected)
└── LICENSE                          # Apache 2.0 (protected)
```

## Navigation system

- Keyboard: arrow keys (left/right, up/down), Space (advance), Home/End
- Click: right half advances, left half goes back
- Footer: language selector, prev/next arrows, agenda link (injected via JS on slides 4+)
- Agenda: clickable `goTo(N)` links to jump to any section
- `#start` hash: skips language selector, goes directly to title slide

## Invariants

These must hold true after every edit:

1. **Balanced sections**: `<section class="slide">` count == `</section>` count in both files
2. **Synced slide count**: PT-BR and EN have the same number of slides
3. **preventDefault intact**: exactly 4 occurrences per slide file (JavaScript navigation)
4. **Correct PT-BR accents**: no unaccented words like `codigo`, `voce`, `nao`, etc.
5. **Agenda goTo() indices**: match actual slide positions after any reorder
6. **Protected files**: CNAME and LICENSE must never be modified (enforced by hooks + permissions)

## Skills and commands

| Name | Type | Purpose |
|------|------|---------|
| `update-slides` | Skill | Add, remove, or move slides. Auto-recalculates goTo() and agenda |
| `translate` | Skill | Sync visible text between PT-BR and EN. Preserves HTML/CSS/JS |
| `/review-slides` | Command | Verify all invariants: section balance, preventDefault, accents, goTo() |

## Milestones

- [x] M0: Initial slide deck (33 slides PT-BR)
- [x] M1: English translation (33 slides EN)
- [x] M2: Landing page with language selector and references
- [x] M3: Claude Code integration (CLAUDE.md, AGENTS.md, skills, commands, hooks)
- [x] M4: GitHub Pages deployment with custom domain
- [x] M5: Project documentation (README, CONTRIBUTING, architecture, PRD)
- [ ] M6: Speaker notes or companion blog post
- [ ] M7: PDF export for offline distribution

## Success criteria

- Presentation can be delivered end-to-end in ~40 minutes
- Any engineer can clone the repo, open index.html, and present
- The repo itself demonstrates every practice discussed in the slides
- Slides remain synchronized across both languages after any edit
