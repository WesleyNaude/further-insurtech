# Further — build brief

> **This document describes the insurer idea, which is archived.**
> `main` now holds the fuel tax hand-back. See `README.md` and `NOTES.md`.
> The insurer build is preserved in full at the tag `archive/insurer`.
> Most of the research below still stands; the framing around motor insurance
> does not.

Owner: Claude. Written 18 September 2026, overnight build.

## The premise (changed)
The old build assumed a carbon fund redistributes money to low-carbon commuters.
Research killed it: a commuter's annual saving is worth ~R300 / EUR 81. Too small
to fund anything.

New premise: **an insurer pays, because kilometres not driven are claims not made.**

- Annual mileage is among the strongest predictors of motor claims frequency.
- Discovery Insure has paid out R1bn in fuel cash back for verified driving behaviour,
  so the willingness to pay is proven, not hypothetical.
- Every existing telematics product measures the driving you DID. None can prove the
  trip you DIDN'T take, because a stationary phone looks identical to a phone in a drawer.
- Proving "I took the train instead, on this corridor, at this time" is the gap.
  Trip capture + mode classification + corridor verification is the product.

Unit sold: a **verified kilometre not driven**, not a tonne of CO2.
CO2 stays in the app as a secondary, honest number. It is never the business model.

## Second revenue line: off-peak booking
Book transit in-app at dynamically discounted off-peak prices.
Rationale from research: the Dutch Spitsmijden trials cut participants' peak trips ~60%
with cash rewards, but behaviour snapped straight back when payments stopped. A bounty
buys behaviour only while you pay. Putting the incentive in the FARE has no cliff, and
gives us margin that does not depend on the insurer.

## What we keep from the Lovable build
- The rewards engine: ledger, money (integer cents), co2, cashback + their unit tests.
- The six-screen information architecture, broadly.
- The "where every number came from, tappable" transparency principle from the brief.
- Brand name Further.

## What we throw away
- MUI sediment, Lovable scaffolding (.lovable, AGENTS.md), Supabase/Drizzle/auth,
  the marketing site, the fund payment page, Untitled UI duplication alongside shadcn,
  Aeonik (Lovable stubs, licensed, not shippable).

## Stack decisions
- Vite + React 19 + TypeScript. TanStack Router (file-based) — same routing API as the
  old Start app so Wesley's other code drops in.
- Tailwind v4 + shadcn/Radix as the component base (easiest for him to extend).
- Zustand + persist for the data layer, behind a repository interface so Supabase
  drops in later without a rewrite.
- MapLibre GL + free CARTO basemaps for corridor verification. No API key. This is the
  visual differentiator; no competitor shows the corridor you proved.
- Turf.js for geometry, NumberFlow for animated figures, Motion for transitions,
  Recharts for the impact charts, Sonner for toasts, Vaul for sheets.

## Screens
1. Today — live premium reduction, streak, this month's verified km, recent trips, FAB.
2. Trips — timeline, mode, verification state, map thumbnails.
3. Trip detail — corridor map, evidence chain, km, rand earned. The transparency screen.
4. Book — off-peak fare finder with dynamic pricing. Shows the saving vs driving.
5. Wallet — accrued cash back, premium statement, redeem.
6. Impact — charts: km not driven, rand earned, CO2 (secondary).
7. Settings — vehicle, policy, insurer link, privacy and what we never store.

## Non-negotiables
- No claim that this offsets or neutralises anything. The EU forced 21 airlines to
  withdraw exactly that language in Nov 2025. Every number tappable to its source.
- British English. No em dashes.
- Works offline, no keys, `npm install && npm run dev`.
