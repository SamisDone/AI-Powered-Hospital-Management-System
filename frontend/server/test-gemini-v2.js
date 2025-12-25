import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function testGemini() {
    if (!apiKey) return;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log('--- Testing with v1 version ---');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("test");
            console.log('✅ v1beta (default) worked!');
        } catch (e) {
            console.log('❌ v1beta failed:', e.message);
        }

        console.log('\n--- Testing with gemini-pro ---');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("test");
            console.log('✅ gemini-pro worked!');
        } catch (e) {
            console.log('❌ gemini-pro failed:', e.message);
        }
    } catch (error) {
        console.error(error);
    }
}

testGemini();
