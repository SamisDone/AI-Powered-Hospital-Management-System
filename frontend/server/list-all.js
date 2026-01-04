import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parentEnv = path.resolve(__dirname, '../.env');
dotenv.config({ path: parentEnv });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function listAllModels() {
    if (!apiKey) {
        console.log('NO KEY');
        return;
    }
    const fetch = (await import('node-fetch')).default;
    let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.models) {
            console.log('SUPPORTED_MODELS_START');
            data.models.forEach(m => {
                console.log(m.name);
            });
            console.log('SUPPORTED_MODELS_END');
        } else {
            console.log('DATA:', JSON.stringify(data));
        }
    } catch (e) {
        console.error(e);
    }
}

listAllModels();
