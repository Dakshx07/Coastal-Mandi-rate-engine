
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

  // --- Sentence 1: Trend Identification ---
  // Find the species with the largest absolute percentage price change.
  let biggestMover = summaries[0];
  let maxAbsDiff = -1;

  summaries.forEach(s => {
    if (s.todayRate && s.change.status !== 'SAME') {
      const absDiff = Math.abs(s.change.percentDiff);
      if (absDiff > maxAbsDiff) {
        maxAbsDiff = absDiff;
        biggestMover = s;
      }
    }
  });

  let trendText = "🌊 The Big Wave: Calm waters today. Prices are stable across the board.";
  if (biggestMover && biggestMover.todayRate && maxAbsDiff > 0) {
    const direction = biggestMover.change.status === 'UP' ? 'surged' : 'dropped';
    const impact = biggestMover.change.status === 'UP' ? 'Good for sellers!' : 'Great for buyers!';
    trendText = `🌊 The Big Wave: ${biggestMover.species.name_en} prices ${direction} by ${biggestMover.change.percentDiff}% today. ${impact}`;
  }

  // --- Sentence 2: Actionable Advice ---
  let insightText = "⚓ Captain's Call: Hold steady. No major opportunities right now.";
  if (maxAbsDiff > 10 && biggestMover) {
    if (biggestMover.change.status === 'UP') {
      insightText = `⚓ Captain's Call: Sell ${biggestMover.species.name_en} now! Prices are peaking, lock in your profits.`;
    } else {
      insightText = `⚓ Captain's Call: Buy ${biggestMover.species.name_en}! It's a bargain at these low rates.`;
    }
  } else {
    const upCount = summaries.filter(s => s.change.status === 'UP').length;
    const downCount = summaries.filter(s => s.change.status === 'DOWN').length;
    if (upCount > downCount) insightText = "⚓ Captain's Call: It's a seller's market. Look to offload stock.";
    else if (downCount > upCount) insightText = "⚓ Captain's Call: It's a buyer's market. Stock up for the week.";
  }

  // --- Sentence 3: Outlook ---
  const healthText = "🔮 The Horizon: Expect moderate trading volume tomorrow based on current trends.";

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
export const generateFallbackPredictions = (currentPrice: number): PredictionPoint[] => {
  const predictions: PredictionPoint[] = [];
  let price = currentPrice;
  // Trend bias: slight upward drift
  const trend = 0.5;

  for (let i = 1; i <= 7; i++) {
    // Random fluctuation between -5% and +5%
    const changePercent = (Math.random() * 0.1) - 0.04;
    const change = price * changePercent + trend;
    price += change;

    predictions.push({
      date: getFutureDate(i),
      price: Math.round(price)
    });
  }
  return predictions;
};
