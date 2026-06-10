---
name: Orval request-body naming
description: How to name OpenAPI requestBody component schemas so orval codegen doesn't produce a duplicate-export collision.
---

Rule: a requestBody **component schema** must not be named `<OperationId>Body` (PascalCase operationId + "Body"). Use the repo convention `*Input` (e.g. `TutorAskInput`, `RewriteLectureInput`) instead.

**Why:** orval's zod generator emits a per-operation body schema named `<OperationId>Body` (e.g. operation `rewriteLecture` → `RewriteLectureBody`). If a component schema *also* has that exact name, `lib/api-zod/src/index.ts` (which does `export * from "./generated/api"` and `export * from "./generated/types"`) re-exports the same identifier twice → TS2308 "already exported a member named …", and `pnpm --filter @workspace/api-spec run codegen` fails in its `typecheck:libs` step.

**How to apply:** when adding a new spec operation with a body, give the component a name that differs from `<OperationId>Body`. The server validates with the generated operation-body zod (`<OperationId>Body`, e.g. `RewriteLectureBody.safeParse`), while the `$ref` points at the `*Input` component. `StartReasoningBody` works only by luck (operation `startReasoningAttempt` → `StartReasoningAttemptBody`, distinct) — don't rely on that.
