---
name: Stale course-outline cache breaks lecture nav
description: Why prev/next lecture nav can show a too-short list even when the API returns all lectures
---

Prev/next lecture navigation derives the ordered lecture list from the course-overview query. The lecture view stays mounted across `/lectures/:lectureId` param changes (wouter reuses the component), so a query fetched once on first lecture open is never remounted.

**Symptom:** nav shows a shorter outline (e.g. "no Next" partway through) even though the dev DB and `/api/course/overview` return the full set. The tab cached an older, shorter outline from before more lectures existed and never refetched.

**Rule:** any nav/list computed from a long-lived query in a component that persists across route-param changes must refetch on the param transition (effect keyed on the id), not just on mount.

**Why:** React Query refetch-on-mount does nothing when the component doesn't remount; staleTime defaults don't force a network fetch during in-place param navigation.

**How to apply:** in `LectureView`, `useEffect(() => refetchOverview(), [refetchOverview, lectureId])`.
