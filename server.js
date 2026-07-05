import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const agentCard = {
  id: "proofpulse.research.v1",
  name: "ProofPulse",
  summary: "Paid research and verification agent for A2A claims, hackathon decisions, and Web3 due diligence.",
  owner: "DoraHacks participant",
  tracks: ["Research & Intelligence Agents", "Data & Verification Agents"],
  cap_ready: true,
  agent_store: {
    category: "Research & Intelligence",
    listing_status: "demo-ready",
    tagline: "Buy an evidence check before an agent publishes, routes funds, or accepts a bounty."
  },
  price: {
    currency: "USDC",
    starting_at: "0.25",
    settlement: "CAP-compatible quote, intent, settlement, and receipt flow"
  },
  inputs: {
    claim: "string",
    context: "string",
    urgency: "normal | fast"
  },
  outputs: {
    verdict: "supporting | mixed | weak | risky",
    confidence: "0-100",
    evidence: "array",
    next_actions: "array"
  },
  sla: {
    median_response_seconds: 8,
    max_report_words: 900
  },
  endpoints: {
    quote: "/api/quote",
    cap_intent: "/api/cap/intent",
    cap_call: "/api/cap/call",
    a2a_manifest: "/api/a2a/manifest"
  }
};

const demoSources = [
  {
    title: "DoraHacks CROO Agent Hackathon",
    url: "https://dorahacks.io/hackathon/croo-hackathon",
    type: "primary"
  },
  {
    title: "CROO Agent Store integration notes",
    url: "https://croo.network",
    type: "ecosystem"
  }
];

const a2aManifest = {
  protocol: "proofpulse.a2a.v1",
  agent_id: agentCard.id,
  name: agentCard.name,
  description: agentCard.summary,
  capabilities: [
    "claim_verification",
    "source_gap_detection",
    "paid_due_diligence",
    "machine_readable_reports"
  ],
  input_schema: {
    claim: { type: "string", required: true },
    context: { type: "string", required: false },
    urgency: { type: "string", enum: ["normal", "fast"] },
    buyer_agent: { type: "string", required: false }
  },
  output_schema: {
    verdict: "supporting | mixed | weak | risky",
    confidence: "number",
    evidence: "array",
    gaps: "array",
    recommended_policy: "allow | review | block"
  },
  commercial_terms: {
    currency: "USDC",
    minimum_price: "0.25",
    settlement: "CAP demo intent and receipt"
  }
};

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function scoreClaim(claim, context = "") {
  const text = `${claim} ${context}`.trim();
  const urls = [];
  const protectedText = text.replace(/https?:\/\/\S+/g, (url) => {
    const token = `__URL_${urls.length}__`;
    urls.push(url);
    return token;
  });
  const sentences = protectedText
    .split(/[.!?\n]/)
    .map((line) => line.trim())
    .map((line) => line.replace(/__URL_(\d+)__/g, (_, index) => urls[Number(index)] || ""))
    .filter(Boolean);

  const sourceSignals = (text.match(/https?:\/\/|doi:|arxiv|github|docs|paper|audit|report/gi) || []).length;
  const riskSignals = (text.match(/guarantee|risk-free|100%|always|never|moon|instant|no downside|稳赚|保本/gi) || []).length;
  const specificitySignals = (text.match(/\b\d+(\.\d+)?%?|\$|usd|usdc|202\d|q[1-4]\b/gi) || []).length;
  const capSignals = (text.match(/\bcap\b|croo|agent store|a2a|paid|callable|receipt|escrow/gi) || []).length;
  const confidence = Math.max(18, Math.min(94, 42 + sourceSignals * 12 + specificitySignals * 5 - riskSignals * 14));

  const verdict =
    riskSignals >= 2 ? "risky" :
    confidence >= 74 ? "supporting" :
    confidence >= 48 ? "mixed" :
    "weak";

  const evidence = sentences.slice(0, 5).map((sentence, index) => ({
    id: `ev-${index + 1}`,
    excerpt: sentence,
    signal: sentence.match(/https?:\/\/|github|docs|paper|report/i)
      ? "source"
      : sentence.match(/\b\d+(\.\d+)?%?|\$|usd|usdc|202\d/i)
        ? "specific"
        : "context",
    weight: Math.max(1, Math.min(5, Math.round(confidence / 20) - index))
  }));

  const gaps = [];
  if (sourceSignals === 0) gaps.push("Add at least two primary sources or transaction links.");
  if (specificitySignals < 2) gaps.push("Add measurable dates, amounts, benchmarks, or acceptance criteria.");
  if (capSignals < 2) gaps.push("Show how the claim connects to CAP, A2A, payment, or Agent Store usage.");
  if (riskSignals > 0) gaps.push("Rewrite absolute claims and disclose uncertainty.");
  if (!context || context.length < 120) gaps.push("Provide more surrounding context before purchase or integration.");

  return {
    verdict,
    confidence,
    evidence,
    gaps,
    recommended_policy: verdict === "risky" ? "block" : verdict === "weak" ? "review" : "allow",
    sources_checked: sourceSignals ? Math.min(sourceSignals, 5) : 0,
    a2a_note: "This report is safe to pass to another agent as a decision dependency, not as final truth.",
    next_actions: [
      "Attach primary links for every high-impact claim.",
      "Run a buyer-facing summary before publishing the agent response.",
      "Store the receipt hash with the CAP job id for later audit."
    ]
  };
}

