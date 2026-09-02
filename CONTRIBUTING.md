# Contributing to AgentProof

Thanks for contributing to AgentProof. The product verifies AI-agent behavior, so changes must preserve owner isolation, evidence privacy, endpoint safety, and understandable reports.

## Before You Start

- Read the root [README](./README.md) for architecture and local setup.
- Check existing issues and pull requests before starting duplicate work.
- Do not include secrets, .env.local, AWS credentials, real endpoint tokens, customer data, evidence, or generated CDK output.

## Development Workflow

1. Create a focused branch from the latest main.
2. Install dependencies with npm ci.
3. Copy .env.example to .env.local and use development-only values.
4. Make the smallest change that resolves the issue.
5. Add or update tests for behavioral changes.
6. Run the local quality checks before opening a pull request.

~~~powershell
npm run typecheck
npm test -- --run
npx eslint .
npm run build
npm run infra:synth
git diff --check
~~~

## Pull Requests

- Explain the problem, solution, and verification performed.
- Keep unrelated formatting or refactoring out of the pull request.
- Include mobile and desktop screenshots for user-interface changes.
- Document environment, infrastructure, or migration consequences.
- Never bypass required CI checks or branch protection.

## Design and Product Expectations

- Preserve the existing AgentProof typography, colors, spacing, and workspace interaction patterns unless the change is intentionally a design-system update.
- Keep keyboard access, visible focus, and responsive layouts intact.
- Do not turn user-controlled text, endpoint URLs, prompts, or evidence into public analytics or search-indexable content.

## Security Reports

Do not file public issues for suspected vulnerabilities. Follow [SECURITY.md](./SECURITY.md).
