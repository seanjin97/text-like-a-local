const API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function buildPrompt(goal?: string, hasHistory: boolean = false): string {
    const basePrompt = `You are an expert at analyzing chat conversations and generating natural replies.

Analyze the chat screenshot and generate a reply for the USER (the person who needs to respond).${hasHistory ? '\n\nNote: You have been shown previous messages in this conversation. Use that context to maintain coherence and build upon the ongoing discussion.' : ''}

Instructions:
1. Identify who the USER is - typically their messages appear on the right side or in a different color
2. Understand the conversation context and what the other person is asking/saying
3. Detect the language being used
4. Notice the writing style: casual abbreviations, emoji usage, punctuation habits, local expressions`;

    const goalSection = goal
        ? `\n5. IMPORTANT - Conversation Goal: ${goal}\n   Steer the reply to naturally work toward this goal while staying contextually appropriate`
        : '';

    const styleInstructions = `
${goal ? '6' : '5'}. Generate a reply that:
   - Is in the SAME language as the conversation
   - Matches the USER's writing style from their previous messages
   - Uses similar emoji patterns if the user uses emojis
   - Feels natural and human, not robotic or overly formal
   - Is contextually appropriate to what was said${goal ? '\n   - Subtly steers toward the conversation goal' : ''}
   - Write in first person. "I" is preferred.

OUTPUT FORMAT:
If the reply is in English, output ONLY the reply text.
If the reply is NOT in English, output in this EXACT format:
REPLY: [the reply in the conversation's language]
TRANSLATION: [English translation of the reply]

Do not include any other text, explanations, or formatting.`;

    return basePrompt + goalSection + styleInstructions;
}

export interface ConversationEntry {
    imageBase64: string;
    mimeType: string;
    reply: string;
}

export interface GenerateReplyResult {
    success: true;
    reply: string;
    translation?: string;
}

export interface GenerateReplyError {
    success: false;
    error: string;
}

export type GenerateReplyResponse = GenerateReplyResult | GenerateReplyError;

export async function generateReply(
    apiKey: string,
    imageBase64: string,
    mimeType: string,
    goal?: string,
    conversationHistory: ConversationEntry[] = []
): Promise<GenerateReplyResponse> {
    try {
        // Build conversation history for context
        const contents = [];

        // Add conversation history
        for (const entry of conversationHistory) {
            // User message with image
            contents.push({
                role: 'user',
                parts: [
                    {
                        inline_data: {
                            mime_type: entry.mimeType,
                            data: entry.imageBase64,
                        },
                    },
                ],
            });
            // Model's reply
            contents.push({
                role: 'model',
                parts: [{ text: entry.reply }],
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [
                { text: buildPrompt(goal, conversationHistory.length > 0) },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: imageBase64,
                    },
                },
            ],
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData?.error?.message || `API error: ${response.status}`;
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return { success: false, error: 'No reply generated' };
        }

        // Parse the response to extract reply and optional translation
        const text = rawText.trim();
        const replyMatch = text.match(
            /^REPLY:\s*(.+?)(?:\nTRANSLATION:\s*(.+))?$/s
        );

        if (replyMatch) {
            // Non-English reply with translation
            return {
                success: true,
                reply: replyMatch[1].trim(),
                translation: replyMatch[2]?.trim(),
            };
        } else {
            // English reply (no translation needed)
            return { success: true, reply: text };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: 'Say "ok"' }],
                    },
                ],
            }),
        });
        return response.ok;
    } catch {
        return false;
    }
}
