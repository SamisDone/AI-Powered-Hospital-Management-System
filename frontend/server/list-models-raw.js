import fetch from "node-fetch";
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
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Available Models:');
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log('❌ No models found or error:', data);
        }
    } catch (error) {
        console.error('❌ Fetch failed:', error.message);
    }
}

listModels();
