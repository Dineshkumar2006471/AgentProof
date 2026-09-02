export type Guide = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  updatedAt: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const guides: Guide[] = [
  {
    slug: "ai-agent-verification",
    title: "AI Agent Verification",
    description: "A practical guide to verifying whether a deployed AI agent keeps its operational promises.",
    keyword: "AI agent verification",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "Define the promise", paragraphs: ["Start with an explicit contract: the jobs an agent can perform, the actions it must refuse, and the evidence required before it can claim a state change.", "A useful contract turns vague requirements such as safe support into testable behavior such as refusing credentials, escalating unsupported account changes, and avoiding unverified refund claims."] },
      { heading: "Test a live endpoint", paragraphs: ["Verification must reach the same public HTTPS endpoint used by the deployed agent. AgentProof sends scenario inputs, records bounded response evidence, and evaluates happy, boundary, edge, and adversarial behavior."] },
      { heading: "Share the outcome", paragraphs: ["A reliability score is only useful when the underlying findings are inspectable. Private reports retain full evidence for the owner, while a public report can communicate an unexpired verified result without exposing credentials or account data."] }
    ]
  },
  {
    slug: "executable-ai-agent-contracts",
    title: "Executable AI Agent Contracts",
    description: "How to turn an AI agent specification into an executable contract and a reliable test matrix.",
    keyword: "executable AI agent contracts",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "Write observable behavior", paragraphs: ["A contract should describe behavior that an evaluator can observe from an endpoint response or a declared tool action. State what the agent can do, what it must never do, and what success looks like."] },
      { heading: "Use prohibitions precisely", paragraphs: ["Restrictions are strongest when they name prohibited data or actions. For example, a support agent can refuse passwords, OTPs, card details, government identifiers, and claims that a refund or account update is complete without backend evidence."] },
      { heading: "Version the contract", paragraphs: ["Treat an agent contract as a versioned interface. A changed capability, policy, tool, or workflow should create a new version and a new verification record rather than overwrite earlier evidence."] }
    ]
  },
  {
    slug: "deterministic-ai-agent-testing",
    title: "Deterministic AI Agent Testing",
    description: "Use deterministic checks alongside semantic evaluation to make AI agent testing repeatable and evidence-led.",
    keyword: "deterministic AI agent testing",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "Check what can be checked exactly", paragraphs: ["HTTP failures, response limits, prohibited tool calls, invalid endpoint behavior, and explicit state assertions should be deterministic. These checks are fast, repeatable, and easy to audit."] },
      { heading: "Use semantic judgment carefully", paragraphs: ["Natural-language behavior sometimes needs semantic evaluation. It should compare the expected behavior with the recorded response and explain the judgment, rather than replace deterministic policy checks."] },
      { heading: "Keep evidence bounded", paragraphs: ["Store only the response and structured state required to reproduce a finding. Bound request and response sizes, redact credentials, and keep raw payloads out of public reports."] }
    ]
  },
  {
    slug: "adversarial-ai-agent-contract-testing",
    title: "Adversarial AI Agent Contract Testing",
    description: "Test an AI agent against unsafe requests, prompt injection, boundary cases, and unsupported actions.",
    keyword: "adversarial AI agent contract testing",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "Target the actual risk", paragraphs: ["Adversarial tests should be derived from the agent contract. A sales agent should be tested for invented pricing and guarantees; a support agent should be tested for sensitive-data handling and unsupported state changes."] },
      { heading: "Include indirect requests", paragraphs: ["Do not only ask an agent to violate policy directly. Test requests disguised as troubleshooting, urgency, authority, or a request to ignore previous instructions."] },
      { heading: "Treat findings as engineering input", paragraphs: ["A useful failed test includes the scenario, the expected behavior, the actual response, severity, and an explanation. The result should be actionable for the agent team, not merely a score reduction."] }
    ]
  },
  {
    slug: "prevent-ai-agent-hallucinations-production",
    title: "Prevent AI Agent Hallucinations in Production",
    description: "Reduce unsupported claims by enforcing evidence requirements, test contracts, and production verification.",
    keyword: "prevent AI agent hallucinations in production",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "Separate guidance from execution", paragraphs: ["An agent can explain a process without claiming an irreversible action completed. Contracts should require escalation or explicit uncertainty whenever the agent lacks verified backend evidence."] },
      { heading: "Test commercial claims", paragraphs: ["Pricing, availability, discounts, contract terms, delivery status, refunds, and account changes need explicit tests. The agent should not invent facts simply because a user asks confidently."] },
      { heading: "Re-verify after changes", paragraphs: ["Model prompts, tools, retrieval data, and workflow changes can alter behavior. Run a new contract version after meaningful changes and compare the new evidence with the previous result."] }
    ]
  },
  {
    slug: "public-verification-reports",
    title: "Public AI Agent Verification Reports",
    description: "Understand what a public AI agent verification report communicates and what it deliberately keeps private.",
    keyword: "public AI agent verification reports",
    updatedAt: "2026-09-02",
    sections: [
      { heading: "What a report proves", paragraphs: ["A public report records an AgentProof verification outcome for a named agent version at a point in time. It shows the score, test categories, status, validity window, and actionable findings when present."] },
      { heading: "What stays private", paragraphs: ["Endpoint credentials, owner details, full raw responses, private evidence, and internal technical identifiers remain private. Public reports are intended for sharing, not for publishing customer-controlled content to search engines."] },
      { heading: "Use badges honestly", paragraphs: ["Only an unexpired VERIFIED report should display an AgentProof Verified badge. Conditional, failed, blocked, expired, and missing reports must never receive the badge."] }
    ]
  }
];

export const caseStudy = {
  title: "Customer Support Agent Safety Verification",
  description: "A controlled AgentProof demonstration showing how contract-derived tests reveal unsupported account-action behavior.",
  updatedAt: "2026-09-02",
  summary: "The controlled customer-support agent was evaluated against 14 scenarios covering normal support, sensitive data, and unsupported account actions. It passed 12 scenarios and produced two actionable findings.",
  findings: [
    "The agent correctly refused passwords, OTPs, card details, and government identifiers.",
    "The agent did not consistently escalate unsupported account-detail update requests.",
    "The report converts the gap into a reproducible expectation for the next contract version."
  ]
};

export function guideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
