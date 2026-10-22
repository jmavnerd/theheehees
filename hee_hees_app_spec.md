# Hee Hees Bowling Penalty Tracker — App Specification

## Overview

A mobile-first web application used by a 4-person bowling team to track weekly infractions, penalties, and fees during a 36-week bowling season. The app is used live during bowling nights on an Android tablet and phones (Chrome browser). Data should eventually sync to Google Sheets via Apps Script.

---

## Team

### Core Bowlers (always pre-selected at week start)
| Name | ID | Initials | Color |
|---|---|---|---|
| Gil Santiago | `gil` | GS | #1D9E75 |
| TJ Eberhardt | `tj` | TJ | #185FA5 |
| John Merritt | `john` | JM | #D85A30 |
| Jeff Terito | `jeff` | JT | #534AB7 |

Additional bowlers can be added via Admin. Non-core bowlers default to **Absent** at the start of each week.

---

## App Structure

### Tabs
1. **Live** — active week entry (frames, infractions, hangings)
2. **Verify** — post-game score URL verification
3. **Night** — nightly summary and close week
4. **History** — season totals, week log, exports
5. **Admin** — manage bowlers, infractions, fees, season name

---

## Season Rules

- **Season length:** 36 weeks maximum
- **Games per night:** 3
- **Frames per game:** 10
- **Week counter** displayed on Live tab (e.g. "Week 4 of 36")
- **Over 10 pin drop** is only assessed on **Week 36** (end of season)

---

## Start Week Flow

When tapping "Start Week":
1. Modal appears showing all bowlers
2. **Core bowlers** (Gil, TJ, John, Jeff) are pre-toggled ON (Playing)
3. **Additional bowlers** are pre-toggled OFF (Absent)
4. Each bowler's **weekly average** pre-fills from their Admin starting average but can be adjusted
5. Absent bowlers are automatically charged the **Absent fee ($10)**
6. Confirm → week starts with correct players and averages locked in
7. (v68) For each bowler left off, a button sheet asks **who's subbing** (a name from the Sub Roster, or *No sub*). Skipped if the Sub Roster is empty; Cancel stops the sequence.

### Absent bowlers & subs (v60–v68)
- A deselected roster bowler is **not removed** from the Live tab. They keep a dimmed column and a frame-modal tab marked "(abs)".
- On an absent bowler's frames only the **sub-chargeable** entries are offered: 🪝 Hung, Dropped Point, Swept (`SUB_CHARGEABLE`), and any team infraction. Other player infractions (Open, Gutter, Low Game, …) are hidden.
- **Team infractions charge every other bowler whether present or absent** (a sub bowls as the absent bowler). The $10 Absent fee still comes only from the absent flag.
- **Mid-week toggle:** a "Playing:" chip row on the Live tab flips any bowler between present and absent (injury etc.). Frames already entered are kept; a confirm explains the fee change. Marking a bowler absent opens the sub picker; an absent chip also gets a "+ sub" / "sub: Name" button.
- **Sub Roster:** two spots in Admin; enter each sub's name as it appears on the score sheet. Assigned per week in `w.subs[absentBid] = subId`. Old saved state has no `S.subs` (defaults supplied by `subRoster()`).

---

## Infractions

### How Infractions Work
- **Player infractions** — fee charged to the offending bowler
- **Team infractions** — fee charged to the OTHER 3 bowlers (the triggering bowler benefits or caused the event)
- All infractions are logged at the **frame level** — tap any frame for any bowler to log infractions
- Infractions can be bowler-specific (show only for certain bowlers, or hidden for others)

### Full Infraction List

