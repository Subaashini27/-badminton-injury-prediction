import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coachAPI } from '../../services/api';
import { Bar } from 'react-chartjs-2';

const InjuryAnalysis = () => {
  const { currentUser } = useAuth();
  const [injuryData, setInjuryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInjuryData = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await coachAPI.getInjuryReports(currentUser.id);
        setInjuryData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch injury data');
      } finally {
        setLoading(false);
      }
    };
    fetchInjuryData();
  }, [currentUser]);

  const processInjuryData = () => {
    if (injuryData.length === 0) {
      return {
        totalInjuries: 0,
        mostCommonInjury: 'N/A',
        injuryCounts: {},
      };
    }

    const injuryCounts = injuryData.reduce((acc, report) => {
      const type = report.injury_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const mostCommonInjury = Object.keys(injuryCounts).reduce((a, b) =>
      injuryCounts[a] > injuryCounts[b] ? a : b
    );

    return {
      totalInjuries: injuryData.length,
      mostCommonInjury,
      injuryCounts,
    };
  };

  const { totalInjuries, mostCommonInjury, injuryCounts } = processInjuryData();

  const chartData = {
    labels: Object.keys(injuryCounts),
    datasets: [
      {
        label: 'Number of Injuries',
        data: Object.values(injuryCounts),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Injury Distribution by Type' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  if (loading) return <div className="p-6">Loading injury analysis...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team Injury Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Injuries</h2>
          <p className="text-3xl font-bold">{totalInjuries}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Most Common Injury</h2>
          <p className="text-3xl font-bold">{mostCommonInjury}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Injury Distribution</h2>
        {totalInjuries > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>No injury data available to display.</p>
        )}
      </div>
    </div>
  );
};

export default InjuryAnalysis; 