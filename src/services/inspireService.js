// AI inspiration engine. Calls the Claude API directly from the browser when
// VITE_ANTHROPIC_API_KEY is set; the Inspire page falls back to a curated
// library on any failure so the feature never shows a broken state.
//
// NOTE: a browser-side key is visible to users. For a real deployment, move
// this call behind a small serverless proxy (Firebase Functions / Vercel)
// and keep the key server-side. The curated fallback means the demo works
// with no key at all.

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

export function hasApiKey() {
  return Boolean(API_KEY);
}

export async function generateInspiration({ struggle, field, need, athletes }) {
  if (!API_KEY) throw new Error("no-api-key");

  const context = athletes
    .slice(0, 45)
    .map(
      (a) =>
        `- ${a.name} (${a.sport}, ${a.state})${a.bio ? `: ${a.bio}` : ""}`
    )
    .join("\n");

  const prompt = `You are a warm, specific mentor on a platform celebrating Indian women achievers in sport.

A user shared their struggle: "${struggle}"
Their field: ${field}
What they need most right now: ${need}

Choose ONE athlete from this list whose real journey most closely mirrors the user's situation:
${context}

Write a message of 180-230 words, in the second person, that:
- opens by naming their specific struggle with genuine empathy (do not say "I understand how you feel")
- introduces the chosen athlete naturally
- draws a specific, honest parallel between her journey and theirs
- describes one concrete moment from her career that maps to what they are facing
- ends with one short, non-generic sentence of encouragement

Then give the single "key moment" as one sentence.

Return ONLY valid JSON, no markdown fences:
{"athlete": "<exact name from the list>", "message": "<the message>", "keyMoment": "<one sentence>"}`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API responded ${res.status}`);

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  if (!parsed.athlete || !parsed.message) throw new Error("Unexpected AI response shape");

  return {
    athlete: parsed.athlete,
    message: parsed.message,
    keyMoment: parsed.keyMoment || "",
    source: "ai",
  };
}

export function matchAthlete(name, athletes) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
  const target = norm(name);
  if (!target) return null;
  return (
    athletes.find((a) => norm(a.name) === target) ||
    athletes.find(
      (a) => norm(a.name).includes(target) || target.includes(norm(a.name))
    ) ||
    null
  );
}