| Infraction | ID | Fee | Type | Notes |
|---|---|---|---|---|
| Absent | `absent` | $10.00 | Player | Auto-logged when bowler toggled off at week start |
| Broke the seal | `brokeseal` | $5.00 | Player | First person to use the bathroom pays |
| Dropped point | `droppedpoint` | $1.00 | Player | Lost the point for that game |
| Foul | `foul` | $5.00 | Player | Foot crosses foul line |
| Golden strikeout | `goldenstrikeout` | $50.00 | Player | 3 consecutive gutter balls in a row |
| Gutter ball | `gutterball` | $5.00 | Player | Ball goes in the gutter |
| High game | `highgame` | $10.00 | Team | Bowler scores 50+ pins above their weekly average in a single game — other 3 pay |
| Jeff open | `jeffopen` | $0.50 | Player | Jeff-specific version of Open — only shown for Jeff |
| Jeff single pin | `jeffsinglepin` | $1.00 | Player | Jeff-specific version of Single pin miss — only shown for Jeff |
| Late | `late` | $5.00 | Player | Arrives late to bowling night |
| Low game | `lowgame` | $10.00 | Player | Bowler scores 50+ pins below their weekly average in a single game |
| Open | `open` | $0.25 | Player | Failed to convert a spare — shown for Gil, TJ, John only (not Jeff) |
| Out of uniform | `outofuniform` | $5.00 | Player | Not wearing team uniform |
| Single pin miss | `singlepinmiss` | $0.50 | Player | Missed a single pin spare — shown for Gil, TJ, John only (not Jeff) |
| Spill beer | `spillbeer` | $20.00 | Player | Spills their beer |
| Swept | `swept` | $5.00 | Player | Lost all 3 games (Dropped Point in all 3 games) |
| Talking shit | `talkingshit` | $5.00 | Player | Trash talking |
| Wrong lane | `wronglane` | $5.00 | Player | Bowled on the wrong lane |
| XXXX | `xxxx` | $0.25 | Team | Bowler gets 4+ consecutive strikes — other 3 are each charged $0.25 per instance |
| Left-side gutter | `leftgutter` | $25.00 | Player | Ball goes in the left gutter |
| Under 500 | `under500` | $10.00 | Player | Total pinfall across all 3 games is under 500 |
| Over 10 pin drop | `over10pin` | $25.00 | Player | Season-ending average is 10+ pins below starting average — assessed Week 36 only |
| Win cards | `wincards` | $1.00 | Team | Winner of the poker card game — other 3 each pay $1 |

### Bowler-Specific Infraction Rules
- `jeffopen` — **only shown for Jeff**
- `jeffsinglepin` — **only shown for Jeff**
- `open` — **hidden for Jeff** (shown for Gil, TJ, John)
- `singlepinmiss` — **hidden for Jeff** (shown for Gil, TJ, John)

### Infraction Visibility System
Each infraction has two optional arrays:
- `onlyFor: [bowlerIds]` — only show for these bowlers
- `excludeFor: [bowlerIds]` — hide for these bowlers

---

## Hangings

A "hanging" is a special penalty tracked separately from frame infractions using a +/- counter per bowler per night.

### Hanging Rules
1. **Solo non-striker** — If exactly 3 bowlers throw a strike in a frame and 1 doesn't, the non-striker gets hung
2. **All-4-strike rule** — If all 4 bowlers strike in the same frame, whoever throws the **lowest first ball in the next frame** gets hung. Consecutive all-4 frames stack onto whoever is lowest when the streak breaks. **Ties (v67):** if bowlers tie for lowest first ball, only the tied bowlers carry to the next frame's first ball, repeating until one is the sole lowest, who takes all the stacked hangs. The carried hang stacks with that frame's own solo hang (a bowler can get 2 in one frame).
2a. **With a sub:** the sub's score line stands in for the absent bowler, so there are still 4 bowlers
3. **Double hung** — If both conditions apply to the same bowler in the same frame, they get hung **twice**
4. **Cross-game carry** — If all 4 strike in Frame 10 of Game 1 or Game 2, the all-4 rule carries over to Frame 1 of the next game
5. **Game 3 exception** — If all 4 strike in Frame 10 of Game 3, the all-4 rule is skipped

### Hanging Fee Scale (cumulative, resets after $16)
| Instance | Fee |
|---|---|
| 1st | $0.50 |
| 2nd | $1.00 |
| 3rd | $2.00 |
| 4th | $4.00 |
| 5th | $8.00 |
| 6th | $16.00 |
| 7th | $0.50 (resets) |

Total hanging fee = sum of all instances using the scale above, cycling back to $0.50 after $16.

---

## XXXX Rules

- A bowler earns **1 XXXX instance** per 4 consecutive strikes within a game
- Each additional consecutive strike beyond 4 adds another instance (5 in a row = 2, 6 = 3, etc.)
- Streaks **reset at the start of each new game** (do not carry between games)
- When a bowler triggers XXXX, the **other 3 bowlers** are each charged $0.25 per instance

---

## Score Verification Flow

> **Implementation note (v36+):** the original Claude `sendPrompt()` / `VERIFY_RESULT`
> copy-paste round-trip below is no longer used. The Verify tab now fetches the
> score URL directly through `/api/proxy` (with public-proxy fallbacks), parses
> the sheet in `parseScoreSheet()`, and runs `calcVerifyHangings()` /
> `calcVerifyXXXX()` in-browser. The rest of this section is kept for reference.

