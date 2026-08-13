import { store } from '../store.js';

export function renderAnalytics(container) {
  const trades = store.getTrades();
  
  // Aggregate PnL per month (YYYY-MM)
  const monthlyPnL = {};
  trades.forEach(t => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyPnL[monthKey]) {
      monthlyPnL[monthKey] = { profit: 0, loss: 0, net: 0, count: 0 };
    }
    
    if (t.pnl >= 0) {
      monthlyPnL[monthKey].profit += t.pnl;
    } else {
      monthlyPnL[monthKey].loss += Math.abs(t.pnl);
    }
    monthlyPnL[monthKey].net += t.pnl;
    monthlyPnL[monthKey].count++;
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();

  let monthsHtml = months.map((monthName, index) => {
    const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
    const data = monthlyPnL[monthKey];
    
    let boxClass = 'bg-dark-panel/30 border-gray-800 hover:border-gray-600';
    let contentHtml = `<span class="text-xl font-bold text-gray-500">${monthName}</span>`;

    if (data) {
      if (data.net >= 0) {
        boxClass = 'border-neon-green/30 bg-neon-green/5 hover:border-neon-green/60 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] group';
        contentHtml = `
          <span class="text-xl font-bold text-white group-hover:text-neon-green transition-colors">${monthName}</span>
          <div class="mt-2 text-sm font-bold text-neon-profit">+$${data.net.toFixed(2)}</div>
        `;
      } else {
        boxClass = 'border-neon-red/30 bg-neon-red/5 hover:border-neon-red/60 hover:shadow-[0_0_15px_rgba(255,51,102,0.15)] group';
        contentHtml = `
          <span class="text-xl font-bold text-white group-hover:text-neon-red transition-colors">${monthName}</span>
          <div class="mt-2 text-sm font-bold text-neon-loss">-$${Math.abs(data.net).toFixed(2)}</div>
        `;
      }
    }

    return `
      <div class="glass-panel p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[140px] relative overflow-hidden ${boxClass}" data-month="${monthKey}">
        ${contentHtml}
        ${data ? `
          <div class="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
            <div class="text-xs text-gray-400 mb-1">${data.count} Executions</div>
            <div class="text-sm font-bold text-neon-green">Gross Win: $${data.profit.toFixed(2)}</div>
            <div class="text-sm font-bold text-neon-red">Gross Loss: $${data.loss.toFixed(2)}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold text-white flex items-center gap-3">
          <i data-lucide="pie-chart" class="text-neon-blue"></i>
          Performance Analytics
        </h2>
      </div>

      <div class="mb-8 p-6 glass-panel flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 class="text-lg font-medium text-gray-400 mb-1">Yearly Outlook (${currentYear})</h3>
          <p class="text-gray-500 text-sm">Monthly breakdown of net profitability and execution count.</p>
        </div>
        <div class="flex gap-3">
          <button id="btn-export-pdf" class="btn-primary py-2 px-4 text-sm">
            <i data-lucide="file-text" class="w-4 h-4"></i> Export PDF
          </button>
          <button id="btn-export-csv" class="btn-primary py-2 px-4 text-sm">
            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export CSV
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${monthsHtml}
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind Export Events
  container.querySelector('#btn-export-csv').addEventListener('click', () => {
    const rows = [
      ["Date", "Type", "Asset", "Entry", "Exit", "Qty", "PnL", "Reason", "Notes", "Tags"]
    ];
    trades.forEach(t => {
      rows.push([
        t.date, t.type, t.asset, t.entryPrice, t.exitPrice, t.qty, t.pnl, 
        `"${t.reason.replace(/"/g, '""')}"`, 
        `"${t.notes.replace(/"/g, '""')}"`, 
        `"${t.tags.join(', ')}"`
      ]);
    });
    
    const csvContent = rows.map(e => e.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trades_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  container.querySelector('#btn-export-pdf').addEventListener('click', () => {
    // Generate a mock PDF download using text blob named as .pdf
    const text = "Discipline Trading Journal - PDF Report\\n\\nThis is a mocked PDF export. Real PDF generation requires an external library like pdfmake or html2pdf.js.\\n\\nTotal Trades: " + trades.length;
    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `discipline_report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
