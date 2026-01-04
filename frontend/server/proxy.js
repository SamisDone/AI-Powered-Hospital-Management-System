import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from current dir and parent dir
dotenv.config(); // Default
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const app = express();
const PORT = 3001;

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
console.log(`🔑 Debug: GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`🔑 Debug: VITE_GEMINI_API_KEY present: ${!!process.env.VITE_GEMINI_API_KEY}`);

const genAI = new GoogleGenerativeAI(apiKey || "");

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxy server is running' });
});

async function generateWithFallback(modelNames, content) {
    let lastError = null;
    for (const name of modelNames) {
        try {
            console.log(`📡 Proxy trying model: ${name}`);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(content);
            const response = await result.response;
            return response.text();
        } catch (e) {
            console.warn(`⚠️ Proxy model ${name} failed: ${e.message}`);
            lastError = e;
            if (!e.message.includes('404')) break;
        }
    }
    throw lastError;
}

const MODAL_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];
const TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-exp"];

// Image analysis endpoint using Gemini
app.post('/api/huggingface/caption', express.raw({ type: 'application/octet-stream', limit: '10mb' }), async (req, res) => {
    try {
        console.log('📸 Received image analysis request');
        if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });
        if (!req.body || req.body.length === 0) return res.status(400).json({ error: 'No image data received' });

        const base64Image = req.body.toString('base64');
        const content = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            },
            "Extract all text from this medical image/document. Then provide a concise description of what you see."
        ];

        const caption = await generateWithFallback(MODAL_MODELS, content);
        console.log('✅ Image analyzed successfully');
        res.json([{ generated_text: caption }]);

    } catch (error) {
        console.error('❌ Gemini Analysis Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Text generation endpoint for medical enhancement
app.post('/api/huggingface/generate', express.json(), async (req, res) => {
    try {
        console.log('🧠 Received text generation request');
        if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

        const prompt = req.body.inputs;
        const text = await generateWithFallback(TEXT_MODELS, prompt);

        console.log('✅ Text generated successfully');
        res.json([{ generated_text: text }]);

    } catch (error) {
        console.error('❌ Gemini Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Proxy Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for ${allowedOrigins.join(', ')}`);
    console.log(`🔑 Gemini API Key configured: ${apiKey ? 'Yes (' + apiKey.substring(0, 5) + '...)' : 'No'}`);
});
