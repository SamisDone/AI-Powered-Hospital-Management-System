import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parentEnv = path.resolve(__dirname, '../.env');
dotenv.config({ path: parentEnv });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
console.log('KEY_VALUE_RAW:', apiKey);

async function checkKey() {
    if (!apiKey) {
        console.log('NO KEY FOUND');
        return;
    }
    const fetch = (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('MODELS_DATA:', JSON.stringify(data));
}

checkKey();
