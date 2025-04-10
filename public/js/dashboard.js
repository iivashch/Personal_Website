// public/js/dashboard.js

async function loadDashboard() {
    try {
      const res = await fetch('https://iivashch.github.io/daily-json-api/data.json');
      const data = await res.json();
  
      // Headline indicators
      function renderHeadlineIndicators(data) {
        const list = document.getElementById('headline-list');
        list.innerHTML = '';
  
        const formatValue = (v, prefix = '', suffix = '') =>
          v !== undefined && v !== null ? `${prefix}${v}${suffix}` : 'N/A';
  
        const sections = [
          { label: 'stocks', prefix: '', suffix: '', pretty: { sp500: 'S&P 500', N100: 'NASDAQ 100', SSE: 'SSE Composite' } },
          { label: 'currencies', prefix: '', suffix: '', pretty: { dxy: 'Dollar Index (DXY)', btc: 'Bitcoin (BTC)' } },
          { label: 'precious_metals', prefix: '', suffix: '', pretty: { gold: 'Gold Price' } },
          { label: 'commodities', prefix: '$', suffix: '', pretty: { oil: 'Crude Oil Price' } }
        ];
  
        sections.forEach(section => {
          const values = data[section.label];
          if (values) {
            Object.entries(values).forEach(([key, val]) => {
              const name = section.pretty[key] || key.toUpperCase();
              const item = document.createElement('li');
              item.className = 'list-group-item';
              item.innerHTML = `${name}: <span>${formatValue(val, section.prefix, section.suffix)}</span>`;
              list.appendChild(item);
            });
          }
        });
      }
  
      if (data.updated_at) {
        document.getElementById('last-updated').textContent = `Last updated: ${new Date(data.updated_at).toLocaleString()}`;
      }
  
      const STATIC_KEYS = ['stocks', 'bonds', 'commodities', 'updated_at'];
      const dynamicContainer = document.getElementById('dynamic-metrics-container');
      const sidebarContainer = document.getElementById('dynamic-sidebar-links');
  
      Object.keys(data).forEach(metric => {
        if (STATIC_KEYS.includes(metric)) return;
  
        const sectionId = `section-${metric}`;
  
        // Sidebar link
        const link = document.createElement('a');
        link.classList.add('nav-link');
        link.href = `#${sectionId}`;
        link.textContent = metric.toUpperCase();
        sidebarContainer.appendChild(link);
  
        // Section
        const section = document.createElement('section');
        section.classList.add('mb-5');
        section.id = sectionId;
  
        section.innerHTML = `
          <h4 class="text-capitalize">${metric.toUpperCase()}</h4>
          <canvas id="chart-${metric}" height="150"></canvas>
          <button 
            class="btn btn-outline-secondary btn-sm mt-2"
            onclick="toggleReport('${metric}', this)"
          >
            Show Full Report
          </button>
          <div id="${metric}-report" class="full-report-container" style="display: none;"></div>
        `;
  
        dynamicContainer.appendChild(section);
  
        renderChart(`chart-${metric}`, data[metric]);
        renderFullReport(metric, data[metric].full_report);
      });
  
      renderHeadlineIndicators(data);
  
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }
  
  function renderChart(id, chartData) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.3
        }]
      }
    });
  }
  
  function renderFullReport(id, fullReport) {
    const container = document.getElementById(`${id}-report`);
    if (!container || !Array.isArray(fullReport)) return;
  
    const table = document.createElement('table');
    table.classList.add('table', 'table-sm', 'table-bordered', 'mt-3');
  
    const headers = Object.keys(fullReport[0] || {});
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    fullReport.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(h => {
        const td = document.createElement('td');
        td.textContent = row[h];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  
    table.appendChild(tbody);
    container.appendChild(table);
  }
  
  // 🔁 Toggle report visibility and button label
  function toggleReport(metric, btn) {
    const report = document.getElementById(`${metric}-report`);
    if (!report) return;
  
    const isHidden = report.style.display === 'none' || report.style.display === '';
    report.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Hide Full Report' : 'Show Full Report';
  }
  
  window.addEventListener('DOMContentLoaded', loadDashboard);

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('refreshDashboard');
    const status = document.getElementById('refreshStatus');
  
    if (btn) {
      btn.addEventListener('click', async () => {
        status.textContent = 'Refreshing...';
        try {
          const res = await fetch('/dashboard/refresh', { method: 'POST' });
          const result = await res.json();
          if (result.success) {
            status.textContent = '✅ Refreshed!';
            await loadDashboard(); // reload charts
          } else {
            status.textContent = '⚠️ Refresh failed';
          }
        } catch (err) {
          console.error('Refresh error:', err);
          status.textContent = '❌ Error refreshing';
        }
      });
    }
  });
  
  