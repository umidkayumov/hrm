import { GoogleGenAI } from "@google/genai";
import { Submission } from "../types";

const API_KEY = process.env.API_KEY || '';

export const summarizeCandidate = async (candidate: Submission): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Unable to generate AI summary.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Prepare the prompt
    const answersText = Object.entries(candidate.answers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `
      Act as an expert HR Recruiter. Summarize the following job application candidate profile into a concise, 3-sentence professional summary highlighting their key strengths and potential fit.
      
      Candidate Name: ${candidate.candidateName}
      Submission Data:
      ${answersText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI summary. Please try again later.";
  }
};
