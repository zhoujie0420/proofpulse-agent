import { spawn } from "node:child_process";

const port = 4193;
const baseUrl = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, ["server.js"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

function stop() {
  if (!server.killed) server.kill("SIGTERM");
}

async function waitForHealth() {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // The server may still be binding the port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become healthy:\n${output}`);
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`${path} failed: ${await response.text()}`);
  return response.json();
}

try {
  await waitForHealth();

  const card = await fetch(`${baseUrl}/api/agent-card`).then((response) => response.json());
  if (card.id !== "proofpulse.research.v1") throw new Error("Unexpected agent card id.");

  const manifest = await fetch(`${baseUrl}/api/a2a/manifest`).then((response) => response.json());
  if (!manifest.capabilities.includes("claim_verification")) {
    throw new Error("A2A manifest is missing claim verification capability.");
  }

  const quote = await post("/api/quote", {
    claim: "CROO Agent Hackathon rewards paid callable agents.",
    context: "Source: https://dorahacks.io/hackathon/croo-hackathon. CAP, A2A, Agent Store, receipt.",
    buyer_agent: "smoke-test.agent"
  });
  if (!quote.quote_id || !quote.amount) throw new Error("Quote response is incomplete.");

  const intent = await post("/api/cap/intent", {
    quote_id: quote.quote_id,
    amount: quote.amount,
    currency: quote.currency,
    buyer_agent: quote.buyer_agent
  });
  if (!intent.intent_id) throw new Error("CAP intent response is incomplete.");

  const result = await post("/api/cap/call", {
    claim: "CROO Agent Hackathon rewards paid callable agents.",
    context: "Source: https://dorahacks.io/hackathon/croo-hackathon. CAP, A2A, Agent Store, receipt.",
    amount: quote.amount,
    intent_id: intent.intent_id,
    buyer_agent: quote.buyer_agent
  });
  if (!result.receipt.receipt_hash || !result.report.recommended_policy) {
    throw new Error("Paid call response is incomplete.");
  }

  console.log("Smoke test passed.");
} finally {
  stop();
}
