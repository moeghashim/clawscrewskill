import { mutation } from "./_generated/server";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const hassounId = await ctx.db.insert("agents", {
      name: "Hassoun",
      function: "Master Orchestrator",
      role: "Master Orchestrator",
      operatingStyle: "Calm, decisive, high leverage",
      deliverables: ["Weekly outcomes", "Resolved blockers", "Clear priorities"],
      status: "active",
      sessionKey: "agent:main:main",
      focus: "Daily execution + approvals",
      workload: 3,
    });

    const naseemId = await ctx.db.insert("agents", {
      name: "Naseem",
      function: "SEO",
      role: "SEO Master",
      operatingStyle: "Technical, structured, evidence-first",
      deliverables: ["Technical audit", "SEO backlog", "Monthly SEO report"],
      status: "active",
      sessionKey: "agent:seo:main",
      focus: "Technical SEO backlog",
      workload: 2,
    });

    const aminaId = await ctx.db.insert("agents", {
      name: "Amina",
      function: "Support",
      role: "Customer Support Agent",
      operatingStyle: "Warm, precise, de-escalation-first",
      deliverables: ["Inbox triage", "Macros", "Weekly issues report"],
      status: "active",
      sessionKey: "agent:support:main",
      focus: "Inbox triage + macros",
      workload: 2,
    });

    await ctx.db.insert("tasks", {
      title: "SEO technical audit",
      description: "Crawl and produce prioritized fix backlog.",
      status: "In Progress",
      channel: "SEO",
      priority: "P0",
      ownerIds: [naseemId],
      dueDate: "2026-02-07",
      brand: "Babanuj",
      kpiTarget: "+15% organic sessions",
      checklist: ["Run crawl", "Identify blockers", "Produce backlog"],
      definitionOfDone: "Backlog in Mission Control with priorities",
      decisionLog: ["Focus on CWV and indexability first"],
    });

    await ctx.db.insert("tasks", {
      title: "Support macros refresh",
      description: "Draft and deploy support macros for top 5 issues.",
      status: "Assigned",
      channel: "Support",
      priority: "P1",
      ownerIds: [aminaId],
      dueDate: "2026-02-03",
      brand: "Babanuj",
      kpiTarget: "<4h first response",
      checklist: ["Review top issues", "Draft macros", "Deploy"],
      definitionOfDone: "Macros approved + live",
      decisionLog: ["Escalations must note root cause"],
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: hassounId,
      message: "Created initial SEO and Support tasks.",
    });

    await ctx.db.insert("kpis", {
      channel: "SEO",
      metric: "Organic sessions",
      value: "12.4k",
      delta: "+6%",
      period: "W/W",
    });

    await ctx.db.insert("kpis", {
      channel: "Support",
      metric: "First response time",
      value: "5h 12m",
      delta: "-18%",
      period: "W/W",
    });

    await ctx.db.insert("approvals", {
      type: "Google Ads budget change",
      status: "pending",
      requesterId: hassounId,
      rationale: "Test new branded campaign structure",
      impact: "+$500/week",
      link: "https://ads.google.com",
    });

    await ctx.db.insert("supportQueue", {
      ticketId: "SUP-1042",
      status: "Open",
      priority: "High",
      sla: "2h",
      category: "Delivery delay",
    });

    await ctx.db.insert("b2bPipeline", {
      accountName: "GreenCart",
      stage: "Proposal",
      nextStep: "Send pricing sheet",
      ownerId: hassounId,
      health: "Good",
    });

    await ctx.db.insert("templates", {
      title: "Support: Late Delivery",
      type: "support_macro",
      content: "Thanks for reaching out — we’re looking into the delay and will update you within 24 hours.",
    });

    await ctx.db.insert("contentCalendar", {
      title: "TikTok: 3 steps to launch on Babanuj",
      platform: "TikTok",
      status: "Planned",
      publishDate: "2026-02-04",
      ownerId: naseemId,
      campaign: "Seller onboarding",
      hook: "Ready to launch your first product in 72 hours?",
      notes: "Keep under 35s, add on-screen checklist.",
    });

    await ctx.db.insert("contentCalendar", {
      title: "IG Reels: Behind the scenes fulfillment",
      platform: "Instagram",
      status: "Scheduled",
      publishDate: "2026-02-06",
      ownerId: hassounId,
      campaign: "Trust builders",
      hook: "Here’s what happens after you click checkout",
      notes: "Capture warehouse shots, end with CTA.",
    });

    await ctx.db.insert("knowledgeBase", {
      title: "Support escalation playbook",
      category: "Support",
      summary: "Escalate delivery delays after 48h; include order ID, tracking, and customer sentiment.",
      ownerId: aminaId,
      link: "https://docs.google.com/document/d/placeholder",
    });

    await ctx.db.insert("knowledgeBase", {
      title: "SEO technical audit checklist",
      category: "SEO",
      summary: "Run crawl, check indexation, CWV, and prioritize fixes by impact vs effort.",
      ownerId: naseemId,
      link: "https://docs.google.com/document/d/placeholder",
    });

    await ctx.db.insert("meetingNotes", {
      title: "B2B onboarding sync",
      meetingType: "B2B",
      summary: "Aligned on onboarding timeline for GreenCart. Need pricing sheet and launch checklist by Friday.",
      date: "2026-02-01",
      ownerId: hassounId,
      nextSteps: ["Send pricing sheet", "Draft launch checklist", "Confirm onboarding call"],
    });

    await ctx.db.insert("meetingNotes", {
      title: "Support weekly review",
      meetingType: "Support",
      summary: "Top issues: delivery delays, refund status. Update macros and add SLA alerts.",
      date: "2026-02-02",
      ownerId: aminaId,
      nextSteps: ["Refresh macros", "Define SLA alert triggers"],
    });

    await ctx.db.insert("standups", {
      date: "2026-02-02",
      summary: "Tasks: 2 total | Blocked: 0 | Approvals pending: 1 | Support open: 1 | Pipeline accounts: 1",
      statusBreakdown: "Assigned: 1 · In Progress: 1",
      blockers: [],
    });

    await ctx.db.insert("alerts", {
      type: "pending_approvals",
      severity: "medium",
      message: "1 approval pending review",
      createdAt: "2026-02-02T10:00:00.000Z",
    });

    await ctx.db.insert("policies", {
      key: "budget_change",
      description: "Any paid media budget change",
      requiresApproval: true,
    });

    await ctx.db.insert("policies", {
      key: "policy_sensitive",
      description: "Policy or compliance sensitive action",
      requiresApproval: true,
    });

    await ctx.db.insert("policies", {
      key: "content_publish",
      description: "Publish content to social platforms",
      requiresApproval: false,
    });

    await ctx.db.insert("auditLogs", {
      action: "create",
      entityType: "template",
      entityId: "seed-template-1",
      actorId: hassounId,
      rationale: "Initialize template library",
      expectedImpact: "Faster response times",
      measurementPlan: "Track first response time weekly",
      timestamp: "2026-02-02T11:00:00.000Z",
    });

    return { ok: true };
  },
});
