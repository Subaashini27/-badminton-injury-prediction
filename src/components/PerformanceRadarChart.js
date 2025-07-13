import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const PerformanceRadarChart = ({ metrics }) => {
  const calculateCategoryScore = (category) => {
    if (!metrics || !metrics[category]) return 0;
    const values = Object.values(metrics[category]);
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
  };

  const data = {
    labels: ['Shot Quality', 'Movement', 'Physical', 'Technical'],
    datasets: [{
      label: 'Performance',
      data: [
        calculateCategoryScore('shotQuality'),
        calculateCategoryScore('movementMetrics'),
        calculateCategoryScore('physicalMetrics'),
        calculateCategoryScore('technicalMetrics')
      ],
      backgroundColor: 'rgba(52, 152, 219, 0.6)',
      borderColor: 'rgb(52, 152, 219)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(52, 152, 219)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(52, 152, 219)'
    }]
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
      <Radar data={data} options={options} />
    </div>
  );
};

export default PerformanceRadarChart; 