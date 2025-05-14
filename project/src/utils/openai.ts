// utils/openai.ts
import OpenAI from "openai";

const apiKey = import.meta.env.VITE_COMPANY_API_KEY;
// const apiKey = import.meta.env.VITE_PERSONAL_API_KEY;

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export const getAIResponse = async (messages: Message[]) => {
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    console.log(messages)

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
            { "role": "user", "content": "You are a helpful assistant that analyzes CSV data. The user will upload a CSV file and you will help them extract insights from it." },
            ...messages
        ],
    });

    return completion.choices[0]

}

