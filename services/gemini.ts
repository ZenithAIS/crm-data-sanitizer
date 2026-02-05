
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types.ts";

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze the provided audio and return a detailed JSON object with the following structure:
            {
              "executiveSummary": "A concise summary of the key points discussed.",
              "actionItems": [
                { "task": "The specific action to be taken", "assignee": "Name or role mentioned, otherwise 'Unassigned'" }
              ],
              "sentiment": {
                "label": "Positive, Neutral, or Negative",
                "score": 0.0 to 1.0,
                "explanation": "Brief reasoning for this sentiment"
              },
              "transcription": "The full verbatim text of the audio"
            }
            Ensure the response is valid JSON.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                assignee: { type: Type.STRING },
              },
              required: ["task", "assignee"]
            }
          },
          sentiment: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              score: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
            required: ["label", "score", "explanation"]
          },
          transcription: { type: Type.STRING },
        },
        required: ["executiveSummary", "actionItems", "sentiment", "transcription"]
      }
    }
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as AnalysisResult;
};