async function routeApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/agent-card") {
    return json(res, 200, agentCard);
  }

  if (req.method === "POST" && url.pathname === "/api/quote") {
    const body = await readBody(req);
    const urgencyMultiplier = body.urgency === "fast" ? 2 : 1;
    const textUnits = Math.max(1, Math.ceil(`${body.claim || ""} ${body.context || ""}`.length / 600));
    return json(res, 200, {
      quote_id: `quote_${Date.now()}`,
      agent_id: agentCard.id,
      buyer_agent: body.buyer_agent || "human.demo",
      amount: (0.25 * textUnits * urgencyMultiplier).toFixed(2),
      currency: "USDC",
      expires_in_seconds: 300,
      accepted_methods: ["CAP escrow", "manual test receipt"],
      deliverables: [
        "structured verdict",
        "evidence excerpts",
        "source gaps",
        "A2A policy recommendation",
        "receipt hash"
      ]
    });
  }

  if (req.method === "POST" && url.pathname === "/api/cap/intent") {
    const body = await readBody(req);
    if (!body.quote_id) return json(res, 400, { error: "quote_id is required" });
    return json(res, 200, {
      intent_id: `cap_intent_${Date.now()}`,
      quote_id: body.quote_id,
      agent_id: agentCard.id,
      buyer_agent: body.buyer_agent || "human.demo",
      pay_to: "proofpulse.demo.eth",
      network: "Base demo",
      currency: body.currency || "USDC",
      amount: body.amount || "0.25",
      status: "ready_for_settlement",
      memo: "Demo CAP intent. Replace with CROO production SDK settlement when keys are issued."
    });
  }

  if (req.method === "POST" && url.pathname === "/api/cap/call") {
    const body = await readBody(req);
    if (!body.claim) return json(res, 400, { error: "claim is required" });
    const report = scoreClaim(body.claim, body.context);
    return json(res, 200, {
      job_id: `job_${Date.now()}`,
      agent_id: agentCard.id,
      buyer_agent: body.buyer_agent || "human.demo",
      receipt: {
        settlement_status: "demo-settled",
        currency: "USDC",
        amount: body.amount || "0.25",
        intent_id: body.intent_id || null,
        receipt_hash: `demo_${Buffer.from(`${body.claim}:${Date.now()}`).toString("hex").slice(0, 24)}`
      },
      sources: demoSources,
      report
    });
  }

  if (req.method === "GET" && url.pathname === "/api/a2a/manifest") {
    return json(res, 200, a2aManifest);
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true, agent: agentCard.id });
  }

  return json(res, 404, { error: "not found" });
}

async function routeStatic(req, res, url) {
  const safePath = normalize(url.pathname === "/" ? "/index.html" : url.pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) return await routeApi(req, res, url);
    return await routeStatic(req, res, url);
  } catch (error) {
    return json(res, 500, { error: error.message });
  }
}).listen(port, host, () => {
  console.log(`ProofPulse running at http://${host}:${port}`);
});
