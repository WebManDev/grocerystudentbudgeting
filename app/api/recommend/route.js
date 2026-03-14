import { NextResponse } from "next/server";

export async function POST(request) {
  const { dish, groceryList } = await request.json();

  if (!dish) {
    return NextResponse.json({ error: "No dish provided" }, { status: 400 });
  }

  const systemPrompt = `You are a grocery assistant for students in Australia.
When given a dish name, respond ONLY with a JSON array of ingredients needed.
Each ingredient must have: name (string), quantity (number), unit (string like "g", "ml", "units", "tbsp"), budget_tip (string or null).
Example: [{"name":"pasta","quantity":400,"unit":"g","budget_tip":"Home brand saves ~$2"},{"name":"egg","quantity":2,"unit":"units","budget_tip":null}]
Respond with ONLY the JSON array. No explanation, no markdown, no backticks.`;

  const userPrompt = groceryList?.length
    ? `I want to make: ${dish}. I already have: ${groceryList.map(i => i.name).join(", ")}. What else do I need?`
    : `I want to make: ${dish}. Give me the full ingredient list.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "OpenRouter API error" }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const ingredients = JSON.parse(clean);

    return NextResponse.json({ ingredients });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
