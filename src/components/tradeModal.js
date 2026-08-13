import { store } from '../store.js';

/**
 * FOREX P&L CALCULATION ENGINE
 * Account Currency: USD
 *
 * Standard Lot = 100,000 units of base currency
 * Mini Lot     = 10,000 units
 * Micro Lot    = 1,000 units
 *
 * For pairs where USD is the QUOTE currency (e.g. EUR/USD, GBP/USD):
 *   P&L (USD) = (Exit - Entry) * Lots * 100,000 * Direction
 *
 * For pairs where USD is the BASE currency (e.g. USD/JPY, USD/CAD):
 *   P&L (USD) = ((Exit - Entry) / Exit) * Lots * 100,000 * Direction
 *   (result is in quote currency, then divided by exit rate to convert back to USD)
 *
 * For Cross pairs (EUR/JPY, GBP/AUD etc.):
 *   P&L (Quote) = (Exit - Entry) * Lots * 100,000 * Direction
 *   then we need to convert quote currency to USD — user can enter exit conversion rate
 *
 * Pip Value:
 *   For XY/USD: 1 pip = $10 per standard lot
 *   For USD/XY: 1 pip = 10 / exit rate per standard lot
 */

function detectPairType(asset) {
  const a = asset.toUpperCase().replace('/', '');
  // Pairs with USD as quote (profit natively in USD)
  const usdQuote = ['EURUSD','GBPUSD','AUDUSD','NZDUSD','XAUUSD','XAGUSD'];
  // Pairs with USD as base
  const usdBase  = ['USDJPY','USDCAD','USDCHF','USDHKD','USDSGD','USDCNH'];

  if (usdQuote.some(p => a.includes(p.replace('USD','')) && a.endsWith('USD'))) return 'USD_QUOTE';
  if (usdBase.some(p => a.startsWith('USD'))) return 'USD_BASE';
  // Crypto / Stock fallback
  if (asset.includes('/USD') || asset.includes('USD')) return 'USD_QUOTE';
  if (asset.startsWith('USD')) return 'USD_BASE';
  return 'CROSS'; // cross pair
}

function calcForexPnL(asset, entry, exit, lots, direction) {
  const type = detectPairType(asset);
  const units = lots * 100000;
  const dir   = direction === 'Buy' ? 1 : -1;

  if (type === 'USD_QUOTE') {
    return (exit - entry) * units * dir;
  } else if (type === 'USD_BASE') {
    // P&L in quote currency, convert to USD by dividing by exit price
    return ((exit - entry) / exit) * units * dir;
  } else {
    // Cross pair: P&L in quote currency — simplified, no live rate
    return (exit - entry) * units * dir;
  }
}

function calcPipValue(asset, lots, exitRate) {
  const type = detectPairType(asset);
  const pipMultiplier = lots * 100000 * 0.0001;
  if (type === 'USD_QUOTE') return (pipMultiplier).toFixed(2);
  if (type === 'USD_BASE') return (pipMultiplier / (exitRate || 1)).toFixed(2);
  return (pipMultiplier).toFixed(2);
}

function countPips(asset, entry, exit) {
  const a = asset.toUpperCase();
  // JPY pairs use 2 decimal places, pip = 0.01
  if (a.includes('JPY')) {
    return ((exit - entry) / 0.01).toFixed(1);
  }
  // Standard pairs: pip = 0.0001
  return ((exit - entry) / 0.0001).toFixed(1);
}

const COMMON_PAIRS = [
  'EUR/USD','GBP/USD','AUD/USD','NZD/USD','USD/JPY',
  'USD/CAD','USD/CHF','EUR/JPY','GBP/JPY','EUR/GBP',
  'XAU/USD','XAG/USD','BTC/USD','ETH/USD',
  'AAPL','TSLA','NVDA','SPX500'
];

