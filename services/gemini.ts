
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, EMERGENCY_KEYWORDS } from "../constants";
import { UserProfile, SmartwatchMetrics, InsurancePolicy } from "../types";

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export class GeminiService {
  private getSystemInstruction(user: UserProfile, watchMetrics?: SmartwatchMetrics) {
    let instruction = SYSTEM_INSTRUCTIONS.replace('{{COUNTRY}}', user.country || 'Global');
    if (watchMetrics) {
      instruction += `\n\nBIO-SYNC: HR: ${watchMetrics.heartRate}, Stress: ${watchMetrics.stressLevel}, HRV: ${watchMetrics.hrv}.`;
    }
    return instruction;
  }

  private createClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chat(prompt: string, user: UserProfile, history: any[] = [], watchMetrics?: SmartwatchMetrics) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: this.getSystemInstruction(user, watchMetrics),
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: GroundingSource[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });

    return { text: response.text, isRedFlag: EMERGENCY_KEYWORDS.some(kw => prompt.toLowerCase().includes(kw)), sources };
  }

  async analyzeReport(base64Data: string, mimeType: string, user: UserProfile, insurance?: InsurancePolicy) {
    const ai = this.createClient();
    const insuranceContext = insurance 
      ? `User has insurance from ${insurance.provider} (Plan: ${insurance.planName}). Benefits include: ${insurance.preventativeBenefits?.join(', ')}. Policy Summary: ${insurance.coverageSummary}.`
      : "No insurance policy provided.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: `CRITICAL SYSTEM TASK: Clinical & Financial Auditor.
            
            USER PROFILE:
            - Age: ${user.age}
            - Country: ${user.country}
            - Insurance Context: ${insuranceContext}

            GOAL: 
            Analyze the attached image/document (it is either a Medication Prescription or a Hospital Bill). 

            1. EXTRACT PATIENT NAME: Find the full name of the patient listed.
            2. DETECT ERRORS: Be aggressive in finding red flags, redundancies, or billing errors.

            IF IT IS A PRESCRIPTION:
            - Explain EXACT clinical use (why) and reasoning (how) for each.
            - AUDIT: Identify 'faultyMeds'—redundancies, high-risk interactions, or clinically unnecessary items.

            IF IT IS A HOSPITAL BILL:
            - Extract hospital name and total spent.
            - AUDIT: Cross-reference charges against insurance. Identify 'coverageDiscrepancies'.

            BIO-ADVOCACY EMAIL (MANDATORY): 
            You MUST generate a complete, professional, firm email draft. 
            - If errors were found, demand rectification.
            - If no errors were found, provide a "Clinical Verification Request" email instead.
            - Use a professional "Clinical Advocate" tone.

            Output JSON schema:
            {
              "docType": "prescription" | "bill" | "lab_report",
              "patientName": "string",
              "hospitalName": "string",
              "summary": "snappy summary",
              "deducedCondition": "string",
              "clinicalIntegrity": {
                "medications": [{"name": "string", "dosage": "string", "purpose": "string", "reasoning": "string"}],
                "faultyMeds": ["string explaining specific error"]
              },
              "billingAudit": {
                "totalAmount": "string",
                "currency": "string",
                "items": [{"item": "string", "cost": number}],
                "coverageDiscrepancies": ["string"]
              },
              "bioAdvocacyEmail": {
                "primaryErrorHighlight": "Brief 1-sentence summary of the main error/risk found",
                "recipientEmail": "string",
                "subject": "Firm subject line",
                "body": "Complete email body content"
              },
              "recommendedQuestions": ["string"]
            }` }
        ]
      },
      config: { responseMimeType: "application/json" },
    });

    try {
      const text = response.text || "{}";
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      console.error("Analysis Parse Error:", e);
      return { summary: "Analysis failed. Please ensure the image is clear." };
    }
  }

  async analyzePolicy(base64Data: string, mimeType: string, user: UserProfile) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: `Analyze this insurance policy document.
            Output JSON with these keys:
            - provider: Name of insurer
            - planName: Name of plan
            - longevityScore: A score from 0-100
            - preventativeBenefits: Array of key covered preventative screenings.
            - coverageSummary: Professional summary.
            - optimizationTip: 1 tip.` }
        ]
      },
      config: { responseMimeType: "application/json" },
    });

    try {
      const text = response.text || "{}";
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      return { provider: "Unknown", coverageSummary: "Could not parse policy details." };
    }
  }

  async analyzeNutrition(mealDescription: string, user: UserProfile) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User: ${user.name}, Country: ${user.country}. 
        Analyze this meal: "${mealDescription}". 
        Output JSON with keys: calories, protein, carbs, fats, isHealthy, healthTip.`,
      config: { responseMimeType: "application/json" },
    });

    try {
      const text = response.text || "{}";
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      return { calories: 0, protein: 'N/A', carbs: 'N/A', fats: 'N/A', isHealthy: false, healthTip: "Analysis failed." };
    }
  }

  async getMedicationInfo(name: string, user: UserProfile) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Medication: ${name}. Give me the 'Lifestyle Vibe'.`,
    });
    return response.text;
  }

  async fetchMedicareNews(user: UserProfile) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current biggest health/bio-hacking trend for 20-year-olds in ${user.country}. 1 sentence.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return response.text;
  }

  async findNearbyProviders(query: string, lat: number, lng: number) {
    const ai = this.createClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: `Find high-performance clinics or specialist help for: "${query}" near ${lat}, ${lng}.` }] }],
      config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } },
    });
    return { places: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c:any) => c.maps).map((c:any) => ({ title: c.maps.title, uri: c.maps.uri })) || [] };
  }
}

export const gemini = new GeminiService();
