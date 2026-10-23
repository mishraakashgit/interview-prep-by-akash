# Interview Prep: Lead Software Engineer (FinTech track)

A daily interview-prep web app for moving into **Lead Software Engineer** roles at product and
financial-services companies (Mastercard, Visa, Barclays, JP Morgan, Morgan Stanley and similar).

It turns a 12-week plan into a short to-do list each day, covering DSA, system design, and the
leadership/behavioral round.

## What's inside

| Page | What it does |
| --- | --- |
| **Today** | Your plan for the day: 2 new DSA problems, reviews that are due, one system design topic, one leadership question, a study-time log and journal. Weekends switch to mock-interview days. Shows your streak and overall progress. |
| **DSA** | ~155 LeetCode problems grouped into 19 patterns (NeetCode-150 style plus LLD/design problems that banks like to ask). ★ marks the core set. Rate every solve as *Shaky / OK / Nailed it* and the app schedules the next review (spaced repetition). Per-problem notes. |
| **System Design** | A 45-minute answer framework and 32 topics: fundamentals, building blocks, classic case studies and a **Fintech** set (payment system, card authorization network, double-entry ledger, fraud detection, cross-border transfer, matching engine, reconciliation, Open Banking). Each topic has a checklist of what a strong answer covers, plus your notes. |
| **Leadership & Behavioral** | STAR tips, a 30-question bank aimed at lead roles in banking/payments, and a STAR **story bank** where you link each story to the questions it answers, so you can see the gaps. |
| **Companies** | Focus areas and tips per target company, your own notes, and an application tracker (stage, notes). |
| **Mock Interview** | Random coding, design or behavioral prompt with a countdown timer and a self-assessment rubric. |
| **Roadmap & Data** | The 12-week roadmap, plan start date, and backup export/import. |

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

## Your data

Everything is stored in your browser's `localStorage`; there is no backend and no login.
Use **Roadmap & Data → Export backup** regularly (and to move between laptop and phone).
Clearing browser data erases progress unless you have a backup.

## Run locally

Requires Node 20.19+ or 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for plan, spaced repetition, data integrity
npm run build      # production build into dist/
```

## Deploy to AWS Amplify Hosting

The repo already contains `amplify.yml`, so no build settings need to be typed in.

1. Push this repo to GitHub (already done if you are reading this there).
2. Open the AWS console → **AWS Amplify** → **Create new app** → **GitHub**.
3. Authorize Amplify, pick `interview-prep-by-akash` and the branch to deploy (e.g. `main`).
4. Amplify detects `amplify.yml`. Accept the defaults and click **Save and deploy**.
5. In a few minutes you get a URL like `https://main.xxxxxx.amplifyapp.com`. Every push to that branch
   redeploys automatically.

Notes:

- The build runs `npm test` before `npm run build`, so a broken change never gets deployed.
- The app uses hash-based URLs (`/#/dsa`), so **no SPA rewrite rules are needed**.
- The build selects Node 22 via `nvm`. If your Amplify build image ever complains, set
  **App settings → Build settings → Build image settings → Live package updates → Node.js version = 22**.
- Optional: add a custom domain under **Hosting → Custom domains**, and restrict access with
  **Hosting → Access control** (basic auth) if you want the site private.

## Customising content

All content lives in plain TypeScript files, so it's easy to add to:

- `src/data/dsa.ts`: patterns and problems (`[slug, title, difficulty, core?]`; slug is the LeetCode URL slug)
- `src/data/systemDesign.ts`: design topics and their checklists
- `src/data/behavioral.ts`: behavioral questions and STAR tips
- `src/data/companies.ts`: company focus areas and tips
- `src/lib/plan.ts`: the weekly roadmap and daily plan rules

## Possible next steps

- Sync progress across devices with an Amplify Gen 2 backend (Cognito auth + DynamoDB) instead of export/import.
- Add Java/Spring deep-dive topics (JVM, GC, concurrency) as a fourth track; Morgan Stanley and JP Morgan probe these.
