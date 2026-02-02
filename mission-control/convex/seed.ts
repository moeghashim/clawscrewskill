import { mutation } from "./_generated/server";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const hassounId = await ctx.db.insert("agents", {
      name: "Hassoun",
      role: "Master Orchestrator",
      status: "active",
      sessionKey: "agent:main:main",
      focus: "Daily execution + approvals",
      workload: 3,
    });

    const naseemId = await ctx.db.insert("agents", {
      name: "Naseem",
      role: "SEO Master",
      status: "active",
      sessionKey: "agent:seo:main",
      focus: "Technical SEO backlog",
      workload: 2,
    });

    const aminaId = await ctx.db.insert("agents", {
      name: "Amina",
      role: "Customer Support Agent",
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

    return { ok: true };
  },
});
