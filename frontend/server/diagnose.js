import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- ENV DIAGNOSTIC ---');
console.log('Working Directory:', process.cwd());
console.log('__dirname:', __dirname);

const localEnv = path.resolve(__dirname, '.env');
const parentEnv = path.resolve(__dirname, '../.env');

console.log('.env in current dir exists:', fs.existsSync(localEnv));
console.log('.env in parent dir exists:', fs.existsSync(parentEnv));

dotenv.config();
dotenv.config({ path: parentEnv });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
console.log('API Key detected:', apiKey ? 'YES (' + apiKey.substring(0, 10) + '...)' : 'NO');

async function listModels() {
    if (!apiKey) return;
    try {
        console.log('\n--- MODEL LIST ---');
        const fetch = (await import('node-fetch')).default;
        // Use raw fetch to list models to see exactly what this key supports
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('Error listing models:', JSON.stringify(data));
        }
    } catch (e) {
        console.error('Failed to list models:', e.message);
    }
}

listModels();
