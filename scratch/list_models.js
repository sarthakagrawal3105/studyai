const { GoogleGenerativeAI } = require("@google/generative-ai");


async function listAllModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // In node SDK listModels is on the genAI object
    // Wait, it might be on a different sub-property or only via REST
    console.log("Fetching models...");
    // For node SDK, listModels is not directly exposed on genAI. You use the client.
    // Actually, let's just try to guess common ones.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro", "gemini-2.0-flash-exp"];
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("hi");
            console.log(`✓ ${modelName} is available`);
        } catch (e) {
            console.log(`✗ ${modelName} failed: ${e.message.split('\n')[0]}`);
        }
    }
  } catch (err) {
    console.error("List error:", err);
  }
}

listAllModels();
