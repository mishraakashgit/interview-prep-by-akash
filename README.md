# pillsdev: DSA tracker

A self-paced DSA practice tracker: about 155 LeetCode problems grouped by pattern, with a review queue
that brings back anything you didn't nail.

## How it works

- **Problems:** ~155 problems in 19 collapsible pattern sections (NeetCode-150 style plus LLD problems
  banks like to ask). ★ marks the core set. Filters, notes per problem, and `/` to search.
- **Rate every attempt:** *Shaky* or *OK* brings the problem back for review **7 days later**;
  *Nailed it* means it's digested. A booster rated Shaky or OK again waits another 7 days.
- **Booster doses due:** problems that are due appear at the top of the page until you rate them again.
- **Progress rail:** problems left (overall and by difficulty), reviews due now and later, and a
  calendar shaded by how many problems you attempted each day, with your streak.
- **No daily goals:** practise whenever you like.
- **Reset:** the ⋯ / avatar menu has *Reset all progress*; it downloads a backup first, so an import undoes it.
- **Motion:** smooth scrolling (Lenis), a 3D brand pill beside the title that spins when you rate a
  problem, and floating 3D pills behind the login screen (Three.js). The 3D code is fetched only on
  desktop-class devices once the page is idle, and never with data saver or "reduce motion" on;
  phones get the SVG logo.

## Accounts, sync and storage

With the Amplify backend deployed, the app is **invite-only**: you and a few friends each sign in with
**email + password** (Amazon Cognito). Everyone's progress is private to their own account, and is saved to your account, so it follows you across laptop and phone.

How it works, and why it is light on the browser:

- All progress is one small JSON document (typically 10-50 KB, even after months of use).
- It is cached in `localStorage` (browsers allow ~5 MB per site), so the app loads instantly and keeps working if the network drops.
- Changes are **debounced**: a burst of clicks becomes a single save ~1.5 s later, and pending changes are flushed when you close the tab.
- In the cloud it's one DynamoDB item per user (owner-only access), well inside the AWS free tier.
- The top bar shows sync status; hover it to see when your last change was made and synced.
- On sign-in, the newer copy wins: the cloud copy, unless this browser has unsynced newer changes. Progress you made before creating an account is carried over on first sign-in.

Without the backend (for example `npm run dev` locally), the app runs in **local-only** mode: no login,
data in this browser only. Use the **⋯ menu → Export backup** (top right) to move it around.

## Run locally

Requires Node 20.19+ or 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for plan, spaced repetition, data integrity
npm run build      # production build into dist/
```

## Deploy to AWS Amplify (Gen 2: hosting + auth + data)

The repo contains `amplify.yml` and an `amplify/` backend (Cognito auth + a `Progress` data model).
Each build deploys the backend for that branch, writes `amplify_outputs.json`, runs the tests and builds the site.

**New Amplify app**

1. AWS console → **AWS Amplify** → **Create new app** → **GitHub** → pick this repo and branch (`main`).
2. Amplify detects the Gen 2 backend. Click **Save and deploy**. The first deploy takes ~5-10 minutes.
3. Create your account (and one per friend), see **Adding users** below.

**Already deployed the earlier (hosting-only) version?**

Backend deploys need a service role. In the app: **App settings → IAM roles → Service role → Create new role**,
attach the managed policy **AmplifyBackendDeployFullAccess**, select the role, then **Redeploy** the branch.

Notes:

- The app uses hash URLs (`/#/dsa`), so no SPA rewrite rules are needed.
- The build selects Node 22 via `nvm`. If the build image complains, set
  **Build settings → Build image settings → Live package updates → Node.js version = 22**.
- Cognito's built-in email sender has a low daily limit, which is plenty for a handful of users.

**Adding users (you and your friends)**

Self sign-up is disabled in the backend, so nobody can register on their own. To add someone:

1. AWS console → **Amazon Cognito** → **User pools** → the pool named `amplifyAuthUserPool…`.
2. **Users** → **Create user**.
3. Choose **Send an email invitation**, enter their email, tick **Mark email address as verified**, and let
   Cognito **generate a password**. Click **Create user**.
4. They get an email with a temporary password. On first sign-in the app asks them to set their own.

To remove someone, select them under **Users** and **Delete** (or **Disable** to pause access).
Each person's progress is a separate record that only they can read.

**Local development with your own cloud sandbox (optional)**

```bash
npx ampx sandbox   # needs AWS credentials; deploys a personal backend and writes amplify_outputs.json
npm run dev
```

## Cost (you + a few friends)

| Service | What it's used for | Expected cost |
| --- | --- | --- |
| Cognito | Login | $0. Always free up to 10,000 monthly active users |
| DynamoDB | One progress record per person | $0. Provisioned at 5 RCU / 5 WCU, inside the always-free 25/25 |
| Amplify Hosting | Builds + serving the site | $0 within 1,000 build min, 5 GB stored, 15 GB served per month (each build is a few minutes) |
| AppSync | The API between app and DB | A few thousand requests per person a month at ~$4 per million: about $0.05 for three people |
| CloudWatch / S3 / Lambda | Logs and deployment plumbing | Cents at most |

Accounts created after 15 July 2025 start with $100-200 of credits that cover all of this. The **Free plan
account closes after 6 months** (or when credits run out), so upgrade to the Paid plan before then; the
always-free allowances keep applying. Set an **AWS Budgets** alert at $1 so nothing surprises you.

## Customising content

All content lives in plain TypeScript files, so it's easy to add to:

- `src/data/dsa.ts`: patterns and problems (`[slug, title, difficulty, core?]`; slug is the LeetCode URL slug)
- `src/lib/spacedRepetition.ts`: the review rule (`REVIEW_AFTER_DAYS`)
- `amplify/`: backend definition (auth + data)
