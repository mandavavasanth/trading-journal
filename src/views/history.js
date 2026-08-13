import { store } from '../store.js';

export function renderHistory(container, openTradeModal) {
  const trades = store.getTrades().sort((a, b) => new Date(b.date) - new Date(a.date));

  const buildRows = () => trades.map(t => {
    const isWin    = t.pnl >= 0;
    const pnlClass = isWin ? 'text-neon-profit' : 'text-neon-loss';
    const typeClass = t.type === 'Buy'
      ? 'text-emerald-400 bg-emerald-900/30 border border-emerald-800/50'
      : 'text-rose-400 bg-rose-900/30 border border-rose-800/50';
    const hasPhotos = t.photos && t.photos.length > 0;

    return `
      <tr class="trade-row border-b border-gray-800/60 hover:bg-white/[0.03] transition-colors group" data-id="${t.id}" data-asset="${t.asset.toLowerCase()}">
        <td class="py-3.5 px-4 text-gray-400 text-sm whitespace-nowrap">${t.date}</td>
        <td class="py-3.5 px-4">
          <div class="font-semibold text-white text-sm">${t.asset}</div>
          ${t.pips ? `<div class="text-xs text-gray-600">${t.pips}</div>` : ''}
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-lg text-xs font-semibold ${typeClass}">${t.type}</span>
        </td>
        <td class="py-3.5 px-4 text-gray-400 text-sm">
          <span>${t.entryPrice}</span>
          <i data-lucide="arrow-right" class="w-3 h-3 inline mx-1 text-gray-600"></i>
          <span>${t.exitPrice}</span>
        </td>
        <td class="py-3.5 px-4 text-sm text-gray-500">${t.lots || t.qty || '—'} lots</td>
        <td class="py-3.5 px-4 font-bold ${pnlClass} text-right text-sm whitespace-nowrap">
          ${isWin ? '+' : ''}$${parseFloat(t.pnl).toFixed(2)}
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${hasPhotos ? `
              <span class="text-xs text-gray-500 mr-1 flex items-center gap-1">
                <i data-lucide="image" class="w-3 h-3"></i>${t.photos.length}
              </span>` : ''}
            <button class="btn-edit-trade p-1.5 rounded-lg text-gray-500 hover:text-neon-blue hover:bg-neon-blue/10 transition-all" 
                    data-id="${t.id}" title="Edit Trade">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button class="btn-delete-trade p-1.5 rounded-lg text-gray-500 hover:text-neon-red hover:bg-neon-red/10 transition-all" 
                    data-id="${t.id}" title="Delete Trade">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const emptyState = `
    <tr>
      <td colspan="7" class="py-16 text-center text-gray-600">
        <div class="flex flex-col items-center justify-center gap-3">
          <i data-lucide="inbox" class="w-12 h-12 text-gray-700"></i>
          <p class="text-sm">No trades yet. Click the <span class="text-neon-blue font-bold">+</span> button to log your first trade.</p>
        </div>
      </td>
    </tr>
  `;

  container.innerHTML = `
    <div class="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in h-full overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Records</p>
          <h2 class="text-3xl font-bold text-white flex items-center gap-3">
            <i data-lucide="history" class="text-neon-blue w-7 h-7"></i>
            Execution History
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="search-asset" placeholder="Search pair..." 
                   class="bg-black/40 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-neon-blue transition-colors w-32 md:w-48">
          </div>
          <span id="trade-count-display" class="text-sm text-gray-500 hidden sm:inline">${trades.length} trades</span>
          <button id="btn-add-trade-history"
            class="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Trade
          </button>
        </div>
      </div>

      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-black/40 border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
                <th class="py-3.5 px-4 font-semibold">Date</th>
                <th class="py-3.5 px-4 font-semibold">Asset</th>
                <th class="py-3.5 px-4 font-semibold">Side</th>
                <th class="py-3.5 px-4 font-semibold">Entry / Exit</th>
                <th class="py-3.5 px-4 font-semibold">Lots</th>
                <th class="py-3.5 px-4 font-semibold text-right">Net P&amp;L</th>
                <th class="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="history-body">
              ${trades.length > 0 ? buildRows() : emptyState}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Search filtering
  const searchInput = container.querySelector('#search-asset');
  const countDisplay = container.querySelector('#trade-count-display');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = container.querySelectorAll('.trade-row');
      let visibleCount = 0;
      rows.forEach(row => {
        const asset = row.getAttribute('data-asset') || '';
        if (asset.includes(query)) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });
      if (countDisplay) {
        countDisplay.textContent = `${visibleCount} trades`;
      }
    });
  }

  // Add trade from history header
  container.querySelector('#btn-add-trade-history').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    openTradeModal(today);
  });

  // Edit row click
  container.querySelectorAll('.btn-edit-trade').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const trade = trades.find(t => t.id === id);
      if (trade) openTradeModal(trade.date, trade);
    });
  });

  // Delete row click
  container.querySelectorAll('.btn-delete-trade').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const trade = trades.find(t => t.id === id);
      if (!trade) return;
      if (confirm(`Delete trade: ${trade.asset} on ${trade.date}?`)) {
        store.deleteTrade(id);
        // re-render inline without full page reload
        renderHistory(container, openTradeModal);
      }
    });
  });
}
