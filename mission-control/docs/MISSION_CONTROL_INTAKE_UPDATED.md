# Mission Control — Babanuj Ops Configuration

## 1) Project basics
- Project name: Mission Control
- Primary goal:
  - Orchestrate Babanuj growth and operations across SEO, paid media, social content, customer support, and B2B relationships
  - Centralize tasks, ownership, approvals, and daily reporting into one command center
  - Improve execution speed, visibility, and performance tracking across all channels
- Preferred stack: TypeScript + Convex + Vercel
- Hard deadlines: Not provided

## 2) Agent roster
- Hassoun — Master Orchestrator
  - Role: Owns priorities, assigns work, resolves blockers, enforces standards, ships weekly outcomes
  - Personality: calm, decisive, high leverage, insists on clarity and measurable results

- Naseem — SEO Master
  - Role: Audits the website, makes it SEO-ready, builds and executes the SEO plan using provided resources plus independent research
  - Operating style: technical and structured, evidence-first, documentation-driven
  - Deliverables:
    - Technical audit report and prioritized backlog
    - Indexing and crawl hygiene improvements
    - Core Web Vitals plan and fixes where feasible
    - On-page optimization standards and rollout
    - Keyword map, content plan, and publishing briefs
    - Monthly SEO performance report with next actions

- Rami — Google Ads Manager
  - Role: Owns Google Ads strategy, account structure, conversion tracking alignment, creative testing, and ongoing optimization
  - Operating style: incremental experimentation, ruthless measurement, budget-efficient
  - Deliverables:
    - Campaign architecture and naming conventions
    - Keyword and audience strategy
    - Landing page feedback loop with SEO and content
    - Weekly optimization log and KPI report

- Souq — Amazon Ads Manager
  - Role: Owns Amazon PPC strategy, buildout, harvesting, and optimization across Sponsored Products, Sponsored Brands, and Sponsored Display
  - Operating style: profit-aware, search-intent driven, systematic iteration
  - Deliverables:
    - Campaign architecture per ASIN and objective
    - Search term harvesting and negation system
    - Bid and placement strategy
    - Weekly TACoS and profitability report

- Zahra — Social Content Agent
  - Role: Creates content for businesses that want to sell with Babanuj, optimized for TikTok and Instagram
  - Operating style: hook-first, platform-native, fast iteration based on performance
  - Deliverables:
    - Content calendars and posting plans
    - TikTok and Reels scripts with hooks, CTAs, and shot lists
    - Caption and hashtag strategy
    - Repurposing workflows across formats
    - Monthly content performance review with next actions

- Amina — Customer Support Agent
  - Role: Runs customer support operations, drafts and maintains macros, handles escalations, and reports recurring issues
  - Operating style: warm, precise, de-escalation-first, policy-aligned
  - Deliverables:
    - Daily inbox triage and tagging
    - Response templates and macro library
    - Escalation playbooks and resolution tracking
    - Weekly top-issues report and root-cause recommendations

- Faris — B2B Relationships Agent
  - Role: Manages Babanuj business relationships, partner pipeline, onboarding coordination, and follow-ups
  - Operating style: relationship-first with strong operational discipline
  - Deliverables:
    - Lead intake, qualification, and pipeline stages
    - Outreach and follow-up sequences
    - Meeting notes, next steps, and ownership tracking
    - Onboarding checklists for brands selling with Babanuj
    - Weekly pipeline report and relationship health review

## 3) Start small
- Initial active agents:
  - Hassoun
  - Naseem
  - Amina
- First two-week outcome:
  - SEO backlog created with top fixes in progress
  - Support macros implemented and inbox triage stabilized with clear escalation paths
  - Mission Control task board running daily with live reporting

## 4) Mission Control UI
- Reference layout: https://shadcnuikit.com/dashboard/default
- Must-have panels and sections:
  - Agent Cards with status, focus, and workload
  - Task Board by channel and by agent
  - Live Feed for updates, decisions, blockers
  - KPI Snapshot for SEO, Google Ads, Amazon Ads, Social, Support, B2B
  - Customer Support Queue with SLA indicators and issue categories
  - B2B Pipeline with stages, next steps, and relationship health
  - Templates Library for macros, outreach, briefs, and SOPs
  - Approvals Queue for spend changes, publishing, and policy-sensitive actions
- Nice-to-have panels:
  - Content Calendar for TikTok and Instagram
  - Knowledge Base for playbooks and best practices
  - Meeting Notes hub for B2B and operational reviews
- Layout: left navigation, center task board, right live feed and KPI sidebar
- Theme: minimal, tactical, high-contrast, dashboard-first
- Typography: modern sans-serif, readable density, consistent hierarchy

## 5) Task system
- Statuses: Inbox, Assigned, In Progress, Review, Done, Blocked, Waiting on Customer, Waiting on Ops, Scheduled, Optimizing, Paused
- Required fields:
  - Channel: SEO, Google Ads, Amazon Ads, Social, Support, B2B
  - Owner agent
  - Priority: P0, P1, P2, P3
  - Due date
  - Brand or account
  - KPI target
  - Links and attachments
  - Checklist and definition of done
  - Notes and decision log
- Thread subscriptions and mentions: enabled

### 5.1) Agent management process
- Add agent:
  - Create agent record with name, role, status, focus, and workload
  - Assign initial channels and default queue
  - Announce in Live Feed
- Remove agent:
  - Mark agent status as inactive
  - Reassign open tasks to another agent or Inbox
  - Archive agent record (retain history)

### 5.2) Task assignment process
- Intake: tasks land in Inbox
- Assign:
  - Set Owner agent
  - Set priority and due date
  - Move status to Assigned
- Start:
  - Agent moves task to In Progress
  - Adds first update in Notes/Decision Log
- Complete:
  - Move to Review → Done
  - Add completion note + KPI impact

## 6) Notifications
- Daily standup: 09:00 America/Chicago
- Summary destination: in-app plus Telegram-style digest format
- Real-time alerts: enabled for mentions, blockers, and SLA breaches
- Alert triggers:
  - Sudden spend spikes
  - KPI regression week over week
  - Support backlog growth
  - Pipeline stalled items

## 7) Access and deployment
- Repo name: mission-control
- Vercel project: Not provided
- Convex project: Not provided
- Domain: Not provided

## 8) Constraints and operating rules
- Autonomy: agents execute tasks within their scope and log decisions in Mission Control
- Approvals: Hassoun routes budget-sensitive and policy-sensitive actions through the approvals queue
- Documentation: every major change includes a short rationale, expected impact, and measurement plan
