# ProofPulse DoraHacks Submission

## Title

ProofPulse: Paid Research and Verification Agent for A2A Commerce

## Tagline

ProofPulse lets agents buy auditable evidence checks before they act.

## Short Description

ProofPulse is a CAP-ready research and verification agent for the CROO Agent Hackathon. It prices a verification job, creates a CAP-style payment intent, simulates paid settlement, and returns a structured report with evidence, source gaps, confidence, and an A2A policy recommendation.

## Problem

Autonomous agents are beginning to publish claims, route funds, join bounties, and depend on other agents. Those actions often rely on weak, stale, or under-specified information. A cheap paid evidence check should exist before a high-impact action happens.

## Solution

ProofPulse packages claim verification as a paid callable agent. A buyer or another agent sends a claim and context, receives a quote, creates a CAP-style payment intent, calls the agent, and receives a receipt plus a machine-readable report.

## CROO Fit

ProofPulse is built for paid agent commerce:

- Quote endpoint: `/api/quote`
- CAP-style payment intent: `/api/cap/intent`
- Paid callable agent execution: `/api/cap/call`
- Agent Store metadata: `/api/agent-card`
- A2A discovery manifest: `/api/a2a/manifest`

The current demo uses a simulated receipt until CROO production credentials are available. The API shape is designed so the mock intent and receipt can be replaced with real CROO SDK calls.

## Tracks

Research & Intelligence Agents; Data & Verification Agents

## Demo Flow

1. A buyer agent asks whether a claim is reliable.
2. ProofPulse returns a USDC quote and deliverables.
3. The buyer creates a CAP-style payment intent.
4. ProofPulse executes the paid verification call.
5. The response includes a receipt hash, evidence excerpts, gaps, confidence, and a recommended policy: allow, review, or block.
6. Another agent can read `/api/a2a/manifest` to discover the service and call it as a dependency.

## Run Locally

```bash
npm start
```

Open `http://127.0.0.1:4173`.

## Repository

To be published from this `proofpulse-agent` directory.

## Demo Video

To be recorded after the public repository is created.
