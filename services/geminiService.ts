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

    // Build detailed market data with trend analysis
    const marketDataStr = summaries.map(s => {
      const priceStr = s.todayRate ? `₹${s.todayRate.price_per_kg}/kg` : 'No data';
      const yesterdayPriceStr = s.yesterdayRate ? `₹${s.yesterdayRate.price_per_kg}/kg` : 'No prev';
      const trendEmoji = s.change.status === 'UP' ? '📈' : s.change.status === 'DOWN' ? '📉' : '➡️';
      const changePercent = s.change.percentDiff ? `${s.change.percentDiff > 0 ? '+' : ''}${s.change.percentDiff.toFixed(1)}%` : '0%';
      return `- ${s.species.name_en}: Today: ${priceStr} | Yesterday: ${yesterdayPriceStr} | Change: ${changePercent} ${trendEmoji}`;
    }).join('\n');

    // Calculate market summary stats
    const validRates = summaries.filter(s => s.todayRate);
    const upCount = summaries.filter(s => s.change.status === 'UP').length;
    const downCount = summaries.filter(s => s.change.status === 'DOWN').length;
    const avgChange = summaries.reduce((acc, s) => acc + (s.change.percentDiff || 0), 0) / summaries.length;

    const prompt = `
      You are a REAL-TIME fish market analyst specifically for **${harbourName}** in India.
      
      Current Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      
      ## Today's Market Data at ${harbourName}:
      ${marketDataStr}
      
      ## Market Summary:
      - Total Species: ${summaries.length}
      - Prices Rising: ${upCount} species
      - Prices Falling: ${downCount} species
      - Average Change: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)}%
      
      ## Your Task:
      Provide a UNIQUE analysis specific to ${harbourName} RIGHT NOW. Be actionable and specific.
      
      ## Required Format (use EXACTLY this structure):
      
      🎯 **Market Status**: [One line: Is it a BUYER'S market or SELLER'S market today at ${harbourName}?]
      
      💰 **Best Buy Now**: [Name ONE specific species that is BEST VALUE to buy right now and WHY - mention the actual price]
      
      ⚠️ **Avoid Buying**: [Name ONE species to AVOID buying today and WHY - too expensive or price rising]
      
      📊 **Price Alert**: [Mention the BIGGEST price movement today with exact percentage]
      
      🔮 **Tomorrow's Tip**: [Give ONE specific prediction for tomorrow based on today's trends]
      
      ## Rules:
      - Use ACTUAL prices from the data - be specific with ₹ amounts
      - Each response MUST be different - use the timestamp to vary your advice
      - Be confident and actionable - fishermen need clear guidance
      - Keep total response under 120 words
      - Focus on ${harbourName} specifically - don't give generic advice
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


