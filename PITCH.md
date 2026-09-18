# Further — the case

*Written overnight, 18–19 September 2026. Read this before the app.*

*Sources, figures and their caveats are in **EVIDENCE.md**, organised by the
question an investor is likely to ask.*

---

## The short version

**8.74 million South African vehicles are uninsured. That is 65% of the fleet, and
the reason people give is affordability.**

The people who can least afford cover are frequently the people who drive least.
Someone who takes a taxi to work four days a week and uses the car at weekends is
a genuinely low-exposure risk. They are quoted the same R800 to R1,400 a month as
a daily commuter, because no insurer has a cheap, fraud-resistant way to know the
difference before that person is a customer.

Further is the instrument that proves it.

We do not sell a discount to the already-insured middle class. We make a verified
low-mileage credential that lets an insurer underwrite someone they currently
cannot price, and lets a person walk into the market holding evidence rather than
a claim about themselves.

---

## How we got here, honestly

The original brief assumed a large pool of corporate carbon money that could be
redistributed to individuals who travel cleanly. It does not exist in a drawable
form, and the arithmetic kills it: a commuter's annual carbon saving is worth
about **R300** at South Africa's R308/tonne carbon tax rate. You cannot fund
behaviour change out of R300 a year, let alone a company.

The pivot memo's own line was right: *"this does not work as a carbon business."*

So the question became: who already pays real money for someone travelling
differently? The answer is insurers, and it is not theoretical. Discovery Insure
has paid out **R1 billion** in fuel cash back for verified driving behaviour.
Willingness to pay is proven.

---

## The part I got wrong first, and the correction

My first framing was "nobody can prove the trip you didn't take." That is true but
it is not the value. An insurer does not need to know you took the train. They
need to know you drove less, and they can approximate that with an odometer photo
or a plug-in device.

Worse, the obvious product is already sold here:

| Product | What it does |
|---|---|
| **King Price Chilli** | Pay-per-kilometre. From ~R299/month under 100 km |
| **Naked Chilli** | Pay-per-kilometre, up to 70% saving for low mileage |
| **Pineapple "Drive Less, Get Blessed"** | Up to 30% cash back for low mileage |
| **Discovery Vitality Drive** | Up to R1,500/month fuel cash back for driving behaviour |

So "reward low mileage" is not a gap. It is a category.

**The gap is who it is available to, and on what terms.**

Every one of those products measures a car that is already insured, belonging to a
customer who already exists, who has already agreed to be tracked. They are
retention and margin instruments for the insured. None of them reaches the 8.74
million uninsured, because you cannot fit a telematics dongle to a relationship
that has not started.

---

## The market already exists, and its supply chain is a liability

Before the three things that are ours, the thing that proves there is a business
here at all.

Allstate's subsidiary **Arity** assembled driving behaviour on **more than 45
million people** and sold it to insurers. **LexisNexis** runs a Telematics
Exchange doing the same for quoting and underwriting. Nobody needs convincing
that carriers buy third-party exposure data. They buy it at enormous scale.

Then, on **13 January 2025**, the Texas Attorney General sued Allstate and Arity
in the first state action ever brought under a comprehensive privacy statute. The
complaint alleges Arity paid app developers to embed a tracking SDK, targeting
apps that already used location so that the collection would not be obvious. The
state is seeking up to $10,000 per violation and the destruction of the data.

So the market is proven and the incumbent way of supplying it is being taken
apart in court. The asset was the data; the liability was how it was obtained.

**Further is that same business with the consent inverted.** The member opts in,
is paid for it, can read the exact payload on a screen in the app, and owns the
record. That is not a feature we added to be nice. After January 2025 it is the
only version of this business anyone should want to fund.

## The three things that are actually ours

**1. We underwrite the person's travel, not the customer's car.**
Further measures how someone moves, across every mode, before there is a policy.
That produces an exposure profile for a person who is currently unpriceable. It
turns a rejected quote into a rateable risk. For an insurer this is growth in a
market where motor is already 41.2% of non-life premiums and heading to $9.19bn by
2033. Growth is a far better sell than sharing margin.