export function openTradeModal(dateStr, tradeToEdit = null) {
  const modal = document.getElementById('trade-modal');
  const modalContent = document.getElementById('trade-modal-content');
  
  const t = tradeToEdit || {
    id: '', date: dateStr, type: 'Buy',
    asset: '', entryPrice: '', exitPrice: '',
    lots: '', pnl: '', pips: '', pipValue: '',
    reason: '', notes: '', tags: [], photos: []
  };
  // Ensure photos array always exists
  if (!t.photos) t.photos = [];

  modalContent.innerHTML = `
    <div class="p-6 md:p-8 flex flex-col h-full relative overflow-y-auto">
      <!-- Close button -->
      <button id="close-modal" class="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>

      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <i data-lucide="edit-3" class="text-neon-blue"></i>
        ${tradeToEdit ? 'Edit Trade' : 'New Trade'} — ${dateStr}
      </h2>

      <form id="trade-form" class="space-y-6">
        <input type="hidden" id="trade-id" value="${t.id}">
        <input type="hidden" id="trade-date" value="${t.date}">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- LEFT: Execution Details -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neon-blue uppercase tracking-widest border-b border-gray-800 pb-2">
              Execution Details
            </h3>

            <!-- Direction -->
            <div class="flex gap-3">
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="type" value="Buy" class="peer hidden" ${t.type === 'Buy' ? 'checked' : ''}>
                <div class="w-full py-2.5 text-center rounded-xl border-2 border-gray-700 bg-gray-900/50 text-gray-400
                  peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400 peer-checked:border-emerald-500/50
                  peer-checked:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all font-semibold">
                  📈 Buy (Long)
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="type" value="Sell" class="peer hidden" ${t.type === 'Sell' ? 'checked' : ''}>
                <div class="w-full py-2.5 text-center rounded-xl border-2 border-gray-700 bg-gray-900/50 text-gray-400
                  peer-checked:bg-rose-500/10 peer-checked:text-rose-400 peer-checked:border-rose-500/50
                  peer-checked:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all font-semibold">
                  📉 Sell (Short)
                </div>
              </label>
            </div>

            <!-- Asset -->
            <div>
              <label class="form-label">Currency Pair / Asset</label>
              <input type="text" id="trade-asset" required list="pair-list" class="input-field" 
                placeholder="e.g. EUR/USD, GBP/JPY, AAPL" value="${t.asset}">
              <datalist id="pair-list">
                ${COMMON_PAIRS.map(p => `<option value="${p}">`).join('')}
              </datalist>
            </div>

            <!-- Entry / Exit -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Entry Price</label>
                <input type="number" id="trade-entry" step="0.00001" required class="input-field" 
                  placeholder="1.10000" value="${t.entryPrice}">
              </div>
              <div>
                <label class="form-label">Exit Price</label>
                <input type="number" id="trade-exit" step="0.00001" required class="input-field" 
                  placeholder="1.11000" value="${t.exitPrice}">
              </div>
            </div>

            <!-- Lot Size -->
            <div>
              <label class="form-label flex items-center justify-between">
                <span>Lot Size</span>
                <span class="text-gray-500 text-xs">1 lot = 100,000 units</span>
              </label>
              <div class="flex gap-2 mb-2">
                ${[['0.01','Micro'],['0.10','Mini'],['0.50','0.5'],['1.00','1 Lot']].map(([val, label]) =>
                  `<button type="button" class="lot-preset flex-1 py-1.5 text-xs rounded-lg border border-gray-700 text-gray-400 hover:border-neon-blue hover:text-neon-blue transition-all" data-lot="${val}">${label}</button>`
                ).join('')}
              </div>
              <input type="number" id="trade-lots" step="0.01" min="0.01" required class="input-field" 
                placeholder="e.g. 0.10" value="${t.lots || t.qty || ''}">
            </div>

            <!-- Calculated Info Panel -->
            <div id="calc-panel" class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-4 space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 uppercase tracking-wider">Pips</span>
                <span id="display-pips" class="text-sm font-bold text-white">${t.pips || '—'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 uppercase tracking-wider">Pip Value (per pip)</span>
                <span id="display-pipval" class="text-sm font-bold text-white">${t.pipValue ? '$'+t.pipValue : '—'}</span>
              </div>
              <div class="flex justify-between items-center border-t border-gray-700/50 pt-2.5">
                <span class="text-xs text-gray-500 uppercase tracking-wider">Est. Position Size</span>
                <span id="display-units" class="text-sm font-bold text-white">—</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Net P&L (USD)</span>
                <span id="display-pnl" class="text-lg font-bold text-gray-400">$0.00</span>
              </div>
            </div>

            <!-- Manual P&L override -->
            <div>
              <label class="form-label flex items-center gap-2">
                Net P&L ($) 
                <span class="text-xs text-gray-600">— Auto-calculated above, or override here</span>
              </label>
              <input type="number" id="trade-pnl" step="0.01" required class="input-field" 
                placeholder="Net Profit/Loss in USD" value="${t.pnl}">
            </div>
          </div>

          <!-- RIGHT: Psychology & Notes -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neon-blue uppercase tracking-widest border-b border-gray-800 pb-2">
              Psychology & Review
            </h3>

            <div>
              <label class="form-label">Strategy / Reason for Entry</label>
              <textarea id="trade-reason" rows="3" class="input-field resize-none" 
                placeholder="Describe your setup, confluences, key levels...">${t.reason}</textarea>
            </div>

            <div>
              <label class="form-label">Post-Trade Review & Emotions</label>
              <textarea id="trade-notes" rows="3" class="input-field resize-none"
                placeholder="What went right or wrong? What would you do differently?">${t.notes}</textarea>
            </div>

            <div>
              <label class="form-label mb-2">Behavioral Tags</label>
              <div class="flex flex-wrap gap-2" id="tags-container">
                ${['FOMO', 'Discipline', 'Revenge Trading', 'Confidence', 'Patience', 'Overtrading', 'Internal Liquidity', 'Liquidity but no trend', 'Conservative Entry Model', 'Aggressive Entry Model'].map(tag => `
                  <button type="button" class="tag-btn px-3 py-1.5 rounded-full text-xs font-semibold border transition-all 
                    ${t.tags && t.tags.includes(tag) 
                      ? 'bg-neon-blue/20 text-neon-blue border-neon-blue shadow-[0_0_8px_rgba(0,204,255,0.3)]' 
                      : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300'}" 
                    data-tag="${tag}">${tag}</button>
                `).join('')}
              </div>
            </div>

            <!-- Forex Reference Card -->
            <div class="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
              <p class="text-xs font-semibold text-neon-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                <i data-lucide="info" class="w-3.5 h-3.5"></i> Forex Quick Reference
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div><span class="text-gray-600">Micro lot:</span> 1,000 units</div>
                <div><span class="text-gray-600">Mini lot:</span> 10,000 units</div>
                <div><span class="text-gray-600">Std lot:</span> 100,000 units</div>
                <div><span class="text-gray-600">1 pip (EUR/USD):</span> $10/lot</div>
                <div><span class="text-gray-600">Long = Buy:</span> profit ↑</div>
                <div><span class="text-gray-600">Short = Sell:</span> profit ↓</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Chart Screenshots Section (Full Width) ── -->
        <div class="border-t border-gray-800/60 pt-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-neon-blue uppercase tracking-widest flex items-center gap-2">
              <i data-lucide="image" class="w-4 h-4"></i>
              Chart Screenshots
              <span id="photo-count-badge" class="ml-1 px-2 py-0.5 rounded-full bg-neon-blue/15 text-neon-blue text-xs font-bold">${t.photos.length}</span>
            </h3>
            <label for="photo-upload" class="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-neon-blue hover:text-neon-blue hover:bg-neon-blue/5 transition-all">
              <i data-lucide="upload-cloud" class="w-3.5 h-3.5"></i> Upload Photos
            </label>
            <input type="file" id="photo-upload" multiple accept="image/*" class="hidden">
          </div>

          <!-- Photo Grid -->
          <div id="photo-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[80px]">
            ${t.photos.length === 0 ? `
              <div id="photo-empty" class="col-span-full flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-gray-800 text-gray-600">
                <i data-lucide="image-off" class="w-7 h-7 mb-2"></i>
                <span class="text-xs">No screenshots yet — upload to analyse your chart</span>
              </div>` : ''}
            ${t.photos.map((src, idx) => `
              <div class="relative group rounded-xl overflow-hidden border border-gray-700 aspect-video bg-gray-900" data-photo-idx="${idx}">
                <img src="${src}" alt="Chart ${idx+1}" class="w-full h-full object-cover cursor-pointer photo-preview" data-idx="${idx}">
                <button type="button"
                  class="btn-delete-photo absolute top-1 right-1 p-1 rounded-full bg-black/70 text-gray-400 hover:text-neon-red hover:bg-black transition-all opacity-0 group-hover:opacity-100"
                  data-idx="${idx}" title="Remove photo">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>


        <div class="pt-4 border-t border-gray-800 flex justify-end gap-4 items-center">
          ${tradeToEdit ? `<button type="button" id="btn-delete-trade" class="btn-danger mr-auto"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>` : ''}
          <button type="button" id="btn-cancel" class="px-5 py-2.5 text-gray-400 hover:text-white transition-colors text-sm">Cancel</button>
          <button type="submit" class="btn-primary">
            <i data-lucide="save" class="w-4 h-4"></i> Save Trade
          </button>
        </div>
      </form>

      <!-- Lightbox overlay for full-screen photo preview -->
      <div id="photo-lightbox" class="hidden fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" style="backdrop-filter:blur(8px)">
        <button id="lightbox-close" class="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
        <img id="lightbox-img" src="" alt="Chart preview" class="max-w-full max-h-full rounded-xl object-contain shadow-2xl">
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  modal.classList.remove('hidden');
  void modal.offsetWidth;
  modal.classList.remove('opacity-0');
  modalContent.classList.remove('scale-95');

  const closeModalFn = () => {
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
  };

  modal.querySelector('#close-modal').addEventListener('click', closeModalFn);
  modal.querySelector('#btn-cancel').addEventListener('click', closeModalFn);

  const btnDelete = modal.querySelector('#btn-delete-trade');
  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this trade?')) {
        store.deleteTrade(t.id);
        closeModalFn();
      }
    });
  }

  // Tag selection
  const selectedTags = new Set(t.tags || []);
  modal.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const tag = e.target.getAttribute('data-tag');
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        e.target.className = 'tag-btn px-3 py-1.5 rounded-full text-xs font-semibold border transition-all bg-transparent text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300';
      } else {
        selectedTags.add(tag);
        e.target.className = 'tag-btn px-3 py-1.5 rounded-full text-xs font-semibold border transition-all bg-neon-blue/20 text-neon-blue border-neon-blue shadow-[0_0_8px_rgba(0,204,255,0.3)]';
      }
    });
  });

  // Lot preset buttons
  const lotsInput = modal.querySelector('#trade-lots');
  modal.querySelectorAll('.lot-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      lotsInput.value = btn.getAttribute('data-lot');
      lotsInput.dispatchEvent(new Event('input'));
    });
  });

  // Live calculation engine
  const assetInput  = modal.querySelector('#trade-asset');
  const entryInput  = modal.querySelector('#trade-entry');
  const exitInput   = modal.querySelector('#trade-exit');
  const pnlInput    = modal.querySelector('#trade-pnl');
  const displayPnl  = modal.querySelector('#display-pnl');
  const displayPips = modal.querySelector('#display-pips');
  const displayPipVal = modal.querySelector('#display-pipval');
  const displayUnits  = modal.querySelector('#display-units');

  const runCalc = () => {
    const asset  = assetInput.value.trim();
    const entry  = parseFloat(entryInput.value);
    const exit   = parseFloat(exitInput.value);
    const lots   = parseFloat(lotsInput.value);
    const direction = modal.querySelector('input[name="type"]:checked')?.value || 'Buy';

    if (!asset || isNaN(entry) || isNaN(exit) || isNaN(lots)) {
      displayPnl.textContent = '$0.00';
      displayPnl.className = 'text-lg font-bold text-gray-400';
      return;
    }

    const pnl     = calcForexPnL(asset, entry, exit, lots, direction);
    const pips    = countPips(asset, entry, exit);
    const pipVal  = calcPipValue(asset, lots, exit);
    const units   = (lots * 100000).toLocaleString();

    pnlInput.value = pnl.toFixed(2);

    const sign = pnl >= 0 ? '+' : '';
    displayPnl.textContent  = `${sign}$${pnl.toFixed(2)}`;
    displayPnl.className    = `text-lg font-bold ${pnl >= 0 ? 'text-neon-profit' : 'text-neon-loss'}`;
    displayPips.textContent  = `${pips} pips`;
    displayPips.className    = `text-sm font-bold ${parseFloat(pips) >= 0 ? 'text-neon-profit' : 'text-neon-loss'}`;
    displayPipVal.textContent = `$${pipVal}`;
    displayUnits.textContent  = `${units} units`;
  };

  assetInput.addEventListener('input', runCalc);
  entryInput.addEventListener('input', runCalc);
  exitInput.addEventListener('input', runCalc);
  lotsInput.addEventListener('input', runCalc);
  modal.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', runCalc));

  // Trigger initial calc if editing
  if (tradeToEdit) runCalc();

  // ── Photo Management ───────────────────────────────────────────────
  const photoState = [...t.photos]; // mutable copy

  const renderPhotoGrid = () => {
    const grid  = modal.querySelector('#photo-grid');
    const badge = modal.querySelector('#photo-count-badge');
    if (!grid) return;

    badge.textContent = photoState.length;

    if (photoState.length === 0) {
      grid.innerHTML = `
        <div id="photo-empty" class="col-span-full flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-gray-800 text-gray-600">
          <i data-lucide="image-off" class="w-7 h-7 mb-2"></i>
          <span class="text-xs">No screenshots yet — upload to analyse your chart</span>
        </div>`;
    } else {
      grid.innerHTML = photoState.map((src, idx) => `
        <div class="relative group rounded-xl overflow-hidden border border-gray-700 aspect-video bg-gray-900">
          <img src="${src}" alt="Chart ${idx+1}" class="w-full h-full object-cover cursor-pointer photo-preview" data-idx="${idx}">
          <button type="button"
            class="btn-delete-photo absolute top-1 right-1 p-1 rounded-full bg-black/70 text-gray-400 hover:text-neon-red hover:bg-black transition-all opacity-0 group-hover:opacity-100"
            data-idx="${idx}" title="Remove photo">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();

    // Re-bind delete buttons
    grid.querySelectorAll('.btn-delete-photo').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        photoState.splice(idx, 1);
        renderPhotoGrid();
      });
    });

    // Re-bind lightbox
    grid.querySelectorAll('.photo-preview').forEach(img => {
      img.addEventListener('click', () => {
        const lb = modal.querySelector('#photo-lightbox');
        const lbImg = modal.querySelector('#lightbox-img');
        lbImg.src = img.src;
        lb.classList.remove('hidden');
      });
    });
  };

  // Initial bind for any existing photos
  renderPhotoGrid();

  // Lightbox close
  modal.querySelector('#lightbox-close').addEventListener('click', () => {
    modal.querySelector('#photo-lightbox').classList.add('hidden');
  });
  modal.querySelector('#photo-lightbox').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });

  // File upload handler
  const photoUpload = modal.querySelector('#photo-upload');
  photoUpload.addEventListener('change', () => {
    const files = Array.from(photoUpload.files);
    let loaded = 0;
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        photoState.push(e.target.result);
        loaded++;
        if (loaded === files.length) renderPhotoGrid();
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added
    photoUpload.value = '';
  });

  // Form submission
  modal.querySelector('#trade-form').addEventListener('submit', e => {
    e.preventDefault();

    const asset = document.getElementById('trade-asset').value;
    const lots  = parseFloat(document.getElementById('trade-lots').value);

    const tradeData = {
      id:         document.getElementById('trade-id').value,
      date:       document.getElementById('trade-date').value,
      type:       document.querySelector('input[name="type"]:checked').value,
      asset,
      entryPrice: parseFloat(document.getElementById('trade-entry').value),
      exitPrice:  parseFloat(document.getElementById('trade-exit').value),
      qty:        lots,
      lots,
      pnl:        parseFloat(document.getElementById('trade-pnl').value),
      pips:       document.getElementById('display-pips').textContent,
      pipValue:   document.getElementById('display-pipval').textContent.replace('$',''),
      reason:     document.getElementById('trade-reason').value,
      notes:      document.getElementById('trade-notes').value,
      tags:       Array.from(selectedTags),
      photos:     [...photoState]
    };

    store.saveTrade(tradeData);
    
    const btnSubmit = modal.querySelector('button[type="submit"]');
    btnSubmit.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Saved!`;
    btnSubmit.classList.remove('btn-primary');
    btnSubmit.classList.add('bg-neon-green', 'text-black', 'font-bold', 'px-6', 'py-2.5', 'rounded-xl', 'flex', 'items-center', 'gap-2');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => closeModalFn(), 700);
  });
}
