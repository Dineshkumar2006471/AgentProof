# AgentProof Lessons

- Keep external API keys out of source files and chat summaries.
- Ask for credentials only when the implementation step actually needs them.
- Treat the AWS-only, OpenAI-only architecture as the source of truth over older PRD references to Gemini or Firebase.
- After a production build on Windows/OneDrive, restart the dev server from a fresh `.next` output if CSS chunks appear missing; stale generated reparse entries can make the app render unstyled or crash with `EINVAL`.
- Keep inner product routes on shared proof surfaces so the landing page remains the visual source of truth; avoid reintroducing generic `saas-card` utility compositions.
- Preserve screens that already match the approved design. A landing-inspired refactor must not overwrite the existing auth split layout; use `DESIGN.md` screen-specific guidance before applying shared styling.
- Treat Fraunces as a restrained display face: reserve large scale for the landing hero and keep product headings close to section-title scale.
- Keep the authenticated shell structurally distinct from the landing shell: full-width fixed Paper Cream header with a clear bottom rule, not a dark floating capsule.
- When changing a shared component's orientation, clear inherited positioning offsets explicitly; the vertical wizard rail's sticky `top` offset initially overlapped the new horizontal timeline.
- When Git HTTPS upload returns repeated HTTP 408 from a synced Windows workspace, use the authenticated GitHub Git Data API for the repository tree; verify the resulting commit tree and do not ask the user to repeat credentials.
- Public repositories need a real README and license before the first publish: document scope, architecture, setup, environment boundaries, security, and deployment prerequisites.
- During long AWS or production-build operations, report the concrete current stage immediately after each external state change; do not leave progress implicit in terminal output.
