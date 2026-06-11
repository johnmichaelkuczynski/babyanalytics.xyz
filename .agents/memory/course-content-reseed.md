---
name: Course content reseed (seeded data migrations)
description: How to make seeded reference-data changes self-heal across all DBs (incl. prod) instead of stranding old rows.
---

# Self-healing seeded course content

Course content (topics/lectures/assignments/problems) is **data rows** seeded by the API server on startup, not files. So changing the seed file does NOT update databases that already have rows — dev and prod keep the old content.

**Why prod is the hard case:** republishing migrates **schema, not data**, and agent `executeSql` against prod is **read-only**. The only thing that can replace stale prod *data* is the app's own startup seed logic. (Data replacement is not a schema migration, so it doesn't violate the "don't script prod schema migrations" rule.)

**Two-part gate that actually self-heals:**
- A **content marker** (known row's existence) alone is NOT enough: once the marker exists, later edits to the *same* content are never picked up.
- Add a **content version** stamped in a tiny `seed_meta` key/value table. Reseed when the marker is missing OR the stored version != the current `SEED_CONTENT_VERSION`. **Bump the version constant on every seed-content edit** or the change won't propagate.
- Do the wipe + full reseed + version-stamp in **one transaction**, so the marker/version only become visible after the whole curriculum commits (a mid-seed crash rolls back instead of stranding partial content).
- Reading `seed_meta` must tolerate the table not existing yet (treat as version-unset) so a boot that races schema migration still heals on the next boot.

**Tradeoff:** a version bump TRUNCATEs student-progress tables too. Acceptable for a single-user/self-paced course; reconsider if multi-user.

**Why:** seeded reference data that changes *meaning* (not just shape) silently rots in existing/prod DBs unless the reseed is gated on a version, not just emptiness or a marker.

**Curriculum-size coupling:** the number of topics/units is hardcoded in places beyond the seed — the system diagnostic asserts a minimum topic count, and the course overview route iterates a fixed week list and bounds `weekNumber` validation. When you change how many topics/units the curriculum has, update these in lockstep or the operator diagnostic false-fails and overview leaks phantom units.
