const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    const list = await genAI.listModels();
    console.log("Available Models:");
    for (const model of list.models) {
      console.log(`${model.name} - ${model.supportedGenerationMethods}`);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
