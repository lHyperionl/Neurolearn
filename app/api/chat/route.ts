import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://neurolearn.app",
        "X-Title": process.env.OPENROUTER_SITE_NAME || "NeuroLearn",
    },
});

interface ChatMessage {
    id: string;
    role: "student" | "ai";
    content: string;
    timestamp: string;
}

const SYSTEM_PROMPT = `You are NeuroLearn AI, an expert medical education assistant specializing in neuroradiology and brain MRI interpretation.

You help medical students learn to classify brain diagnoses including:
- Glioblastoma Multiforme (GBM): Grade IV malignant brain tumor with ring enhancement, necrosis, and "butterfly" pattern. Key MRI features include irregular thick enhancement around central necrosis, significant peritumoral vasogenic edema, crossing the corpus callosum, and mass effect with midline shift.
- Meningioma: Benign extra-axial tumor with dural tail sign. Key MRI features include dural tail sign (thickening of adjacent dura), well-circumscribed extra-axial mass, intense uniform enhancement, and hyperostosis of adjacent bone.
- Multiple Sclerosis: Demyelinating disease with Dawson's fingers and T1 black holes. Key MRI features include Dawson's fingers (periventricular lesions perpendicular to ventricles), ovoid lesions in juxtacortical and infratentorial regions, open-ring enhancement in active lesions, and T1 'black holes' indicating chronic axonal loss.

When responding:
1. Be educational and explain radiological features visible on MRI
2. Reference specific MRI sequences (T1, T2, FLAIR, T1+C, DWI)
3. Help students develop diagnostic reasoning
4. Keep responses concise but informative
5. Use markdown formatting sparingly for clarity`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages }: { messages: ChatMessage[] } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            );
        }

        const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg) => ({
            role: msg.role === "ai" ? "assistant" : ("user" as const),
            content: msg.content,
        }));

        const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o";

        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...formattedMessages,
            ],
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            return NextResponse.json(
                { error: "No response from AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({ content: response });
    } catch (error) {
        console.error("OpenRouter API error:", error);

        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                { error: "AI temporarily unavailable. Please try again." },
                { status: error.status || 500 }
            );
        }

        return NextResponse.json(
            { error: "Connection error. Please try again." },
            { status: 500 }
        );
    }
}