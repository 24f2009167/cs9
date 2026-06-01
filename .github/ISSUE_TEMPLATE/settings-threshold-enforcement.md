---
name: Settings threshold enforcement
about: Resolver eligibility and inactivity thresholds are saved but not enforced by background jobs
title: '[Settings] Threshold enforcement — eligibility and inactivity checks have no cron jobs'
labels: 'enhancement'
assignees: ''
---

**Is your feature request related to a problem? Please describe.**

The platform settings expose resolver eligibility thresholds (minimum spark/reputation to qualify as a resolver) and user inactivity thresholds (warning period, suspension period). These values are saved and wired into the leaderboard scoring, but they are not enforced — no background jobs read or act on them.

Consequences:

- A resolver whose reputation drops below the eligibility floor stays a resolver indefinitely.
- Users who are inactive beyond the warning/inactivity threshold are never auto-warned or suspended — the thresholds exist but nothing fires.

**Describe the solution you'd like**

Two cron jobs (analogous to `scheduled/question-assignment.js`):

1. **`resolver-eligibility-check`** — runs daily (or configurable interval)
   - Reads resolver eligibility threshold from platform settings.
   - Finds all resolvers whose reputation/spark falls below the threshold.
   - After a configurable grace period, auto-demotes them to USER and sends a notification.
   - Logs events to `logs/feature.log`.

2. **`inactivity-check`** — runs daily
   - Reads warning/inactivity thresholds from platform settings.
   - Finds users inactive beyond the warning threshold → sets `status: 'disabled'` (or `suspended`) and notifies them.
   - Logs events to `logs/feature.log`.

Both should be:
- Toggleable via a platform settings flag (e.g. `autoEnforcementEnabled`).
- Idempotent and safe to re-run.
- Documented in `FEATURE.md` alongside the existing auto-assignment spec.

**Describe alternatives you've considered**

Leave enforcement manual — admins monitor resolver quality and user activity manually via the admin dashboard. Acceptable for an MVP, but the settings UI is misleading since it displays thresholds that do nothing yet.

**Additional context**

- Both thresholds are already saved in `platform-settings` and wired into the leaderboard weights.
- Escalation settings are already wired (flag → warn → suspend pipeline exists in `content.service.js`).
- The gap is specifically that the cron jobs that *trigger* the escalation based on inactivity/reputation don't exist.
- See `FEATURE.md` for the existing cron pattern to follow.