**2. Consent, which is the real blocker.**
Usage-based insurance has an adoption problem, not a data problem. Every existing
product asks you to accept surveillance of your driving and then scores you down
for it. Further inverts the posture: it pays you for what you *didn't* do, keeps
every route on the device, and transmits six numbers a month. The `/insurer`
screen reproduces that payload exactly, beside the far longer list of what is
withheld. People do not opt into being watched. They opt into being credited.

**3. The credential is portable.**
Your mileage record belongs to you, not to whoever is currently insuring you. You
can take it to any insurer and be quoted on evidence. That is the piece that makes
this a market instrument rather than one insurer's loyalty feature, and it is the
piece an incumbent will never build, because it commoditises them.

---

## Why it is South African

This is not a Western product ported south. In most of the world, multimodal
commuting is aspirational. Here it is simply how people travel: the minibus taxi
sector moves the majority of commuters, and a household with one car typically
uses it alongside taxis and trains rather than instead of them.

That means:

- The low-mileage-but-car-owning segment is genuinely enormous here, not a niche.
- The taxi industry is digitising right now, without us. SANTACO piloted cashless
  in the Eastern Cape from March 2026, and CODETA went live in Khayelitsha,
  Killarney and Mfuleni on 1 June 2026 with smart cards and the SAPay app, backed
  by Accion and the Mastercard Center for Inclusive Growth. Fare-tap evidence is
  arriving as infrastructure. We should build on those rails, not compete with
  them.
- The outcome is financial inclusion with a commercial engine behind it, which is
  the only kind that survives contact with a budget.

---

## What the original session already knew

Re-reading the team's own discussion, three things were right and were being
talked past.

**"South Africans don't care about carbon at all. But they do care about cost
saving. They are absolute fiends for cost saving."** This is the whole pivot,
said out loud before the research confirmed it. The app now leads with rand on
every screen and treats kilograms as a footnote.

**Loss aversion.** The point was made three times and never built: people respond
roughly twice as strongly to reclaiming their own money as to accumulating
points. It is why Checkers frames Xtra Savings as money back rather than a
discount. Further now says "back in your pocket" and "you pay R1,890 a month, so
far you have taken R511 of it back", not "you have earned 511 points".

**Verification was correctly identified as the weakest point.** *"That's our
biggest weak point, someone would be like, cool, good idea, but how? How are you
sure someone's not going to game the system?"* Every existing behaviour-reward
scheme, Discovery's included, ultimately rests on an attestation the member
ticks. The app answers this directly: corridor match, speed profile, stop dwell
and fare tap, with a three-level verification state where a self-reported trip
can never reach "verified", and a car off a published alignment earns nothing
because at road speed a bus and a car are indistinguishable.

### The one idea I cut too fast

Golden Arrow buses are overcrowded at peak and close to empty off-peak. That is a
real operator yield problem, and it means off-peak demand shifting has a payer
who is not the insurer: an operator with a bus running either way and empty seats
on it. I dismissed the booking idea because we cannot set fares or hold
inventory, and that remains true. But selling *verified demand shifted into
off-peak windows* to an operator is a second revenue line that needs no ticketing
licence and no inventory risk. The Plan screen is the front end of it.

## Would anyone buy it, and would anyone fund it

Two different questions, and they have different answers.

### Would people use it

The strongest evidence is that they already do. Discovery Vitality Drive has
paid out **R1 billion** in fuel cash back, which means South Africans at scale
will install a tracking app, tolerate it running in the background, and change
behaviour for money. That question is settled; we do not have to prove it.

The reward here is also not a gimmick. R500 a month off an R1,890 premium is
about 27%. That is groceries, not a badge.

But the honest refinement matters more than either point.

**Our first cohort is not people we must persuade to change.** It is people
already travelling this way who are simply not being paid for it. A Cape Town
household with one car, taking the train or a taxi to work four days a week, is
already a low-exposure risk and is already being charged as though it commutes
daily. For them Further requires no behaviour change at all, only measurement.
That is a far easier sell, a far cheaper acquisition, and it means the product
generates value before it changes a single journey. Behaviour change is the
second-order benefit, not the precondition.

