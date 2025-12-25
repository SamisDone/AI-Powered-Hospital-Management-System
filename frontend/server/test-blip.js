import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.VITE_HUGGINGFACE_API_KEY;

console.log('🧪 Testing BLIP Image Captioning...\n');

async function testBLIP() {
    try {
        // Create a simple test image (1x1 red pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const imageBuffer = Buffer.from(testImageBase64, 'base64');

        console.log('📤 Sending test image to Hugging Face BLIP model...');
        console.log(`Image size: ${imageBuffer.length} bytes\n`);

        const response = await fetch(
            'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: imageBuffer
            }
        );

        console.log(`📥 Status: ${response.status}`);
        console.log(`📥 Content-Type: ${response.headers.get('content-type')}\n`);

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Response (JSON):');
            console.log(JSON.stringify(data, null, 2));

            if (response.ok) {
                console.log('\n🎉 SUCCESS! The API is working correctly!');
            } else {
                console.log('\n⚠️ API returned an error. Details above.');
            }
        } else {
            const text = await response.text();
            console.log('❌ Response (HTML/Text):');
            console.log(text.substring(0, 500));
            console.log('\n💡 This usually means:');
            console.log('   1. Model is loading (wait 20-30 seconds and try again)');
            console.log('   2. Rate limit reached (wait a few minutes)');
            console.log('   3. API endpoint changed (check Hugging Face docs)');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBLIP();
