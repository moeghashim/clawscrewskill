# Learning Log

## 2026-02-02
- Added a dedicated content calendar table (platform/status/publishDate) so the dashboard can group posts by production stage without overloading the task board.
- Seeded calendar items to validate grouping and visual density in the UI.
- Introduced a knowledge base table to track playbooks by category with quick summaries + links.
- Added meeting notes table + dashboard panel to capture summaries and next steps by meeting type.
- Implemented standup generation that summarizes tasks, blockers, approvals, support, and pipeline counts.
- Added alerts engine to detect blocked tasks, KPI regression, support backlog, and pending approvals.
- Added policy enforcement mutations that route approvals for sensitive actions and log activity updates.
- Added audit log table + mutation to capture rationale, impact, and measurement plan for major actions.
- Added dashboard panels for standups, alerts, and audit trail visibility.
- Added admin controls to create agents and assign tasks from the dashboard.
- Added dedicated admin pages for adding agents and assigning tasks, linked from navigation.
- Added role dropdown for agents with option to add a new custom role.
- Expanded agent creation to capture function, operating style, and deliverables.
- Added markdown import for agent details with role auto-mapping.
- Added header indicator for live agent/task counts.
- Added agent deactivation flow with required work summary + learning captured to audit logs.
- Updated task assignment to create new tasks (auto-assigned) instead of selecting existing tasks.
- Enhanced task cards with status icons, processing indicator, and clickable detail modal; moved admin actions to header.
