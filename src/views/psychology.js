import { store } from '../store.js';

// Behavioural emotion tags
const EMOTION_TAGS = [
  'FOMO', 'Discipline', 'Revenge Trading',
  'Confidence', 'Patience', 'Overtrading',
  'Internal Liquidity', 'Liquidity but no trend'
];

// Entry model tags — rendered separately with special styling
const MODEL_TAGS = [
  {
    name: 'Conservative Entry Model',
    icon: 'shield-check',
    color: 'text-emerald-400',
    border: 'border-emerald-900/40',
    bg: 'bg-emerald-950/20',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.08)]',
    desc: 'Patient, confirmation-based entries. Waited for all confluences before executing.'
  },
  {
    name: 'Aggressive Entry Model',
    icon: 'zap',
    color: 'text-amber-400',
    border: 'border-amber-900/40',
    bg: 'bg-amber-950/20',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.08)]',
    desc: 'Anticipatory / early entries taken before full confirmation.'
  }
];

function buildTagCard(tag, trades, iconOverride = null, colorOverride = null, borderOverride = null, bgOverride = null, glowOverride = null, desc = null) {
  const taggedTrades = trades.filter(t => t.tags && t.tags.includes(tag));
  const count  = taggedTrades.length;
  const netPnL = taggedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const wins   = taggedTrades.filter(t => t.pnl > 0).length;
  const losses = taggedTrades.filter(t => t.pnl < 0).length;
  const wr     = count > 0 ? Math.round((wins / count) * 100) : 0;

  const pnlPositive = netPnL >= 0;
  const pnlClass    = pnlPositive ? 'text-neon-profit' : 'text-neon-loss';
  const pnlSign     = pnlPositive ? '+' : '';

  const border = borderOverride || 'border-gray-800/60';
  const bg     = bgOverride     || 'bg-dark-panel/40';
  const glow   = glowOverride   || '';

  return `
    <div class="glass-panel p-6 ${border} ${bg} ${glow} hover:border-gray-600 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-bold text-white leading-snug">${tag}</h3>
          <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">${count} trades</span>
        </div>
        ${desc ? `<p class="text-xs text-gray-500 mb-4 leading-relaxed">${desc}</p>` : ''}
      </div>

      <div>
        <!-- Win/Loss bar -->
        ${count > 0 ? `
          <div class="mb-4">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-neon-green">${wins}W</span>
              <span class="text-neon-red">${losses}L</span>
            </div>
            <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-neon-green to-emerald-500 rounded-full transition-all" style="width:${wr}%"></div>
            </div>
            <p class="text-right text-xs text-gray-600 mt-1">${wr}% WR</p>
          </div>` : `<div class="mb-4 text-xs text-gray-600 italic">No trades tagged yet</div>`}

        <div class="flex items-end justify-between border-t border-white/5 pt-3">
          <span class="text-xs text-gray-500">Net P&amp;L</span>
          <span class="text-2xl font-bold tracking-wide ${pnlClass}">
            ${pnlSign}$${Math.abs(netPnL).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </span>
        </div>
      </div>
    </div>
  `;
}

export function renderPsychology(container) {
  const trades = store.getTrades();

  const emotionCardsHtml = EMOTION_TAGS.map(tag => buildTagCard(tag, trades)).join('');

  const modelCardsHtml = MODEL_TAGS.map(m =>
    buildTagCard(m.name, trades, m.icon, m.color, m.border, m.bg, m.glow, m.desc)
  ).join('');

  container.innerHTML = `
    <div class="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in overflow-y-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 shrink-0">
        <div>
          <p class="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Mindset</p>
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <i data-lucide="brain" class="text-neon-blue"></i>
            Psychology
          </h2>
          <p class="text-gray-500 text-sm mt-1">The story behind your numbers</p>
        </div>
        <div class="glass-panel px-4 py-3 flex items-center gap-3 border-blue-900/40">
          <i data-lucide="bell" class="w-5 h-5 text-neon-blue"></i>
          <div>
            <div class="text-sm font-bold text-white">Daily reminder</div>
            <div class="text-xs text-gray-500">Log your mindset after each session</div>
          </div>
        </div>
      </div>

      <!-- Entry Models (top, highlighted) -->
      <div class="mb-6 shrink-0">
        <p class="text-xs font-semibold text-neon-blue uppercase tracking-widest mb-3 flex items-center gap-2">
          <i data-lucide="layers" class="w-3.5 h-3.5"></i> Entry Models
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${modelCardsHtml}
        </div>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3 mb-6 shrink-0">
        <div class="flex-1 h-px bg-gray-800"></div>
        <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest">Behavioural Patterns</p>
        <div class="flex-1 h-px bg-gray-800"></div>
      </div>

      <!-- Emotion / Behaviour Tags -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
        ${emotionCardsHtml}
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
