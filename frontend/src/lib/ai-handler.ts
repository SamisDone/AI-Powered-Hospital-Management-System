import { analyzeMedicalRecord as analyzeWithGemini } from "./gemini";
import { analyzeMedicalRecord as analyzeWithHF } from "./huggingface";

/**
 * Unified AI Handler that tries Gemini first, then fallbacks to Hugging Face
 */
export async function analyzeMedicalRecord(fileUrl: string): Promise<string> {
    const errors: string[] = [];

    // Try Gemini first
    try {
        console.log("Trying Gemini analysis...");
        return await analyzeWithGemini(fileUrl);
    } catch (error: any) {
        console.warn("Gemini analysis failed:", error.message);
        errors.push(`Gemini: ${error.message}`);
    }

    // Fallback to Hugging Face
    try {
        console.log("Falling back to Hugging Face analysis...");
        return await analyzeWithHF(fileUrl);
    } catch (error: any) {
        console.warn("Hugging Face analysis failed:", error.message);
        errors.push(`Hugging Face: ${error.message}`);
    }

    // If both failed
    throw new Error(`All AI services failed. \n${errors.join('\n')}`);
}
