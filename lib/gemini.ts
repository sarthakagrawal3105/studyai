import { GoogleGenerativeAI } from "@google/generative-ai";

// Split the environment variable by commas and clean up whitespace
const getApiKeys = () => {
    const rawKeys = process.env.GEMINI_API_KEY || "";
    return rawKeys.split(",").map(k => k.trim()).filter(k => k.length > 0);
};

let currentKeyIndex = 0;

/**
 * Executes an AI task with automatic key rotation and retries.
 * If a 429 (Quota Exceeded) error is encountered, it switches to the next available key.
 */
export async function runWithRotation<T>(
    task: (model: any) => Promise<T>,
    modelName: string = "gemini-flash-latest",
    generationConfig?: any
): Promise<T> {
    const keys = getApiKeys();
    
    if (keys.length === 0) {
        throw new Error("No GEMINI_API_KEY found in environment variables.");
    }

    // Try at most the number of keys we have
    for (let attempt = 0; attempt < keys.length; attempt++) {
        const apiKey = keys[currentKeyIndex];
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

        try {
            return await task(model);
        } catch (error: any) {
            const errorMessage = error.message || "";
            const isQuotaError = errorMessage.includes("429") || 
                               errorMessage.toLowerCase().includes("quota") ||
                               errorMessage.toLowerCase().includes("limit");

            if (isQuotaError && keys.length > 1) {
                console.warn(`[Gemini Rotation] Key ${currentKeyIndex + 1} exhausted. Rotating to next key...`);
                currentKeyIndex = (currentKeyIndex + 1) % keys.length;
                // Wait a tiny bit before retry to avoid instant failure
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            // If it's not a quota error or we have no more keys to try, rethrow
            throw error;
        }
    }

    throw new Error("All provided Gemini API keys have exhausted their quota. Please try again later.");
}
