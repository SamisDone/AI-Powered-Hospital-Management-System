import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing.");
}

// v1beta might be unstable for some regions/keys, but usually standard
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Analyzes a medical record using Google Gemini.
 * Tries multiple model aliases to ensure compatibility.
 */
export async function analyzeMedicalRecord(fileUrl: string): Promise<string> {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }

    // List of models to try in order of preference
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            let promptContent: any[] = [
                "Summarize this medical report with:",
                "- Key findings",
                "- Test results",
                "- Recommendations",
                "Keep it professional and concise."
            ];

            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const base64Data = await blobToBase64(blob);
            const mimeType = blob.type || "image/jpeg";

            promptContent.push({
                inlineData: {
                    data: base64Data.split(',')[1],
                    mimeType
                }
            });

            const result = await model.generateContent(promptContent);
            const apiResponse = await result.response;
            return apiResponse.text();
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model if 404
            if (!error.message.includes('404')) {
                break; // If it's another error (like quota), stop
            }
        }
    }

    throw new Error(lastError?.message || "All Gemini models failed.");
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
