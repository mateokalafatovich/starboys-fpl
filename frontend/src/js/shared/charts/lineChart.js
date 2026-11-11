import { Chart } from 'chart.js/auto';
import { LINE_COLORS } from '../../constants/chart-color.js';

export function createLineChart(canvas, { labels, series, xTitle, yTitle, reverseY = false }) {
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: series.map((s, i) => {
        const color = LINE_COLORS[i % LINE_COLORS.length];
        return {
          label: s.name,
          data: s.values,
          borderColor: color,
          backgroundColor: color,
          tension: 0.2,
          pointRadius: 2,
          spanGaps: true,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          title: {
            display: !!xTitle,
            text: xTitle
          },
        },
        y: {
          reverse: reverseY,
          title: {
            display: !!yTitle,
            text: yTitle
          },
        },
      },
    },
  });
}