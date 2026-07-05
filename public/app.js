const form = document.querySelector("#agentForm");
const output = document.querySelector("#output");
const verdict = document.querySelector("#verdict");
const confidence = document.querySelector("#confidence");
const runDemo = document.querySelector("#runDemo");
const loadCard = document.querySelector("#loadCard");
const loadManifest = document.querySelector("#loadManifest");

function formPayload() {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function print(payload) {
  output.textContent = JSON.stringify(payload, null, 2);
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

runDemo.addEventListener("click", async () => {
  runDemo.disabled = true;
  verdict.textContent = "Running";
  confidence.textContent = "...";
  try {
    const payload = formPayload();
    const quote = await postJson("/api/quote", payload);
    const intent = await postJson("/api/cap/intent", {
      quote_id: quote.quote_id,
      amount: quote.amount,
      currency: quote.currency,
      buyer_agent: payload.buyer_agent
    });
    const result = await postJson("/api/cap/call", {
      ...payload,
      amount: quote.amount,
      intent_id: intent.intent_id
    });
    verdict.textContent = result.report.verdict;
    confidence.textContent = result.report.confidence;
    print({ quote, cap_intent: intent, result });
  } catch (error) {
    verdict.textContent = "Error";
    confidence.textContent = "!";
    print({ error: error.message });
  } finally {
    runDemo.disabled = false;
  }
});

loadCard.addEventListener("click", async () => {
  const response = await fetch("/api/agent-card");
  const card = await response.json();
  verdict.textContent = "Agent card";
  confidence.textContent = "CAP";
  print(card);
});

loadManifest.addEventListener("click", async () => {
  const response = await fetch("/api/a2a/manifest");
  const manifest = await response.json();
  verdict.textContent = "A2A manifest";
  confidence.textContent = "API";
  print(manifest);
});
