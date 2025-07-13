import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InjuryRiskChart = ({ data, title = 'Injury Risk Analysis' }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Injury Risk Score',
        data: data.values || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Risk Score (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default InjuryRiskChart;























