import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.HUGGINGFACE_API_KEY;

async function testHF() {
    if (!apiKey) {
        console.error('❌ HUGGINGFACE_API_KEY not found');
        return;
    }
    try {
        console.log('Testing Hugging Face with Mistral...');
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: "Explain what a medical summary is." }),
            }
        );
        const result = await response.json();
        console.log('Response:', JSON.stringify(result).substring(0, 200));
        if (response.ok) {
            console.log('✅ Hugging Face is WORKING');
        } else {
            console.log('❌ Hugging Face failed:', result.error);
        }
    } catch (e) {
        console.error(e);
    }
}

testHF();
