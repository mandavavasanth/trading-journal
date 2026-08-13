import { store } from '../store.js';

let currentDate = new Date();
let activeDayPanel = null; // track which date has the panel open

export function renderCalendar(container, openTradeModal) {
  const trades = store.getTrades();
  
  // Aggregate PnL per day
  const dailyPnL = {};
  trades.forEach(t => {
    if (!dailyPnL[t.date]) dailyPnL[t.date] = 0;
    dailyPnL[t.date] += t.pnl;
  });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate      = new Date(year, month + 1, 0).getDate();
  const prevLastDate  = new Date(year, month, 0).getDate();
  
  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];

  // ── Monthly stats for analytics ──────────────────────────────────────────
  let monthPnL = 0, grossProfit = 0, grossLoss = 0, monthWins = 0, monthLosses = 0;
  const monthPrefix = `${year}-${String(month+1).padStart(2, '0')}`;
  const monthTrades = trades.filter(t => t.date.startsWith(monthPrefix));
  monthTrades.forEach(t => {
    monthPnL += t.pnl;
    if (t.pnl > 0) { grossProfit += t.pnl; monthWins++; }
    if (t.pnl < 0) { grossLoss  += Math.abs(t.pnl); monthLosses++; }
  });

  const capital         = store.getCapital();
  const currentBalance  = capital + monthPnL;
  const totalVol        = grossProfit + grossLoss;
  const profitPct       = totalVol === 0 ? 50 : Math.round((grossProfit / totalVol) * 100);
  const lossPct         = 100 - profitPct;
  const returnOnCapital = ((monthPnL / capital) * 100).toFixed(2);
  const monthPnlSign    = monthPnL >= 0 ? '+' : '';

  // ── Build calendar grid ───────────────────────────────────────────────────
  let daysHtml = '';

  // Previous month ghost days
  for (let x = firstDayIndex; x > 0; x--) {
    daysHtml += `<div class="p-3 min-h-[110px] border border-gray-800/30 rounded-2xl opacity-20 bg-black/10">
      <span class="text-sm font-medium text-gray-600">${prevLastDate - x + 1}</span>
    </div>`;
  }

  // Current month days
  const today = new Date();
  for (let i = 1; i <= lastDate; i++) {
    const dStr      = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const dayTrades = trades.filter(t => t.date === dStr);
    const pnl       = dailyPnL[dStr];
    const isToday   = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isActive  = activeDayPanel === dStr;

    let cardBase = 'border-gray-800/60 hover:border-gray-500 bg-dark-panel/40 hover:bg-dark-panel/80';
    let pnlHtml  = '';

    if (pnl !== undefined) {
      if (pnl >= 0) {
        cardBase = 'border-neon-green/40 bg-neon-green/5 hover:border-neon-green/80 shadow-[0_0_12px_rgba(0,255,136,0.07)]';
        pnlHtml  = `<div class="mt-1.5 text-xs font-bold text-neon-profit">+$${pnl.toFixed(2)}</div>`;
      } else {
        cardBase = 'border-neon-red/40 bg-neon-red/5 hover:border-neon-red/80 shadow-[0_0_12px_rgba(255,51,102,0.07)]';
        pnlHtml  = `<div class="mt-1.5 text-xs font-bold text-neon-loss">-$${Math.abs(pnl).toFixed(2)}</div>`;
      }
    }
    if (isToday)  cardBase += ' ring-2 ring-neon-blue ring-offset-1 ring-offset-black';
    if (isActive) cardBase += ' ring-2 ring-neon-blue/60';

    // Trade count badge
    const badgeHtml = dayTrades.length > 0
      ? `<span class="px-1.5 py-0.5 rounded-md text-[9px] font-bold ${pnl >= 0 ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-red/15 text-neon-red'}">
           ${dayTrades.length}T
         </span>`
      : '';

    daysHtml += `
      <div class="p-3 min-h-[110px] border ${cardBase} rounded-2xl cursor-pointer transition-all duration-200 relative group flex flex-col" 
           data-date="${dStr}">
        <!-- Header row: date number + quick-add -->
        <div class="flex items-center justify-between mb-0.5">
          <span class="text-sm font-bold ${pnl !== undefined ? 'text-white' : 'text-gray-500'} group-hover:text-white transition-colors">${i}</span>
          <div class="flex items-center gap-1">
            ${badgeHtml}
            <button class="btn-quick-add opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md bg-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-black transition-all" 
                    data-date="${dStr}" title="Add new trade on ${dStr}">
              <i data-lucide="plus" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
        <!-- P&L -->
        ${pnlHtml}
        <!-- Bottom: first asset name -->
        ${dayTrades.length > 0 ? `
          <div class="mt-auto pt-1.5 border-t border-white/5">
            <span class="text-[10px] text-gray-500 truncate block">${dayTrades.map(t=>t.asset).join(', ')}</span>
          </div>` : ''}
      </div>
    `;
  }

  // ── Render page ──────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col animate-fade-in overflow-y-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 shrink-0">
        <div>
          <p class="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Interactive</p>
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <i data-lucide="calendar" class="text-neon-blue"></i>
            Trading Calendar
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-add-trade-calendar" class="btn-primary py-2 px-4 text-sm font-semibold flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Trade
          </button>
          <div class="flex items-center gap-2 bg-dark-panel p-1.5 rounded-xl border border-gray-800">
            <button id="prev-month" class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            <div class="text-base font-bold text-white min-w-[140px] text-center">${monthNames[month]} ${year}</div>
            <button id="next-month" class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="glass-panel p-4 flex flex-col mb-4 shrink-0 rounded-3xl">
        <div class="grid grid-cols-7 gap-2 mb-3 pb-2 border-b border-gray-800/60">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>
            `<div class="py-1 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">${d}</div>`
          ).join('')}
        </div>
        <div class="grid grid-cols-7 gap-2" id="cal-grid">
          ${daysHtml}
        </div>
      </div>

      <!-- Day Detail Panel (injected here when a day is clicked) -->
      <div id="day-panel" class="hidden mb-4 shrink-0"></div>

      <!-- Analytics row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 pb-8">

        <!-- Monthly P&L -->
        <div class="glass-panel p-5 border-b-2 flex flex-col justify-between" 
             style="border-bottom-color: ${monthPnL >= 0 ? '#00ff88' : '#ff3366'}">
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Monthly P&amp;L</p>
          <h3 class="text-3xl font-bold ${monthPnL >= 0 ? 'text-neon-profit' : 'text-neon-loss'}">
            ${monthPnlSign}$${monthPnL.toFixed(2)}
          </h3>
          <p class="text-xs mt-1 ${monthPnL >= 0 ? 'text-neon-green' : 'text-neon-red'}">${monthPnlSign}${returnOnCapital}% return</p>
        </div>

        <!-- Monthly Trade Count -->
        <div class="glass-panel p-5 border-b-2 border-b-neon-blue/60 flex flex-col justify-between">
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Trades — ${monthNames[month]}</p>
          <h3 class="text-3xl font-bold text-white">${monthTrades.length}</h3>
          <div class="flex items-center gap-3 mt-1 text-xs">
            <span class="text-neon-green font-bold">${monthWins}W</span>
            <span class="text-gray-600">/</span>
            <span class="text-neon-red font-bold">${monthLosses}L</span>
            ${monthTrades.length > 0 ? `<span class="text-gray-500 ml-auto">${Math.round((monthWins/monthTrades.length)*100)}% WR</span>` : ''}
          </div>
        </div>

        <!-- Current Balance -->
        <div class="glass-panel p-5 border-b-2 flex flex-col justify-between"
             style="border-bottom-color: ${currentBalance >= capital ? '#00ff88' : '#ff3366'}">
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">End-of-Month Balance</p>
          <h3 class="text-2xl font-bold text-white">$${currentBalance.toLocaleString(undefined,{minimumFractionDigits:2})}</h3>
          <p class="text-xs text-gray-500 mt-1">Starting: $${capital.toLocaleString()}</p>
        </div>

        <!-- Pie Chart -->
        <div class="glass-panel p-5 flex items-center gap-4">
          <div class="relative w-20 h-20 shrink-0 rounded-full"
               style="background: conic-gradient(#00ff88 0% ${profitPct}%, #ff3366 ${profitPct}% 100%); box-shadow: 0 0 20px rgba(0,255,136,0.1)">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-[56px] h-[56px] bg-dark-bg rounded-full flex flex-col items-center justify-center">
                <span class="text-[9px] text-gray-500">Win</span>
                <span class="text-xs font-bold text-neon-profit">${profitPct}%</span>
              </div>
            </div>
          </div>
          <div class="flex-1 space-y-2 text-xs">
            <div>
              <div class="flex justify-between mb-0.5"><span class="text-gray-500">Profit</span><span class="text-neon-green font-bold">${profitPct}%</span></div>
              <div class="text-white font-semibold">$${grossProfit.toFixed(0)}</div>
            </div>
            <div>
              <div class="flex justify-between mb-0.5"><span class="text-gray-500">Loss</span><span class="text-neon-red font-bold">${lossPct}%</span></div>
              <div class="text-white font-semibold">$${grossLoss.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // ── Event: Prev/Next month ──────────────────────────────────────────────
  container.querySelector('#prev-month').addEventListener('click', () => {
    activeDayPanel = null;
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(container, openTradeModal);
  });
  container.querySelector('#next-month').addEventListener('click', () => {
    activeDayPanel = null;
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(container, openTradeModal);
  });

  // ── Event: Header "Add Trade" button → today's date ──────────────────────
  container.querySelector('#btn-add-trade-calendar').addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    openTradeModal(todayStr);
  });

  // ── Event: Quick-Add (+) button on hover → always NEW trade for that date ─
  container.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dStr = e.currentTarget.getAttribute('data-date');
      openTradeModal(dStr); // no second arg = always new trade
    });
  });

  // ── Event: Day tile click → open Day Detail Panel ──────────────────────
  container.querySelectorAll('#cal-grid [data-date]').forEach(tile => {
    tile.addEventListener('click', e => {
      // Don't trigger if they clicked the quick-add button
      if (e.target.closest('.btn-quick-add')) return;

      const dStr      = tile.getAttribute('data-date');
      const dayTrades = trades.filter(t => t.date === dStr);
      const panel     = container.querySelector('#day-panel');

      // If clicking same date again → toggle panel closed
      if (activeDayPanel === dStr) {
        activeDayPanel = null;
        panel.classList.add('hidden');
        panel.innerHTML = '';
        return;
      }

      activeDayPanel = dStr;

      // Build Day Detail Panel HTML
      const [y, m, d] = dStr.split('-');
      const dayLabel  = `${monthNames[parseInt(m)-1]} ${parseInt(d)}, ${y}`;

      const tradeRows = dayTrades.length === 0
        ? `<p class="text-gray-500 text-sm text-center py-4">No trades logged on this day.</p>`
        : dayTrades.map(t => `
            <div class="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-gray-800/60 hover:border-gray-700 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'Buy' ? 'bg-emerald-900/30' : 'bg-rose-900/30'}">
                  <i data-lucide="${t.type === 'Buy' ? 'trending-up' : 'trending-down'}" class="w-4 h-4 ${t.type === 'Buy' ? 'text-neon-green' : 'text-neon-red'}"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">${t.asset}</p>
                  <p class="text-xs text-gray-500">${t.type} · ${t.lots || t.qty || '—'} lots${t.pips ? ' · '+t.pips : ''}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold ${t.pnl >= 0 ? 'text-neon-profit' : 'text-neon-loss'}">${t.pnl >= 0 ? '+' : ''}$${parseFloat(t.pnl).toFixed(2)}</span>
                <button class="panel-edit-btn p-1.5 rounded-lg text-gray-500 hover:text-neon-blue hover:bg-neon-blue/10 transition-all" 
                        data-trade-id="${t.id}" title="Edit trade">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button class="panel-delete-btn p-1.5 rounded-lg text-gray-500 hover:text-neon-red hover:bg-neon-red/10 transition-all" 
                        data-trade-id="${t.id}" title="Delete trade">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          `).join('');

      const totalDayPnL = dayTrades.reduce((s, t) => s + t.pnl, 0);
      const dayPnlColor = totalDayPnL >= 0 ? 'text-neon-profit' : 'text-neon-loss';

      panel.innerHTML = `
        <div class="glass-panel p-5 rounded-2xl border-neon-blue/20 animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Day Summary</p>
              <h3 class="text-lg font-bold text-white">${dayLabel}</h3>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold ${dayPnlColor}">${totalDayPnL >= 0 ? '+' : ''}$${totalDayPnL.toFixed(2)}</span>
              <button id="panel-add-new-btn" data-date="${dStr}"
                class="btn-primary py-2 px-3 text-xs flex items-center gap-1.5">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Another Trade
              </button>
              <button id="panel-close-btn" class="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div class="space-y-2" id="panel-trade-list">
            ${tradeRows}
          </div>
        </div>
      `;
      panel.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();

      // Close button
      panel.querySelector('#panel-close-btn').addEventListener('click', () => {
        activeDayPanel = null;
        panel.classList.add('hidden');
        panel.innerHTML = '';
      });

      // "Add Another Trade" button in panel → ALWAYS new trade
      panel.querySelector('#panel-add-new-btn').addEventListener('click', () => {
        openTradeModal(dStr); // no second arg = new trade
      });

      // Edit buttons in panel
      panel.querySelectorAll('.panel-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tradeId = btn.getAttribute('data-trade-id');
          const trade   = trades.find(t => t.id === tradeId);
          if (trade) openTradeModal(trade.date, trade); // pass trade = edit mode
        });
      });

      // Delete buttons in panel
      panel.querySelectorAll('.panel-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tradeId = btn.getAttribute('data-trade-id');
          const trade   = trades.find(t => t.id === tradeId);
          if (!trade) return;
          if (confirm(`Delete trade: ${trade.asset} (${trade.type}) $${trade.pnl}?`)) {
            store.deleteTrade(tradeId);
            activeDayPanel = null;
            renderCalendar(container, openTradeModal);
          }
        });
      });

      // Scroll panel into view
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}
