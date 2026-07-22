---
name: update-prd
description: >
  Update docs/PRD.md to reflect current project state. Syncs slide count,
  content structure, repository tree, skills/commands table, and invariants.
  Triggers when the user says "update PRD", "sync PRD", "update requirements",
  or after structural changes to slides, skills, or commands.
---

# Update PRD Skill

## Section-source mapping

| PRD Section | Source | Auto-update? |
|---|---|---|
| Content structure | Slide HTML files (`<h1>` tags, section count) | Yes |
| Repository structure | Filesystem | Yes |
| Skills and commands | `.claude/skills/`, `.claude/commands/` | Yes |
| Invariants | AGENTS.md | Yes |
| Milestones | User intent only | Only when user explicitly says |
| Overview, Problem, Goals, Non-goals | Manual | Never |
| Target audience, Success criteria | Manual | Never |
| Technical decisions | Manual | Never |

## Workflow

1. **Read the current PRD:**
   ```
   Read docs/PRD.md
   ```

2. **Gather actual state** — run all in parallel:
   ```
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source-en.html
   ```
   ```
   grep -oP '(?<=<h1[^>]*>)[^<]+' ai/claude-code/claude-code-open-source.html
   ```
   ```
   ls .claude/skills/
   ls .claude/commands/
   ```
   ```
   find . -not -path './.git/*' -not -path './node_modules/*' \
          -not -path './.claude/plans/*' -not -path './.claude/settings.local.json' \
          -not -name '.DS_Store' -not -path './memory/*' | sort
   ```
   ```
   grep -A2 'preventDefault' AGENTS.md | head -5
   ```

3. **Compare each auto-updatable section and identify drift:**

   a. **Content structure**: Compare the slide count in the PRD heading
      (`## Content structure (N slides per language)`) against the actual
      `grep -c` result. Extract slide titles from `<h1>` tags and compare
      against the Part breakdown lists.

   b. **Repository structure**: Compare the tree code block in the PRD
      against the actual filesystem listing. Look for files/directories
      that were added or removed.

   c. **Skills and commands table**: List all directories under
      `.claude/skills/` and all `.md` files under `.claude/commands/`.
      Read each `SKILL.md` frontmatter for name and description. Compare
      against the table rows in the PRD.

   d. **Invariants**: Read the AGENTS.md verification section. Compare
      the numbered invariants in the PRD against the checks listed there
      (especially numeric values like preventDefault count).

4. **Report drift** — list every section that diverges, with specifics:
   > **Content structure**: PRD says 33 slides, actual count is 26.
   > **Skills table**: Missing entry for `update-readme` skill.
   > **Repository structure**: Missing `.claude/agents/` directory.

   If no drift is found, report "PRD is in sync with project state"
   and **stop here**.

5. **Update only divergent sections** — use `Edit` to modify only the
   specific lines/blocks that are out of date. Never rewrite sections
   that are already correct.

6. **Verify** — read back `docs/PRD.md` and confirm:
   - Slide count in heading matches actual count
   - All skills and commands in the table exist on disk
   - All files in the repository structure tree exist on disk
   - No markdown formatting was broken

## Rules

- NEVER modify Overview, Problem, Goals, Non-goals, Target audience,
  or Success criteria — these reflect intent, not state
- NEVER modify Technical decisions unless the user explicitly asks
- NEVER modify Milestones unless the user explicitly says a milestone
  is complete
- Only update sections where actual drift is detected
- Preserve the existing markdown formatting style (tables, headings,
  code fences, indentation)
- When updating Content structure, extract actual slide titles from
  `<h1>` tags to rebuild the Part breakdowns accurately
- When updating the Skills/Commands table, read each SKILL.md
  frontmatter for the purpose column
- Report what was changed after updating
- If a section has complex drift that cannot be resolved automatically
  (e.g., slide parts need re-grouping), show the user what you found
  and ask for guidance
