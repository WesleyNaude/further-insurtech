# Further — the fuel tax hand-back (branch)

Drivers pay a carbon charge at the pump. Some of it comes back to low-income
households, on every tram, bus and train journey they make. Kraków, 2028.

```bash
npm install && npm run dev
```

No keys, no backend, no sign-in. Settings has a light/dark switch, a demo reset,
and a "Start empty" button that runs the sign-up from the beginning.

**Read `BRANCH-NOTES.md` first.** The journey's two money figures cannot both be
true, and there are four things worth flagging before anyone pitches this.

`main` holds the insurer build; `flight-reward` holds idea 2.

## The design constraint that decides everything

> If the system requires her to remember something at 4:20am, it has already
> failed.

So there is no "log a journey" button anywhere in this app. She taps her travel
card the way she always has, the operator's fare system tells us a valid journey
happened, and the money follows a few minutes later. No tracking, no GPS, no
evidence to upload. The fare system already did the verifying.

## What it pays

| | |
|---|---|
| A single KMK ticket | 6,00 zł |
| Share covered | 50% |
| Back, each journey | **3,00 zł** (about €0.70) |

The member sees złoty, because Poland is not in the eurozone and a wallet
showing her euro would be the first thing that told her this was not for her.
Euro appears only where the fund itself is denominated in euro.

## The screen that matters

Marta drives in, because the first tram is too late for a six o'clock shift, and
trams home. The wallet notices that pattern on its own, prices the missing
mornings, and tells her when the first tram runs. Then it stops talking.

It does not tell her to move her shift. She works out whether that is possible.
We only make it legible in money.

## Not claimed

A demonstration. Figures are modelled, not quoted. No city, operator or fund has
endorsed this, and rates are set by the city rather than by us.
