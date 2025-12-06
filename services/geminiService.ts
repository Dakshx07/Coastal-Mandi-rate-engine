
import { GoogleGenAI } from "@google/genai";
import { DailyRateSummary, Rate, PredictionPoint } from "../types";

// Determine if we are in a browser environment with the API key available
// Determine if we are in a browser environment with the API key available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const getMarketInsights = async (
  harbourName: string,
  summaries: DailyRateSummary[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Using local oracle.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const marketDataStr = summaries.map(s => {
      const priceStr = s.todayRate ? `₹${s.todayRate.price_per_kg}` : 'N/A';
      return `- ${s.species.name_en} (${s.species.name_local}): Current: ${priceStr}, Status: ${s.change.description}`;
    }).join('\n');

    const prompt = `
      Role: Fishing companion for ${harbourName}.
      Data:
      ${marketDataStr}
      
      Brief:
      1. 🌊 **Pulse**: Biggest mover & why.
      2. ⚓ **Action**: Buy/Sell/Hold recommendation.
      3. 🔮 **Outlook**: Short prediction.
      
      Keep it under 100 words. Friendly tone. No markdown bolding.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate insights.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};

export const predictPriceTrend = async (
  speciesName: string,
  history: Rate[]
): Promise<PredictionPoint[] | null> => {
  if (!apiKey || !history || history.length === 0) {
    return null; // Trigger fallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const historyStr = sortedHistory.map(h => `${h.date}: ₹${h.price_per_kg}`).join('\n');

    const prompt = `
      Based on the following historical price data for ${speciesName}, predict the daily prices for the NEXT 7 days (dates after the last entry).
      
      History:
      ${historyStr}
      
      Return ONLY a raw JSON array of objects. Do not use Markdown.
      Format: [{"date": "YYYY-MM-DD", "price": 123}, ...]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) return null;

    // Sanitize and parse JSON
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const predictions: PredictionPoint[] = JSON.parse(jsonStr);

    return predictions;
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return null;
  }
};
