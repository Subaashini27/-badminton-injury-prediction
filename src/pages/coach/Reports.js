import React, { useState } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('team_performance');
  const [generatedReports, setGeneratedReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // In a real app, this would trigger a backend process
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: `${reportType.replace('_', ' ')} Report - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        url: `/reports/generated/${Date.now()}.pdf`, // Mock URL
      };
      setGeneratedReports([newReport, ...generatedReports]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Reports</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Report Type</h2>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="team_performance">Team Performance</option>
          <option value="injury_summary">Injury Summary</option>
          <option value="athlete_progress">Athlete Progress</option>
        </select>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Generated Reports</h2>
        {generatedReports.length === 0 ? (
          <p>No reports generated yet.</p>
        ) : (
          <ul>
            {generatedReports.map(report => (
              <li key={report.id} className="border-b py-2 flex justify-between items-center">
                <span>{report.name}</span>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reports;

