---
name: Reasoning instrument label
description: The reasoning-diagnostic instrument enum stays "ethical" internally but must always render as "Professional Judgment".
---

# Reasoning instrument label

The dilemma-based reasoning diagnostic's instrument enum stays `"ethical"` internally
(database column, OpenAPI schema, and generated codegen symbols all depend on it), but
the UI must ALWAYS map it to the display label **"Professional Judgment"** at every
render point. Never print the raw `"ethical"` enum to the user.

**Why:** The course was rebranded away from its ethics origins; renaming the enum would
churn the DB schema, OpenAPI spec, and Orval/zod codegen for no functional gain. Keeping
the enum stable while remapping the label is the low-risk path. (The companion
multiple-choice instrument is "Critical Reasoning".)
**How to apply:** When adding or editing any surface that shows the instrument name
(dashboard, diagnostics pages, results, README), translate `"ethical"` → "Professional
Judgment" at the boundary. Do not rename the enum value in db/openapi/codegen.
