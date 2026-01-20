import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

const MODAL_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];
const TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-exp"];

async function generateWithFallback(modelNames, content) {
    let lastError = null;
    for (const name of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(content);
            const response = await result.response;
            return response.text();
        } catch (e) {
            console.warn(`⚠️ Proxy model ${name} failed: ${e.message}`);
            lastError = e;
            // Vercel serverless functions have a timeout, so we don't want to loop too much
            // but for 404/not found we can try the next one.
            if (!e.message.includes('404')) break;
        }
    }
    throw lastError;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    try {
        if (pathname.endsWith('/caption')) {
            // Vercel automatically parses body for JSON, but for raw we might need to handle it
            // Based on implementation_plan, we pass it as octet-stream
            // However, Vercel might have already parsed it if it's small.
            // Let's assume it's in req.body.
            
            let buffer;
            if (Buffer.isBuffer(req.body)) {
                buffer = req.body;
            } else if (typeof req.body === 'string') {
                buffer = Buffer.from(req.body, 'base64');
            } else {
                // If it's already an object/array (unlikely for raw)
                buffer = Buffer.from(JSON.stringify(req.body));
            }

            const base64Image = buffer.toString('base64');
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
            return res.json([{ generated_text: caption }]);
        } 
        
        if (pathname.endsWith('/generate')) {
            const prompt = req.body.inputs;
            if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

            const text = await generateWithFallback(TEXT_MODELS, prompt);
            return res.json([{ generated_text: text }]);
        }

        res.status(404).json({ error: 'Endpoint not found' });
    } catch (error) {
        console.error('❌ Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
}
