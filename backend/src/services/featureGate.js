export const plans = {
  free: {
    label: "Free",
    watchlistLimit: 5,
    historyLimit: 10,
    premiumMetrics: false,
    detailedAnalysis: false,
    chartPoints: 36
  },
  premium: {
    label: "Premium",
    watchlistLimit: 50,
    historyLimit: 50,
    premiumMetrics: true,
    detailedAnalysis: true,
    chartPoints: 72
  }
};

export function planFor(user) {
  return plans[user?.plan === "premium" ? "premium" : "free"];
}

export function applyPlanToAnalysis(analysis, plan) {
  if (plan.premiumMetrics) {
    return {
      ...analysis,
      plan: plan.label,
      premiumLocked: false,
      premiumTeaser: null
    };
  }

  const { premiumMetrics, ...basicMetrics } = analysis.metrics;
  return {
    ...analysis,
    chart: analysis.chart.slice(-plan.chartPoints),
    metrics: basicMetrics,
    plan: plan.label,
    premiumLocked: true,
    premiumTeaser: {
      title: "Premium Research freischalten",
      items: [
        "Mehr Watchlist-Plaetze",
        "Detailliertere Kennzahlen",
        "Laengere Historie",
        "Erweiterte Chart-Ansichten"
      ]
    }
  };
}
