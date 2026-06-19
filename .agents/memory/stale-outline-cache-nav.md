---
name: Lecture prev/next nav pitfalls
description: Two distinct bugs that make lecture prev/next nav appear broken even when data is correct
---

Prev/next lecture navigation derives an ordered, course-wide list by flattening every unit's lectures from the course-overview query. Two separate failure modes have looked like "can't get past lecture N":

## 1. Flex truncation overflow hides the Next button (the real one)
The bottom nav puts prev/next in a flex row, each side `flex-1` with a `truncate` title. A `flex-1` child still has `min-width: auto`, so it refuses to shrink below its content width — `truncate` never engages, the long title runs full-width, the row overflows horizontally, and the Next card is pushed off-screen (telltale: a horizontal page scrollbar + the Previous title cut off mid-word at the viewport edge, with no ellipsis).

**Rule:** every flex item whose child must truncate needs `min-w-0` on the item itself, not just on the inner span. Also give scroll containers `overflow-x-hidden` / grid columns `min-w-0` so no inner content can force horizontal page overflow.

## 2. Stale cached outline (secondary)
The lecture view stays mounted across `/lectures/:id` param changes (wouter reuses the component), so the overview query fetched once never refetches and can hold a shorter outline. Fix: `useEffect(() => refetchOverview(), [refetchOverview, lectureId])`.

**Always** show a persistent current-lecture indicator (title + "Lecture X of Y") so the user knows where they are regardless of nav state.
