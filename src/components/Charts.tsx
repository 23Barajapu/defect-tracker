'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartOptions,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function StatusDoughnutChart({ statusCounts }: { statusCounts: Record<string, number> }) {
  const data = {
    labels: ['Open', 'Retesting', 'Re-open', 'Close'],
    datasets: [
      {
        data: [
          statusCounts.Open || 0,
          statusCounts.Retesting || 0,
          statusCounts['Re-open'] || 0,
          statusCounts.Close || 0,
        ],
        backgroundColor: ['#3b82f6', '#a855f7', '#ef4444', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
          padding: 15,
        },
      },
    },
    cutout: '72%',
  };

  return <Doughnut data={data} options={options} />;
}

export function SeverityBarChart({ severityCounts }: { severityCounts: Record<string, number> }) {
  const data = {
    labels: ['Blocker', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Jumlah Defect',
        data: [
          severityCounts.Blocker || 0,
          severityCounts.High || 0,
          severityCounts.Medium || 0,
          severityCounts.Low || 0,
        ],
        backgroundColor: ['#dc2626', '#f97316', '#eab308', '#64748b'],
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: 'bold' } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={data} options={options} />;
}
