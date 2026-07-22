---
name: commit
description: >
  Create a conventional commit for staged or unstaged changes.
  Analyzes the diff, categorizes by type and scope, runs AGENTS.md
  mandatory checks, drafts the message, and commits after user confirmation.
  Triggers when the user says "commit", "conventional commit",
  "save changes", "commitar", or "criar commit".
---

# Conventional Commit Skill

## Workflow

1. **Inspect the working tree** — run all four in parallel:
   ```
   git status
   git diff --staged
   git diff
   git log --oneline -5
   ```
   Summarize: which files are modified, untracked, or already staged.

2. **Filter protected files.** If `CNAME` or `LICENSE` appear in the
   changed files, exclude them from all subsequent steps and warn:
   > "CNAME and LICENSE are protected and will not be committed."

3. **Run AGENTS.md mandatory pre-commit checks.** All must pass before
   committing. If any check fails, fix the issue first and re-run.

   a. Balanced sections in both slide files:
   ```
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
   grep -c '</section>' ai/claude-code/claude-code-open-source.html
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source-en.html
   grep -c '</section>' ai/claude-code/claude-code-open-source-en.html
   ```
   All 4 values must be equal.

   b. `preventDefault` intact (exactly 7 per file):
   ```
   grep -c 'preventDefault' ai/claude-code/claude-code-open-source.html
   grep -c 'preventDefault' ai/claude-code/claude-code-open-source-en.html
   ```

   c. No unaccented PT-BR words:
   ```
   rg '\b(codigo|voce|nao|sessao|verificacao|implementacao|automacao|seguranca)\b' ai/claude-code/claude-code-open-source.html
   ```
   Must return zero results.

   d. Both slide files have the same number of slides.

   Skip checks a-d if no slide files were modified.

4. **Categorize changes** by commit type:

   | Type       | When to use                                              |
   |------------|----------------------------------------------------------|
   | `feat`     | New slide, new page, new major content                   |
   | `fix`      | Broken navigation, wrong goTo indices, typos that change meaning |
   | `docs`     | README.md, CONTRIBUTING.md, AGENTS.md, CLAUDE.md         |
   | `style`    | CSS-only changes (colors, spacing, fonts, visual tweaks) |
   | `refactor` | Restructure HTML/JS without changing behavior            |
   | `chore`    | Skills, commands, settings, config, tooling              |
   | `ci`       | CI/CD pipeline files                                     |
   | `build`    | Build system or dependency changes                       |
   | `perf`     | Performance improvements                                 |
   | `test`     | Adding or updating tests                                 |

5. **Determine scope** from the files changed:

   | Scope      | Files                                                     |
   |------------|-----------------------------------------------------------|
   | `slides`   | ai/claude-code/claude-code-open-source.html, ai/claude-code/claude-code-open-source-en.html |
   | `landing`  | index.html                                                |
   | `docs`     | README.md, CONTRIBUTING.md, AGENTS.md, CLAUDE.md          |
   | `skills`   | .claude/skills/**                                         |
   | `commands` | .claude/commands/**                                       |
   | `config`   | .claude/settings.json, .claude/settings.local.json        |

   If changes span multiple scopes, either omit the scope or ask the user.

6. **Evaluate whether to split commits.** If changes touch unrelated
   areas (e.g., slides AND a new skill), ask:
   > "These changes touch unrelated areas. Split into separate commits
   > or commit everything together?"

   If splitting, repeat steps 7-9 for each logical group.

7. **Draft the commit message** using this format:
   ```
   type(scope): description

   Optional body explaining why, not what.

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

   First-line rules:
   - Imperative mood ("add", not "added" or "adds")
   - Lowercase after the colon
   - No period at the end
   - Under 72 characters total

   Show the user a preview:
   > **Files to stage:**
   > - file1.html
   > - file2.md
   >
   > **Commit message:**
   > ```
   > type(scope): description
   >
   > Co-Authored-By: Claude <noreply@anthropic.com>
   > ```
   >
   > Proceed?

   Wait for explicit confirmation before continuing.

8. **Stage and commit.** Stage files individually by name:
   ```
   git add file1.html
   git add file2.md
   ```

   Create the commit using a HEREDOC:
   ```
   git commit -m "$(cat <<'EOF'
   type(scope): description

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

9. **Post-commit verification:**
   ```
   git log --oneline -1
   git status
   ```
   Report the commit hash and remaining status. If the commit failed
   due to a hook, diagnose the issue, fix it, re-stage, and create a
   NEW commit (never amend the previous one).

## Rules

- NEVER stage `CNAME` or `LICENSE`
- NEVER run `git push` — even if the user asks (per AGENTS.md)
- NEVER amend a previous commit unless the user explicitly says "amend"
- NEVER use `--no-verify` or skip hooks
- NEVER use `git add .` or `git add -A` — always stage files by name
- Always use imperative mood in the description
- Keep the subject line under 72 characters
- Always include the `Co-Authored-By: Claude <noreply@anthropic.com>` trailer
- If a pre-commit hook fails, create a NEW commit after fixing
- When unsure about type or scope, ask the user
- For breaking changes, add `!` after type/scope: `feat(slides)!: redesign navigation`

## Examples

| Commit message | When |
|----------------|------|
| `feat(slides): add security guardrails slide` | New slide content |
| `fix(slides): correct goTo indices after reorder` | Navigation fix |
| `docs: update contributing guidelines` | README/docs change |
| `style(slides): adjust heading color to ctp-blue` | CSS-only tweak |
| `chore(skills): add conventional commit workflow` | New skill/command |
| `chore(config): allow git status in settings` | Settings change |
