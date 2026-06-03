---
name: testing-mintlify-docs
description: Test the Mintlify documentation site end-to-end. Use when verifying docs UI, navigation, or component rendering after changes to the docs/ directory.
---

# Testing Mintlify Docs for Log Engine

## Prerequisites

- Node.js installed (the Mintlify CLI requires it)
- The `docs/` directory exists with `docs.json` and MDX files

## Starting the Dev Server

```bash
cd docs && npx mintlify dev --port 3333
```

- The CLI may prompt to install on first run — answer "y"
- If port 3333 is in use, Mintlify auto-increments (e.g., 3334). Check the terminal output for the actual port.
- The server takes ~10-15 seconds to become ready. Wait for the "preview ready" message.

## What to Test

### Navigation Structure
- Two tabs exist: "Documentation" and "API Reference"
- Documentation tab sidebar: 3 groups (Getting Started: 2 pages, Features: 6 pages, Guides: 2 pages)
- API Reference tab sidebar: 1 group (3 pages: LogEngine, Types & Interfaces, Enums)
- Clicking tabs switches sidebar content

### Key Mintlify Components
These components are used across pages and are most likely to break if MDX syntax is wrong:

| Component | Where Used | What to Check |
|-----------|-----------|---------------|
| CardGroup | introduction.mdx, quickstart.mdx | Cards render with icons, titles, descriptions, and working href links |
| AccordionGroup | introduction.mdx | Items collapsed by default, expand on click, show content |
| Steps | introduction.mdx, guides/migration.mdx | Numbered steps render sequentially |
| CodeGroup | quickstart.mdx | Tab switching between pnpm/npm/yarn shows correct commands |
| ParamField | api-reference/log-engine.mdx | Field name, type, and "required" badge render |
| Warning/Info | introduction.mdx, guides/migration.mdx, api-reference/enums.mdx | Colored callout boxes with correct text |
| Tables | api-reference/enums.mdx, features/log-modes.mdx | Visibility matrix table renders with correct columns/rows |

### Cross-Page Navigation
- Card links navigate to correct pages
- Sidebar links navigate correctly
- Previous/Next page links at bottom of pages work
- Internal markdown links (e.g., Migration Guide link in Warning) resolve correctly

### Pages to Verify (13 total)
1. `/introduction` — CardGroup, AccordionGroup, Steps, Warning
2. `/quickstart` — CodeGroup, Info callout, CardGroup
3. `/features/log-modes` — Tables
4. `/features/data-redaction` — Code examples
5. `/features/output-handlers` — Code examples
6. `/features/emoji-support` — Tables
7. `/features/format-customization` — Code examples
8. `/features/auto-configuration` — Tables
9. `/guides/migration` — Warning, Steps, Tables
10. `/guides/environment-variables` — Tables
11. `/api-reference/log-engine` — ParamField, Warning, code blocks
12. `/api-reference/types` — Code blocks, tables
13. `/api-reference/enums` — Visibility matrix table, Warning

## Common Issues

- Port conflicts: Mintlify auto-selects next available port. Always check terminal output.
- First run: `npx mintlify dev` may need to download the CLI (~30s).
- MDX syntax errors: If a page fails to render, check the terminal for error messages pointing to the file and line.
- Component names are case-sensitive in MDX (e.g., `<CodeGroup>` not `<codegroup>`).

## Devin Secrets Needed

None — local dev server requires no authentication.
