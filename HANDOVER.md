# Overnight handover

Everything runs. From this folder:

```bash
npm install && npm run dev
```

Then open **http://localhost:5173**. No keys, no backend, no sign-in. Dark by
default, as you asked. Settings has a light/dark/system switch and a "Reset demo
data" button.

Four things, in the order worth going through:

1. **PITCH.md** — the case, the competitors, and the honest risks. Read this first.
2. **EVIDENCE.md** — every external figure, its source, and where it is soft.
   Organised by the question an investor is likely to ask.
3. **The deck** — 15 slides, separate from the app, at
   **https://claude.ai/artifact/QPVwjPpr6zT7wPdWWSFVXa**
   Speaker notes on every slide say what to land and what not to over-claim.
4. **README.md** and **BRIEF.md** — how the thing works, and what I set out to do.

---

## The one thing you need to know before you pitch

**I was wrong in my first framing, and I corrected it during the night.**

I told you the gap was "nobody can prove the trip you didn't take". Then I
researched the South African market properly and found that low-mileage pricing
is not a gap here, it is a category:

- **King Price Chilli** and **Naked Chilli** both sell pay-per-kilometre cover,
  advertising 50–70% savings for low mileage.
- **Pineapple** runs "Drive Less, Get Blessed", up to 30% cash back.
- **Discovery Insure** has paid out **R1 billion** in fuel cash back.

So if you pitch "we reward people for driving less", someone in the room will
name three companies already doing it. You need the sharper version.

**The sharper version is the 65%.** About 8.74 million South African vehicles are
uninsured, and the reason people give is affordability. Every product above
measures a car that is *already insured*, belonging to a customer who already
exists and has already agreed to be tracked. None of them reaches a person before
there is a policy, because you cannot fit a telematics dongle to a relationship
that has not started.

Further measures a person's travel across every mode, before there is a policy.
That turns a rejected quote into a rateable risk. For an insurer that is growth,
not shared margin, which is a much easier thing to sell.

Three defensible pieces, in order of strength:

1. **Consent.** Usage-based insurance has an adoption problem, not a data
   problem. Everyone else asks to watch you drive and then scores you down.
   Further pays you for what you *didn't* do, keeps routes on the device, and
   sends six numbers a month. The `/insurer` screen shows that exact payload.
2. **Portability.** The mileage record belongs to the member, not the insurer, so
   it can be taken to anyone. No incumbent will build this, because it
   commoditises them. `/record`.
3. **Verification.** Your own session called this the biggest weak point, and it
   was right. The evidence chain is the answer, and it is visible on every trip.

---

## What I mined from your transcript

Three things in that discussion were right and were being talked past.

- *"South Africans don't care about carbon at all. But they do care about cost
  saving."* That is the pivot, said out loud before the research confirmed it.
  Every screen leads with rand; kilograms are a labelled footnote.
- **Loss aversion.** Raised three times, never built. People respond about twice
  as strongly to reclaiming their own money as to accumulating points, which is
  why Checkers frames Xtra Savings as money back. The app now says "back in your
  pocket" and "you pay R1,890 a month, so far you have taken R511 of it back".
- **Golden Arrow: overcrowded at peak, empty off-peak.** I had cut the booking
  idea, and I still think selling tickets is a different company. But an operator
  with empty off-peak seats is a real second payer for *verified demand shifted
  into off-peak windows*, with no inventory risk and no ticketing licence. `/plan`
  is the front end of that. This is the strongest unexplored thread.

---

## What is in the app

| Screen | What it is for |
|---|---|
| **Today** | Money taken back, ring to the 30% ceiling, week strip, the one next action worth taking |
| **Trips** | Every trip, filterable, with its verification state visible |
| **Trip detail** | The corridor drawn against the published alignment, plus the full evidence chain |
| **Track** (`+` button) | Real on-device recording: Geolocation, Wake Lock, Vibration, live corridor matching |
| **Plan** | Operator's own off-peak fare against what driving costs, and a pre-commitment |
| **Wallet** | How you take the money, and a shareable statement image |
| **Impact** | Kilometres first. Carbon present, labelled, and priced nowhere |
| **Record** | The portable credential with a SHA-256 integrity digest |
| **Insurer** | The exact six-number payload, beside the far longer list of what is withheld |
| **Cover** | What cover could cost on measured travel. An indication, never a quotation |

Tracking works for real. On a laptop with no usable GPS, hit "Run a simulated
trip": it feeds synthetic fixes through the *same* corridor matcher and
classifier, and always saves as probable, never verified.

---

## Decisions I made without you

- **Dropped the carbon-fund premise entirely**, along with the marketing site,
  the fund page, MUI, Supabase, Drizzle and the Lovable scaffolding.
- **Dropped Aeonik.** The files in your zip were Lovable asset stubs, not fonts,
  and it is licensed. Using Inter.
- **No tiled basemap.** Routes are computed and drawn as SVG. A street map answers
  "where is this", which the member knows. The figure answers "does my path match
  the published alignment", which is the actual claim. It also works offline and
  costs nothing to serve.
- **Dropped Recharts** for a hand-drawn chart: 358 kB to 6 kB, and it matches the
  route figure's visual language.
- **No 3D.** I considered it after your Framer note. In an app whose entire job is
  making a financial claim legible, a 3D object would be ornament, and ornament
  next to a money figure reads as a distraction from it. I spent the time on
  motion that carries meaning instead: the ring, the route drawing itself in, the
  evidence checks, the once-a-month ceiling moment.

## The best thing I found overnight

While building the first-run state I noticed the model paid a **brand-new account
the maximum reduction on its first day**. Driving nothing and not being measured
produce identical numbers, so the engine could not tell them apart.

Nothing is now paid until seven distinct days have been measured, the member sees
that countdown rather than a mysterious zero, and it is covered by tests. It is
worth saying out loud in a pitch: it is exactly the rule an insurer would demand,
and it shows the verification claim is not decorative.

Settings has a **"Start empty"** button that puts the app into the real day-one
state, so the first-run experience is demonstrable rather than theoretical.

## Where I was sloppy, and fixed it

- The marginal-gain card first showed **minus R188** because I recomputed rated
  mileage without the month proration. There is now one tested helper that owns
  that maths.
- My faint grey **failed WCAG AA at 2.62:1**. All three ink steps were rebalanced;
  every one now passes on every surface, in both themes.
- Inset dividers overflowed the frame by exactly their inset, because they had
  `w-full` and a left margin.

## Numbers

44 tests pass. TypeScript clean, with unused-symbol checking on. Initial bundle
403 kB (127 kB gzipped), routes code-split. Eleven unused dependencies removed.
Every text and accent pairing passes WCAG AA in both themes, and every control
has a 44px hit area.

**One thing I could not verify myself.** The service worker registers in a real
browser but not in the preview pane I was working in, which sandboxes it. The
file is served correctly (`/sw.js`, 200, `text/javascript`), so "Add to Home
Screen" should work when you open it in Chrome or Safari. Worth a ten-second
check before you demo it installed.

## What I would do next

1. The Golden Arrow off-peak thread. It is the best unexplored idea in your own
   transcript and it has a payer who is not the insurer.
2. Multi-insurer portability, quickly. If Further only works with one insurer it
   is a feature, and Discovery can build it.
3. Check the FAIS line with someone who knows it. Selling an underwriting input
   is fine; quoting or arranging cover is a licence.
