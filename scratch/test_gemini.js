const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const apiKey = "AIzaSyBD-gcEDiMqs7UDPrX14Tif5kNUjE9qeOE";
    try {
        console.log("Listing models...");
        // This requires the @google/generative-ai library to have listModels, but it doesn't always.
        // Actually, we can just try a very basic fetch to check if the key is valid.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Models Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
