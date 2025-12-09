
import { RateChangeResult, DailyRateSummary, OracleSummary, VerificationLevel, PredictionPoint } from './types';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysOffset);
  return formatDate(date);
};

export const getFutureDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatDate(date);
};

export const calculate_rate_change = (price_today: number, price_yesterday: number): RateChangeResult => {
  if (price_yesterday === 0) {
    return {
      status: 'SAME',
      percentDiff: 0,
      description: 'No previous data'
    };
  }

  const diff = price_today - price_yesterday;
  const percentDiff = (Math.abs(diff) / price_yesterday) * 100;
  const roundedPercent = parseFloat(percentDiff.toFixed(2));

  let status: 'UP' | 'DOWN' | 'SAME' = 'SAME';
  if (diff > 0) status = 'UP';
  if (diff < 0) status = 'DOWN';

  let description = "No Change";
  if (status === 'UP') description = `Up ${roundedPercent}%`;
  if (status === 'DOWN') description = `Down ${roundedPercent}%`;

  return {
    status,
    percentDiff: roundedPercent,
    description
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const parseCSV = (csvText: string): { species_id: string, price: number }[] => {
  return csvText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split(',');
      if (parts.length < 2) return null;
      const species_id = parts[0].trim();
      const price = parseFloat(parts[1].trim());
      if (!species_id || isNaN(price)) return null;
      return { species_id, price };
    })
    .filter((item): item is { species_id: string, price: number } => item !== null);
};

export const shouldTriggerNotification = (oldPrice: number, newPrice: number): boolean => {
  if (oldPrice === 0) return false;
  const diff = Math.abs(newPrice - oldPrice);
  const percentDiff = (diff / oldPrice) * 100;
  return percentDiff > 10;
};

// ------------------------------------------------------------------
// INNOVATION & DATA ACCURACY LOGIC
// ------------------------------------------------------------------

/**
 * Calculates the Rate Confidence Score (0-100) based on source verification and sampling.
 * Formula: (Lots_Checked / 10 * 50) + (Level_Weight / 10 * 50)
 */
export const calculateConfidenceScore = (level: VerificationLevel, lots_checked: number): number => {
  let levelWeight = 1;
  // Define Level Weights
  if (level === 'Verified') levelWeight = 10;
  else if (level === 'Phone Call') levelWeight = 5;
  else if (level === 'Unconfirmed') levelWeight = 1;

  // Clamp lots to max 10 for calculation (as max weight is for 10 lots)
  const cappedLots = Math.min(lots_checked, 10);

  // Calculate components
  const lotsScore = (cappedLots / 10) * 50;
  const levelScore = (levelWeight / 10) * 50;

  return Math.round(lotsScore + levelScore);
};

/**
 * Validates if a price change is abnormal (>30%) to prevent data entry errors.
 */
export const check_abnormal_change = (price_today: number, price_yesterday: number): boolean => {
  if (price_yesterday === 0) return false;

  const diff = Math.abs(price_today - price_yesterday);
  const percentDiff = (diff / price_yesterday);

  // Alert if change is greater than 30%
  return percentDiff > 0.30;
};

/**
 * Generates a 3-sentence Market Oracle Summary using deterministic logic.
 * 1. Trend Identification
 * 2. Market Health
 * 3. Actionable Insight
 */
