# Further

A mobile web app that turns the kilometres you **don't** drive into money off your
car insurance.

```bash
npm install
npm run dev     # http://localhost:5173
```

Other scripts: `npm run check` (types, tests, build) and, with the dev server
running, `npm run shots` to recapture the app screenshots used in the pitch deck.

No backend, no keys, no sign-in. All data is seeded locally and persists in the
browser. Settings → Reset demo data puts it back.

---

## Why this exists

The previous build assumed a large pool of corporate carbon money that could be
redistributed to individuals for low-carbon travel. It does not exist in a form
anyone can draw from, and the arithmetic is fatal: a commuter's annual carbon
saving is worth roughly **R300**. You cannot fund a behaviour-change reward out
of that.

So Further does not price carbon. It prices **exposure**.

Every motor policy is rated on an assumed annual mileage. Drive under it and the
insurer's expected claims cost falls. Further measures the gap and hands most of
it back. Kilograms of CO2 still appear in the app, clearly labelled as a
consequence rather than a currency.

### The part that is actually hard

Measuring the driving you *did* is a solved problem, and in South Africa it is
already sold: King Price and Naked both offer pay-per-kilometre cover, and
Pineapple refunds up to 30% for low mileage. Discovery Insure has paid out R1bn
in fuel cash back for telematics-verified driving behaviour.

What none of them solve is **consent**. Usage-based insurance has an adoption
problem, not a data problem: people will not be watched. Every existing product
asks you to accept surveillance of your driving and then scores you down for it.

Further inverts that. It pays you for what you *didn't* do, keeps every route on
the device, and sends the insurer six numbers a month. `/insurer` reproduces that
payload exactly, alongside the much longer list of what is withheld. That screen
is the product.

### Why we never have to prove the counterfactual

We do not need to know whether you *would* have driven on any given day. Your
policy already states the mileage it was priced on, so the comparison is against
the insurer's own assumption. That is what lets the route data stay on the phone.

---

## How a rand is derived

`src/lib/domain/engine.ts` is the only place money is calculated, and every
constant in it is surfaced in the UI (Settings → The constants we apply).

| Constant | Value | Why |
|---|---|---|
| `MILEAGE_VARIABLE_SHARE` | 55% | Theft, hail and parked damage do not fall when you drive less |
| `MEMBER_SHARE` | 60% | The member's cut of the modelled saving |
| `MAX_REDUCTION` | 30% | Nobody's premium goes to zero |

Money is integer cents throughout. Any figure in the app that represents money
opens the full derivation chain.

## Scrub the journey

The trip screen does not just assert that a trip was verified, it lets you check.
Drag along the speed profile and you see the speed the phone measured at that
moment, how far the path sat from the published alignment, and a marker moving
along the route. A point-by-point band underneath shows the deviation against the
220 m tolerance the verifier actually applies.

It is the one place where the interaction is the argument. A fabricated trip
cannot survive being looked at this closely.

## Your record

The Impact tab draws every verified journey as its actual corridor, layered at
low opacity, so routes you repeat burn brighter. After a few months it is a
dense figure nobody else could have, because nobody else made those journeys.
Tap Replay and it rebuilds itself oldest-first.

It is drawn on a canvas rather than in WebGL on purpose: the same additive
result for a few hundred bytes instead of the ~150 kB three.js would add to a
127 kB app.

## The evidence threshold

Nothing is paid until **seven distinct days** have been measured. Without that
rule, a brand-new account looks identical to a member who drove nowhere, and
would be credited the full ceiling immediately. Settings has a "Start empty"
button that puts the app into that genuine day-one state so you can see it.

## Verification

A trip is `verified`, `probable` or `unverified`, and the app never hides which.

- **verified** — measured on-device, matched to a published corridor within
  220 m, with a consistent speed profile. Only this earns full credit.
- **probable** — hand-logged, reclassified by the member, or simulated.
- **unverified** — failed the evidence bar. Earns nothing, and is excluded from
  *driven* kilometres too, which errs in the member's favour.

Car trips off a published alignment earn nothing by design: at road speed a bus
and a car are indistinguishable, so we assume the car.

## Live tracking

`/track` records a real trip using Geolocation, Wake Lock and Vibration, with
corridor matching, distance and mode classification computed on the device.
Where there is no usable GPS, a simulated journey is fed through the *same*
reducer and is always saved as probable, never verified.

## Stack

React 19, TanStack Router (file-based, code-split), Tailwind v4, Zustand
(persisted), Motion, Vaul, Sonner, NumberFlow, vite-plugin-pwa. Installable to
the home screen; runs offline. 56 tests under Vitest.

No charting library and no map library: both were replaced by drawings sized to
the one job they do here, which removed about 1.6 MB from the bundle.

Routes are computed and drawn as SVG rather than rendered on a tiled basemap. A
street map answers "where is this", which the member already knows. The figure
answers "does my path match the published alignment", which is the actual claim.

## What is invented

The member, the vehicle and "Cornerstone Insure" are fictional, and no real
insurer has seen this. The premium and rated mileage are illustrative but sit
inside the real market band. Trips are deterministically generated. The corridors
are real Cape Town routes with simplified geometry, and the fares are shaped on
published operator prices rather than audited. Everything financial is *derived*
from those inputs by `engine.ts`, so changing the policy in Settings re-derives
the whole app. EVIDENCE.md has the full breakdown.

## Not claimed

Nothing in this app offsets, neutralises or cancels emissions, and nothing here
is a carbon credit. Figures are modelled, not quoted. No insurer or regulator has
endorsed the calculation.