The real adoption risks are battery drain, install-then-forget, and the fact
that South African public transport has genuine safety and reliability problems
that no reward fixes. We should not pretend otherwise.

### Would a business pay

This is where the model gets cleaner than "share the saving".

South African motor insurers spend heavily on acquisition: OUTsurance, King
Price and Budget are among the country's largest broadcast advertisers. What
they buy with that spend is an unqualified lead and a self-declared mileage
figure.

Further can hand them a lead that arrives with **evidence attached**: a verified
exposure profile, months of it, that prices better than book. Two revenue lines
follow, neither of which requires us to touch the member's money:

1. A per-member verification fee for continuous exposure measurement.
2. A qualified-acquisition fee, which is worth a multiple of a click because the
   risk is pre-measured.

And there is a third, entirely separate payer noted above: an operator with
empty off-peak seats, buying verified demand shifted into those windows.

### Would an investor fund it

The capital is already in this exact market, with this exact mandate.

In January 2025 **Naked raised R700 million (about $38 million)**, the largest
insurtech round in Africa, from Yellowwoods, the **IFC**, Germany's **DEG** and
**BlueOrchard**, explicitly to improve accessibility for underserved populations
in South Africa. Three of those four are development finance or impact
investors. The 65% uninsured figure is not a nice-to-have social angle for that
capital; it is the mandate.

Further is a better venture shape than an insurer. No balance sheet, no
underwriting licence, no claims reserve. It is asset-light infrastructure that
sells into insurers rather than competing with them, which means higher gross
margin and much faster expansion into other markets with the same problem.

The question an investor will actually ask is: **why doesn't Naked or Discovery
just build this?** The answer has to be portability, and it has to be true. A
credential that works across insurers is worth more to a consumer than one that
locks them in, and no incumbent will ship the product that lets its customers
shop. If we do not get to multi-insurer quickly, we are a feature, and that is
the honest bear case.

## The honest risks

**An insurer builds it themselves.** Discovery demonstrably can. The defence is
portability: a credential that works across insurers is worth more to consumers
than one that locks them in, and no incumbent will build the thing that lets
customers shop. We have to get to multi-insurer quickly or we become a feature.

**Absence of evidence is not evidence of absence.** A phone that has not been
measuring looks exactly like a car that has not moved. Without a rule, a
brand-new account would be credited the maximum reduction on day one, which is
both wrong and trivially exploitable. Nothing is paid until seven days have been
measured, and that threshold is shown to the member rather than buried. Any
verification product that gets this backwards has no business selling
verification.

**Verification is adversarial.** If the credential is worth money, people will try
to forge it. Everything in the app is designed around that: corridor matching,
speed profile, stop dwell, fare tap, and an explicit three-level verification
state where self-reported trips can never reach "verified". A car off a published
alignment earns nothing, because at road speed a bus and a car are
indistinguishable and we assume the car.

**Regulation.** Selling an underwriting input is fine. Advising on or arranging
cover makes us an FSP under FAIC, which is a licence, not a footnote. The first
version sells verification to an insurer, and does not quote.

**Behaviour reverts.** The Dutch Spitsmijden trials cut participants' peak trips
by about 60% with cash rewards, and behaviour snapped straight back when payments
stopped. A bounty buys behaviour only while you pay for it. A premium reduction
does not have that cliff: it persists exactly as long as the behaviour does,
because it is a repricing rather than a bribe.

---

## What we are not claiming

No offsetting, no neutrality, no carbon credit. In November 2025 the European
Commission forced 21 airlines to withdraw exactly that language. The kilograms in
the Impact tab are a consequence of driving less, labelled as such, and priced
nowhere.

---

## The ask

A pilot with one insurer, one corridor, one cohort: Cape Town's Southern or
Northern Line, a few hundred members, three months. We prove the exposure
reduction is real and the verification holds. They price it. Nobody has to believe
a forecast, only a measurement.
