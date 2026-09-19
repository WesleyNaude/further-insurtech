# Further — flight reward (branch)

Change one thing at home, prevent enough warming to cover your own flight **and
one more passenger's**, and an airline gives you a seat.

```bash
npm install && npm run dev
```

No keys, no backend, no sign-in. Settings has a light/dark switch, a demo reset
and a "Start empty" button for the genuine day-one state.

**Read `BRANCH-NOTES.md` first.** Two of the team brief's headline figures do
not survive contact with published sources, and there are three objections to
the premise that I could not design away. They are all written up there.

`main` holds the insurer build; this branch replaces the app.

## How a tonne is earned

`src/lib/flight/engine.ts` is the only place the maths lives.

| Constant | Value | Why |
|---|---|---|
| Eskom grid | 0.699 kg CO2e/kWh | About 80% coal |
| Geyser load | 350 kWh/month | Typical of a 240–450 range |
| Flight CO2 | 0.151 kg/pax-km | Short-haul economy; the climb burns disproportionately |
| Non-CO2 | ×1.9 | Contrails and the rest, shown separately and never folded in |
| Seats covered | 2 | Breaking even is not a contribution |

## Verification

Progress is measured from the member's own electricity bills against a
pre-install baseline, never from the appliance's rated saving. Nothing counts
until there is an install date, a Certificate of Compliance, bills from before
and at least one reading after. A month where usage rose contributes zero.

One install, one ticket. Claiming closes the enrolment.

## Owner or tenant

The stated user rents, and cannot fit a geyser. Choose "I rent" on the Install
screen and the checklist gains a landlord agreement: the owner installs and
keeps the electricity saving, the tenant earns the ticket. The brief's own
suggested resolution, built, and labelled as unproven.

## Not claimed

This offsets a flight's emissions. It is not a certified carbon credit, has not
been audited, and no airline or regulator has endorsed the calculation. We do
not claim the appliance would not have been fitted anyway.
