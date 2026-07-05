# ProofPulse Agent

ProofPulse is a CAP-ready research and verification agent for the CROO Agent Hackathon.

It helps a buyer or another agent check whether a claim is supported, risky, or under-specified before they publish, route funds, accept a bounty, or depend on another agent. The MVP includes a local web demo, quote endpoint, CAP-style intent endpoint, callable paid agent endpoint, A2A manifest, and an agent card that can be adapted for CROO Agent Store listing.

## Why This Fits CROO

- Track: Research & Intelligence Agents
- Secondary track: Data & Verification Agents
- Commerce flow: buyer request -> quote -> paid call -> receipt -> structured report
- A2A value: other agents can call ProofPulse before publishing claims, routing capital, accepting bounties, or listing their own services
- Open-source ready: zero dependencies, MIT license
- Judging-friendly: runs locally with no API keys

## Run

```bash
npm start
```

Open `http://localhost:4173`.

## Test

```bash
npm test
```

The smoke test starts a local server, checks the agent card and A2A manifest, then runs the quote -> CAP intent -> paid call flow.

## API

```bash
curl http://localhost:4173/api/agent-card
```

```bash
curl -X POST http://localhost:4173/api/quote \
  -H "content-type: application/json" \
  -d '{"claim":"This hackathon has 25 days left and only 4 BUIDLs.","context":"Source: DoraHacks CROO Agent Hackathon page."}'
```

```bash
curl -X POST http://localhost:4173/api/cap/intent \
  -H "content-type: application/json" \
  -d '{"quote_id":"quote_demo","amount":"0.25","currency":"USDC","buyer_agent":"bounty-triage.agent"}'
```

```bash
curl -X POST http://localhost:4173/api/cap/call \
  -H "content-type: application/json" \
  -d '{"claim":"This hackathon has 25 days left and only 4 BUIDLs.","context":"Source: DoraHacks CROO Agent Hackathon page.","amount":"0.25","intent_id":"cap_intent_demo"}'
```

```bash
curl http://localhost:4173/api/a2a/manifest
```

## Submission Notes

Required by the hackathon:

- Public GitHub repo
- Permissive license
- README with setup instructions
- Max 5-minute demo video
- CAP integration notes
- CROO Agent Store listing
- DoraHacks BUIDL submission

Current MVP status:

- Quote endpoint implemented
- CAP-style payment intent endpoint implemented
- Callable agent endpoint implemented
- Receipt hash stub implemented
- Agent card implemented
- A2A manifest implemented
- Machine-readable policy recommendation implemented
- CAP settlement is simulated until production keys/store listing are configured

Submission checklist:

- Publish this directory as a public GitHub repository.
- Register as hacker on the CROO Agent Hackathon page.
- Create a DoraHacks BUIDL using the copy in `SUBMISSION.md`.
- Record a 3-5 minute demo video using the script below.
- Add the public repository URL and demo video URL to DoraHacks before the deadline.

## Demo Script

1. Open the local demo and explain the buyer is another agent deciding whether to trust a claim.
2. Click "Run agent" to generate a quote, CAP intent, receipt, and verification report.
3. Point out the verdict, confidence, evidence, source gaps, and recommended policy.
4. Click "A2A manifest" to show how another agent can discover and call ProofPulse.
5. Explain that the demo settlement object is ready to replace with CROO production SDK calls when credentials are available.
