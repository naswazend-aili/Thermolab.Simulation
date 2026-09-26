/* ==========================================================================
   Chart.js Dynamic Graph Manager
   ========================================================================== */
const charts = {};

function createChart(canvasId, type, label, xLabel, yLabel, color = '#2563eb'){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return null;
  const ctx = canvas.getContext('2d');
  if(!ctx) return null;

  if(charts[canvasId]) charts[canvasId].destroy();

  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const gridColor = isDarkMode ? '#2a385b' : '#e2e8f0';

  charts[canvasId] = new Chart(ctx, {
    type: type,
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderColor: color,
        backgroundColor: color + '22',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: textColor, font: { family: 'Inter', weight: '600' } } },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Poppins', size: 13 },
          bodyFont: { family: 'IBM Plex Mono', size: 12 },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          title: { display: true, text: xLabel, color: textColor, font: { family: 'Inter', weight: '600' } },
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          title: { display: true, text: yLabel, color: textColor, font: { family: 'Inter', weight: '600' } },
          ticks: { color: textColor },
          grid: { color: gridColor },
          beginAtZero: false
        }
      }
    }
  });

  return charts[canvasId];
}
