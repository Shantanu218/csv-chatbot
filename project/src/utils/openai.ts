// utils/openai.ts
import OpenAI from "openai";

export const getAIResponse = async (apiKey: string, prompt: string) => {
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Only if you must use it on the frontend
    });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // or "gpt-4-turbo"
            messages: [
                { role: "user", content: prompt },
            ],
        });

        return completion.choices[0]?.message?.content || "No response";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Failed to fetch AI response");
    }
};