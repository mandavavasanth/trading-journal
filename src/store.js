const STORAGE_KEY = 'discipline_trades';
const CAPITAL_KEY = 'discipline_capital';

export const store = {
  getTrades: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : generateDummyData();
  },
  
  saveTrade: (trade) => {
    const trades = store.getTrades();
    const existingIndex = trades.findIndex(t => t.id === trade.id);
    if (existingIndex > -1) {
      trades[existingIndex] = trade;
    } else {
      trade.id = Date.now().toString();
      trades.push(trade);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    // Trigger custom event so views can update
    window.dispatchEvent(new Event('tradesUpdated'));
    return trade;
  },

  deleteTrade: (id) => {
    let trades = store.getTrades();
    trades = trades.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    window.dispatchEvent(new Event('tradesUpdated'));
  },
  
  getCapital: () => {
    return parseFloat(localStorage.getItem(CAPITAL_KEY)) || 10000;
  },
  
  setCapital: (amount) => {
    localStorage.setItem(CAPITAL_KEY, amount.toString());
    window.dispatchEvent(new Event('tradesUpdated'));
  },

  getTradeStats: () => {
    const trades = store.getTrades();
    let totalPnL = 0;
    let wins = 0;
    let losses = 0;

    trades.forEach(trade => {
      if (trade.pnl > 0) wins++;
      if (trade.pnl < 0) losses++;
      totalPnL += trade.pnl;
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

    return { totalPnL, wins, losses, winRate, totalTrades };
  },

  exportBackup: () => {
    const data = {
      trades: store.getTrades(),
      capital: store.getCapital()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discipline_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

function generateDummyData() {
  const dummy = [];
  const today = new Date();

  const pairs = [
    { asset: 'EUR/USD', entry: 1.0850, range: 0.01, pip: 0.0001, isUsdQuote: true },
    { asset: 'GBP/USD', entry: 1.2700, range: 0.015, pip: 0.0001, isUsdQuote: true },
    { asset: 'USD/JPY', entry: 153.50, range: 1.5, pip: 0.01, isUsdQuote: false },
    { asset: 'AUD/USD', entry: 0.6550, range: 0.008, pip: 0.0001, isUsdQuote: true },
    { asset: 'USD/CAD', entry: 1.3700, range: 0.012, pip: 0.0001, isUsdQuote: false },
    { asset: 'XAU/USD', entry: 2320.0, range: 30,   pip: 0.1,    isUsdQuote: true },
  ];

  const lotOptions = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00];
  const allTags = ['FOMO', 'Discipline', 'Revenge Trading', 'Confidence', 'Patience', 'Overtrading', 'Internal Liquidity', 'Liquidity but no trend', 'Conservative Entry Model', 'Aggressive Entry Model'];

  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.floor(Math.random() * 60));

    const pair  = pairs[Math.floor(Math.random() * pairs.length)];
    const lots  = lotOptions[Math.floor(Math.random() * lotOptions.length)];
    const units = lots * 100000;
    const isWin = Math.random() > 0.38;
    const direction = Math.random() > 0.5 ? 'Buy' : 'Sell';

    const pipMove = isWin
      ? (Math.random() * 30 + 5)   // 5–35 pip win
      : -(Math.random() * 20 + 3); // 3–23 pip loss
    const pipDir  = direction === 'Buy' ? 1 : -1;

    const entryPrice = pair.entry + (Math.random() - 0.5) * pair.range;
    const exitPrice  = entryPrice + (pipMove * pair.pip * pipDir);

    let pnl;
    if (pair.isUsdQuote) {
      pnl = (exitPrice - entryPrice) * units * (direction === 'Buy' ? 1 : -1);
    } else {
      pnl = ((exitPrice - entryPrice) / exitPrice) * units * (direction === 'Buy' ? 1 : -1);
    }

    const pips = (pipMove * pipDir).toFixed(1);

    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);

    dummy.push({
      id:         `dummy_${i}`,
      date:       d.toISOString().split('T')[0],
      type:       direction,
      asset:      pair.asset,
      entryPrice: parseFloat(entryPrice.toFixed(5)),
      exitPrice:  parseFloat(exitPrice.toFixed(5)),
      qty:        lots,
      lots,
      pnl:        parseFloat(pnl.toFixed(2)),
      pips:       `${pips} pips`,
      pipValue:   (lots * 10).toFixed(2),
      reason:     'Identified key support/resistance confluence with trend alignment.',
      notes:      'Followed the plan. Managed emotions well during drawdown.',
      tags:       selectedTags
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
  return dummy;
}
