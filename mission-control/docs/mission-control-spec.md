# Mission Control — Babanuj Ops

## Overview
Mission Control is a multi-agent operations hub for Babanuj. It centralizes tasks, ownership, approvals, and reporting across SEO, paid media, social content, customer support, and B2B relationships. The system is designed for real-time collaboration, clear accountability, and measurable outcomes.

**Stack:** TypeScript, Convex (DB + storage), Vercel (web + API)

## Primary Goals
- Orchestrate growth and operations across channels.
- Centralize tasks, approvals, and daily reporting.
- Improve execution speed, visibility, and performance tracking.

## Phase 1 Scope (Initial Build)
- Mission Control UI dashboard (shadcn dashboard-inspired layout)
- Task board with custom statuses
- Agent cards and live activity feed
- KPI snapshot panels
- Approvals queue
- Base Convex schema + seed data
- Daily standup generation (logic scaffold)

## Agents (Initial Active)
- **Hassoun** — Master Orchestrator
- **Naseem** — SEO Master
- **Amina** — Customer Support

## Task System
### Statuses
- Inbox
- Assigned
- In Progress
- Review
- Done
- Blocked
- Waiting on Customer
- Waiting on Ops
- Scheduled
- Optimizing
- Paused

### Required Fields
- Channel (SEO, Google Ads, Amazon Ads, Social, Support, B2B)
- Owner agent
- Priority (P0–P3)
- Due date
- Brand/account
- KPI target
- Links/attachments
- Checklist + definition of done
- Notes/decision log

### Behaviors
- Thread subscriptions and @mentions
- Approvals queue for spend/policy changes
- Audit trail for changes

## Notifications
- Daily standup (09:00 America/Chicago)
- Real-time alerts: @mentions, blockers, SLA breaches
- Alert triggers: spend spikes, KPI regression, support backlog growth, pipeline stalls

## UI Layout (inspired by shadcnuikit dashboard)
- **Left nav:** Agents, Channels, Templates, Approvals, Reports
- **Center:** Task board (kanban)
- **Right:** Live feed + KPI snapshot
- **Top bar:** Project name, time, status

## Data Model (Convex)
### Agents
- name
- role
- status (idle/active/blocked)
- sessionKey
- focus
- workload

### Tasks
- title, description
- status
- channel
- priority
- ownerIds
- dueDate
- brand
- kpiTarget
- checklist
- definitionOfDone
- decisionLog

### Messages
- taskId
- fromAgentId
- content
- attachments

### Activities
- type
- agentId
- message

### KPIs
- channel
- metric
- value
- delta
- period

### Approvals
- type
- status
- requesterId
- rationale
- impact
- link

### SupportQueue
- ticketId
- status
- priority
- sla
- category

### B2B Pipeline
- accountName
- stage
- nextStep
- ownerId
- health

## Future Phases
- Convex realtime subscriptions wired to UI
- Agent automation + cron heartbeats
- Daily standup summary generator
- Slack/Telegram notifications
- Analytics and report exports
