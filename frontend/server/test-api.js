import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.VITE_HUGGINGFACE_API_KEY;

console.log('🔑 Testing Hugging Face API Key...');
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);

async function testAPI() {
    try {
        // Test with a simple text model first
        console.log('\n📝 Testing text generation API...');
        const textResponse = await fetch(
            'https://api-inference.huggingface.co/models/gpt2',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: 'Hello, this is a test',
                })
            }
        );

        console.log(`Status: ${textResponse.status}`);
        console.log(`Content-Type: ${textResponse.headers.get('content-type')}`);

        const textData = await textResponse.text();
        console.log(`Response: ${textData.substring(0, 200)}`);

        if (textResponse.ok) {
            console.log('✅ API Key is valid!');
        } else {
            console.log('❌ API request failed');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAPI();
