/**
 * Shared recharts theming for the Kairós dark surface (#121C2E).
 * Categorical order and sequential/diverging ramps were run through the
 * dataviz skill's validator against this surface — don't reorder the
 * categorical array casually, the ordering is what keeps adjacent slots
 * colorblind-distinguishable (worst adjacent pair sits in the 8-12 ΔE
 * floor band, which is only legal paired with direct labels/legends —
 * every chart here ships a legend or tooltip, never color alone).
 */

export const CATEGORICAL = ['#0284C7', '#8B5CF6', '#EC4899', '#0D9488', '#6366F1', '#EA580C'];

export const SEQUENTIAL = ['#16223A', '#0F3B52', '#0E6E93', '#0EA5C9', '#22D9FF'];

export const DIVERGING = {
  negative: '#EF4444',
  neutral: '#334155',
  positive: '#22C55E',
};

export const STATUS_COLORS = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#00CCFF',
  neutral: '#94A3B8',
};

export const CHART_CHROME = {
  grid: '#1f2c44',
  axis: '#1f2c44',
  axisText: '#94A3B8',
  tooltipBg: '#16223A',
  tooltipBorder: '#1f2c44',
  textPrimary: '#F8FAFC',
};

export const axisTickStyle = { fill: CHART_CHROME.axisText, fontSize: 11 };

export const tooltipContentStyle = {
  background: CHART_CHROME.tooltipBg,
  border: `1px solid ${CHART_CHROME.tooltipBorder}`,
  borderRadius: 12,
  color: CHART_CHROME.textPrimary,
  fontSize: 12,
  padding: '8px 12px',
};

export const tooltipLabelStyle = { color: CHART_CHROME.axisText, marginBottom: 4 };
