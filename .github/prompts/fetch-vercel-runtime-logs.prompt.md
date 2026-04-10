# Fetch Vercel Runtime Logs

Fetch runtime (request/function) logs from Vercel for the linked project `vevg-karlsburg-abfallkalender`.

## Prerequisites

- `vercel` CLI installed and authenticated
- Project linked via `vercel link` (`.vercel/project.json` exists)
- `gh` CLI installed and authenticated (for PR-based lookup)

## Workflow

### 1. Determine scope

Ask the user what runtime logs they need. Options:

- **Production runtime logs** (latest or time-windowed)
- **Preview/branch deployment runtime logs**
- **A specific PR's deployment runtime logs**
- **Filtered by error level or status code**

### 2. Fetch runtime logs

#### Option A: Production runtime logs (recent)

```sh
vercel logs --environment production --limit 100
```

With time window:

```sh
vercel logs --environment production --since 1h
vercel logs --environment production --since 2026-04-09T00:00:00Z --until 2026-04-10T00:00:00Z
```

#### Option B: By branch name (preview deployments)

```sh
vercel logs --branch <branch-name> --limit 100
```

Or first find the deployment URL, then scope to it:

```sh
BRANCH="<branch-name>"
DEPLOYMENT_URL=$(vercel ls --format json | python3 -c "
import sys, json
branch = '$BRANCH'
data = json.load(sys.stdin)
matches = [d for d in data['deployments'] if d['meta'].get('githubCommitRef') == branch and d['state'] == 'READY']
if matches: print(matches[0]['url'])
")
echo "Deployment: $DEPLOYMENT_URL"
vercel logs --deployment "$DEPLOYMENT_URL" --no-follow --limit 100
```

#### Option C: By PR number

```sh
PR_NUMBER="<pr-number>"
BRANCH=$(gh pr view "$PR_NUMBER" --json headRefName -q '.headRefName')
echo "PR #$PR_NUMBER is on branch: $BRANCH"
vercel logs --branch "$BRANCH" --limit 100
```

#### Option D: By specific deployment ID/URL

```sh
vercel logs <deployment-url> --no-follow --limit 100
```

### 3. Filtering options

Combine any of the above with these filters:

```sh
# Only errors
vercel logs --environment production --level error

# Specific HTTP status codes
vercel logs --environment production --status-code 500
vercel logs --environment production --status-code 4xx

# Full-text search
vercel logs --environment production --query "fetchIcsFeed"

# Advanced search syntax
vercel logs --environment production --search "status:500 error"

# By source type (serverless, edge-function, edge-middleware, static)
vercel logs --environment production --source serverless

# Expand to see full log messages
vercel logs --environment production --expand --limit 50
```

### 4. JSON output for processing

For piping to other tools or detailed analysis:

```sh
vercel logs --environment production --json --limit 100 | python3 -c "
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    entry = json.loads(line)
    print(f\"{entry.get('timestamp','')} [{entry.get('level','info')}] {entry.get('message','')}\")
"
```

### 5. Live streaming

For watching logs in real-time:

```sh
# Stream production logs
vercel logs --environment production --follow

# Stream a specific deployment
vercel logs <deployment-url> --follow
```

Note: Use `--follow` in async/background terminal mode since it streams indefinitely.

### 6. Present results

- Show which deployment/environment the logs are from
- Summarize error patterns if present (count of 5xx, 4xx, etc.)
- Highlight any repeated errors or timeouts
- For this project specifically, watch for:
  - Fetch failures to `vevg-karlsburg.de` (upstream VEVG site)
  - Cache misses / cache errors
  - ICS feed parsing errors
  - Timeout errors (routes have `maxDuration` of 30s or 300s)

## Notes

- `vercel logs` shows **runtime request logs** (HTTP requests hitting the deployment)
- `vercel inspect --logs` shows **build logs** (use the deployment logs skill for that)
- The `--follow` flag is implicit when a deployment URL/ID is given; use `--no-follow` to disable
- Log legend: λ = serverless function, ε = edge/middleware, ◇ = static/external
- Production logs require the deployment to be in `READY` state
- Preview deployments may have limited log retention