export const generate_oracle_summary = (summaries: DailyRateSummary[]): OracleSummary => {
  if (summaries.length === 0) {
    return {
      trend: "No market data available yet.",
      health: "Market status unknown.",
      insight: "Please check back later."
    };
  }

  // --- 1. Top Movers Analysis ---
  const sortedByChange = [...summaries].sort((a, b) => Math.abs(b.change.percentDiff) - Math.abs(a.change.percentDiff));
  const biggestMover = sortedByChange[0];

  let trendText = "🌊 The waters are calm today. Prices are stable across the board.";

  if (biggestMover && Math.abs(biggestMover.change.percentDiff) > 2) {
    const direction = biggestMover.change.status === 'UP' ? 'surged' : 'dropped';
    const impact = biggestMover.change.status === 'UP' ? 'Sellers are making good profit.' : 'Buyers are finding great deals.';
    trendText = `🌊 Big Wave: ${biggestMover.species.name_en} prices ${direction} by ${biggestMover.change.percentDiff.toFixed(1)}% today. ${impact}`;
  }

  // --- 2. Actionable Advice (Captain's Call) ---
  let insightText = "⚓ Captain's Call: Hold steady. No major opportunities right now.";

  // Find best buy (biggest drop)
  const topDrop = summaries.filter(s => s.change.status === 'DOWN').sort((a, b) => b.change.percentDiff - a.change.percentDiff)[0];
  // Find best sell (biggest gain)
  const topGain = summaries.filter(s => s.change.status === 'UP').sort((a, b) => b.change.percentDiff - a.change.percentDiff)[0];

  if (topDrop && topDrop.change.percentDiff > 5) {
    insightText = `⚓ Captain's Call: BUY ${topDrop.species.name_en}! Price is down ${topDrop.change.percentDiff.toFixed(1)}%. Great time to stock up.`;
  } else if (topGain && topGain.change.percentDiff > 5) {
    insightText = `⚓ Captain's Call: SELL ${topGain.species.name_en}! Price is up ${topGain.change.percentDiff.toFixed(1)}%. Lock in your profits.`;
  } else {
    const upCount = summaries.filter(s => s.change.status === 'UP').length;
    const downCount = summaries.filter(s => s.change.status === 'DOWN').length;
    if (upCount > downCount) insightText = "⚓ Captain's Call: It's a seller's market today. Most prices are trending up.";
    else if (downCount > upCount) insightText = "⚓ Captain's Call: It's a buyer's market today. Good deals available on many species.";
  }

  // --- 3. Market Outlook (The Horizon) ---
  let healthText = "🔮 The Horizon: Market volume looks normal.";
  const volatileCount = summaries.filter(s => Math.abs(s.change.percentDiff) > 5).length;

  if (volatileCount > 3) {
    healthText = "🔮 The Horizon: High volatility detected. Expect rapid price changes tomorrow.";
  } else {
    healthText = "🔮 The Horizon: Prices are stable. Expect steady trading conditions tomorrow.";
  }

  return {
    trend: trendText,
    health: insightText, // Swapped for better UI mapping
    insight: healthText
  };
};

/**
 * Generates fallback predictions using a simple random walk with drift.
 * Used when AI service is unavailable.
 */
export const generateFallbackPredictions = (currentPrice: number, speciesName: string = ''): PredictionPoint[] => {
  const predictions: PredictionPoint[] = [];
  let price = currentPrice;

  // Create a simple hash from species name to seed the trend
  let hash = 0;
  for (let i = 0; i < speciesName.length; i++) {
    hash = speciesName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Determine trend based on hash (some go up, some go down, some volatile)
  const trendType = Math.abs(hash) % 3; // 0: Up, 1: Down, 2: Volatile
  const volatility = (Math.abs(hash) % 10) / 100 + 0.02; // 0.02 to 0.12

  for (let i = 1; i <= 7; i++) {
    let changePercent = 0;

    if (trendType === 0) {
      // Upward trend
      changePercent = (Math.random() * volatility);
    } else if (trendType === 1) {
      // Downward trend
      changePercent = -(Math.random() * volatility);
    } else {
      // Volatile
      changePercent = (Math.random() - 0.5) * (volatility * 2);
    }

    const change = price * changePercent;
    price += change;

    predictions.push({
      date: getFutureDate(i),
      price: Math.round(price)
    });
  }
  return predictions;
};

/**
 * Generates a dynamic, algorithm-based forecast message for a specific species.
 * Replaces hardcoded text with "real" analysis based on prediction data.
 */
export const generateSpeciesForecast = (
  speciesName: string,
  currentPrice: number,
  predictions: PredictionPoint[]
): string => {
  if (!predictions || predictions.length === 0) {
    return "Insufficient data for a reliable forecast.";
  }

  const nextDayPrice = predictions[0].price;
  const weekPrice = predictions[6].price; // 7th day

  const shortTermDiff = nextDayPrice - currentPrice;
  const longTermDiff = weekPrice - currentPrice;

  const shortTermPercent = (shortTermDiff / currentPrice) * 100;
  const longTermPercent = (longTermDiff / currentPrice) * 100;

  // Logic for the message
  if (longTermPercent > 15) {
    return `Strong bullish trend detected for ${speciesName}. Prices are expected to surge by ~${Math.round(longTermPercent)}% over the week. Recommendation: Hold stock for better margins.`;
  } else if (longTermPercent < -15) {
    return `Bearish outlook for ${speciesName}. Prices might drop by ~${Math.abs(Math.round(longTermPercent))}% this week. Recommendation: Sell now to avoid further depreciation.`;
  } else if (shortTermPercent > 5) {
    return `Short-term spike expected. Prices may rise tomorrow. Good opportunity for quick sales before stabilization.`;
  } else if (shortTermPercent < -5) {
    return `Minor dip expected tomorrow. Buyers might find better deals if they wait 24 hours.`;
  } else if (longTermPercent > 5) {
    return `Steady upward growth. Expect consistent but small gains throughout the week.`;
  } else if (longTermPercent < -5) {
    return `Slow decline predicted. Consider clearing stock sooner rather than later.`;
  } else {
    return `Market is stable. ${speciesName} prices are expected to remain within a narrow range. Safe to trade as usual with low volatility.`;
  }
};
