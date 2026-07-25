import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  menuContext: z.string().max(6000).optional(),
});

const SYSTEM = `You are Aria, the AI food concierge for RestaurantOS AI.
You help diners pick dishes based on mood, diet, budget, weather, and cravings.
Rules:
- Be warm, concise, and confident. 1–3 short paragraphs max.
- When recommending, name up to 3 specific dishes from the MENU CONTEXT (if provided) and say why.
- Respect diet flags (veg, vegan, gluten-free), spice tolerance, allergies, and budget when mentioned.
- Never invent dishes that aren't in the menu context. If the menu can't satisfy a request, say so and suggest the closest option.
- Format prices as "₹<amount>".`;

export const askAria = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const systemContent = data.menuContext
      ? `${SYSTEM}\n\nMENU CONTEXT (available dishes with price and tags):\n${data.menuContext}`
      : SYSTEM;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [{ role: "system", content: systemContent }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Aria is a little busy — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please top up in Lovable AI settings.");
      throw new Error(`AI error [${res.status}]: ${body}`);
    }
    const json = await res.json();
    const reply: string = json?.choices?.[0]?.message?.content ?? "Sorry, I couldn't come up with a recommendation.";
    return { reply };
  });
