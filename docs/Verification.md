# Verification

New members prove they are real before they get access to the server. They
click a button, type a code, or answer your questions. Qbox gives them the
verified roles, removes the unverified role, and records every attempt. Setup
lives in the portal (`/verification`); staff use `/verify` in Discord.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules and Discord REST adapter | `modules/verification` (`@qbox/verification`) |
| Database models | `VerificationSettings`, `VerificationAttempt`, `VerificationPendingMember` in `prisma/schema/verification.prisma` |
| PostgreSQL repository | `packages/database/src/verification/PrismaVerificationRepository.ts` |
| `/verify` command | `packages/discord/src/commands/Verify.command.ts` |
| Panel button, forms, join handler, kick timer | `packages/discord/src/verification/` |
| API | `apps/api/src/verification/VerificationRoutes.ts` |
| Portal | `apps/web/public/js/verification.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `verification.members` | See attempts and stats, check a member, verify and unverify members |
| `verification.manage` | See attempts and stats, change settings, and post the panel |

Discord administrators can do everything.

## Discord commands

`/verify panel | member | unverify | status`

- `panel` posts the panel in the verification channel, or updates it if it is already there.
- `member` verifies someone yourself (skips the challenge and the account age check).
- `unverify` removes the verified roles and gives the unverified role back.
- `status` shows whether a member is verified, their account age, and recent attempts.

## Methods

- **Button:** clicking the panel button verifies the member.
- **Code:** Qbox shows a 6-character code in a private reply (letters and digits, spaced out so it is easy to read). The member clicks **Enter code** and types it in a form. Spaces and case don't matter. Codes expire after 5 minutes and work once.
- **Questions:** the member answers up to 5 questions in a form. Each question has one or more accepted answers, compared without case or extra spaces. Every answer must be right.

## Settings

- **Verified roles** (up to 10) are given on success. The optional **unverified role** is given on join and removed on success.
- **Minimum account age** (days, from the Discord account creation date). Newer accounts are either not allowed to verify (**deny**), kicked on join (**kick**), or allowed but posted to the log (**flag**).
- **Wrong tries before a cooldown:** after this many failures within the cooldown window, the member must wait. 0 means unlimited.
- **Kick after N minutes:** members who joined and still have not verified are kicked (checked every minute, with a DM telling them they can rejoin). 0 turns it off.
- **Log channel** receives successes, failures, flagged and kicked accounts, and staff changes.
- **DM on success** with optional custom text, and a **welcome message** in a channel after verifying. Both support `{user}` (mention) and `{server}` (server name).
- **Panel:** title, text, color, and button label, with a live preview and a post/update button.

## Attempts

Every attempt is stored with the member, result, reason, and who did it:
`PASSED`, `FAILED`, `DENIED_AGE`, `KICKED`, `MANUAL` (verified by staff), and
`REVOKED` (unverified by staff). The portal lists them with result and search
filters and shows verified, failed, and kicked counts for the last 24 hours and
how many members are waiting to verify.

## Setup

1. Give the bot **Manage Roles** and **Kick Members**, and put the Qbox role above the verified and unverified roles.
2. Hide your channels from `@everyone` (or the unverified role) and allow them for the verified role. Keep the verification channel visible to everyone.
3. In the portal, open **Verification > Settings**, pick the method, roles, and channel, and turn verification on.
4. Open **Panel**, adjust the text, and click **Post panel in Discord** (or run `/verify panel`).
5. Grant `verification.members` to staff who should verify members by hand.

## Known limitations

- Codes live in the bot's memory. If the bot restarts, members click Verify again to get a new code.
- Members already in the server when verification is turned on are not tracked for the kick timer; only members who join afterwards (or are unverified by staff) are.
- A member counts as verified when they hold all verified roles.
