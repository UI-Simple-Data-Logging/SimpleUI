import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function ItemList({ items, onEdit, onDelete }) {
  // CSV Export
  const downloadCSV = () => {
    const headers = ['ID', 'Parameter', 'Value', 'Process', 'Priority', 'Target Metric', 'Timestamp'];
    const csvData = items.map(item => [
      item._id,
      item.parameter,
      item.value,
      item.processType,
      item.priority,
      item.targetMetricAffected,
      new Date(item.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'items.csv');
  };

  // Excel Export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      items.map(item => ({
        ID: item._id,
        Parameter: item.parameter,
        Value: item.value,
        Process: item.processType,
        Priority: item.priority,
        Target: item.targetMetricAffected,
        Timestamp: new Date(item.timestamp).toLocaleString()
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
    XLSX.writeFile(workbook, 'items.xlsx');
  };

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableData = items.map(item => [
      item.parameter,
      item.value,
      item.processType,
      item.priority,
      item.targetMetricAffected,
      new Date(item.timestamp).toLocaleString()
    ]);
    autoTable(doc, {
      head: [['Parameter', 'Value', 'Process', 'Priority', 'Target', 'Timestamp']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [64, 64, 64] }
    });
    doc.save('items.pdf');
  };

  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" disabled={items.length === 0}>
          Download CSV
        </button>
        <button onClick={downloadExcel} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" disabled={items.length === 0}>
          Download Excel
        </button>
        <button onClick={downloadPDF} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm" disabled={items.length === 0}>
          Download PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Parameter</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Process</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.parameter}</td>
                  <td className="px-4 py-2">{item.value}</td>
                  <td className="px-4 py-2">{item.processType}</td>
                  <td className="px-4 py-2">{item.priority}</td>
                  <td className="px-4 py-2">{item.targetMetricAffected}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(item._id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItemList;