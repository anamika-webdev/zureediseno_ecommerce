// Step 1: Create the SizeChart component
// Create file: src/components/store/SizeChart.tsx

'use client';

import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

export default function SizeChart() {
  const [activeTab, setActiveTab] = useState('men');

  const menSizes = [
    { size: 'S', chest: '36-38', length: '27-28', shoulder: '16-17', sleeve: '24-25' },
    { size: 'M', chest: '38-40', length: '28-29', shoulder: '17-18', sleeve: '25-26' },
    { size: 'L', chest: '40-42', length: '29-30', shoulder: '18-19', sleeve: '26-27' },
    { size: 'XL', chest: '42-44', length: '30-31', shoulder: '19-20', sleeve: '27-28' },
    { size: 'XXL', chest: '44-46', length: '31-32', shoulder: '20-21', sleeve: '28-29' },
    { size: 'XXXL', chest: '46-48', length: '32-33', shoulder: '21-22', sleeve: '29-30' },
  ];

  const womenSizes = [
    { size: 'XS', chest: '32-34', length: '24-25', shoulder: '14-15', sleeve: '22-23' },
    { size: 'S', chest: '34-36', length: '25-26', shoulder: '15-16', sleeve: '23-24' },
    { size: 'M', chest: '36-38', length: '26-27', shoulder: '16-17', sleeve: '24-25' },
    { size: 'L', chest: '38-40', length: '27-28', shoulder: '17-18', sleeve: '25-26' },
    { size: 'XL', chest: '40-42', length: '28-29', shoulder: '18-19', sleeve: '26-27' },
    { size: 'XXL', chest: '42-44', length: '29-30', shoulder: '19-20', sleeve: '27-28' },
  ];

  const sizes = activeTab === 'men' ? menSizes : womenSizes;

  return (
    <div className="w-full bg-white rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Shirt Size Chart (India)</h2>
        </div>
        <p className="text-sm text-gray-600">All measurements are in inches</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('men')}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'men'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Men's Sizes
        </button>
        <button
          onClick={() => setActiveTab('women')}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'women'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Women's Sizes
        </button>
      </div>

      {/* Size Chart Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={activeTab === 'men' ? 'bg-blue-50' : 'bg-pink-50'}>
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-700 text-sm">
                Size
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-700 text-sm">
                Chest (inches)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-700 text-sm">
                Length (inches)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-700 text-sm">
                Shoulder (inches)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-700 text-sm">
                Sleeve (inches)
              </th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((row, index) => (
              <tr
                key={row.size}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="border border-gray-300 px-4 py-3 font-bold text-gray-800 text-sm">
                  {row.size}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {row.chest}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {row.length}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {row.shoulder}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                  {row.sleeve}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