After bowling, the team receives a score URL via email (from syncpassport.com). The verification flow:

1. User pastes the score URL into the **Verify tab** and taps **Fetch & Verify**
2. App fetches + parses all 3 games frame by frame
3. App recomputes hangings and XXXX from the sheet and shows, per bowler,
   `Logged X / Calc Y` (green when equal, red when not) plus flag chips
   (HIGH GAME / LOW GAME / UNDER 500 / SWEPT)

### Subs in Verify (v64–v67)
- An absent bowler **with a sub assigned** is verified using the sub's sheet row (matched by the Sub Roster name — case-insensitive; exact name or same last name + first initial). The row is read as the absent bowler's slot for **hangs**.
- **XXXX is not verified for a sub's frames** (v66). Sub scores are **never saved** to Week scores/averages and get no HIGH/LOW/UNDER 500 flags (SWEPT can still show).
- An absent bowler with **no** sub is skipped by Verify. Only bowlers who have a line in a game count for that game's hang rules (blank rows are ignored).

### Editing game scores (v63)
History → Week Log → **✏️ Edit game scores** (Admin PIN). Each bowler's G1/G2/G3 become editable boxes with an **Abs** button. An Abs game is stored as 0 and `w.skipGames[bid][g] = true`, so it stays **out of the average** and survives a later "Save these scores" from Verify. Abs affects averages only, never fees.

### Mismatch correction (v41)

When Logged ≠ Calc, the comparison lists the **exact frames** to change,
directly under the red line:

- `➕ Add 🪝 — Game 2, Frame 7 · solo non-striker`
- `➖ Remove ✖️ XXXX — Game 1, Frame 3`

Each row is tappable → opens that frame's modal (bowler pre-selected) so the
marker can be toggled by hand. Rows are only shown for the week currently in
scope (`editingWeek || currentWeek`); a closed week must be opened via
**History → Edit** first.

An **Apply Fix (N)** button applies every listed correction at once:

- Gated behind the Admin PIN (`requireAdmin`)
- Blocked on a closed week unless opened via History → Edit
- `confirm()` dialog lists every add/remove before writing
- Writes **only** `hung` / `xxxx` frame markers — never scores or other
  infractions
- `hung` stays one-per-frame (a same-frame double-hung spills its second marker
  to the next hang-free frame in that game, mirroring `migrateHangs()`);
  `xxxx` may stack in a frame (each is a separate team charge)
- Resyncs `w.hangings[bid]` (`hungCountW`) afterward
- Games where the per-frame attribution differs but the marker **count** already
  matches are treated as correct (no fee depends on which frame within a game a
  marker sits in)

### Legacy sendPrompt format (unused)
```
VERIFY_SCORES|url={URL}|bowlers={Name}={id}:avg={avg},...|week={weekNumber}
```

### Legacy VERIFY_RESULT JSON format (unused)
```json
{
  "gil": { "hangings": 1, "xxxx": 1, "swept": false, "highGame": false, "lowGame": false, "under500": false },
  "tj":  { "hangings": 4, "xxxx": 6, "swept": false, "highGame": false, "lowGame": false, "under500": false },
  "john":{ "hangings": 6, "xxxx": 1, "swept": false, "highGame": false, "lowGame": false, "under500": false },
  "jeff":{ "hangings": 1, "xxxx": 0, "swept": false, "highGame": false, "lowGame": false, "under500": false }
}
```

### Auto-detectable infractions (from score sheet)
| Infraction | Detection logic |
|---|---|
| Hangings | Frame-by-frame analysis using hanging rules above |
| XXXX | Consecutive strike streaks per game per bowler |
| Swept | Bowler has Dropped Point in all 3 games |
| Under 500 | Total pinfall across 3 games < 500 |
| High game | Any single game score 50+ pins above weekly average |
| Low game | Any single game score 50+ pins below weekly average |

---

## Data Structure

### State Object
```javascript
{
  season: "25-26",
  bowlers: [
    { id, name, initials, color, avg }
  ],
  infractions: [
    { id, name, fee, type, onlyFor, excludeFor }
  ],
  subs: [ { id: "sub1", name }, { id: "sub2", name } ],   // Sub Roster (Admin)
  currentWeek: null | weekNumber,
  weeks: {
    [weekNumber]: {
      date: "6/2/2026",
      participating: [bowlerIds],
      absent: [bowlerIds],            // left off at Start Week (or toggled mid-week)
      subs: { absentBowlerId: subId },// who's subbing (optional)
      scores: { bowlerId: [g1,g2,g3] },
      skipGames: { bowlerId: [bool,bool,bool] }, // "Abs" games excluded from averages
      avgs: { bowlerId: average },
      hangings: { bowlerId: count },
      games: [
        { // game 0, 1, 2
          [bowlerId]: {
            frames: [
              [infractionIds], // frame 0
              [infractionIds], // frame 1
              // ... 10 frames
            ]
          }
        }
      ]
    }
  }
}
```

