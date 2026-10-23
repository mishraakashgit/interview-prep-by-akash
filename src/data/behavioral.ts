import type { BehavioralQuestion } from '../types';

const q = (id: string, theme: string, question: string): BehavioralQuestion => ({ id, theme, question });

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  // Leadership & people
  q('lead-1', 'Leadership', 'Tell me about a time you led a team through a difficult delivery.'),
  q('lead-2', 'Leadership', 'How do you mentor and grow engineers on your team? Give a specific example.'),
  q('lead-3', 'Leadership', 'Tell me about a time you had to deal with an under-performing team member.'),
  q('lead-4', 'Leadership', 'Describe how you onboard a new engineer onto a complex codebase.'),
  q('lead-5', 'Leadership', 'Tell me about a time you had to delegate something you would rather have done yourself.'),
  // Technical leadership
  q('tech-1', 'Technical Leadership', 'Describe the most complex system you have designed. What would you change now?'),
  q('tech-2', 'Technical Leadership', 'Tell me about a significant technical decision you made with incomplete information.'),
  q('tech-3', 'Technical Leadership', 'How did you handle technical debt while still delivering features?'),
  q('tech-4', 'Technical Leadership', 'Tell me about a time you introduced a new technology or practice to the team.'),
  q('tech-5', 'Technical Leadership', 'How do you run code reviews and set engineering standards?'),
  q('tech-6', 'Technical Leadership', 'Tell me about a production incident you owned. What was the root cause and what changed afterwards?'),
  // Conflict & influence
  q('conf-1', 'Conflict & Influence', 'Tell me about a time you disagreed with your manager or an architect.'),
  q('conf-2', 'Conflict & Influence', 'Describe a time two engineers on your team strongly disagreed on a design. How did you resolve it?'),
  q('conf-3', 'Conflict & Influence', 'How did you influence a team or stakeholder you had no authority over?'),
  q('conf-4', 'Conflict & Influence', 'Tell me about a time you pushed back on a product requirement.'),
  // Stakeholders & delivery
  q('del-1', 'Delivery & Stakeholders', 'Tell me about a project that was at risk of missing its deadline. What did you do?'),
  q('del-2', 'Delivery & Stakeholders', 'How do you explain a technical trade-off to non-technical stakeholders?'),
  q('del-3', 'Delivery & Stakeholders', 'How do you estimate and plan work for a team? How do you handle scope creep?'),
  q('del-4', 'Delivery & Stakeholders', 'Tell me about a time you had to manage competing priorities from multiple stakeholders.'),
  // Ownership & failure
  q('own-1', 'Ownership & Growth', 'Tell me about a failure and what you learned from it.'),
  q('own-2', 'Ownership & Growth', 'Tell me about a time you went beyond your role to solve a problem.'),
  q('own-3', 'Ownership & Growth', 'Describe a time you received critical feedback. How did you respond?'),
  q('own-4', 'Ownership & Growth', 'Tell me about a time you improved a process for the whole team.'),
  // Banking / payments context
  q('fin-1', 'Risk, Compliance & Quality', 'Tell me about a time you balanced speed of delivery with risk, security or compliance.'),
  q('fin-2', 'Risk, Compliance & Quality', 'How do you make sure a system that moves money is correct and auditable?'),
  q('fin-3', 'Risk, Compliance & Quality', 'Tell me about a time you found a security or data-quality issue. What did you do?'),
  // Motivation
  q('mot-1', 'Motivation', 'Walk me through your career so far. (Prepare a crisp 2-minute version.)'),
  q('mot-2', 'Motivation', 'Your title is Software Architect: why are you looking at Lead Engineer roles?'),
  q('mot-3', 'Motivation', 'Why this company? Why financial services / payments?'),
  q('mot-4', 'Motivation', 'Where do you see yourself in 3-5 years: deeper technical track or people management?'),
];

export const BEHAVIORAL_THEMES = [...new Set(BEHAVIORAL_QUESTIONS.map((x) => x.theme))];

export const STAR_TIPS = [
  'Situation + Task: 20% of the answer. Set context fast: team size, stakes, your role.',
  'Action: 60%. Say "I", not "we". Show decisions, trade-offs and how you brought people along.',
  'Result: 20%. Quantify (latency -40%, incidents halved, shipped 2 weeks early) and add what you learned.',
  'Prepare 8-10 strong stories; each one can usually answer 3-4 different questions.',
  'For lead roles, interviewers listen for scope: impact beyond your own code, multiplying the team.',
];
