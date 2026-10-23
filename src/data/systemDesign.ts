import type { SdTopic } from '../types';

export const SD_FRAMEWORK = [
  { step: 'Clarify requirements (3-5 min)', detail: 'Functional scope, users, out-of-scope items. Ask, don\'t assume.' },
  { step: 'Non-functional requirements', detail: 'Scale (DAU, QPS, data size), latency, availability vs consistency, compliance (PCI DSS, GDPR, data residency).' },
  { step: 'Back-of-envelope estimates', detail: 'QPS (avg and peak), storage per year, bandwidth. Round aggressively; state assumptions.' },
  { step: 'API & data model', detail: 'Core endpoints with idempotency keys where money moves; entities, keys, access patterns.' },
  { step: 'High-level design', detail: 'Clients → edge/gateway → services → data stores → async pipeline. Draw it, narrate the request path.' },
  { step: 'Deep dives (the lead signal)', detail: 'Pick 2-3 bottlenecks: hot partitions, consistency, failure handling, exactly-once effects. Drive this yourself.' },
  { step: 'Trade-offs & evolution', detail: 'What you chose and why, what breaks at 10x, observability, rollout, cost, team ownership boundaries.' },
];

const t = (id: string, title: string, category: SdTopic['category'], keyPoints: string[]): SdTopic => ({
  id,
  title,
  category,
  keyPoints,
});

