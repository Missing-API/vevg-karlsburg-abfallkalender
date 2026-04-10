# Fetch Vercel Deployment (Build) Logs

Fetch build/deployment logs from Vercel for the linked project `vevg-karlsburg-abfallkalender`.

## Prerequisites

- `vercel` CLI installed and authenticated
- Project linked via `vercel link` (`.vercel/project.json` exists)
- `gh` CLI installed and authenticated (for PR-based lookup)

## Workflow

### 1. Determine which deployment to inspect

Ask the user which deployment they want logs for. Options:

- **Latest production** deployment
- **A specific branch** (e.g. a feature branch / PR preview)
- **A specific commit SHA**
- **A specific PR number**

### 2. Find the deployment

#### Option A: Latest production deployment

```sh
vercel ls --format json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for d in data['deployments']:
    if d.get('target') == 'production':
        print(json.dumps({'url': d['url'], 'state': d['state'], 'branch': d['meta'].get('githubCommitRef',''), 'commit': d['meta'].get('githubCommitSha','')[:8], 'message': d['meta'].get('githubCommitMessage','')}, indent=2))
        break
"
```

#### Option B: By branch name

```sh
BRANCH="<branch-name>"
vercel ls --format json | python3 -c "
import sys, json
branch = '$BRANCH'
data = json.load(sys.stdin)
matches = [d for d in data['deployments'] if d['meta'].get('githubCommitRef') == branch]
for d in matches[:3]:
    print(json.dumps({'url': d['url'], 'state': d['state'], 'branch': d['meta'].get('githubCommitRef',''), 'commit': d['meta'].get('githubCommitSha','')[:8], 'message': d['meta'].get('githubCommitMessage',''), 'created': d['createdAt']}, indent=2))
    print('---')
"
```

#### Option C: By PR number (use gh to find branch, then match)

```sh
PR_NUMBER="<pr-number>"
BRANCH=$(gh pr view "$PR_NUMBER" --json headRefName -q '.headRefName')
echo "PR #$PR_NUMBER is on branch: $BRANCH"
# Then use Option B with that branch name
```

#### Option D: By commit SHA

```sh
SHA="<commit-sha>"
vercel ls --format json | python3 -c "
import sys, json
sha = '$SHA'
data = json.load(sys.stdin)
matches = [d for d in data['deployments'] if d['meta'].get('githubCommitSha','').startswith(sha)]
for d in matches[:3]:
    print(json.dumps({'url': d['url'], 'state': d['state'], 'branch': d['meta'].get('githubCommitRef',''), 'commit': d['meta'].get('githubCommitSha','')[:8], 'message': d['meta'].get('githubCommitMessage','')}, indent=2))
    print('---')
"
```

### 3. Fetch build logs

Once you have the deployment URL:

```sh
vercel inspect <deployment-url> --logs
```

For ERROR state deployments this is especially useful to see what went wrong during the build.

### 4. Present results

- Show the deployment metadata (branch, commit, state, message) first
- Then show the build logs
- Highlight any errors or warnings in the output
- If the deployment state is ERROR, focus on identifying the root cause

## Notes

- The `target` field is `"production"` for production deployments and `null` for preview/branch deployments
- The `state` field can be: `READY`, `ERROR`, `BUILDING`, `QUEUED`, `CANCELED`
- Build logs are only available after a deployment has finished building
- Use `vercel inspect <url> --wait --logs` if the deployment is still building
