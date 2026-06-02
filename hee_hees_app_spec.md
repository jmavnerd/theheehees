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
2. **All-4-strike rule** — If all 4 bowlers strike in the same frame, whoever throws the **lowest first ball in the next frame** gets hung
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

After bowling, the team receives a score URL via email (from syncpassport.com). The verification flow:

1. User pastes the score URL into the **Verify tab**
2. App sends a `VERIFY_SCORES|...` message to Claude via `sendPrompt()`
3. Claude fetches the URL, parses all 3 games frame by frame
4. Claude applies the hanging and XXXX rules exactly
5. Claude responds with a `VERIFY_RESULT|{JSON}` block
6. User copies that line and pastes it into Step 2 of the Verify tab
7. App parses the JSON and displays a comparison against what was manually logged

### sendPrompt format
```
VERIFY_SCORES|url={URL}|bowlers={Name}={id}:avg={avg},...|week={weekNumber}
```

### VERIFY_RESULT JSON format
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
  currentWeek: null | weekNumber,
  weeks: {
    [weekNumber]: {
      date: "6/2/2026",
      participating: [bowlerIds],
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
- **Absent** — auto-logged, charged to absent bowler only

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
