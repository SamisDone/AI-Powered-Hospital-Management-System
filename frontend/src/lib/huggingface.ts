/**
 * Hugging Face Integration Service
 * Uses the LOCAL PROXY to bypass CORS issues
 */

const PROXY_URL = '/api/proxy';

export async function analyzeMedicalRecord(fileUrl: string): Promise<string> {
    try {
        // 1. Fetch the image as generic blob
        const imgResponse = await fetch(fileUrl);
        if (!imgResponse.ok) throw new Error("Could not fetch the medical record file.");
        const imgBlob = await imgResponse.blob();

        // 2. Call the proxy for captioning
        console.log("Requesting image caption via proxy...");
        const captionResponse = await fetch(`${PROXY_URL}/api/huggingface/caption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: imgBlob
        });

        if (!captionResponse.ok) {
            const err = await captionResponse.text();
            throw new Error(`Proxy Error (Caption): ${err}`);
        }

        const captionData = await captionResponse.json();
        const caption = captionData[0]?.generated_text;

        if (!caption) throw new Error("No description generated for this image.");

        // 3. Call the proxy for enhancement
        console.log("Enhancing description via proxy...");
        const enhancementResponse = await fetch(`${PROXY_URL}/api/huggingface/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: `Summarize this medical report with: - Key findings - Test results - Recommendations. Based on this image description: "${caption}". Keep it professional and concise.`
            })
        });

        if (!enhancementResponse.ok) {
            console.warn("Enhancement failed, using basic caption.");
            return `Medical Analysis Summary: ${caption}\n\nNote: Detailed analysis is currently limited.`;
        }

        const enhancementData = await enhancementResponse.json();
        return enhancementData[0]?.generated_text || caption;

    } catch (error: any) {
        console.error("Hugging Face (via Proxy) Failed:", error);
        throw new Error(error.message || "Hugging Face analysis failed");
    }
}