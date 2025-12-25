import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    if (!apiKey) {
        console.error('❌ VITE_GEMINI_API_KEY not found');
        return;
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The SDK doesn't have a direct listModels, but we can try a few standard ones
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ Model ${modelName} is AVAILABLE`);
            } catch (e) {
                console.log(`❌ Model ${modelName} is NOT available: ${e.message.substring(0, 50)}...`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

listModels();
