import { eq, sql } from "drizzle-orm";
import {
  db,
  diagnosticAssessmentsTable,
  seedMetaTable,
} from "@workspace/db";
import { logger } from "./logger";
import { buildCatalog, DIAGNOSTIC_CATALOG_VERSION } from "./diagnosticContent";

// Populate the diagnostic catalog (the selectable configurations). No items are
// stored — every attempt generates fresh, never-repeated questions. This is
// version-gated and self-healing: if the stored catalog version differs from
// the current one, the catalog is replaced in a single transaction so existing
// or production databases pick up catalog changes on boot. Replacing the
// catalog cascade-deletes prior attempts (acceptable: diagnostics are ungraded
// and unlimited-retake).
export async function seedDiagnosticsIfEmpty(): Promise<void> {
  let storedVersion: string | null = null;
  try {
    const rows = await db
      .select({ value: seedMetaTable.value })
      .from(seedMetaTable)
      .where(eq(seedMetaTable.key, "diagnostic_version"));
    storedVersion = rows[0]?.value ?? null;
  } catch (err) {
    logger.warn(
      { err: (err as Error).message },
      "Diagnostic seed: seed_meta unavailable, treating version as unset",
    );
    storedVersion = null;
  }

  const existing = await db.execute(
    sql`select count(*)::int as n from diagnostic_assessments`,
  );
  const row = (existing.rows[0] ?? {}) as { n?: number };
  const populated = (row.n ?? 0) > 0;

  if (populated && storedVersion === DIAGNOSTIC_CATALOG_VERSION) {
    logger.info("Diagnostic seed: catalog present and current, skipping");
    return;
  }

  const catalog = buildCatalog();
  logger.info(
    { entries: catalog.length, storedVersion, expected: DIAGNOSTIC_CATALOG_VERSION },
    "Diagnostic seed: (re)populating catalog",
  );

  await db.transaction(async (tx) => {
    if (populated) {
      await tx.execute(
        sql`TRUNCATE TABLE diagnostic_responses, diagnostic_attempts, diagnostic_items, diagnostic_assessments RESTART IDENTITY CASCADE`,
      );
    }
    for (const entry of catalog) {
      await tx.insert(diagnosticAssessmentsTable).values({
        kind: entry.kind,
        format: entry.format,
        length: entry.length,
        phase: entry.phase,
        title: entry.title,
        subtitle: entry.subtitle,
        instructions: entry.instructions,
        position: entry.position,
      });
    }
    await tx
      .insert(seedMetaTable)
      .values({ key: "diagnostic_version", value: DIAGNOSTIC_CATALOG_VERSION })
      .onConflictDoUpdate({
        target: seedMetaTable.key,
        set: { value: DIAGNOSTIC_CATALOG_VERSION, updatedAt: new Date() },
      });
  });

  logger.info({ entries: catalog.length }, "Diagnostic seed complete");
}
