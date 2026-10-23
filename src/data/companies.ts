import type { CompanyInfo } from '../types';

// Based on commonly reported candidate experiences. Processes vary by team,
// location and level, so confirm the exact rounds with your recruiter.
export const COMPANIES: CompanyInfo[] = [
  {
    id: 'mastercard',
    name: 'Mastercard',
    focus: [
      'DSA: medium-level problems (arrays, strings, hashing, trees)',
      'Java / Spring Boot and microservices depth',
      'System design with a payments flavour: authorization, tokenization, high availability',
      'Behavioral aligned to company values ("Decency Quotient")',
    ],
    tips: [
      'Know the card payment flow end to end (cardholder, merchant, acquirer, network, issuer).',
      'Be ready to discuss security: PCI DSS, encryption, tokenization.',
      'Lead roles: expect questions on mentoring, agile delivery and stakeholder management.',
    ],
  },
  {
    id: 'visa',
    name: 'Visa',
    focus: [
      'Online coding assessment followed by DSA rounds (medium, occasionally hard)',
      'System design: very high throughput, low latency, availability',
      'Core CS: concurrency, OS and networking basics',
      'Behavioral and leadership round with hiring manager',
    ],
    tips: [
      'Practise designing for scale numbers that are huge (tens of thousands of TPS at peak).',
      'Prepare a deep dive on a system you built: trade-offs, metrics, failures.',
      'Concurrency questions (thread safety, locks, executors) are commonly reported.',
    ],
  },
  {
    id: 'barclays',
    name: 'Barclays',
    focus: [
      'Online test (coding plus aptitude / MCQ) is common',
      'DSA: easy to medium problems',
      'Java, Spring, SQL, microservices, cloud basics',
      'Values-based behavioral round (Respect, Integrity, Service, Excellence, Stewardship)',
    ],
    tips: [
      'Map STAR stories to the RISES values.',
      'Expect practical questions on SQL, REST design and production support.',
      'Lead roles: agile ceremonies, team leadership and risk awareness.',
    ],
  },
  {
    id: 'jpmorgan',
    name: 'JP Morgan Chase',
    focus: [
      'Coding assessment (often HackerRank) plus a recorded behavioral/video round for some roles',
      'DSA: medium problems; clean, well-tested code matters',
      'System design and low-level/object-oriented design',
      'Behavioral based on the firm\'s business principles',
    ],
    tips: [
      'Practise LLD problems (parking lot, rate limiter, cache) with clean OOP and SOLID.',
      'Know Java collections and concurrency internals well.',
      'Have strong stories on ownership, client focus and operational excellence.',
    ],
  },
  {
    id: 'morgan-stanley',
    name: 'Morgan Stanley',
    focus: [
      'DSA: medium, sometimes hard; strong focus on fundamentals',
      'Java deep dive: JVM, garbage collection, multithreading, collections internals',
      'System design and design patterns',
      'Behavioral and team-fit rounds; several interviews is common',
    ],
    tips: [
      'Revise core Java internals: HashMap, ConcurrentHashMap, memory model, GC.',
      'Be precise about complexity analysis and edge cases.',
      'Expect probing follow-ups on projects listed on your CV.',
    ],
  },
];
