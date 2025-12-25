import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.HUGGINGFACE_API_KEY;

async function testHFRouter() {
    if (!apiKey) return;
    try {
        console.log('Testing Hugging Face with NEW router...');
        const response = await fetch(
            "https://router.huggingface.co/mistralai/Mistral-7B-Instruct-v0.2",
            {
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: "Explain medical summary." }),
            }
        );
        const result = await response.json();
        console.log('Status:', response.status);
        if (response.ok) {
            console.log('✅ Hugging Face NEW router is WORKING');
            console.log('Response:', JSON.stringify(result).substring(0, 100));
        } else {
            console.log('❌ Hugging Face failed again:', result);
        }
    } catch (e) {
        console.error(e);
    }
}

testHFRouter();
