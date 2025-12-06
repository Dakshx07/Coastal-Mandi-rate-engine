import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyRateSummary, Rate, PredictionPoint } from "../types";

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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const marketDataStr = summaries.map(s => {
      const priceStr = s.todayRate ? `₹${s.todayRate.price_per_kg}` : 'N/A';
      return `- ${s.species.name_en} (${s.species.name_local}): Current: ${priceStr}, Status: ${s.change.description}`;
    }).join('\n');

    const prompt = `
      Role: Expert Market Analyst for ${harbourName} Fish Market.
      Current Time: ${new Date().toLocaleString()} (Vary your response based on this specific moment).
      
      Data:
      ${marketDataStr}
      
      Task: Provide a unique, non-repetitive market summary for ${harbourName}.
      
      Format:
      1. 🌊 **Pulse**: Identify the single most interesting price movement today.
      2. ⚓ **Action**: Give one specific piece of advice for a buyer or seller.
      3. 🔮 **Outlook**: Predict tomorrow's volume based on today's prices.
      
      Constraints:
      - Keep it under 80 words.
      - Be specific to the data provided.
      - Do NOT repeat generic phrases.
      - Use a professional but accessible tone.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Could not generate insights.";
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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const historyStr = sortedHistory.map(h => `${h.date}: ₹${h.price_per_kg}`).join('\n');

    const prompt = `
      Based on the following historical price data for ${speciesName}, predict the daily prices for the NEXT 7 days (dates after the last entry).
      
      History:
      ${historyStr}
      
      Return ONLY a raw JSON array of objects. Do not use Markdown.
      Format: [{"date": "YYYY-MM-DD", "price": 123}, ...]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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


