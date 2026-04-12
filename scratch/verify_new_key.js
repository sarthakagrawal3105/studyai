const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function verifyKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env.local");
        process.exit(1);
    }

    try {
        console.log("Verifying API Key connectivity...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello, are you online?");
        console.log("Response:", result.response.text());
        console.log("SUCCESS: API Key is valid and functional.");
    } catch (error) {
        console.error("FAILURE: API Key verification failed.");
        console.error(error);
        process.exit(1);
    }
}

verifyKey();
