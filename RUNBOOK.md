# ClawsCrew Production Runbook

## Prerequisites
- Convex deployed and reachable
- `CONVEX_DEPLOYMENT` and `CONVEX_DEPLOY_KEY` available for connector/runtime commands
- OpenClaw installed and authenticated (`openclaw help`, `openclaw agent --help` work)

## 1) Seed workflow + baseline data
```bash
cd convex
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run workflowSeeds.js:seedWorkflows '{}'
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run seed.js:seedData '{}'
```

## 2) Create mission and complete intake
```bash
# create mission
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run missions.js:create '{"name":"SEO Department","objective":"Improve SEO","constraints":"No paid tools","toolsAllowed":["web_search"],"soul":"Be concise"}'

# complete intake gate (replace missionId)
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run orchestrator.js:completeMissionIntake '{"missionId":"<missionId>","answersMarkdown":"Objective: ..."}'
```

## 3) Start a workflow run
```bash
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run runs.js:start '{"missionId":"<missionId>","workflowKey":"feature-dev","title":"Feature Request"}'
```

## 4) Connector execution modes

### A) Dry (claim/release only)
```bash
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> node skill/bin/clawscrew connector --once --worker-id dry-worker
```

### B) Auto-pass test mode
```bash
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> node skill/bin/clawscrew connector --once --auto-pass --worker-id test-worker
```

### C) Real OpenClaw execution (isolated session per step)
```bash
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> node skill/bin/clawscrew connector --once --execute-openclaw --worker-id oc-worker
```

## 5) Install background connector service

### macOS LaunchAgent
```bash
node skill/bin/clawscrew connector-service --deploy-key '<deploy-key>' --worker-id connector-daemon --execute-openclaw
```

### Linux systemd unit (generator)
```bash
node skill/bin/clawscrew connector-service --deploy-key '<deploy-key>' --worker-id connector-daemon --execute-openclaw
# then follow printed systemctl commands
```

## 6) Health checks
```bash
# Connector status
cd convex
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run connector.js:status '{}'

# Smoke
CONVEX_DEPLOYMENT=<deployment> CONVEX_DEPLOY_KEY=<key> npx convex run health.js:smoke '{}'
```

## Notes
- Intake gate is enforced for scheduling/runs/waves: mission must be `intakeStatus=complete`.
- Legacy `waves.*` API is deprecated; use `workflowWaves.*`.
- Auto-wave loop is idempotent (`workflowWaves.startAuto`).
- In automation scripts, pass both `CONVEX_DEPLOYMENT` and `CONVEX_DEPLOY_KEY` explicitly to avoid environment mismatch.
