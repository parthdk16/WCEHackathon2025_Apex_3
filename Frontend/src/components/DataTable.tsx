import React from "react";

const DataTable = (detection_results) => {
  return (
    <table className="border-collapse border border-gray-400">
      <thead>
        <tr>
          <th className="border p-2">Anomaly</th>
          <th className="border p-2">Humidity</th>
          <th className="border p-2">Mean Pressure</th>
        </tr>
      </thead>
      <tbody>
        {detection_results.map((entry, index) => (
          <tr key={index}>
            <td className="border p-2">{entry.anomaly}</td>
            <td className="border p-2">{entry.humidity}</td>
            <td className="border p-2">{entry.meanpressure}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