export const SD_TOPICS: SdTopic[] = [
  // Fundamentals
  t('scalability', 'Scalability: vertical vs horizontal, stateless services', 'Fundamentals', [
    'Why stateless app tiers scale horizontally; where session state goes',
    'Scale-up vs scale-out cost and limits',
    'Read replicas vs sharding: what each solves',
    'Auto-scaling signals (CPU, queue depth, latency)',
  ]),
  t('cap', 'CAP, PACELC & consistency models', 'Fundamentals', [
    'CAP in partition terms, not "pick two"',
    'PACELC: latency vs consistency when there is no partition',
    'Strong, sequential, causal, read-your-writes, eventual',
    'Which parts of a payments system need strong consistency (balances) vs eventual (analytics)',
  ]),
  t('latency-numbers', 'Latency numbers & capacity estimation', 'Fundamentals', [
    'Memory vs SSD vs network vs cross-region latency orders of magnitude',
    'QPS from DAU: DAU × actions / 86,400 × peak factor',
    'Storage growth per year with replication factor',
    'Know powers of two: 2^10 ≈ 1K, 2^20 ≈ 1M, 2^30 ≈ 1B',
  ]),
  t('databases', 'SQL vs NoSQL & choosing a datastore', 'Fundamentals', [
    'ACID and isolation levels (read committed, repeatable read, serializable)',
    'Key-value, document, wide-column, graph: access-pattern fit',
    'Indexes: B-tree vs LSM, write vs read amplification',
    'Why banks still default to relational for ledgers',
  ]),
  t('sharding', 'Partitioning, sharding & consistent hashing', 'Fundamentals', [
    'Range vs hash partitioning; choosing a shard key',
    'Hot partitions and how to detect/mitigate them',
    'Consistent hashing with virtual nodes',
    'Resharding and cross-shard queries/transactions',
  ]),
  t('replication', 'Replication & consensus', 'Fundamentals', [
    'Leader-follower, multi-leader, leaderless (quorum R + W > N)',
    'Replication lag and its user-visible effects',
    'Raft/Paxos at a whiteboard level: leader election, log replication',
    'Failover and split brain; fencing tokens',
  ]),
  t('distributed-txn', 'Distributed transactions: 2PC, Saga, Outbox', 'Fundamentals', [
    'Why 2PC blocks and when it is still acceptable',
    'Saga: orchestration vs choreography, compensating actions',
    'Transactional outbox + CDC to publish events reliably',
    'Idempotent consumers and exactly-once effects',
  ]),
  t('reliability', 'Reliability patterns & resilience', 'Fundamentals', [
    'Timeouts, retries with exponential backoff + jitter',
    'Circuit breakers, bulkheads, load shedding',
    'Graceful degradation and fallbacks',
    'SLI / SLO / error budgets; RTO and RPO',
  ]),
  t('security', 'Security for financial systems', 'Fundamentals', [
    'AuthN vs AuthZ; OAuth2 / OIDC flows; mTLS between services',
    'Encryption in transit and at rest; KMS/HSM and key rotation',
    'PCI DSS scope reduction via tokenization',
    'Secrets management, audit logging, least privilege',
  ]),
  t('observability', 'Observability', 'Fundamentals', [
    'Metrics, logs, traces: what each is for',
    'RED / USE methods; golden signals',
    'Distributed tracing and correlation IDs',
    'Alerting on SLOs rather than symptoms',
  ]),

  // Building blocks
  t('load-balancer', 'Load balancers & API gateway', 'Building Blocks', [
    'L4 vs L7; algorithms (round robin, least conn, consistent hash)',
    'Health checks and connection draining',
    'Gateway concerns: auth, rate limiting, routing, request shaping',
  ]),
  t('caching', 'Caching strategies', 'Building Blocks', [
    'Cache-aside, read-through, write-through, write-behind',
    'Eviction (LRU/LFU) and TTL choice',
    'Cache stampede / thundering herd mitigation',
    'Invalidation and consistency with the source of truth',
  ]),
  t('message-queues', 'Message queues & event streaming (Kafka)', 'Building Blocks', [
    'Queue vs log; Kafka partitions, consumer groups, offsets',
    'Ordering guarantees per partition key',
    'At-most / at-least / exactly-once semantics',
    'Dead-letter queues, retries, poison messages, back-pressure',
  ]),
  t('cdn-storage', 'CDN & object storage', 'Building Blocks', [
    'Push vs pull CDN; cache keys and invalidation',
    'Blob storage for large files; pre-signed URLs',
    'Multipart upload and lifecycle policies',
  ]),
  t('search', 'Search & indexing', 'Building Blocks', [
    'Inverted index basics',
    'Keeping a search index in sync (CDC / dual write pitfalls)',
    'Ranking, typeahead with tries / prefix indexes',
  ]),
  t('microservices', 'Microservices vs modular monolith', 'Building Blocks', [
    'Service boundaries from domain (DDD bounded contexts)',
    'Sync (REST/gRPC) vs async communication trade-offs',
    'Data ownership: database per service',
    'Strangler-fig migration from a monolith; team topology (Conway\'s law)',
  ]),

  // Classic case studies
  t('url-shortener', 'Design a URL shortener', 'Case Study', [
    'ID generation: base62 counter vs hash vs pre-generated keys',
    'Read-heavy: caching and redirect latency',
    'Analytics pipeline off the hot path',
  ]),
  t('rate-limiter', 'Design a distributed rate limiter', 'Case Study', [
    'Token bucket, leaky bucket, fixed vs sliding window',
    'Centralized counter (Redis + Lua) vs local + sync',
    'Per-user, per-API-key, per-merchant limits; response headers',
    'Fail-open vs fail-closed decision',
  ]),
  t('notification', 'Design a notification system', 'Case Study', [
    'Fan-out across email/SMS/push providers',
    'User preferences, templates, de-duplication',
    'Retries, provider failover, delivery tracking',
  ]),
  t('chat', 'Design a chat / messaging system', 'Case Study', [
    'WebSockets and connection management at scale',
    'Message ordering and delivery receipts',
    'Storage for message history; presence service',
  ]),
  t('news-feed', 'Design a news feed', 'Case Study', [
    'Fan-out on write vs read; hybrid for celebrities',
    'Feed ranking and pagination (cursor based)',
    'Caching timelines',
  ]),
  t('distributed-cache', 'Design a distributed key-value store / cache', 'Case Study', [
    'Partitioning with consistent hashing',
    'Replication, quorum, hinted handoff, read repair',
    'Conflict resolution: LWW vs vector clocks',
  ]),
  t('job-scheduler', 'Design a distributed job scheduler', 'Case Study', [
    'Storing jobs; polling vs time-wheel',
    'Leases so each job runs once; handling worker death',
    'Retries, priorities, idempotent jobs',
  ]),
  t('file-storage', 'Design file storage (Dropbox / Google Drive)', 'Case Study', [
    'Chunking, dedup, delta sync',
    'Metadata service vs block storage',
    'Conflict handling across devices',
  ]),

  // Fintech-focused: high value for Visa, Mastercard and investment banks
  t('payment-system', 'Design a payment system (Stripe / PayPal-like)', 'Fintech', [
    'Payment lifecycle: initiate, authorize, capture, settle, refund',
    'Idempotency keys end-to-end; retries never double-charge',
    'Payment service vs PSP integration; webhooks and their reliability',
    'Reconciliation with PSP/bank files; handling mismatches',
    'State machine for payment status; audit trail',
  ]),
  t('card-authorization', 'Design a card authorization network (Visa / Mastercard)', 'Fintech', [
    'Flow: merchant → acquirer → network → issuer and back; ISO 8583 at a high level',
    'Sub-second latency budget and very high availability (active-active)',
    'Stand-in processing when an issuer is down',
    'Tokenization (network tokens) and PCI scope',
    'Clearing and settlement as a separate batch flow',
  ]),
  t('ledger', 'Design a double-entry ledger / wallet', 'Fintech', [
    'Double-entry: every transaction balances to zero',
    'Immutable append-only entries; balances as derived/materialized state',
    'Concurrency on hot accounts: row locks, optimistic versioning, sharded sub-accounts',
    'Exactly-once posting and idempotency',
    'Reporting, audits and point-in-time balances',
  ]),
  t('fraud-detection', 'Design a real-time fraud detection system', 'Fintech', [
    'Rules engine + ML scoring within the auth latency budget',
    'Feature store: real-time (velocity counters) vs batch features',
    'Streaming pipeline (Kafka/Flink) and feedback loop from chargebacks',
    'Explainability and false-positive trade-offs',
  ]),
  t('money-transfer', 'Design a cross-border money transfer (P2P) system', 'Fintech', [
    'FX quote locking and expiry',
    'Saga across debit, FX and credit with compensations',
    'Compliance checks: KYC/AML, sanctions screening',
    'Regulatory data residency',
  ]),
  t('trading', 'Design a stock exchange / order matching engine', 'Fintech', [
    'Order book data structure (price-time priority)',
    'Single-threaded matching per instrument for determinism; sequencer',
    'Low-latency messaging; event sourcing for replay',
    'Market data fan-out',
  ]),
  t('reconciliation', 'Design a batch reconciliation / settlement system', 'Fintech', [
    'Ingest large files (SFTP/S3); schema validation',
    'Matching algorithms and break management',
    'Idempotent, restartable batch jobs; checkpoints',
    'End-of-day cut-offs and time zones',
  ]),
  t('api-gateway-bank', 'Design an Open Banking API platform', 'Fintech', [
    'OAuth2 consent flows, scopes, token lifetimes',
    'Per-TPP rate limiting and quotas',
    'Versioning, backward compatibility, developer portal',
    'Audit logging and regulatory reporting',
  ]),
];

export const SD_CATEGORIES: SdTopic['category'][] = ['Fundamentals', 'Building Blocks', 'Case Study', 'Fintech'];
