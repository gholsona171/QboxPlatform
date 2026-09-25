# Staff

Keep a staff roster with ranks, promote and demote with Discord roles, give
strikes, handle leave of absence, and track shifts. Managers work from the
portal (`/staff`) or Discord (`/staff`); staff members use `/staff` or the
portal's **My profile** tab for their own profile, shifts, and leave.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, roster message, Discord REST adapter | `modules/staff` (`@qbox/staff`) |
| Database models | `StaffSettings`, `StaffRank`, `StaffMember`, `StaffRecord`, `StaffStrike`, `StaffLeave`, `StaffShift` in `prisma/schema/staff.prisma` |
| PostgreSQL repository | `packages/database/src/staff/PrismaStaffRepository.ts` |
| `/staff` command | `packages/discord/src/commands/Staff.command.ts` |
| Leave buttons and timer | `packages/discord/src/staff/StaffFeature.ts` |
| API | `apps/api/src/staff/StaffRoutes.ts` |
| Portal | `apps/web/public/js/staff.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `staff.view` | See the roster, profiles, leave requests, shifts, and the leaderboard |
| `staff.manage` | Hire, promote, demote, remove, strikes, notes, reviewing leave, ranks, and settings |
| `staff.shifts` | Clock in and out, and see your own shift time |

Anyone on the roster can see their own profile and request leave. Discord
administrators can do everything.

## Discord commands

`/staff roster | profile | hire | promote | demote | fire | strike | note | loa | clockin | clockout | shifts`

- `hire`, `promote`, and `demote` take an optional rank name. Without one, hires start at the lowest rank and promotions move one rank.
- `loa days:<n> reason:<text> start:<YYYY-MM-DD>` requests leave. `loa action:Cancel or end my leave` withdraws a request or ends leave early.
- `shifts` shows your week; add `member` or `leaderboard:true` (needs `staff.view`) and `weeks-ago` for earlier weeks.

## Features

- **Ranks:** an ordered list (highest first) with a name, Discord role, color, and description. Changing a rank's role moves every member in it to the new role. Ranks with members cannot be deleted.
- **Roster:** each member has a rank, optional callsign or badge number, join date, status (active, on leave, suspended, retired), and private notes.
- **Roles:** hiring gives the rank role, promotions and demotions swap roles, and removing someone takes their rank and leave roles. If Discord refuses the role change, nothing is saved.
- **History:** every hire, promotion, demotion, removal, leave start and end, note, strike, and status change is recorded with who did it and why. History is kept after someone is removed.
- **Strikes:** with an optional expiry. Expired or removed strikes stop counting.
- **Leave of absence:** members request leave; the request is posted in the staff log with Approve and Deny buttons, and appears under **Leave requests** in the portal. Approved leave starts on its start date: the member's status becomes "on leave", the optional leave role is added, and any open shift ends. Leave ends automatically (or early) and the role is removed.
- **Shifts:** clock in and out, with a shift log and weekly totals (Monday to Sunday, UTC) and a leaderboard. Shifts end automatically after a set number of hours and are marked "auto".
- **Staff log:** hires, promotions, demotions, removals, strikes, leave, and strike removals are posted to a channel.
- **Roster message:** choose a channel and Guildhall keeps one message listing every rank and member, updated after every change. If the message is deleted a new one is posted.

## Setup

1. Give the bot **Manage Roles** and put the Guildhall role above the rank roles and the leave role.
2. In the portal, open **Staff > Ranks** and add your ranks, highest first, with their Discord roles.
3. In **Staff > Settings**, choose the staff log channel, the roster channel, the leave role, the auto clock-out limit, and the longest leave allowed.
4. Grant `staff.view`, `staff.manage`, and `staff.shifts` to the right roles.
5. Hire staff with `/staff hire` or **Staff > Roster**.

## Known limitations

- The roster message holds up to about 4000 characters; very large rosters are cut off at the end.
- Leave is checked once a minute, so it can start or end up to a minute late.
- Weekly totals use UTC weeks.