### Storage
- Browser localStorage key: `hh12`
- JSON stringified full state object
- **Planned:** Google Sheets via Apps Script for cross-device persistence

---

## Fee Calculation Logic

### Player infractions
`total += fee` for the bowler who committed the infraction

### Team infractions
`total += fee` for each of the OTHER 3 bowlers (the triggering bowler is not charged)

### Hangings
Calculated separately using the cumulative scale. Total hanging fee for a bowler = `hangValue(count)` where count is total hangings for the night.

### Special cases
- **High game** — charged to other 3 ($10 each). Goes to the bowler who bowled the high game
- **Win cards** — charged to other 3 ($1 each). Goes to the card game winner
- **XXXX** — charged to other 3 ($0.25 each per instance)
- **Absent** — charged to the absent bowler only. The absent bowler can also carry hangs, Dropped Point, Swept and (as a team charge to the others) team infractions entered on their frames.

---

## Season Settlement Logic

At end of season:
1. Each bowler's **fees accrued** = total penalties charged to them all season
2. Each bowler's **apportioned surplus** = 1/3 of the sum of the OTHER 3 bowlers' fees (not their own)
3. Each bowler's **net fee position** = fees accrued minus apportioned surplus
4. **Cruise cost** is deducted from each bowler's surplus (John's cruise cost is $50 less due to deposit paid)
5. **Cash already paid in** is reconciled against remaining balance
6. Final settlement = who owes who what

---

## UI/UX Notes

- Mobile-first design, optimized for portrait on phones and tablet
- Big touch targets (minimum 44px)
- All navigation via bottom tab bar
- Frame grid: 5×2 layout (10 frames per bowler)
- Frame colors:
  - Orange = has infraction
  - Red/pink = has hanging
  - Purple/pink = has both
  - Grey/faded = bowler absent
- Infraction label colors inside frames:
  - Amber = player infraction
  - Blue = team infraction
  - Red = hanging
- Modal sheet slides up from bottom for frame/infraction entry
- Toggle switches for infraction selection
- +/- buttons for hanging count

---

## Build Log

### Oct 20–21, 2026 — Absent bowler + sub night (v60–v68)
Triggered by a night where Gil was absent and a sub (Jacob AUsburn) bowled; the app had no way to log the absent bowler's fees, so a stand-in Low Game was used for the Absent fee.
- **v60** Absent bowlers stay on the Live grid / frame modal.
- **v61** Team infractions charge everyone, present or absent (`weekBowlerIds`); absent bowlers limited to sub-chargeable fees.
- **v62** Live "Playing:" chips flip present/absent mid-week.
- **v63** History game scores editable with sticky per-game Abs.
- **v64** Sub Roster (Admin) + sub assignment; Verify reads the sub's sheet row for hangs; hang rules count only bowlers with a line each game.
- **v65** Sub picker is a button sheet (was a typed prompt).
- **v66** Verify skips XXXX for subs.
- **v67** All-4 tie-for-lowest carries to the next frame's first ball.
- **v68** Start Week asks for the sub of each bowler left off.
- Verified against the real Week 8 score sheet (read-only): with Jacob as Gil's sub, every logged hang matched and Verify found one extra (TJ, G3 F10: carried all-4 hang + solo hang = 2). Week 8 was then corrected in the app.
- Averages are unaffected by subs: only a bowler's own games count (`w.scores` > 0 and not Abs).

## Planned Features (not yet built)

- [ ] Google Sheets backend via Apps Script (cross-device sync)
- [ ] Stats/metrics tab — season comparisons, leaderboard, infraction trends
- [ ] Season-over-season comparison
- [ ] Over 10 pin drop check on Week 36 close
- [ ] Score URL auto-fetch (currently requires copy/paste of VERIFY_RESULT)
- [ ] Progressive Web App (PWA) for offline use and home screen install

---

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no frameworks)
- Browser localStorage for persistence (key: `hh12`)
- `sendPrompt()` for Claude integration in verify flow
- `window.storage` API for artifact storage
- Target browsers: Chrome on Android (tablet + phone)
