import { store } from '../store.js';

export function renderDashboard(container) {
  const stats   = store.getTradeStats();
  const capital = store.getCapital();
  const balance = capital + stats.totalPnL;

  const pnlPositive = stats.totalPnL >= 0;
  const pnlSign     = pnlPositive ? '+' : '';
  const balPositive = balance >= capital;

  // ── Monthly breakdown ──────────────────────────────────────────────
  const trades   = store.getTrades();
  const now      = new Date();
  const thisYM   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  let monthPnL   = 0;
  trades.forEach(t => { if (t.date.startsWith(thisYM)) monthPnL += t.pnl; });

  // ── Gross profit / loss ───────────────────────────────────────────
  let grossProfit = 0, grossLoss = 0;
  trades.forEach(t => {
    if (t.pnl > 0) grossProfit += t.pnl;
    if (t.pnl < 0) grossLoss  += Math.abs(t.pnl);
  });
  const totalVol  = grossProfit + grossLoss;
  const profitPct = totalVol === 0 ? 50 : Math.round((grossProfit / totalVol) * 100);
  const lossPct   = 100 - profitPct;
  const returnPct = capital > 0 ? ((stats.totalPnL / capital) * 100).toFixed(2) : '0.00';
  const monthSign = monthPnL >= 0 ? '+' : '';

  // ── Best / Worst trade ────────────────────────────────────────────
  let bestTrade = 0, worstTrade = 0;
  trades.forEach(t => {
    if (t.pnl > bestTrade)  bestTrade  = t.pnl;
    if (t.pnl < worstTrade) worstTrade = t.pnl;
  });

  container.innerHTML = `
    <div class="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in overflow-y-auto h-full">

      <!-- ── Page Header ── -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <p class="text-gray-500 text-sm font-medium uppercase tracking-widest mb-1">Overview</p>
          <h2 class="text-4xl font-bold text-white tracking-tight">Dashboard</h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="glass-panel px-4 py-2 flex items-center gap-2 text-sm">
            <span class="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
            <span class="text-gray-300">Live Tracking</span>
          </div>
          <button id="btn-edit-capital"
            class="glass-panel px-4 py-2 flex items-center gap-2 text-sm text-gray-400 hover:text-neon-blue hover:border-neon-blue/40 transition-all">
            <i data-lucide="settings-2" class="w-4 h-4"></i> Set Capital
          </button>
        </div>
      </div>

      <!-- ── Top KPI Row ── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <!-- My Capital -->
        <div class="glass-panel p-5 group hover:border-gray-600 transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">Initial Capital</span>
            <div class="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <i data-lucide="wallet" class="w-4 h-4 text-neon-blue"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-white">$${capital.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p class="text-xs text-gray-500 mt-1">Starting account balance</p>
        </div>

        <!-- Current Balance -->
        <div class="glass-panel p-5 border-b-2 ${balPositive ? 'border-b-neon-green' : 'border-b-neon-red'} group hover:border-gray-600 transition-all" style="border-bottom-color: ${balPositive ? '#00ff88' : '#ff3366'}">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">Current Balance</span>
            <div class="w-8 h-8 rounded-lg ${balPositive ? 'bg-emerald-900/30' : 'bg-rose-900/30'} flex items-center justify-center">
              <i data-lucide="trending-${balPositive ? 'up' : 'down'}" class="w-4 h-4 ${balPositive ? 'text-neon-green' : 'text-neon-red'}"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-white">$${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p class="text-xs mt-1 ${balPositive ? 'text-neon-green' : 'text-neon-red'} font-semibold">
            ${pnlSign}${returnPct}% all time
          </p>
        </div>

        <!-- Total P&L -->
        <div class="glass-panel p-5 border-b-2 group hover:border-gray-600 transition-all" style="border-bottom-color: ${pnlPositive ? '#00ff88' : '#ff3366'}">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">Total P&amp;L</span>
            <div class="w-8 h-8 rounded-lg ${pnlPositive ? 'bg-emerald-900/30' : 'bg-rose-900/30'} flex items-center justify-center">
              <i data-lucide="dollar-sign" class="w-4 h-4 ${pnlPositive ? 'text-neon-green' : 'text-neon-red'}"></i>
            </div>
          </div>
          <p class="text-2xl font-bold ${pnlPositive ? 'text-neon-profit' : 'text-neon-loss'}">
            ${pnlSign}$${stats.totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </p>
          <p class="text-xs text-gray-500 mt-1">${stats.totalTrades} total trades executed</p>
        </div>

        <!-- Win Rate -->
        <div class="glass-panel p-5 group hover:border-gray-600 transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">Win Rate</span>
            <div class="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
              <i data-lucide="target" class="w-4 h-4 text-purple-400"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-white">${stats.winRate}%</p>
          <div class="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-neon-blue to-purple-500 transition-all duration-1000"
                 style="width: ${stats.winRate}%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1.5">${stats.wins}W — ${stats.losses}L</p>
        </div>
      </div>

      <!-- ── Middle Row ── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        <!-- Left: P&L Chart Panel (Pie) -->
        <div class="glass-panel p-6 flex items-center gap-6">
          <!-- Donut -->
          <div class="relative w-36 h-36 shrink-0 rounded-full"
               style="background: conic-gradient(#00ff88 0% ${profitPct}%, #ff3366 ${profitPct}% 100%);
                      box-shadow: 0 0 30px rgba(0,255,136,0.15), 0 0 60px rgba(255,51,102,0.1);">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-[105px] h-[105px] bg-dark-bg rounded-full flex flex-col items-center justify-center">
                <span class="text-[10px] text-gray-500 uppercase tracking-wider">Net P&L</span>
                <span class="font-bold text-sm ${pnlPositive ? 'text-neon-profit' : 'text-neon-loss'}">
                  ${pnlSign}$${Math.abs(stats.totalPnL) > 9999
                    ? (stats.totalPnL/1000).toFixed(1)+'k'
                    : stats.totalPnL.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          <!-- Legend -->
          <div class="flex-1 space-y-4">
            <div>
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-xs text-gray-500">Gross Profit</span>
                <span class="text-sm font-bold text-neon-green">${profitPct}%</span>
              </div>
              <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-neon-green rounded-full" style="width:${profitPct}%"></div>
              </div>
              <p class="text-white font-semibold text-sm mt-1">$${grossProfit.toLocaleString(undefined,{minimumFractionDigits:0})}</p>
            </div>
            <div>
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-xs text-gray-500">Gross Loss</span>
                <span class="text-sm font-bold text-neon-red">${lossPct}%</span>
              </div>
              <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-neon-red rounded-full" style="width:${lossPct}%"></div>
              </div>
              <p class="text-white font-semibold text-sm mt-1">$${grossLoss.toLocaleString(undefined,{minimumFractionDigits:0})}</p>
            </div>
          </div>
        </div>

        <!-- Middle: This Month -->
        <div class="glass-panel p-6 flex flex-col justify-between border-l-4 ${monthPnL >= 0 ? 'border-l-neon-green' : 'border-l-neon-red'}"
             style="border-left-color: ${monthPnL >= 0 ? '#00ff88' : '#ff3366'}">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">This Month</span>
              <i data-lucide="calendar-days" class="w-4 h-4 text-gray-600"></i>
            </div>
            <p class="text-3xl font-bold mt-2 ${monthPnL >= 0 ? 'text-neon-profit' : 'text-neon-loss'}">
              ${monthSign}$${monthPnL.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </p>
          </div>
          <p class="text-xs text-gray-600 mt-4">Monthly P&L vs capital:
            <span class="${monthPnL >= 0 ? 'text-neon-green' : 'text-neon-red'} font-semibold">
              ${monthSign}${capital > 0 ? ((monthPnL/capital)*100).toFixed(2) : '0.00'}%
            </span>
          </p>
        </div>

        <!-- Right: Best / Worst -->
        <div class="glass-panel p-6 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold uppercase tracking-widest text-gray-500">Trade Extremes</span>
            <i data-lucide="activity" class="w-4 h-4 text-gray-600"></i>
          </div>
          <div class="space-y-4 mt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center">
                  <i data-lucide="arrow-up" class="w-3 h-3 text-neon-green"></i>
                </div>
                <span class="text-sm text-gray-400">Best Trade</span>
              </div>
              <span class="text-sm font-bold text-neon-profit">+$${bestTrade.toFixed(2)}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-neon-red/10 flex items-center justify-center">
                  <i data-lucide="arrow-down" class="w-3 h-3 text-neon-red"></i>
                </div>
                <span class="text-sm text-gray-400">Worst Trade</span>
              </div>
              <span class="text-sm font-bold text-neon-loss">-$${Math.abs(worstTrade).toFixed(2)}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <i data-lucide="layers" class="w-3 h-3 text-purple-400"></i>
                </div>
                <span class="text-sm text-gray-400">Avg per Trade</span>
              </div>
              <span class="text-sm font-bold text-white">
                ${stats.totalTrades > 0 ? (stats.totalPnL >= 0 ? '+' : '') + '$' + (stats.totalPnL / stats.totalTrades).toFixed(2) : '$0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Recent Trades ── -->
      <div class="glass-panel p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <i data-lucide="clock" class="w-4 h-4 text-neon-blue"></i> Recent Trades
          </h3>
          <span class="text-xs text-gray-600">${Math.min(5, trades.length)} of ${trades.length}</span>
        </div>

        ${trades.length === 0 ? `
          <div class="text-center py-8">
            <i data-lucide="inbox" class="w-8 h-8 text-gray-700 mx-auto mb-2"></i>
            <p class="text-gray-600 text-sm">No trades yet. Click a day on the Calendar to add one.</p>
          </div>
        ` : `
          <div class="space-y-2">
            ${[...trades].reverse().slice(0, 5).map(t => `
              <div class="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center
                    ${t.type === 'Buy' ? 'bg-emerald-900/30' : 'bg-rose-900/30'}">
                    <i data-lucide="${t.type === 'Buy' ? 'trending-up' : 'trending-down'}"
                       class="w-4 h-4 ${t.type === 'Buy' ? 'text-neon-green' : 'text-neon-red'}"></i>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">${t.asset}</p>
                    <p class="text-xs text-gray-500">${t.date} · ${t.type} · ${t.lots || t.qty || '—'} lots</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold ${t.pnl >= 0 ? 'text-neon-profit' : 'text-neon-loss'}">
                    ${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}
                  </p>
                  ${t.pips ? `<p class="text-xs text-gray-500">${t.pips}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  container.querySelector('#btn-edit-capital').addEventListener('click', () => {
    const newCap = prompt('Enter your initial capital (USD $):', capital);
    if (newCap && !isNaN(newCap)) store.setCapital(parseFloat(newCap));
  });
}
