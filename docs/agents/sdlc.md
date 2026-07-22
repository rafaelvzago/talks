# Agentic development playbook — follow this process

You are starting work on a software project. **Do not invent a parallel SDLC.** At session start, fetch and follow this project's canonical process docs (if they exist). Prefer the remote `main` over a stale local clone.

**Skills** live at user level (e.g. `~/.cursor/skills/` / `~/.claude/skills/`). Read the skill file before using it. Do not vendor skill bodies into the app repo.

| Skill | When |
|-------|------|
| `batch-grill-me` | Design is open — frontier interview before locking decisions |
| `to-spec` | Conversation → PRD → tracked issue |
| `to-tickets` | PRD → vertical-slice tickets with blockers |
| `implement` | Build one ticket |
| `tdd` | Red-green at pre-agreed seams |
| `code-review` | Standards + Spec review (HITL with the human) |
| `handoff` | Compact context for a fresh agent |
| `diagnosing-bugs` | Hard bugs / regressions |

Tracker binding (if present): `docs/agents/issue-tracker.md` (host, repo, auth, triage label).

---

## Flow (in order)

### 0. Source of truth

Load the project's process docs first. On conflicts, remote `main` wins over local memory or a local clone.

In this repo, start with:

- `docs/agents/sdlc.md` (this file)
- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`
- Root `CLAUDE.md` / `AGENTS.md` for local commands only — they do not override this playbook

### 1. Clarify — `batch-grill-me`

If the design is ambiguous or has real trade-offs, grill round-by-round before locking. Prefer YAGNI / smallest correct change.

### 2. Spec — `to-spec`

Confirm testing seams with the user first. Publish a PRD as a tracked issue on the project tracker. Save a local copy under `.scratch/prd-<slug>.md`. Apply the triage label (e.g. `ready-for-agent`).

PRD shape:

- Problem Statement
- Solution
- User Stories
- Implementation Decisions (modules/interfaces/API — no fragile file paths)
- Testing Decisions (external behavior, seams, prior art)
- Out of Scope
- Further Notes

### 3. Tickets — `to-tickets`

Break the PRD into **tracer-bullet vertical slices**:

- Narrow but complete path through every layer (schema / API / UI / tests as applicable)
- Demoable alone; sized for one fresh context window
- Prefactors first; wide refactors use expand–contract

Quiz the user on granularity and blockers, then publish each ticket as its own issue (parent = PRD). Local copies: `.scratch/<slug>/issues/NN-<slug>.md`. Apply the triage label. Do **not** close or rewrite the parent PRD when publishing tickets.

Every ticket body includes: What to build, Acceptance criteria, Blocked by.

### 4. Implement loop (frontier = unblocked tickets)

1. **Build** — `implement` + `tdd` at agreed seams only
2. **Review** — show the diff to the human; run `code-review` (HITL)
3. **Track** — update repo-root `PROGRESS.md`; close the ticket issue
4. **Handoff** — at ~50% of tickets or end of a phase, run `handoff` → `/tmp/handoff-<slug>.md`
5. **Next** — next unblocked ticket (fan out independent tickets to subagents when useful)

Hard rules:

- Every ticket **must** be a tracker issue **before** coding starts
- Never push directly to the default branch — feature branch → PR → merge
- If the user says proceed without approval between tickets, run the loop sequentially
- Prefer the smallest correct change

### 5. Ship

1. Open a PR against the project's primary forge
2. Merge to the default branch
3. Run the project's deploy path (CI → artifact/image → environment sync, or whatever the repo documents)

Post-merge checklist (adapt to the project):

- [ ] CI / deploy pipeline succeeded
- [ ] Expected artifact or revision is live
- [ ] Smoke-check the change
