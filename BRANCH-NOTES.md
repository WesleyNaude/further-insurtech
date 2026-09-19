# Branch: fuel-handback

Idea 1 from the team brief, built to Marta's user journey.

Drivers pay a carbon charge at the pump. Some of it comes back to low-income
households, on every tram, bus and train journey they make. Kraków, 2028.

`main` holds the insurer build and `flight-reward` holds idea 2. This branch
replaces the app; the shell, tokens, primitives and charts carried over.

```bash
npm install && npm run dev
```

---

## The journey, and where it is in the app

| Touchpoint | Where it lives |
|---|---|
| 1. Hears about it from the city, not from us | The sign-up opens under **Miasto Kraków**. Our name appears nowhere until she is inside |
| 2. Signs up once | Two questions and an identity confirmation. The approval screen gets the most design attention in the app, because she half expects to be rejected |
| 3. The first tap | Nothing to do. No scan, no app to open. There is deliberately **no "log a journey" button anywhere** |
| 4. The notification | A journey arriving fires a toast: the amount, and the running weekly total |
| 5. End of the month | The wallet leads with the month, and one line under it: *Funded by the EU carbon charge on fuel*, tappable |
| 6. Cash out or save | Saving screen. Both are one tap and neither is nudged |
| 7. **She stops driving to work** | The wallet notices the one-way pattern on its own and prices the missing mornings. This is the most important screen in the app |
| 8. May | The school trip goal, with whether she will make it at her current rate |

### Touchpoint 7 is the whole programme

The journey is right that this is the outcome that justifies everything: not
that she gets money, but that the money made a switch worth making.

So the app watches for it. `oneWayPattern()` looks at the last four weeks of
working days and finds days where she travelled home but not in. Once that is
eight or more days and outnumbers her both-ways days, the wallet says so, in
money, with the time of the first tram. Then it stops talking.

It does not tell her to change her shift. She works out whether that is
possible, and the journey is explicit that she designed this, not us. We only
made it slightly rational.

---

## Where the journey's numbers do not hold

The journey quotes **€0.34 a trip** and **€24.80 a month**. Those cannot both be
true for Marta.

At €0.34 a trip, €24.80 a month needs **73 journeys, or 3.3 every working day**,
from someone who drives in and only trams home. That is not her pattern.

The monthly figure is the one she actually reads and reacts to, so I kept it and
derived the rate from it: **half of a 6 złoty Kraków fare, about €0.70**, which
reaches €24.80 at 1.6 journeys a working day. That is exactly her shape: the
tram home every day, plus errands and her mother at weekends.

### And it is in złoty, not euro

Marta is paid in złoty, shops in złoty and reads her bank in złoty. Poland is in
the EU but not the eurozone. A wallet that shows her euro would be the first
thing that told her this was not really for her.

So the member sees **3,00 zł**, and the euro appears only where the fund itself
is denominated in euro, on the "where this comes from" screen. That screen is
also where Poland's position is worth knowing: it has the **largest Social
Climate Fund allocation of any member state, up to €11.4 billion** for
2026–2032.

---

## What I would flag before pitching this

**The timing moved.** ETS2 was delayed to 2028 in the late-2025 Climate Law
deal, so the charge Marta resents does not exist until then. The Social Climate
Fund is live from 2026 and national plans run 2026–2032, so the money is real
before the charge is. Anything built on ETS2 revenue is a 2029 business; the app
is dated 2028 accordingly.

**We are not the only ones who could deliver this.** The Commission tells member
states to reuse existing Cohesion and Recovery delivery structures, and
recommends voucher programmes for public transport by name. France already runs
its sustainable mobility allowance through established voucher issuers. The gap
is not distribution, it is verification and the evidence pack a milestone-based
fund demands. Pitch the second thing, not the first.

**The invisible front door is a strategy, not a tagline.** The journey is right
that people trust the city and not an unknown app promising money. But it also
means we have no consumer brand, no direct channel, and a single customer per
city who can replace us at renewal. That is the commercial risk and it is the
opposite of the portability argument that makes the insurer version defensible.

**We never touch the money.** The app says so on the source screen: the
hand-back passes straight through and the operator's fee is paid separately by
the city. Skimming a payment meant for households would end the programme. It
also means the revenue model is a fee per verified claim, which has to be
argued on volume.

---

## What the app does well

No verification burden on the member at all. The fare system already proved the
journey happened; we are reading it, not re-proving it. That is why there is no
tracking, no GPS, no corridor matching and no evidence checklist anywhere in
this build, and it is the right answer for a user who is awake at 4:20am.

The money is integer grosz end to end and only becomes a string at the edge.

## Numbers

21 tests. TypeScript clean. Every figure on the Settings screen.
