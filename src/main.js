import './style.css';
import { renderDashboard } from './views/dashboard.js';
import { renderCalendar } from './views/calendar.js';
import { renderPsychology } from './views/psychology.js';
import { renderHistory } from './views/history.js';
import { renderAnalytics } from './views/analytics.js';
import { openTradeModal } from './components/tradeModal.js';
import { store } from './store.js';
import { createIcons, icons } from 'lucide';

// Make lucide available globally so views can call it
window.lucide = {
  createIcons: () => createIcons({ icons })
};

document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  const navButtons = document.querySelectorAll('[data-view]');
  const btnExportBackup = document.getElementById('btn-export-backup');
  
  let currentView = 'dashboard';

  const route = () => {
    switch (currentView) {
      case 'dashboard':
        renderDashboard(mainContent);
        break;
      case 'calendar':
        renderCalendar(mainContent, openTradeModal);
        break;
      case 'psychology':
        renderPsychology(mainContent);
        break;
      case 'history':
        renderHistory(mainContent, openTradeModal);
        break;
      case 'analytics':
        renderAnalytics(mainContent);
        break;
    }
    updateNavUI();
  };

  const updateNavUI = () => {
    navButtons.forEach(btn => {
      if (btn.dataset.view === currentView) {
        btn.classList.add('bg-white/10', 'text-white');
        btn.classList.remove('text-gray-400');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.add('text-neon-blue');
          icon.classList.remove('text-gray-400');
        }
      } else {
        btn.classList.remove('bg-white/10', 'text-white');
        btn.classList.add('text-gray-400');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('text-neon-blue');
          icon.classList.add('text-gray-400');
        }
      }
    });
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentView = e.currentTarget.dataset.view;
      route();
    });
  });

  btnExportBackup.addEventListener('click', () => {
    store.exportBackup();
  });

  // Listen for data updates to re-render the current view
  window.addEventListener('tradesUpdated', () => {
    route();
  });

  // FAB: Add trade with today's date
  const fab = document.getElementById('btn-add-trade-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      openTradeModal(today);
    });
  }

  // Initial render
  route();
});
