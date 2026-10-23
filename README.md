# Interview Prep: Lead Software Engineer (FinTech track)

A daily interview-prep web app for moving into **Lead Software Engineer** roles at product and
financial-services companies (Mastercard, Visa, Barclays, JP Morgan, Morgan Stanley and similar).

It turns a 12-week plan into a short to-do list each day, covering DSA, system design, and the
leadership/behavioral round.

## What's inside

| Page | What it does |
| --- | --- |
| **Today** | Your daily goal as a checklist: 2 new DSA problems, up to 4 spaced reviews, one system design topic, one leadership question (plus a mock on weekends). A goal meter fills as you go, with a small celebration when you finish. Includes a study-time log and journal. |
| **DSA** | ~155 LeetCode problems in 19 collapsible pattern sections (NeetCode-150 style plus LLD problems banks like to ask). ★ marks the core set. Hover a row to rate a solve *Shaky / OK / Nailed it*; the app schedules the next review. Filters, notes per problem, and `/` to search. |
| **System Design** | A 45-minute answer framework and 32 topics: fundamentals, building blocks, classic case studies and a **Fintech** set (payment system, card authorization network, double-entry ledger, fraud detection, cross-border transfer, matching engine, reconciliation, Open Banking). Each topic has a checklist and notes. |
| **Leadership** | STAR tips, a 30-question bank aimed at lead roles in banking/payments, and a STAR **story bank** linked to the questions each story answers. |
| **Companies** | Focus areas and tips per target company, your notes, and an application tracker. |
| **Mock** | Random coding, design or behavioral prompt with a timer and a self-assessment rubric. |
| **Roadmap** | The 12-week roadmap, plan start date, and backup export/import. |

On every page a **progress rail** shows problems left (by difficulty), reviews due and design topics done,
plus a **calendar** that marks each day as *goal hit*, *partial* or *skipped*, with your streak.

### The 12-week roadmap

| Week | DSA | System design |
| --- | --- | --- |
| 1 | Arrays & Hashing, Two Pointers | Scalability, estimation, CAP |
| 2 | Sliding Window, Stack | Databases, sharding, replication |
| 3 | Binary Search, Linked List | Caching, load balancers, queues/Kafka |
| 4 | Trees | Distributed transactions, reliability, microservices |
| 5 | Tries, Heaps | URL shortener, rate limiter, security |
| 6 | Backtracking, Graphs | Notifications, news feed, observability |
| 7 | Graphs, Advanced Graphs | **Payment system, ledger** |
| 8 | 1-D DP | **Card authorization, fraud detection** |
| 9 | 2-D DP | Chat, distributed cache, job scheduler |
| 10 | Greedy, Intervals | **Money transfer, reconciliation** |
| 11 | Math, Bits, LLD | **Trading engine, Open Banking**, file storage |
| 12 | Revision | Full mocks |

If you get ahead, the plan pulls from the remaining core problems and topics. After week 12 it keeps
going in revision mode, driven by the spaced-repetition queue.

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
data in this browser only. Use **Roadmap → Export backup** to move it around.

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
- `src/data/systemDesign.ts`: design topics and their checklists
- `src/data/behavioral.ts`: behavioral questions and STAR tips
- `src/data/companies.ts`: company focus areas and tips
- `src/lib/plan.ts`: the weekly roadmap, daily goal and calendar rules
- `amplify/`: backend definition (auth + data)

## Possible next steps

- Add Java/Spring deep-dive topics (JVM, GC, concurrency) as a fourth track; Morgan Stanley and JP Morgan probe these.
