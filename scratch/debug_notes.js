const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test_note_generation() {
    console.log("Testing Note Generation with New Prompt...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const topic = "Quantum Entanglement";
        const systemPrompt = `
                You are an expert teacher. Convert the input into the "Ultra-Smart" note format.
                STRICT INSTRUCTIONS:
                - Use VERY SIMPLE language.
                - Avoid long paragraphs; use bullet points wherever possible.
                - Highlight important terms with **bold**.
                - Make it EASY to revise in less than 2 minutes.
                
                OUTPUT FORMAT (STRICTLY FOLLOW):
                1. 📌 Title
                2. 📖 Definition (2-3 lines only)
                3. 🔑 Key Points (1 line per bullet)
                4. 🧠 Explanation (Use sub-headings, no long paragraphs)
                5. 📊 Diagram / Flow (Text-based steps/process)
                6. 🧪 Examples
                7. 🏷️ Keywords (Max 15 terms)
                8. 📝 5-Mark Answer (5-6 points)
                9. 🧾 10-Mark Answer (Intro + Points + Conclusion)
                10. ⚡ Quick Revision (6-8 ultra-short bullets)
                `;

        const prompt = `
        ${systemPrompt}
        
        INPUT DATA: "${topic}"
        
        INSTRUCTIONS:
        - Use simple and clear language.
        - Focus only on important concepts.
        - Structure with professional Markdown.
        
        Return the result as a JSON object:
        {
            "title": "Clean & Descriptive Title",
            "content": "Full formatted Markdown content"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("AI Raw Text:", text);
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        console.log("Parsed Title:", data.title);
        console.log("Parsed Content Start:", data.content.substring(0, 100));
        console.log("SUCCESS");

    } catch (error) {
        console.error("FAILURE:", error);
    }
}

test_note_generation();
