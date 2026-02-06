# Tasks — Inbox Actions (Toggle + Schedule)

## Relevant Files
- `convex/convex/schema.ts`
- `convex/convex/tasks.ts`
- `convex/convex/activities.ts`
- `ui/src/app/tasks/page.tsx`
- `ui/src/components/EmptyState.tsx`
- `ui/src/components/SectionTitle.tsx`
- `ui/src/components/SideNav.tsx`
- `ui/src/lib/systemAgent.ts`

### Notes
- Scheduling should be restricted to Inbox stage only.
- Disabling a task should cancel its schedule + cron job.
- Scheduling only allowed when enabled.
- Use Clawdbot cron tool for actual scheduling.

## Instructions for Completing Tasks
- Work top‑down; do schema first, then mutations, then UI.
- Keep schedule jobs tied to a task `jobId` and clear on disable.
- Log activities for every toggle/schedule/clear.

## Tasks
- [ ] 0.0 Create feature branch

- [ ] 1.0 Update Convex schema for enabled + schedule fields
  - [ ] 1.1 Add `enabled: boolean` to `tasks` (default true)
  - [ ] 1.2 Add `schedule` object with `type`, `runAt`, `cron`, `jobId`
  - [ ] 1.3 Add `seed` optional fields if needed for seed/clear compatibility

- [ ] 2.0 Add Convex mutations/queries for toggle + schedule + clear
  - [ ] 2.1 `tasks.toggleEnabled({ id, enabled })`
  - [ ] 2.2 `tasks.setSchedule({ id, schedule })` (validate inbox + enabled)
  - [ ] 2.3 `tasks.clearSchedule({ id })`
  - [ ] 2.4 Ensure schedule removal when disabled

- [ ] 3.0 Add cron integration (create/update/delete) and persist jobId
  - [ ] 3.1 Define cron job payload (taskId + action)
  - [ ] 3.2 Create cron job on setSchedule
  - [ ] 3.3 Cancel cron job on clear/disable
  - [ ] 3.4 Store cron job ID in task

- [ ] 4.0 Update Inbox UI to support toggle + schedule modal
  - [ ] 4.1 Show toggle on Inbox cards only
  - [ ] 4.2 Disable schedule UI when task disabled
  - [ ] 4.3 Add schedule modal (one‑time / cron)
  - [ ] 4.4 Send updates to Convex mutations

- [ ] 5.0 Log activity events for toggle/schedule
  - [ ] 5.1 Log on toggle
  - [ ] 5.2 Log on schedule create/update/clear

- [ ] 6.0 Test flow (toggle, schedule, disable cancels, clear schedule)
  - [ ] 6.1 Toggle on/off behavior
  - [ ] 6.2 Schedule one‑time + cron
  - [ ] 6.3 Disable cancels schedule
  - [ ] 6.4 Clear schedule action
