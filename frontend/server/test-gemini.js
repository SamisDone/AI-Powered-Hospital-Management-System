import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from the parent directory (frontend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

console.log('🔑 Testing Gemini API Key...');
console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);

async function testGemini() {
    if (!apiKey) {
        console.error('❌ VITE_GEMINI_API_KEY is not set in .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('\n📝 Sending test prompt to Gemini 1.5 Flash...');
        const result = await model.generateContent("Hello, respond with 'Gemini is working!' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log(`\nResponse: ${text}`);

        if (text.includes('working')) {
            console.log('\n✅ Gemini API Integration is SUCCESSFUL!');
        } else {
            console.log('\n⚠️ Received unexpected response, but the API call worked.');
        }

    } catch (error) {
        console.error('\n❌ Gemini API request failed:');
        console.error(error.message);
        if (error.message.includes('API_KEY_INVALID')) {
            console.error('👉 Suggestion: Check if your API key is correct and active.');
        } else if (error.message.includes('404')) {
            console.error('👉 Suggestion: The model might be unavailable or the name is wrong.');
        }
    }
}

testGemini();
