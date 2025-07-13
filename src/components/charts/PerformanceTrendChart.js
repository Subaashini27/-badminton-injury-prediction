import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const PerformanceTrendChart = ({ history }) => {
  const data = {
    labels: history.map(item => new Date(item.analysis_date)),
    datasets: [
      {
        label: 'Overall Performance Score',
        data: history.map(item => item.overall_score),
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
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
        text: 'Performance Trend Over Time',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Overall Score',
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Performance Trend</h2>
      {history && history.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p className="text-gray-500">No performance history yet. Complete an analysis to see your trend.</p>
      )}
    </div>
  );
};

export default PerformanceTrendChart; 