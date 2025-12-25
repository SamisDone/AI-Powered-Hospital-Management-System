import OpenAI from 'openai';

// NOTE: In a production environment, this should be a backend call to hide the API key.
// For this specific implementation request, we are calling directly from the client.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
    console.warn("Missing VITE_OPENAI_API_KEY. AI features will not work.");
}

const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key',
    dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface AIAnalysisResult {
    summary: string;
    keyInsights: string[];
    recommendations: string;
}

export const analyzeMedicalRecord = async (fileUrl: string): Promise<AIAnalysisResult> => {
    if (!apiKey) {
        throw new Error("OpenAI API Key is missing. Please configure VITE_OPENAI_API_KEY.");
    }

    try {
        // For images, we can use GPT-4o Vision capabilities
        // For PDFs, we would typically need a backend to extract text. 
        // As a fallback/demo for PDFs without backend text extraction, we warn the user or try to treat as text if possible.

        // Construct the prompt
        const systemPrompt = `You are an expert medical AI assistant. Your goal is to analyze medical reports and provide clear, structured summaries for doctors.
    
    Output JSON format:
    {
      "summary": "A concise paragraph summarizing the key findings.",
      "keyInsights": ["List", "of", "critical", "metrics", "or", "findings"],
      "recommendations": "Actionable clinical recommendations based on the findings."
    }
    
    Do not include markdown formatting in the JSON values. Keep it professional and clinical.`;

        const userContent = [
            { type: "text", text: "Please analyze this medical record." },
            {
                type: "image_url",
                image_url: {
                    "url": fileUrl,
                },
            },
        ];

        // Note: This assumes the fileUrl IS an image. 
        // If it's a PDF, this specific call will fail or be invalid for Vision models unless converted.
        // For this implementation, we will assume image-based records (scans/photos) or warn.

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent as any }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        const result = JSON.parse(content) as AIAnalysisResult;
        return result;

    } catch (error: any) {
        if (error?.status === 429) {
            console.warn("OpenAI Quota Exceeded. Falling back to mock data for demonstration.");
            // Return mock data so the user can verify the UI
            return {
                summary: "⚠️ QUOTA EXCEEDED (MOCK RESPONSE): The patient's blood test results indicate mild anemia with hemoglobin levels slightly below the normal range (11.5 g/dL). White blood cell count is normal, suggesting no active infection. Platelet count is within healthy limits.",
                keyInsights: [
                    "Hemoglobin: 11.5 g/dL (Low)",
                    "WBC: 6.5 x 10^9/L (Normal)",
                    "Platelets: 250 x 10^9/L (Normal)",
                    "Ferritin: 20 ng/mL (Low)"
                ],
                recommendations: "Recommend iron supplementation and dietary changes to include more iron-rich foods. Follow up blood count in 4 weeks."
            };
        }

        console.error("AI Analysis Failed:", error);
        throw error;
    }
};
