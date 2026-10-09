// Condensed from the public resume. Impact-first; no internal system names beyond what the resume already says.
export interface Role {
  company: string;
  title: string;
  period: string;
  summary: string;
  bullets: string[];
  tech: string[];
  /** Optional grouped tech list (used for the latest role). */
  techGroups?: { label: string; items: string[] }[];
}

export const experience: Role[] = [
  {
    company: 'Verizon',
    title: 'Software Development Lead',
    period: 'Nov 2019 – Present',
    summary:
      'Owning technical and architectural direction for full-stack delivery across four platform initiatives (NSP, 5G Professional Setup, HNM, AN 360).',
    bullets: [
      'Owned a core module of AN 360 end to end: it ingests network events through a distributed pipeline, groups them, finds the root-cause event per cell site and opens one consolidated ticket per event family, cutting duplicate-ticket noise for operations teams.',
      'Built a high-volume ingestion pipeline (Flink, Kafka, Spring Boot) and later re-architected it to isolate ingestion from downstream processing for better fault tolerance.',
      'Introduced Caffeine in-memory caching (about 3x faster) and, after load testing, cut API response and SQL query time by roughly 50%.',
      'Built a supervisor agent with LangGraph that coordinates multiple sub-agents through Google’s agent-to-agent protocol.',
      'Designed a vendor-routing system (weighting, priority, order type) and an asynchronous task-orchestration platform with Prometheus, Grafana and OpenTelemetry, retries and automated failure recovery.',
      'Built a technician dashboard and mobile app for 5G field installs, with installs consistently completing in under 8 minutes.',
      'Moved delivery to containerized CI/CD on Kubernetes and OpenShift behind API gateways; run design reviews and mentor engineers.',
    ],
    tech: [],
    techGroups: [
      { label: 'Languages and frameworks', items: ['TypeScript', 'JavaScript', 'React', 'Angular', 'Node.js', 'Express', 'GraphQL', 'Java', 'Spring Boot (MVC)', 'Play Framework', 'Python', 'FastAPI', 'Tailwind CSS'] },
      { label: 'Messaging and distributed systems', items: ['Kafka', 'Apache Flink', 'Pulsar', 'RabbitMQ', 'gRPC', 'Microservices', 'Event-driven architecture', 'API gateways', 'REST APIs', 'Async and callback services'] },
      { label: 'Data and caching', items: ['PostgreSQL', 'Oracle SQL and PL', 'MongoDB', 'Redis', 'Caffeine'] },
      { label: 'Cloud and delivery', items: ['AWS', 'Serverless', 'Docker', 'Kubernetes', 'OpenShift', 'Podman', 'Linux', 'CI/CD', 'GitLab Runners', 'Git'] },
      { label: 'Observability and testing', items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Cypress', 'JUnit', 'Load testing'] },
      { label: 'Workflow orchestration', items: ['Prefect', 'Netflix Conductor', 'Custom Node.js orchestrator'] },
      { label: 'Agentic AI', items: ['LangGraph', 'LangChain', 'Google A2A', 'Claude', 'Claude Code', 'Gemini', 'GPT', 'Llama', 'GitHub Copilot'] },
      { label: 'Also from my personal projects', items: ['RAG', 'MCP', 'Hybrid search (pgvector + full-text)', 'Claude Haiku', 'fastembed', 'Guardrails and output verification', 'DynamoDB', 'Lambda', 'API Gateway', 'SNS', 'SQS', 'SES', 'RDS'] },
    ],
  },
  {
    company: 'Caterpillar',
    title: 'Software Developer',
    period: 'May 2019 – Nov 2019',
    summary: 'Rebuilt a legacy machinery-stats dashboard as a modern full-stack app.',
    bullets: [
      'Migrated a legacy PHP dashboard to React, Node.js, Express and MS SQL, aligned with updated design patterns and UX standards.',
      'Wrote Cypress end-to-end coverage as part of CI/CD and code review.',
      'Ran regular design-review calls with stakeholders and tuned both API and frontend performance.',
    ],
    tech: ['React', 'Node.js', 'Express', 'MS SQL', 'Cypress'],
  },
  {
    company: 'Centinal Spark Technologies',
    title: 'Software Developer Intern',
    period: 'Mar 2016 – Mar 2017',
    summary: 'Frontend engineer on a truck-management platform.',
    bullets: [
      'Rebuilt a legacy HTML application as a React interface for tracking trucks, trips, pricing and load assignments.',
    ],
    tech: ['React', 'JavaScript', 'HTML', 'CSS', 'Bootstrap'],
  },
];

export const skills: { area: string; items: string[] }[] = [
  { area: 'Agentic AI', items: ['LangGraph', 'LangChain', 'MCP', 'Google A2A', 'RAG'] },
  { area: 'Distributed systems', items: ['Kafka', 'Flink', 'Pulsar', 'RabbitMQ', 'Redis'] },
  { area: 'Full-stack', items: ['TypeScript', 'React', 'Angular', 'Node/Express', 'GraphQL', 'Spring Boot', 'FastAPI'] },
  { area: 'Cloud and delivery', items: ['AWS', 'Docker', 'Kubernetes', 'OpenShift', 'CI/CD'] },
  { area: 'Observability', items: ['Prometheus', 'Grafana', 'OpenTelemetry'] },
];
