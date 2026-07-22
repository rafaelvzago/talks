---
name: update-slides
description: >
  Use when adding, editing, or removing slides from the presentation.
  Handles goTo() recalculation and agenda updates automatically.
  Triggers when the user says "add slide", "new slide", "remove slide",
  "move slide", or "reorder slides".
---

# Update Slides Skill

## Workflow

1. Count current sections:
   ```
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
   ```

2. Make the slide changes (insert, remove, or move `<section>` elements)

3. Recount sections and map new indices:
   ```
   grep -n '<section class="slide"' ai/claude-code/claude-code-open-source.html | awk -F: '{print NR-1, $0}'
   ```

4. Update ALL `goTo(N)` in the agenda to match new indices

5. Verify sections are balanced:
   ```
   grep -c '<section class="slide"' file.html
   grep -c '</section>' file.html
   ```
   Both numbers must be equal.

6. Verify `preventDefault` is intact:
   ```
   grep -c 'preventDefault' file.html
   ```
   Must be exactly 7.

7. Run `/fix-accentuation` to correct any PT-BR accentuation issues introduced by the changes

## Rules

- Always update BOTH PT-BR and EN files
- The footer JS `goTo(2)` for agenda must point to the correct agenda slide index
- The `navPrev()` and `navNext()` functions reference `current` internally — don't break them
- The `show(window.location.hash === '#start' ? 1 : 0)` at the end must stay intact
- Never use `replace_all` on words that appear in JavaScript (e.g. "preve" broke `preventDefault` once)
