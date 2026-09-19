# Branch: flight-reward

Idea 2 from the team brief: change one thing at home, prevent enough warming to
cover your own flight **and one more passenger's**, and an airline gives you a
seat.

`main` still holds the insurer build. This branch replaces the app; the shell,
design tokens, primitives and charts carried over.

```bash
npm install && npm run dev
```

---

## Where the brief's numbers do not survive contact with sources

I built the strongest honest version, which means two of the brief's headline
figures had to change. Both changes make the idea harder, not easier.

### 1. The saving is roughly 40% smaller than claimed

The brief has a heat pump preventing **0.258 t a month**. Working it from
published figures:

| Input | Value | Source |
|---|---|---|
| Eskom grid intensity | 0.699 kg CO2e/kWh | 2026 reference, ~80% coal |
| Household geyser | 240–450 kWh/month, 350 typical | SA geyser studies |
| Heat pump saving | 60–66% of that load | COP ≈ 3 |

350 × 0.63 × 0.699 = **154 kg a month**, not 258. Gas does slightly better at
about 206 kg once you net off the LPG it burns, because it takes the load off
the grid entirely.

**Consequence:** the brief's "install in March, fly in September" becomes
install in March, fly around **January**. Roughly 7 to 9 months, not 5.3. The
app shows the real figure and the tests assert it is below 258.

### 2. The non-CO2 multiplier is real but contested

The brief is right that a flight warms by more than its fuel. Contrail cirrus
is the single largest component of aviation's effective radiative forcing,
larger than the CO2 itself, and non-CO2 effects are about two thirds of the
total.

But applying a Radiative Forcing Index as a flat multiplier has been called an
incorrect calculation by researchers, because it conflates a stock pollutant
that lasts centuries with a flow pollutant that lasts hours. Airlines have
lobbied hard on exactly this point, and estimates of contrail GWP vary by a
factor of two between studies (Lee et al. vs Teoh et al.).

**What the app does:** uses ×1.9, and shows the fuel-burn CO2 figure separately
on the progress screen, the flight screen, the derivation sheet and settings.
The multiplier is never folded invisibly into a total. If an airline's counsel
pushes back, the CO2-only number is already on screen.

---

## The three objections I could not design away

**Additionality.** A heat pump saves about R11,600 a year on a R27,500–48,000
install: it pays for itself in roughly three years on electricity alone. Most
people who fit one would have fitted it anyway. If the appliance is
self-financing, the free flight is not causing the behaviour, it is a windfall
attached to a decision already made. This is the strongest technical objection
to the whole idea and the brief does not address it. The app says so on the
Install screen rather than hiding it.

**The airline cannot say what it wants to say.** The EU's Empowering Consumers
directive bans offsetting-based environmental claims, and in November 2025 the
Commission forced 21 airlines to withdraw or rewrite exactly that language. The
brief's value to the airline is "a story it can tell". In the EU that story is
now restricted, and carriers elsewhere have watched it happen. The app carries
the disclaimer, but the disclaimer is the problem: if we have to say "this is
not an offset and no airline has endorsed it", it is unclear what the airline is
buying.

**The stated user cannot afford it.** R8,000 to R48,000 and control of a
property. The brief's own closing paragraph admits this and offers the
landlord-financed variant as the way out. I built that variant: choose "I rent"
on the Install screen and the evidence checklist gains a landlord agreement, and
the app states plainly that the landlord keeps the electricity saving while the
tenant earns the ticket. It is the more interesting version. It is also
unproven, and the rand flows to the landlord while the ticket flows to the
tenant, which is a harder conversation than the brief makes it sound.

---

## What the app does well

The verification is the strongest part and is worth keeping whatever happens to
the premise. Progress is computed from **the member's own electricity bills**
against a pre-install baseline, never from the appliance's rated saving. Nothing
counts at all until there is an install date, a Certificate of Compliance, a
baseline from before, and at least one reading after. A month where usage went
*up* contributes zero rather than going negative.

That is the answer to "how do you know they are not gaming it", which the
original session correctly identified as the weakest point of any scheme like
this.

The once-off rule from the brief is enforced in the model, not just stated:
claiming closes the enrolment, and the copy explains the three reasons.

## Numbers

23 tests. TypeScript clean. Every constant is on the Settings screen.

## My recommendation, unchanged

Build it if you want to pitch it, and this branch is a good version. But the
insurer idea on `main` has a proven buyer, a live comparable that raised R700m,
and a market being vacated by a privacy lawsuit. This one has an unproven buyer
whose main incentive is a claim it is increasingly not allowed to make.
