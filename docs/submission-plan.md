# CROO Agent Hackathon Submission Plan

## Selected Hackathon

CROO Agent Hackathon on DoraHacks.

Latest observed on 2026-07-05:

- Deadline: 2026-07-12 17:00
- Prize pool: 10,200 USD
- Current BUIDLs: 68
- Current hackers: 303
- Time remaining: 6 days left for submission
- Required: GitHub/Gitlab/Bitbucket link and demo video
- Must satisfy: Agent Store listing, CAP integration, open-source repo, README/demo, DoraHacks BUIDL filing

## Project

ProofPulse: a paid, callable research and verification agent.

One-line pitch:

> ProofPulse lets humans and agents buy fast evidence checks before they publish claims, route funds, or depend on another agent.

## MVP Scope

1. Web demo with buyer/agent input and report output
2. `/api/quote` for job pricing
3. `/api/cap/intent` for CAP-style payment intent
4. `/api/cap/call` for callable paid agent execution
5. `/api/agent-card` for store-style metadata
6. `/api/a2a/manifest` for agent discovery and composability
7. Receipt hash stub for CAP settlement story

## What To Build Next

1. Replace demo receipt with real CROO CAP SDK call once credentials and store flow are available.
2. Add source ingestion from URLs and GitHub repos.
3. Add optional LLM summarization behind `OPENAI_API_KEY`.
4. Record a 3-minute demo:
   - problem
   - quote, CAP intent, and paid call
   - report
   - A2A reuse
   - CAP/store integration notes

## DoraHacks BUIDL Draft

Title:

ProofPulse: Paid Research and Verification Agent for A2A Commerce

Tagline:

ProofPulse gives agents a way to buy auditable evidence checks before they act.

Description:

ProofPulse is a CAP-ready research and verification agent for the CROO Agent Hackathon. It prices a research job, creates a CAP-style payment intent, accepts a buyer or agent request, simulates settlement with a receipt hash, and returns a structured verdict with evidence, source gaps, confidence, and a machine-readable policy recommendation. Other agents can call it as a paid dependency before publishing claims, investing in bounties, routing funds, or listing their own services.

Tracks:

Research & Intelligence Agents; Data & Verification Agents

Repo:

To be created from `proofpulse-agent`.

Demo video:

To be recorded after CAP/store wiring.

## Suggested DoraHacks Answers

Problem:

Agents increasingly make decisions from weak or stale claims. A bounty agent, trading agent, or listing agent needs a cheap way to buy evidence before taking a costly action.

Solution:

ProofPulse packages claim verification as a paid agent service. It returns a quote, CAP-style payment intent, receipt, verdict, evidence, gaps, and an A2A policy recommendation.

Why CROO:

CROO is about paid callable agents and agent commerce. ProofPulse is not just a chat UI; it is a service another agent can discover, buy, call, and use as a dependency.

Current limitations:

Settlement is simulated in the demo until CROO production credentials are available. The API shape is intentionally designed so the mock intent and receipt can be replaced with real SDK calls.
