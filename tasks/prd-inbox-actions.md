# PRD — Inbox Actions (Toggle + Schedule)

## 1. Introduction / Overview
Add two actions for tasks in the **Inbox** stage: **Enable/Disable toggle** and **Schedule** (one-time or cron). Scheduling should execute a real action (not just log) and be cancelable. When a task is disabled, any existing schedule is canceled.

## 2. Goals
- Provide a simple on/off control for Inbox tasks.
- Allow scheduling tasks (one-time or recurring) from Inbox.
- Ensure schedules are tied to tasks and can be canceled/updated.
- Log activity for toggles and scheduling events.

## 3. User Stories
- As an admin, I can disable an Inbox task to prevent it from running.
- As an admin, I can schedule an Inbox task for a specific time.
- As an admin, I can set a recurring schedule for an Inbox task.
- As an admin, I can clear or update a schedule.
- As an admin, I can see activity logs for these changes.

## 4. Functional Requirements
1. **Toggle**: Inbox tasks have an on/off toggle (`enabled`).
2. **Schedule**: Inbox tasks can be scheduled with:
   - One-time (`runAt` timestamp)
   - Cron (`cron` expression)
3. **Cancel on Disable**: If a task is disabled, any associated schedule is canceled.
4. **Schedule Only When Enabled**: Scheduling is only allowed when `enabled=true`.
5. **Cron Integration**: Scheduling creates a Clawdbot cron job and stores the job ID on the task.
6. **Execute Something**: Scheduled runs perform a real action (initially: create an activity record and optional task message; later can trigger workflow).
7. **Audit**: Activity feed logs toggle and schedule events.

## 5. Non-Goals
- Drag-and-drop kanban in this phase.
- Multi-user permissions/RBAC.
- Complex scheduling UI beyond simple input/validation.

## 6. Design Considerations
- Keep controls minimal: toggle + schedule button in Inbox cards.
- Modal for scheduling with two tabs: One-time / Cron.
- Validation hints for cron syntax.

## 7. Technical Considerations
- Convex schema additions:
  - `tasks.enabled: boolean`
  - `tasks.schedule: { type: "once"|"cron"; runAt?: number; cron?: string; jobId?: string }`
- New Convex mutations:
  - `tasks.toggleEnabled`
  - `tasks.setSchedule`
  - `tasks.clearSchedule`
- Cron integration via Clawdbot `cron` tool to create/cancel jobs.

## 8. Success Metrics
- 100% of Inbox tasks can be toggled and scheduled.
- Schedule creation and cancellation reflected in activity feed.
- No orphaned cron jobs after disabling a task.

## 9. Open Questions
- What action should scheduled jobs perform long-term (workflow execution, webhook, or task status updates)?
- Do we need cron previews or next-run calculation in UI?
